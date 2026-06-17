# nyai-datasource-mf

Module federation remote for NyAI DataSources. Runs standalone on port `5001` and exposes components for consumption by other micro-frontends.

## Development

```bash
cp .env.example .env.local   # add VITE_DEV_TOKEN
npm install
npm run dev                  # http://localhost:5001
```

## Module federation

After `npm run build`, the remote entry is at:

```
dist/assets/remoteEntry.js
```

### Exposed modules

| Import path | Description |
|---|---|
| `datasourceMf/DataSourcesApp` | Full DataSources sub-app (with routing) |
| `datasourceMf/DataSourcesList` | List page only |
| `datasourceMf/DataSourceTypeSelect` | Type selection page |
| `datasourceMf/AddDataSource` | Multi-step add wizard |
| `datasourceMf/DataSourceEdit` | Edit page |
| `datasourceMf/api` | API client |
| `datasourceMf/types` | Shared TypeScript types |

### Consuming in a host app (Vite)

```ts
// vite.config.ts (host)
import federation from '@originjs/vite-plugin-federation';

federation({
  name: 'host',
  remotes: {
    datasourceMf: 'http://localhost:5001/assets/remoteEntry.js',
    // production:
    // datasourceMf: 'https://datasource.nyai.ai/assets/remoteEntry.js',
  },
  shared: ['react', 'react-dom', 'react-router-dom'],
})
```

```tsx
// In the host app router
const DataSourcesApp = React.lazy(() => import('datasourceMf/DataSourcesApp'));

<Route path="/data-sources/*" element={
  <React.Suspense fallback={<div>Loading…</div>}>
    <DataSourcesApp basePath="/data-sources" />
  </React.Suspense>
} />
```

## Shared singletons

`react`, `react-dom`, and `react-router-dom` are declared as shared singletons — the host's version is used. This prevents duplicate React instances and router conflicts.
