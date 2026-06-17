import React from 'react';
import { Check } from 'lucide-react';
import styles from './Stepper.module.scss';

export interface Step {
  label: string;
}

interface StepperProps {
  steps: Step[];
  current: number; // 0-based
}

export const Stepper: React.FC<StepperProps> = ({ steps, current }) => (
  <div className={styles.stepper}>
    {steps.map((step, i) => {
      const done = i < current;
      const active = i === current;

      return (
        <React.Fragment key={step.label}>
          <div
            className={[
              styles.step,
              done ? styles.done : '',
              active ? styles.active : '',
            ].filter(Boolean).join(' ')}
          >
            <div
              className={[
                styles.circle,
                done ? styles.circleDone : '',
                active ? styles.circleActive : '',
              ].filter(Boolean).join(' ')}
            >
              {done ? <Check strokeWidth={2.5} /> : i + 1}
            </div>
            <span
              className={[
                styles.label,
                done ? styles.labelDone : '',
                active ? styles.labelActive : '',
              ].filter(Boolean).join(' ')}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={[styles.connector, done ? styles.connectorDone : ''].filter(Boolean).join(' ')} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);
