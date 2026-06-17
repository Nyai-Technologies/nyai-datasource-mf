/**
 * Module federation export: full DataSources sub-app.
 *
 * Consumers mount this inside their own router using a catch-all route, e.g.:
 *
 *   const DataSourcesApp = React.lazy(() => import('datasourceMf/DataSourcesApp'));
 *
 *   <Route path="/data-sources/*" element={
 *     <React.Suspense fallback={<span>Loading…</span>}>
 *       <DataSourcesApp basePath="/data-sources" />
 *     </React.Suspense>
 *   } />
 */
import '../index.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DataSourcesList } from '../pages/DataSources/DataSourcesList/DataSourcesList';
import { DataSourceTypeSelect } from '../pages/DataSources/DataSourceTypeSelect/DataSourceTypeSelect';
import AddDataSource from '../pages/DataSources/NewDataSource/AddDataSource';
import { DataSourceEdit } from '../pages/DataSources/DataSourceEdit/DataSourceEdit';

interface DataSourcesAppProps {
  /** Base path the host has mounted this app at (default: "/data-sources") */
  basePath?: string;
}

export default function DataSourcesApp({ basePath = '/data-sources' }: DataSourcesAppProps) {
  return (
    <Routes>
      <Route index element={<DataSourcesList />} />
      <Route path="new/type" element={<DataSourceTypeSelect />} />
      <Route path="new" element={<AddDataSource />} />
      <Route path=":id/edit" element={<DataSourceEdit />} />
      <Route path="*" element={<Navigate to={basePath} replace />} />
    </Routes>
  );
}
