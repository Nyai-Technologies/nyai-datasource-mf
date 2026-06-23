import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { DataSourcesList } from './pages/DataSources/DataSourcesList/DataSourcesList';
import { DataSourceTypeSelect } from './pages/DataSources/DataSourceTypeSelect/DataSourceTypeSelect';
import AddDataSource from './pages/DataSources/NewDataSource/AddDataSource';
import { DataSourceEdit } from './pages/DataSources/DataSourceEdit/DataSourceEdit';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

const AuthGuard = () => {
  const { user, checking } = useAuth();
  if (checking) return null;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

const Shell = () => {
  const { user, logout } = useAuth();
  const name = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ''}`.trim()
    : (user?.email ?? 'User');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8fafc' }}>
      <div style={{ height: 48, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', color: '#fff', fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
        <span>NYAI · Data Sources (dev)</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, fontWeight: 400 }}>
          <span style={{ color: '#94a3b8' }}>{name}</span>
          <button
            onClick={logout}
            style={{ background: 'none', border: '1px solid #334155', borderRadius: 4, color: '#94a3b8', padding: '3px 10px', cursor: 'pointer', fontSize: 12 }}
          >
            Logout
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route element={<AuthGuard />}>
            <Route element={<Shell />}>
              <Route index element={<Navigate to="/data-sources" replace />} />
              <Route path="data-sources"              element={<DataSourcesList />} />
              <Route path="data-sources/new/type"     element={<DataSourceTypeSelect />} />
              <Route path="data-sources/new"          element={<AddDataSource />} />
              <Route path="data-sources/:id/edit"     element={<DataSourceEdit />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/data-sources" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
