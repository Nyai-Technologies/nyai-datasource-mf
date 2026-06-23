import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT       = Number(process.env.PORT ?? 5001);
const API_ORIGIN = process.env.VITE_API_ORIGIN ?? 'https://dev.nyai.ai';
const DEV_TOKEN  = process.env.VITE_DEV_TOKEN  ?? '';

const PROXY_PREFIXES = ['/data-engine', '/compliance-service'];

const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.mjs':  'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
};

const DIST = path.join(__dirname, 'dist');

// Buffer the full request body before proxying — required for POST/PUT
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end',  ()    => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function proxyRequest(req, res) {
  const target  = new URL(API_ORIGIN);
  const isHttps = target.protocol === 'https:';
  const lib     = isHttps ? https : http;

  // Buffer body first so content-length is accurate
  const body = await readBody(req);

  // Forward or inject the access_token cookie
  let cookie = req.headers['cookie'] ?? '';
  if (!cookie.includes('access_token=') && DEV_TOKEN) {
    cookie = cookie ? `${cookie}; access_token=${DEV_TOKEN}` : `access_token=${DEV_TOKEN}`;
  }

  const forwardHeaders = {
    'host':            target.hostname,
    'cookie':          cookie,
    'accept':          req.headers['accept'] ?? 'application/json',
    'accept-encoding': 'identity',
    'user-agent':      req.headers['user-agent'] ?? 'node-proxy',
  };

  if (body.length > 0) {
    forwardHeaders['content-type']   = req.headers['content-type'] ?? 'application/json';
    forwardHeaders['content-length'] = String(body.length);
  }

  // Forward any custom request headers (X-Request-Id, X-Timestamp, etc.)
  for (const [k, v] of Object.entries(req.headers)) {
    if (k.startsWith('x-') && !forwardHeaders[k]) forwardHeaders[k] = v;
  }

  const options = {
    hostname: target.hostname,
    port:     target.port || (isHttps ? 443 : 80),
    path:     req.url,
    method:   req.method,
    headers:  forwardHeaders,
  };

  const proxy = lib.request(options, (proxyRes) => {
    console.log(`[proxy] ${req.method} ${req.url} → ${proxyRes.statusCode}`);
    const safeHeaders = { ...proxyRes.headers };
    delete safeHeaders['transfer-encoding'];
    delete safeHeaders['connection'];
    res.writeHead(proxyRes.statusCode, safeHeaders);
    proxyRes.pipe(res, { end: true });
  });

  proxy.on('error', (err) => {
    console.error('[proxy] error:', err.message);
    if (!res.headersSent) {
      res.writeHead(502);
      res.end('Bad Gateway');
    }
  });

  if (body.length > 0) proxy.write(body);
  proxy.end();
}

function serveStatic(req, res) {
  let urlPath = req.url.split('?')[0];
  try { urlPath = decodeURIComponent(urlPath); } catch { /* keep as-is */ }
  urlPath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');

  const tryFile = (fp) => {
    try {
      const stat = fs.statSync(fp);
      if (stat.isDirectory()) return tryFile(path.join(fp, 'index.html'));
      const ext  = path.extname(fp).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] ?? 'application/octet-stream' });
      fs.createReadStream(fp).pipe(res);
      return true;
    } catch { return false; }
  };

  if (!tryFile(path.join(DIST, urlPath))) {
    const index = path.join(DIST, 'index.html');
    if (fs.existsSync(index)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(index).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  }
}

const server = http.createServer((req, res) => {
  if (PROXY_PREFIXES.some(p => req.url.startsWith(p))) {
    proxyRequest(req, res).catch(err => {
      console.error('[proxy] unhandled error:', err.message);
      if (!res.headersSent) { res.writeHead(502); res.end('Bad Gateway'); }
    });
  } else {
    serveStatic(req, res);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] listening on http://0.0.0.0:${PORT}`);
  console.log(`[server] proxying ${PROXY_PREFIXES.join(', ')} → ${API_ORIGIN}`);
});
