import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT        = Number(process.env.PORT ?? 5001);
const API_ORIGIN  = process.env.VITE_API_ORIGIN ?? 'https://dev.nyai.ai';
const DEV_TOKEN   = process.env.VITE_DEV_TOKEN  ?? '';

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

function proxyRequest(req, res) {
  const target   = new URL(API_ORIGIN);
  const isHttps  = target.protocol === 'https:';
  const lib      = isHttps ? https : http;

  // Forward or inject the access_token cookie
  let cookie = req.headers['cookie'] ?? '';
  if (!cookie.includes('access_token=') && DEV_TOKEN) {
    cookie = cookie ? `${cookie}; access_token=${DEV_TOKEN}` : `access_token=${DEV_TOKEN}`;
  }

  const options = {
    hostname: target.hostname,
    port:     target.port || (isHttps ? 443 : 80),
    path:     req.url,
    method:   req.method,
    headers: {
      ...req.headers,
      host:   target.hostname,
      cookie,
    },
  };

  const proxy = lib.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxy.on('error', (err) => {
    console.error('[proxy] error:', err.message);
    res.writeHead(502);
    res.end('Bad Gateway');
  });

  req.pipe(proxy, { end: true });
}

function serveStatic(req, res) {
  // Strip query string
  let urlPath = req.url.split('?')[0];

  // Decode and normalise
  try { urlPath = decodeURIComponent(urlPath); } catch { /* keep as-is */ }
  urlPath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');

  let filePath = path.join(DIST, urlPath);

  const tryFile = (fp) => {
    try {
      const stat = fs.statSync(fp);
      if (stat.isDirectory()) return tryFile(path.join(fp, 'index.html'));
      const ext  = path.extname(fp).toLowerCase();
      const mime = MIME[ext] ?? 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mime });
      fs.createReadStream(fp).pipe(res);
      return true;
    } catch {
      return false;
    }
  };

  if (!tryFile(filePath)) {
    // SPA fallback
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
    proxyRequest(req, res);
  } else {
    serveStatic(req, res);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] listening on http://0.0.0.0:${PORT}`);
  console.log(`[server] proxying ${PROXY_PREFIXES.join(', ')} → ${API_ORIGIN}`);
});
