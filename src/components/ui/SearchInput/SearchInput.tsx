import React from 'react';
import { Search } from 'lucide-react';
import styles from './SearchInput.module.scss';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const SearchInput: React.FC<SearchInputProps> = (props) => (
  <div className={styles.wrapper}>
    <Search className={styles.icon} />
    <input className={styles.input} {...props} />
  </div>
);
