import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const SearchInput: React.FC<SearchInputProps> = (props) => (
  <div className="relative flex items-center">
    <Search className="absolute left-3 w-[15px] h-[15px] text-[#9ca3af] pointer-events-none" />
    <input
      className="h-9 pl-9 pr-3 border border-[#b8c1d3] rounded-[6px] text-[14px] text-[#1a2030] bg-white outline-none transition-all min-w-[220px] placeholder:text-[#a0aec0] placeholder:text-[12px] focus:border-[#1e7070] focus:shadow-[0_0_0_3px_rgba(30,112,112,0.12)]"
      {...props}
    />
  </div>
);
