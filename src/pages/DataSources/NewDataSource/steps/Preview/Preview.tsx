import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { Checkbox } from '../../../../../components/Components';
import type { ApiSchemaTable } from '../../../../../lib/api';
import type { SelectedTable } from '../../../../../types/types';

interface PreviewProps {
  schema: ApiSchemaTable[];
  onSelectionChange: (tables: SelectedTable[]) => void;
}

const rowBase = 'flex items-center w-full gap-3 px-4 py-[14px] border-none border-b border-[#b8c1d3] bg-transparent text-[14px] text-[#374151] cursor-pointer transition-colors text-left last:border-b-0 hover:bg-[#f1f5f9] [box-sizing:border-box]';
const colHeaderCls = 'flex items-center gap-3 px-4 py-[14px] bg-[#f0f5f5] border-b border-[#b8c1d3] text-[14px] font-semibold text-[#374151] sticky top-0';

export const Preview: React.FC<PreviewProps> = ({ schema, onSelectionChange }) => {
  const [selectedTables, setSelectedTables] = useState<Set<string>>(
    () => new Set(schema.map(t => t.tableName)),
  );
  const [selectedCols, setSelectedCols]   = useState<Set<string>>(new Set());
  const [activeTable, setActiveTable]     = useState(schema[0]?.tableName ?? '');

  const activeSchema = schema.find(t => t.tableName === activeTable);
  const activeColumns = activeSchema?.columns.map(c => c.name) ?? [];

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
      <div className="p-10 text-center text-[#6b7280] text-[14px]">
        No schema discovered. Please go back and test the connection.
      </div>
    );
  }

  return (
    <div className="flex border border-[#b8c1d3] rounded-[8px] overflow-hidden min-h-[360px]">
      {/* Tables column */}
      <div className="flex-[0_0_38%] border-r border-[#b8c1d3] overflow-y-auto max-h-[480px]">
        <div className={colHeaderCls}>
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
            className={`${rowBase} ${t.tableName === activeTable ? 'bg-[rgba(30,112,112,0.07)]' : ''}`}
            onClick={() => setActiveTable(t.tableName)}
          >
            <Checkbox checked={selectedTables.has(t.tableName)} onChange={() => toggleTable(t.tableName)} />
            <span className="flex-1">{t.tableName}</span>
            {t.tableName === activeTable && <ChevronRight size={14} className="text-[#9ca3af] w-[14px] h-[14px]" />}
          </button>
        ))}
      </div>

      {/* Columns column */}
      <div className="flex-1 overflow-y-auto max-h-[480px]">
        <div className={colHeaderCls}>
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
          <div
            key={col}
            className={`${rowBase} ${selectedCols.has(col) ? 'bg-[rgba(30,112,112,0.07)]' : ''}`}
          >
            <Checkbox checked={selectedCols.has(col)} onChange={() => toggleCol(col)} />
            <span className="flex-1">{col}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
