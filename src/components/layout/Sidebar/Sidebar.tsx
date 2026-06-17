import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { NavItem } from '../../../types/types';
import styles from './Sidebar.module.scss';

interface SidebarProps {
  items: NavItem[][];
  brandName?: string;
  brandTagline?: string;
  userName?: string;
  onLogout?: () => void;
  onProfile?: () => void;
}

const CollapseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 17l-5-5 5-5M19 17l-5-5 5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ExpandIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UserSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogoutSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  brandName = 'NyAI',
  brandTagline = 'Compliance',
  userName = 'User',
  onLogout,
  onProfile,
}) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const ini = initials(userName);

  const isActive = (item: NavItem) =>
    location.pathname === item.path ||
    (item.path !== '/' && location.pathname.startsWith(item.path + '/'));

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {/* Brand header */}
      <div className={`${styles.brand} ${collapsed ? styles.brandCollapsed : ''}`}>
        {collapsed ? (
          <button className={styles.expandBrandBtn} onClick={() => setCollapsed(false)}>
            <span className={styles.brandLetter}>N</span>
          </button>
        ) : (
          <>
            <div className={styles.brandInfo}>
              <span className={styles.brandName}>{brandName}</span>
              <span className={styles.brandTagline}>{brandTagline}</span>
            </div>
            <button className={styles.collapseBtn} onClick={() => setCollapsed(true)}>
              <CollapseIcon />
            </button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {items.map((group, gi) => (
          <div key={gi} className={styles.navGroup}>
            {gi > 0 && <div className={styles.divider} />}
            {group.map((item) => {
              const active = isActive(item);
              const link = (
                <Link
                  key={item.path}
                  to={item.path}
                  className={[
                    styles.navItem,
                    collapsed ? styles.navItemCollapsed : '',
                    active ? styles.navItemActive : '',
                  ].join(' ')}
                >
                  {item.icon && (
                    <item.icon
                      size={collapsed ? 22 : 18}
                      className={`${styles.navIcon} ${active ? styles.navIconActive : ''}`}
                    />
                  )}
                  {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                </Link>
              );

              return collapsed ? (
                <div key={item.path} className={styles.tipWrap} title={item.label}>
                  {link}
                </div>
              ) : link;
            })}
          </div>
        ))}
      </nav>

      {/* Profile footer */}
      <div className={`${styles.profile} ${collapsed ? styles.profileCollapsed : ''}`}>
        <div className={styles.profileInner}>
          {collapsed ? (
            <button className={styles.avatarBtn} onClick={() => setProfileOpen(!profileOpen)} title={userName}>
              <div className={styles.avatar}>
                <span>{ini}</span>
                <span className={styles.dot} />
              </div>
            </button>
          ) : (
            <button className={styles.profileBtn} onClick={() => setProfileOpen(!profileOpen)}>
              <div className={styles.avatar}>
                <span>{ini}</span>
                <span className={styles.dot} />
              </div>
              <span className={styles.profileName}>
                {userName.length > 13 ? userName.slice(0, 13) + '…' : userName}
              </span>
              <ChevronRight className={styles.chevron} size={16} />
            </button>
          )}

          {profileOpen && (
            <>
              <div className={styles.overlay} onClick={() => setProfileOpen(false)} />
              <div className={styles.profileMenu}>
                {onProfile && (
                  <button className={styles.menuItem} onClick={() => { setProfileOpen(false); onProfile(); }}>
                    <UserSvg /> <span>My Profile</span>
                  </button>
                )}
                {onLogout && (
                  <button className={styles.menuItem} onClick={() => { setProfileOpen(false); onLogout(); }}>
                    <LogoutSvg /> <span>Logout</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Edge expand button */}
      {collapsed && (
        <button className={styles.expandEdgeBtn} onClick={() => setCollapsed(false)}>
          <ExpandIcon />
        </button>
      )}
    </aside>
  );
};
