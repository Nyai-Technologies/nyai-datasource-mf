import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataSourcesList } from './pages/DataSources/DataSourcesList/DataSourcesList';
import { DataSourceTypeSelect } from './pages/DataSources/DataSourceTypeSelect/DataSourceTypeSelect';
import AddDataSource from './pages/DataSources/NewDataSource/AddDataSource';
import { DataSourceEdit } from './pages/DataSources/DataSourceEdit/DataSourceEdit';

export default function App() {
  return (
    <BrowserRouter>
      {/* Dev shell — mimics the host's content area so pages look right at :5001 */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8fafc' }}>
        <div style={{ height: 48, background: '#0f172a', display: 'flex', alignItems: 'center', padding: '0 20px', color: '#fff', fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
          NYAI · Data Sources (dev)
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px' }}>
          <Routes>
            <Route index element={<Navigate to="/data-sources" replace />} />
            <Route path="data-sources" element={<DataSourcesList />} />
            <Route path="data-sources/new/type" element={<DataSourceTypeSelect />} />
            <Route path="data-sources/new" element={<AddDataSource />} />
            <Route path="data-sources/:id/edit" element={<DataSourceEdit />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
