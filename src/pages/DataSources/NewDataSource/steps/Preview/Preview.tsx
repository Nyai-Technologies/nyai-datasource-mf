import React, { useState, useEffect } from 'react';
import { ChevronRightIcon } from '../../../../../assets/layout/Icons';
import { Checkbox } from '../../../../../components/Components';
import type { ApiSchemaTable } from '../../../../../lib/api';
import type { SelectedTable } from '../../../../../types/types';
import styles from './Preview.module.scss';

interface PreviewProps {
  schema: ApiSchemaTable[];
  onSelectionChange: (tables: SelectedTable[]) => void;
}

export const Preview: React.FC<PreviewProps> = ({ schema, onSelectionChange }) => {
  const [selectedTables, setSelectedTables] = useState<Set<string>>(
    () => new Set(schema.map(t => t.tableName)),
  );
  const [selectedCols, setSelectedCols]   = useState<Set<string>>(new Set());
  const [activeTable, setActiveTable]     = useState(schema[0]?.tableName ?? '');

  const activeSchema = schema.find(t => t.tableName === activeTable);
  const activeColumns = activeSchema?.columns.map(c => c.name) ?? [];

  // Notify parent whenever selection changes
  useEffect(() => {
    const tables: SelectedTable[] = schema
      .filter(t => selectedTables.has(t.tableName))
      .map(t => ({
        tableName: t.tableName,
        columns: t.columns.map(c => c.name).filter(n => selectedCols.has(n)),
      }));
    onSelectionChange(tables);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTables, selectedCols]);

  const toggleTable = (id: string) => {
    setSelectedTables(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleCol = (col: string) => {
    setSelectedCols(prev => { const n = new Set(prev); n.has(col) ? n.delete(col) : n.add(col); return n; });
  };

  if (schema.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
        No schema discovered. Please go back and test the connection.
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      <div className={styles.col}>
        <div className={styles.colHeader}>
          <Checkbox
            checked={selectedTables.size === schema.length}
            onChange={v => setSelectedTables(v ? new Set(schema.map(t => t.tableName)) : new Set())}
          />
          Tables
        </div>
        {schema.map(t => (
          <button
            type="button"
            key={t.tableName}
            className={`${styles.row} ${t.tableName === activeTable ? styles.rowSelected : ''}`}
            onClick={() => setActiveTable(t.tableName)}
          >
            <Checkbox checked={selectedTables.has(t.tableName)} onChange={() => toggleTable(t.tableName)} />
            <span className={styles.rowName}>{t.tableName}</span>
            {t.tableName === activeTable && <ChevronRightIcon size={14} className={styles.chevron} />}
          </button>
        ))}
      </div>

      <div className={styles.col}>
        <div className={styles.colHeader}>
          <Checkbox
            checked={activeColumns.length > 0 && activeColumns.every(c => selectedCols.has(c))}
            onChange={v => setSelectedCols(prev => {
              const n = new Set(prev);
              v ? activeColumns.forEach(c => n.add(c)) : activeColumns.forEach(c => n.delete(c));
              return n;
            })}
          />
          Columns
        </div>
        {activeColumns.map(col => (
          <div key={col} className={`${styles.row} ${selectedCols.has(col) ? styles.rowSelected : ''}`}>
            <Checkbox checked={selectedCols.has(col)} onChange={() => toggleCol(col)} />
            <span className={styles.rowName}>{col}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
