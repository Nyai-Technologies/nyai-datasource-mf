import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ArrowLeft } from 'lucide-react';
import type { BreadcrumbItem } from '../../../types/types';
import styles from './Navbar.module.scss';

interface NavbarProps {
  breadcrumbs?: BreadcrumbItem[];
  rightContent?: React.ReactNode;
  hasNotification?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  breadcrumbs = [],
  rightContent,
  hasNotification = true,
}) => {
  const navigate = useNavigate();
  const title = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : 'Dashboard';

  return (
    <header className={styles.navbar}>
      <div className={styles.left}>
        <button className={styles.navBackBtn} type="button" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
        </button>

        {breadcrumbs.length > 1 ? (
          <nav className={styles.breadcrumbs}>
            {breadcrumbs.map((item, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={idx}>
                  {isLast ? (
                    <span className={styles.breadcrumbCurrent}>{item.label}</span>
                  ) : (
                    <Link to={item.path || '#'} className={styles.breadcrumbLink}>
                      {item.label}
                    </Link>
                  )}
                  {!isLast && <span className={styles.breadcrumbSep}>{'>'}</span>}
                </React.Fragment>
              );
            })}
          </nav>
        ) : (
          <h1 className={styles.title}>{title}</h1>
        )}
      </div>

      <div className={styles.right}>
        {rightContent}
        <button className={styles.bellBtn}>
          <Bell className={styles.bellIcon} />
          {hasNotification && <span className={styles.notifDot} />}
        </button>
      </div>
    </header>
  );
};
