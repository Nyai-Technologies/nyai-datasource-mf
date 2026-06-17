import React, { useState } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';
import { Button } from '../../../../components/Components';

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

  const selectCls = 'w-full h-10 border border-[#b8c1d3] rounded-[6px] pl-3 pr-9 text-[14px] text-[#374151] appearance-none outline-none bg-white cursor-pointer focus:border-[#1e7070] box-sizing-border';
  const fieldCls  = 'flex flex-col gap-2';
  const labelCls  = 'text-[14px] font-semibold text-[#374151]';

  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-[12px] w-[860px] max-w-[calc(100vw-40px)] max-h-[calc(100vh-60px)] shadow-[0_8px_32px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-6 py-5 border-b border-[#b8c1d3] flex-shrink-0">
          <span className="text-[18px] font-semibold text-[#374151]">Create Consent Notice</span>
          <button className="bg-transparent border-none cursor-pointer text-[#9ca3af] flex items-center p-1 rounded-[6px] hover:bg-[#f1f5f9] hover:text-[#374151]" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4 overflow-y-auto">

          {/* Notice Name */}
          <div className={fieldCls}>
            <label className={labelCls}>Notice Name</label>
            <input
              className="h-10 border border-[#b8c1d3] rounded-[6px] px-3 text-[14px] text-[#374151] outline-none w-full box-border placeholder:text-[#9ca3af] focus:border-[#1e7070]"
              placeholder="Enter a name for consent notice"
              value={noticeName}
              onChange={e => setNoticeName(e.target.value)}
            />
          </div>

          {/* Table + Columns */}
          <div className="grid grid-cols-2 gap-4">
            <div className={fieldCls}>
              <label className={labelCls}>Select Table</label>
              <div className="relative">
                <select className={selectCls} value={selectedTable} onChange={handleTableChange}>
                  <option value="">Select the table for generating consent notice</option>
                  {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9ca3af]" />
              </div>
            </div>

            <div className={fieldCls}>
              <label className={labelCls}>Select Column(s)</label>
              <div className="relative">
                <select
                  className={`${selectCls} ${!selectedTable ? 'opacity-50 cursor-not-allowed' : ''}`}
                  value={colValue}
                  onChange={handleColChange}
                  disabled={!selectedTable}
                >
                  <option value="">Select a minimum of 2 columns</option>
                  {availableCols.length >= 2 && <option value="__all__">All Columns</option>}
                  {availableCols.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9ca3af]" />
              </div>
            </div>
          </div>

          <hr className="border-none border-t border-[#b8c1d3] my-1" />

          {/* Purpose section header */}
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold text-[#374151]">Define Purpose and Retention Period</span>
            <button
              type="button"
              className="flex items-center gap-[6px] h-8 px-3 border border-[#1e7070] rounded-[6px] bg-white text-[13px] text-[#1e7070] font-medium cursor-pointer hover:bg-[rgba(30,112,112,0.06)]"
              onClick={addPurpose}
            >
              <Plus size={14} /> Add Purpose
            </button>
          </div>

          {/* Purpose rows */}
          {purposeRows.map((row, i) => (
            <div key={i} className="grid grid-cols-2 gap-4">
              <div className={fieldCls}>
                <label className={labelCls}>Purpose</label>
                <div className="relative">
                  <select className={selectCls} value={row.purpose} onChange={e => updateRow(i, { purpose: e.target.value })}>
                    <option value="">Select a purpose or define your own</option>
                    {PRESET_PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9ca3af]" />
                </div>
              </div>

              <div className={fieldCls}>
                <label className={labelCls}>Retention Period</label>
                <div className="flex h-10 border border-[#b8c1d3] rounded-[6px] overflow-hidden focus-within:border-[#1e7070]">
                  <input
                    className="flex-1 border-none outline-none px-3 text-[14px] text-[#374151] min-w-0 placeholder:text-[#9ca3af]"
                    placeholder="Enter retention period"
                    value={row.retention}
                    onChange={e => updateRow(i, { retention: e.target.value })}
                  />
                  <div className="relative flex-shrink-0 border-l border-[#b8c1d3]">
                    <select
                      className="h-full pl-3 pr-7 border-none outline-none text-[14px] text-[#374151] bg-white appearance-none cursor-pointer"
                      value={row.unit}
                      onChange={e => updateRow(i, { unit: e.target.value })}
                    >
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#9ca3af]" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#b8c1d3] flex-shrink-0">
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
