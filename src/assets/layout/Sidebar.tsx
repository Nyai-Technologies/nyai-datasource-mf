import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { NavItem } from './types';

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

// Simple CSS tooltip (no shadcn needed)
const Tip: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="relative group/tip">
    {children}
    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-[#1a1f2b] text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/tip:opacity-100 pointer-events-none z-50 transition-opacity duration-150 shadow-lg border border-white/10">
      {label}
    </div>
  </div>
);

// Collapse icon SVG
const CollapseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M11 17l-5-5 5-5M19 17l-5-5 5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Expand icon SVG
const ExpandIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface SidebarProps {
  items: NavItem[][];
  brandName?: string;
  brandTagline?: string;
  userName?: string;
  onLogout?: () => void;
  onProfile?: () => void;
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
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth <= 900);
  const [profileOpen, setProfileOpen] = useState(false);

  const lastWidth = React.useRef(window.innerWidth);
  React.useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w <= 900 && lastWidth.current > 900) setIsCollapsed(true);
      else if (w > 900 && lastWidth.current <= 900) setIsCollapsed(false);
      lastWidth.current = w;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside
      className={cn(
        'bg-[#252933] text-gray-300 flex flex-col h-screen transition-all duration-300 ease-in-out shrink-0 relative z-40',
        isCollapsed ? 'w-[72px]' : 'w-48',
      )}
    >
      {/* Brand header */}
      <div
        className={cn(
          'h-[60px] flex items-center transition-all duration-300',
          isCollapsed
            ? 'bg-[linear-gradient(112.04deg,#2345A2_0%,#242933_40%)] px-3 justify-center'
            : 'bg-[linear-gradient(112.04deg,#2345A2_0%,#242933_20%)] ps-3 pe-1 justify-between',
        )}
      >
        {isCollapsed ? (
          <Tip label={`${brandName} ${brandTagline}`}>
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-10 h-8 flex items-center justify-center cursor-pointer focus:outline-none"
            >
              <span className="text-white font-extrabold text-xl tracking-tight">N</span>
            </button>
          </Tip>
        ) : (
          <>
            <div className="flex flex-col">
              <span className="text-white font-extrabold text-[18px] leading-none tracking-tight">
                {brandName}
              </span>
              <span className="text-[13px] font-normal leading-none text-white mt-1">{brandTagline}</span>
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              className="text-white hover:text-white transition-colors p-1 focus:outline-none shrink-0 cursor-pointer"
              title="Collapse Sidebar"
            >
              <CollapseIcon />
            </button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden">
        {items.map((group, gi) => (
          <div key={gi}>
            {gi > 0 && (
              <div
                className={cn(
                  'mx-2 my-2 border-t-[0.5px] border-[#A4B2C3]',
                  isCollapsed && 'mx-3',
                )}
              />
            )}
            <div className={cn('space-y-1', isCollapsed && 'flex flex-col w-full')}>
              {group.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path + '/'));

                const link = (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'w-full flex justify-center items-center transition-all duration-200 py-3 group',
                      isCollapsed ? 'px-0 justify-center' : 'px-4 gap-3',
                      isActive
                        ? 'text-white bg-[linear-gradient(180deg,#0C3299_0%,#203970_28%,#222E3C_100%)] shadow-md'
                        : 'text-[#FFFFFF] hover:text-white hover:bg-white/5',
                    )}
                  >
                    {item.icon && (
                      <item.icon
                        size={isCollapsed ? 24 : 20}
                        className={cn(
                          'shrink-0 transition-colors',
                          isActive ? 'text-[#FF8E74]' : 'group-hover:text-white',
                        )}
                      />
                    )}
                    {!isCollapsed && (
                      <span className="text-[14px] font-normal leading-none flex items-center whitespace-nowrap flex-1">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );

                return isCollapsed ? (
                  <Tip key={item.path} label={item.label}>
                    {link}
                  </Tip>
                ) : (
                  link
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Profile footer */}
      <div className={cn('p-2 transition-all duration-300', isCollapsed ? 'flex justify-center' : '')}>
        <div className="relative">
          {isCollapsed ? (
            <Tip label={userName}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center justify-center cursor-pointer focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center relative">
                  <span className="text-white text-xs font-bold">{initials}</span>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#252933] rounded-full" />
                </div>
              </button>
            </Tip>
          ) : (
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 group cursor-pointer w-full focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center relative shrink-0">
                <span className="text-white text-xs font-bold">{initials}</span>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#252933] rounded-full" />
              </div>
              <p className="text-[14px] font-normal text-white group-hover:text-blue-400 transition-colors truncate leading-none flex-1 text-left">
                {userName.length > 10 ? userName.slice(0, 10) + '…' : userName}
              </p>
              <ChevronRight className="text-gray-500 group-hover:text-white transition-colors w-4 h-4 shrink-0" />
            </button>
          )}

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div className="absolute bottom-full left-full mb-1 ml-1 w-32 p-1 border border-[#CCD8FA80] bg-[#252933] text-white shadow-lg rounded-sm z-50">
                {onProfile && (
                  <button
                    onClick={() => { setProfileOpen(false); onProfile(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-[13px] text-white hover:bg-white/5 transition-colors focus:outline-none"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>My Profile</span>
                  </button>
                )}
                {onLogout && (
                  <button
                    onClick={() => { setProfileOpen(false); onLogout(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-[13px] text-white hover:bg-white/5 transition-colors focus:outline-none"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Logout</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Expand button when collapsed */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="absolute top-3 -right-3 z-50 flex h-6 w-6 items-center cursor-pointer justify-center rounded-sm bg-[linear-gradient(112.04deg,#2345A2_0%,#242933_40%)] text-white shadow-md focus:outline-none"
          title="Expand Sidebar"
        >
          <ExpandIcon />
        </button>
      )}
    </aside>
  );
};
