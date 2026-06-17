import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { NavItem } from '../../../types/types';

interface SidebarProps {
  items: NavItem[][];
  brandName?: string;
  brandTagline?: string;
  userName?: string;
  onLogout?: () => void;
  onProfile?: () => void;
}

const CollapseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
    <path d="M11 17l-5-5 5-5M19 17l-5-5 5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ExpandIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UserSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[14px] h-[14px]">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogoutSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[14px] h-[14px]">
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
    <aside
      className={`bg-[#031C30] text-white flex flex-col h-screen transition-all duration-300 ease-in-out flex-shrink-0 relative z-40 overflow-hidden ${collapsed ? 'w-[72px]' : 'w-[192px]'}`}
    >
      {/* Brand header */}
      <div
        className={`h-[60px] flex items-center flex-shrink-0 bg-gradient-to-r from-[#0F4C5C] to-[#031C30] gap-2 ${collapsed ? 'justify-center p-0' : 'px-3'}`}
      >
        {collapsed ? (
          <button
            className="flex items-center justify-center w-10 h-[34px] bg-transparent border-none text-white cursor-pointer"
            onClick={() => setCollapsed(false)}
          >
            <span className="text-[20px] font-extrabold text-white">N</span>
          </button>
        ) : (
          <>
            <div className="flex-1 overflow-hidden">
              <span className="block text-[18px] font-extrabold text-white leading-none tracking-[-0.5px]">{brandName}</span>
              <span className="block text-[13px] font-normal text-white/90 mt-[3px] leading-none">{brandTagline}</span>
            </div>
            <button
              className="flex items-center justify-center w-7 h-7 bg-transparent border-none text-white cursor-pointer rounded-[3px] flex-shrink-0 transition-all hover:bg-white/10"
              onClick={() => setCollapsed(true)}
            >
              <CollapseIcon />
            </button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((group, gi) => (
          <div key={gi}>
            {gi > 0 && <div className="h-px bg-[rgba(164,178,195,0.35)] mx-4 my-3" />}
            {group.map((item) => {
              const active = isActive(item);
              const link = (
                <Link
                  key={item.path}
                  to={item.path}
                  className={[
                    'flex items-center gap-3 rounded-[8px] transition-all cursor-pointer',
                    collapsed ? 'justify-center py-[10px] px-0 mx-3' : 'py-[9px] px-3 mx-3',
                    active
                      ? 'bg-[#0F4C5C] text-white'
                      : 'text-white/[0.82] hover:bg-white/5 hover:text-white',
                  ].join(' ')}
                >
                  {item.icon && (
                    <item.icon
                      size={collapsed ? 22 : 18}
                      className={active ? 'text-[#FF8E74] flex-shrink-0' : 'text-white/65 flex-shrink-0'}
                    />
                  )}
                  {!collapsed && (
                    <span className="text-[14px] font-normal whitespace-nowrap overflow-hidden">
                      {item.label}
                    </span>
                  )}
                </Link>
              );

              return collapsed ? (
                <div key={item.path} className="relative" title={item.label}>
                  {link}
                </div>
              ) : link;
            })}
          </div>
        ))}
      </nav>

      {/* Profile footer */}
      <div className={`p-2 flex-shrink-0 ${collapsed ? 'flex items-center justify-center' : ''}`}>
        <div className="relative">
          {collapsed ? (
            <button
              className="bg-transparent border-none cursor-pointer p-0"
              onClick={() => setProfileOpen(!profileOpen)}
              title={userName}
            >
              <div className="w-8 h-8 rounded-full bg-[#3b82f6] flex items-center justify-center flex-shrink-0 relative">
                <span className="text-[12px] font-bold text-white">{ini}</span>
                <span className="absolute bottom-[-1px] right-[-1px] w-[9px] h-[9px] bg-[#22c55e] border-2 border-[#031C30] rounded-full" />
              </div>
            </button>
          ) : (
            <button
              className="flex items-center gap-[10px] w-full bg-transparent border-none cursor-pointer p-1 rounded-[6px] transition-all"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-[#3b82f6] flex items-center justify-center flex-shrink-0 relative">
                <span className="text-[12px] font-bold text-white">{ini}</span>
                <span className="absolute bottom-[-1px] right-[-1px] w-[9px] h-[9px] bg-[#22c55e] border-2 border-[#031C30] rounded-full" />
              </div>
              <span className="flex-1 text-[14px] font-normal text-white text-left truncate transition-colors leading-none">
                {userName.length > 13 ? userName.slice(0, 13) + '…' : userName}
              </span>
              <ChevronRight className="text-white/45 flex-shrink-0" size={16} />
            </button>
          )}

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-[45]" onClick={() => setProfileOpen(false)} />
              <div className="absolute bottom-[calc(100%+4px)] left-full ml-1 min-w-[140px] p-1 bg-[#031C30] border border-[rgba(204,216,250,0.5)] rounded-[6px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] z-50">
                {onProfile && (
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-white bg-transparent border-none rounded-[3px] cursor-pointer transition-all hover:bg-white/[0.06]"
                    onClick={() => { setProfileOpen(false); onProfile(); }}
                  >
                    <UserSvg /> <span>My Profile</span>
                  </button>
                )}
                {onLogout && (
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-white bg-transparent border-none rounded-[3px] cursor-pointer transition-all hover:bg-white/[0.06]"
                    onClick={() => { setProfileOpen(false); onLogout(); }}
                  >
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
        <button
          className="flex items-center justify-center w-7 h-7 bg-transparent border-none text-white cursor-pointer rounded-[3px] flex-shrink-0 transition-all hover:bg-white/10 absolute right-2 top-[16px]"
          onClick={() => setCollapsed(false)}
        >
          <ExpandIcon />
        </button>
      )}
    </aside>
  );
};
