import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-[#b8c1d3] rounded-[6px] overflow-hidden mb-2">
      <div
        className="flex items-center justify-between px-4 py-3 bg-white cursor-pointer select-none transition-colors hover:bg-[#f1f5f9]"
        onClick={() => setOpen(!open)}
      >
        <span className="text-[14px] font-medium text-[#1a2030]">{title}</span>
        <ChevronDown
          className={`w-[18px] h-[18px] text-[#9ca3af] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </div>
      {open && (
        <div className="px-4 py-4 border-t border-[#b8c1d3] text-[14px] text-[#6b7280] bg-white">
          {children}
        </div>
      )}
    </div>
  );
};
