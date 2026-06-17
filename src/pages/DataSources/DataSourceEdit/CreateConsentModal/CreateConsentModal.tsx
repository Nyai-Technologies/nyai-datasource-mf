import React, { useState } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';
import { Button } from '../../../../components/Components';
import styles from './CreateConsentModal.module.scss';

interface TableItem  { id: string; name: string; pii: boolean; }
interface ColumnItem { name: string; pii: boolean; description: string; }

export interface PurposeEntry { purpose: string; retention: string; unit: string; categories?: string[]; }

interface CreateConsentModalProps {
  onClose:    () => void;
  onGenerate: (name: string, table: string, columns: string[], purposes: PurposeEntry[]) => void;
  tables:  TableItem[];
  columns: Record<string, ColumnItem[]>;
}

const PRESET_PURPOSES = [
  'Order Processing and Fulfillment',
  'Billing and Payment',
  'Delivery of Goods',
  'Marketing and Analytics',
  'Customer Support',
];

const UNITS = ['Day(s)', 'Month(s)', 'Year(s)'];

export const CreateConsentModal: React.FC<CreateConsentModalProps> = ({
  onClose, onGenerate, tables, columns,
}) => {
  const [noticeName, setNoticeName]     = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [colValue, setColValue]         = useState('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [purposeRows, setPurposeRows]   = useState<PurposeEntry[]>([
    { purpose: '', retention: '', unit: 'Month(s)' },
  ]);

  const availableCols = selectedTable ? (columns[selectedTable] ?? []) : [];

  const handleTableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTable(e.target.value);
    setColValue('');
    setSelectedColumns([]);
  };

  const handleColChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setColValue(val);
    if (val === '__all__') {
      setSelectedColumns(availableCols.map(c => c.name));
    } else if (val) {
      setSelectedColumns([val]);
    } else {
      setSelectedColumns([]);
    }
  };

  const updateRow = (i: number, patch: Partial<PurposeEntry>) =>
    setPurposeRows(prev => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const addPurpose = () =>
    setPurposeRows(prev => [...prev, { purpose: '', retention: '', unit: 'Month(s)' }]);

  const canGenerate = noticeName.trim() && selectedTable && selectedColumns.length >= 1;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={e => e.stopPropagation()}>

        <div className={styles.header}>
          <span className={styles.title}>Create Consent Notice</span>
          <button className={styles.closeBtn} type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.body}>

          {/* Notice Name */}
          <div className={styles.field}>
            <label className={styles.label}>Notice Name</label>
            <input
              className={styles.input}
              placeholder="Enter a name for consent notice"
              value={noticeName}
              onChange={e => setNoticeName(e.target.value)}
            />
          </div>

          {/* Table + Columns — 2 columns */}
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label}>Select Table</label>
              <div className={styles.selectWrap}>
                <select className={styles.select} value={selectedTable} onChange={handleTableChange}>
                  <option value="">Select the table for generating consent notice</option>
                  {tables.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} className={styles.selectChevron} />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Select Column(s)</label>
              <div className={styles.selectWrap}>
                <select
                  className={`${styles.select} ${!selectedTable ? styles.disabled : ''}`}
                  value={colValue}
                  onChange={handleColChange}
                  disabled={!selectedTable}
                >
                  <option value="">Select a minimum of 2 columns</option>
                  {availableCols.length >= 2 && (
                    <option value="__all__">All Columns</option>
                  )}
                  {availableCols.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} className={styles.selectChevron} />
              </div>
            </div>
          </div>

          <hr className={styles.divider} />

          {/* Purpose section header */}
          <div className={styles.sectionBar}>
            <span className={styles.sectionTitle}>Define Purpose and Retention Period</span>
            <button type="button" className={styles.addBtn} onClick={addPurpose}>
              <Plus size={14} /> Add Purpose
            </button>
          </div>

          {/* Purpose rows */}
          {purposeRows.map((row, i) => (
            <div key={i} className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label}>Purpose</label>
                <div className={styles.selectWrap}>
                  <select
                    className={styles.select}
                    value={row.purpose}
                    onChange={e => updateRow(i, { purpose: e.target.value })}
                  >
                    <option value="">Select a purpose or define your own</option>
                    {PRESET_PURPOSES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className={styles.selectChevron} />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Retention Period</label>
                <div className={styles.retentionRow}>
                  <input
                    className={styles.retentionInput}
                    placeholder="Enter retention period"
                    value={row.retention}
                    onChange={e => updateRow(i, { retention: e.target.value })}
                  />
                  <div className={styles.unitWrap}>
                    <select
                      className={styles.unitSelect}
                      value={row.unit}
                      onChange={e => updateRow(i, { unit: e.target.value })}
                    >
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <ChevronDown size={13} className={styles.unitChevron} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!canGenerate}
            onClick={() => {
              onGenerate(noticeName, selectedTable, selectedColumns, purposeRows);
              onClose();
            }}
          >
            Generate Consent Notice
          </Button>
        </div>
      </div>
    </div>
  );
};
