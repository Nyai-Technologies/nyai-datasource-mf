import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../Sidebar/Sidebar';
import { Navbar } from '../Navbar/Navbar';
import type { NavItem } from '../../../types/types';
import styles from './Layout.module.scss';

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
    <div className={styles.shell}>
      <Sidebar
        items={navItems}
        brandName={brandName}
        brandTagline={brandTagline}
        userName={userName}
        onLogout={onLogout}
        onProfile={onProfile}
      />
      <div className={styles.body}>
        <Navbar breadcrumbs={breadcrumbs} rightContent={navbarRight} />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
