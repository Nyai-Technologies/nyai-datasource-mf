import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ArrowLeft } from 'lucide-react';
import type { BreadcrumbItem } from '../../../types/types';

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
    <header className="h-[44px] bg-white border-b border-[#b8c1d3] flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          className="flex items-center gap-1 bg-none border-none cursor-pointer text-[#9ca3af] text-[14px] p-0 transition-all hover:text-[#1a2030]"
          type="button"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={14} />
        </button>

        {breadcrumbs.length > 1 ? (
          <nav className="flex items-center gap-1 text-[14px]">
            {breadcrumbs.map((item, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={idx}>
                  {isLast ? (
                    <span className="text-[#1a2030] font-semibold">{item.label}</span>
                  ) : (
                    <Link to={item.path || '#'} className="text-[#9ca3af] font-normal cursor-pointer hover:text-[#6b7280]">
                      {item.label}
                    </Link>
                  )}
                  {!isLast && <span className="text-[#9ca3af] font-normal">{'>'}</span>}
                </React.Fragment>
              );
            })}
          </nav>
        ) : (
          <h1 className="text-[14px] font-semibold text-[#1a2030]">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        {rightContent}
        <button className="w-[34px] h-[34px] flex items-center justify-center border border-[#b8c1d3] rounded-[6px] bg-white cursor-pointer transition-all relative hover:border-[#1e7070] hover:bg-[#f1f5f9]">
          <Bell className="w-4 h-4 text-[#9ca3af]" />
          {hasNotification && (
            <span className="absolute top-[6px] right-[7px] w-[7px] h-[7px] bg-[#ef4444] border-[1.5px] border-white rounded-full" />
          )}
        </button>
      </div>
    </header>
  );
};
