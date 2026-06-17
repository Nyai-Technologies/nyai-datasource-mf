import React from 'react';
import { Link } from 'react-router-dom';
import { NotificationsIcon } from './Icons';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface NavbarProps {
  breadcrumbs?: BreadcrumbItem[];
  rightContent?: React.ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({ breadcrumbs = [], rightContent }) => {
  const title = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : 'Dashboard';

  return (
    <header className="h-11 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {breadcrumbs.length > 1 ? (
          <nav className="flex items-center gap-1 text-[14px]">
            {breadcrumbs.map((item, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={idx}>
                  {isLast ? (
                    <span className="text-[#242933] font-semibold">{item.label}</span>
                  ) : (
                    <Link to={item.path || '#'} className="text-gray-400 font-normal hover:text-gray-600">
                      {item.label}
                    </Link>
                  )}
                  {!isLast && <span className="text-gray-300 mx-1">/</span>}
                </React.Fragment>
              );
            })}
          </nav>
        ) : (
          <h1 className="text-[14px] font-semibold text-[#242933]">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        {rightContent}
        <button
          className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-slate-50 transition-all cursor-pointer focus:outline-none"
          title="Notifications"
        >
          <NotificationsIcon size={16} className="text-[#A0AEC0]" />
        </button>
      </div>
    </header>
  );
};
