import React from 'react';
import { Check } from 'lucide-react';

export interface Step {
  label: string;
}

interface StepperProps {
  steps: Step[];
  current: number;
}

export const Stepper: React.FC<StepperProps> = ({ steps, current }) => (
  <div className="flex items-center justify-center w-full px-6 py-5 box-border">
    {steps.map((step, i) => {
      const done = i < current;
      const active = i === current;

      return (
        <React.Fragment key={step.label}>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-[12px] font-semibold flex-shrink-0 z-[1] transition-all ${
                done || active
                  ? 'bg-[#1e7070] border-[#1e7070] text-white'
                  : 'bg-white border-[#b8c1d3] text-[#b8c1d3]'
              }`}
            >
              {done ? <Check size={14} strokeWidth={2.5} /> : i + 1}
            </div>
            <span
              className={`text-[12px] ${
                active
                  ? 'text-[#1a2030] font-semibold'
                  : done
                  ? 'text-[#1e7070]'
                  : 'text-[#9ca3af] font-normal'
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-[260px] flex-shrink-0 h-[1.5px] mx-2 ${
                done ? 'bg-[#1e7070]' : 'bg-[#b8c1d3]'
              }`}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);
