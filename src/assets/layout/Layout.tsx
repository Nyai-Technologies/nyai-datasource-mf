import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import type { NavItem } from './types';

interface LayoutProps {
  navItems: NavItem[][];
  brandName?: string;
  brandTagline?: string;
  userName?: string;
  onLogout?: () => void;
  onProfile?: () => void;
  /** Right-side content for the navbar (e.g. store selector) */
  navbarRight?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  navItems,
  brandName,
  brandTagline,
  userName,
  onLogout,
  onProfile,
  navbarRight,
}) => {
  const location = useLocation();
  const flat = navItems.flat();

  const active = flat.find((item) =>
    location.pathname === item.path ||
    (item.path !== '/' && location.pathname.startsWith(item.path + '/')),
  ) ?? flat[0];

  const breadcrumbs = active ? [{ label: active.label, path: active.path }] : [];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        items={navItems}
        brandName={brandName}
        brandTagline={brandTagline}
        userName={userName}
        onLogout={onLogout}
        onProfile={onProfile}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar breadcrumbs={breadcrumbs} rightContent={navbarRight} />
        <main className="flex-1 overflow-auto bg-white p-3 md:p-4 [&::-webkit-scrollbar]:hidden">
          <div className="h-full w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
