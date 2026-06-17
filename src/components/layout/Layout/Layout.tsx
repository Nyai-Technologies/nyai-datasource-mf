import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../Sidebar/Sidebar';
import { Navbar } from '../Navbar/Navbar';
import type { NavItem } from '../../../types/types';

interface LayoutProps {
  navItems: NavItem[][];
  brandName?: string;
  brandTagline?: string;
  userName?: string;
  onLogout?: () => void;
  onProfile?: () => void;
  navbarRight?: React.ReactNode;
}

const SUB_ROUTE_LABELS: Record<string, string> = {
  '/data-sources/new/type': 'Select Type',
  '/data-sources/new': 'New Data Source',
};

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

  const active = flat.find(
    (item) =>
      location.pathname === item.path ||
      (item.path !== '/' && location.pathname.startsWith(item.path + '/')),
  ) ?? flat[0];

  const root = active ? { label: active.label, path: active.path } : null;
  const subLabel = SUB_ROUTE_LABELS[location.pathname];

  let breadcrumbs: { label: string; path?: string }[] = [];
  if (root) {
    breadcrumbs = subLabel ? [root, { label: subLabel }] : [root];
  }

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      <Sidebar
        items={navItems}
        brandName={brandName}
        brandTagline={brandTagline}
        userName={userName}
        onLogout={onLogout}
        onProfile={onProfile}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar breadcrumbs={breadcrumbs} rightContent={navbarRight} />
        <main className="flex-1 overflow-auto bg-white p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
