import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './Accordion.module.scss';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={styles.item}>
      <div className={styles.header} onClick={() => setOpen(!open)}>
        <span className={styles.title}>{title}</span>
        <ChevronDown className={`${styles.chevron} ${open ? styles.open : ''}`} />
      </div>
      {open && <div className={styles.body}>{children}</div>}
    </div>
  );
};
