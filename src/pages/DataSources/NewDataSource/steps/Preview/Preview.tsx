import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { Checkbox } from '../../../../../components/Components';
import type { ApiSchemaTable } from '../../../../../lib/api';
import type { SelectedTable } from '../../../../../types/types';

interface PreviewProps {
  schema: ApiSchemaTable[];
  onSelectionChange: (tables: SelectedTable[]) => void;
}

export const Preview: React.FC<PreviewProps> = ({ schema, onSelectionChange }) => {
  const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set());
  const [selectedCols, setSelectedCols]     = useState<Set<string>>(new Set());
  const [activeTable, setActiveTable]       = useState('');

  // Pre-select all tables and all columns once schema arrives
  useEffect(() => {
    if (schema.length === 0) return;
    const allTables = new Set(schema.map(t => t.tableName));
    const allCols   = new Set(schema.flatMap(t => t.columns.map(c => c.name)));
    setSelectedTables(allTables);
    setSelectedCols(allCols);
    setActiveTable(schema[0].tableName);
  }, [schema]);

  const activeSchema  = schema.find(t => t.tableName === activeTable);
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
    setSelectedTables(prev => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
        // deselect all columns belonging to this table
        const tableCols = schema.find(t => t.tableName === id)?.columns.map(c => c.name) ?? [];
        setSelectedCols(prevCols => {
          const nc = new Set(prevCols);
          tableCols.forEach(c => nc.delete(c));
          return nc;
        });
      } else {
        n.add(id);
      }
      return n;
    });
  };

  const toggleCol = (col: string) => {
    setSelectedCols(prev => { const n = new Set(prev); n.has(col) ? n.delete(col) : n.add(col); return n; });
  };

  const allTablesSelected = schema.length > 0 && selectedTables.size === schema.length;
  const allColsSelected   = activeColumns.length > 0 && activeColumns.every(c => selectedCols.has(c));

  if (schema.length === 0) {
    return (
      <div className="p-10 text-center text-[#6b7280] text-[14px]">
        No schema discovered. Please go back and test the connection.
      </div>
    );
  }

  const headerCls = 'flex items-center gap-3 px-4 py-3 bg-[#f0f5f5] border-b border-[#b8c1d3] text-[14px] font-semibold text-[#374151]';
  const rowCls    = 'flex w-full items-center gap-3 px-4 py-[13px] border-b border-[#e5eaf0] last:border-b-0 text-[14px] text-[#374151] bg-transparent border-x-0 border-t-0 cursor-pointer transition-colors text-left';

  return (
    <div className="flex border border-[#b8c1d3] rounded-[8px] overflow-hidden">
      {/* Tables column */}
      <div className="flex-[0_0_50%] border-r border-[#b8c1d3] flex flex-col">
        <div className={headerCls}>
          <Checkbox
            checked={allTablesSelected}
            onChange={v => {
              setSelectedTables(v ? new Set(schema.map(t => t.tableName)) : new Set());
              if (!v) setSelectedCols(new Set());
            }}
          />
          <span>Tables</span>
        </div>
        <div className="overflow-y-auto max-h-[460px]">
          {schema.map(t => {
            const isActive = t.tableName === activeTable;
            return (
              <button
                type="button"
                key={t.tableName}
                className={`${rowCls} ${isActive ? 'bg-[rgba(30,112,112,0.06)]' : 'hover:bg-[#f8fafb]'}`}
                onClick={() => setActiveTable(t.tableName)}
              >
                <Checkbox
                  checked={selectedTables.has(t.tableName)}
                  onChange={() => toggleTable(t.tableName)}
                />
                <span className="flex-1">{t.tableName}</span>
                {isActive && <ChevronRight size={14} className="text-[#9ca3af] flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Columns column */}
      <div className="flex-1 flex flex-col">
        <div className={headerCls}>
          <Checkbox
            checked={allColsSelected}
            onChange={v => setSelectedCols(prev => {
              const n = new Set(prev);
              v ? activeColumns.forEach(c => n.add(c)) : activeColumns.forEach(c => n.delete(c));
              return n;
            })}
          />
          <span>Columns</span>
        </div>
        <div className="overflow-y-auto max-h-[460px]">
          {activeColumns.map(col => (
            <button
              type="button"
              key={col}
              className={`${rowCls} ${selectedCols.has(col) ? 'bg-[rgba(30,112,112,0.06)]' : 'hover:bg-[#f8fafb]'}`}
              onClick={() => toggleCol(col)}
            >
              <Checkbox checked={selectedCols.has(col)} onChange={() => toggleCol(col)} />
              <span className="flex-1">{col}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
