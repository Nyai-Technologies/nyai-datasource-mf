import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout/Layout';
import DataSourcesList from './pages/DataSources/DataSourcesList/DataSourcesList';
import DataSourceTypeSelect from './pages/DataSources/DataSourceTypeSelect/DataSourceTypeSelect';
import AddDataSource from './pages/DataSources/NewDataSource/AddDataSource';
import DataSourceEdit from './pages/DataSources/DataSourceEdit/DataSourceEdit';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/data-sources" replace />} />
          <Route path="data-sources" element={<DataSourcesList />} />
          <Route path="data-sources/new/type" element={<DataSourceTypeSelect />} />
          <Route path="data-sources/new" element={<AddDataSource />} />
          <Route path="data-sources/:id/edit" element={<DataSourceEdit />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
