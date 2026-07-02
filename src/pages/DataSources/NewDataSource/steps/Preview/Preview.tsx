import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { Checkbox } from '../../../../../components/Components';
import type { ApiSchemaTable } from '../../../../../lib/api';
import type { SelectedTable } from '../../../../../types/types';

interface PreviewProps {
  schema: ApiSchemaTable[];
  onSelectionChange: (tables: SelectedTable[]) => void;
}

interface Selection {
  tables: Set<string>;           // selected table names
  cols: Map<string, Set<string>>; // tableName -> selected column names
}

function initSelection(schema: ApiSchemaTable[]): Selection {
  return {
    tables: new Set(schema.map(t => t.tableName)),
    cols: new Map(schema.map(t => [t.tableName, new Set(t.columns.map(c => c.name))])),
  };
}

export const Preview: React.FC<PreviewProps> = ({ schema, onSelectionChange }) => {
  const [sel, setSel]             = useState<Selection>(() => initSelection(schema));
  const [activeTable, setActiveTable] = useState(() => schema[0]?.tableName ?? '');

  const activeSchema  = schema.find(t => t.tableName === activeTable);
  const activeColumns = activeSchema?.columns.map(c => c.name) ?? [];
  const activeCols    = sel.cols.get(activeTable) ?? new Set<string>();

  useEffect(() => {
    const tables: SelectedTable[] = schema
      .filter(t => sel.tables.has(t.tableName))
      .map(t => ({
        tableName: t.tableName,
        columns: [...(sel.cols.get(t.tableName) ?? [])],
      }));
    onSelectionChange(tables);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel]);

  const toggleTable = (id: string) => {
    const tableCols = schema.find(t => t.tableName === id)?.columns.map(c => c.name) ?? [];
    setSel(prev => {
      const tables = new Set(prev.tables);
      const cols   = new Map(prev.cols);
      if (tables.has(id)) {
        tables.delete(id);
        cols.set(id, new Set());
      } else {
        tables.add(id);
        cols.set(id, new Set(tableCols));
      }
      return { tables, cols };
    });
  };

  const toggleCol = (col: string) => {
    setSel(prev => {
      const cols      = new Map(prev.cols);
      const tableCols = new Set(cols.get(activeTable) ?? []);
      tableCols.has(col) ? tableCols.delete(col) : tableCols.add(col);
      cols.set(activeTable, tableCols);

      const tables = new Set(prev.tables);
      tableCols.size > 0 ? tables.add(activeTable) : tables.delete(activeTable);

      return { tables, cols };
    });
  };

  const allTablesSelected = schema.length > 0 && sel.tables.size === schema.length;
  const allColsSelected   = activeColumns.length > 0 && activeColumns.every(c => activeCols.has(c));

  if (schema.length === 0) {
    return (
      <div className="p-10 text-center text-[#6b7280] text-[14px]">
        No schema discovered. Please go back and test the connection.
      </div>
    );
  }

  const headerCls = 'flex items-center gap-3 px-6 py-[14px] bg-[#eaf3f5] text-[14px] font-semibold text-[#1a2030]';
  const rowCls    = 'flex w-full items-center gap-3 px-6 py-[15px] border-b border-[#eef1f5] last:border-b-0 text-[14px] text-[#374151] border-x-0 border-t-0 cursor-pointer transition-colors text-left';

  return (
    <div className="flex">
      {/* Tables column */}
      <div className="flex-[0_0_50%] flex flex-col">
        <div className={headerCls}>
          <Checkbox
            checked={allTablesSelected}
            onChange={v => {
              const next = v
                ? initSelection(schema)
                : { tables: new Set<string>(), cols: new Map(schema.map(t => [t.tableName, new Set<string>()])) };
              setSel(next);
            }}
          />
          <span>Tables</span>
        </div>
        <div className="overflow-y-auto">
          {schema.map(t => {
            const isActive = t.tableName === activeTable;
            const rowBg = isActive ? 'bg-[#eaf3f5]' : 'bg-white';
            return (
              <button
                type="button"
                key={t.tableName}
                className={`${rowCls} ${rowBg}`}
                onClick={() => setActiveTable(t.tableName)}
              >
                <Checkbox
                  checked={sel.tables.has(t.tableName)}
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
      <div className="flex-1 flex flex-col border-l border-[#eef1f5]">
        <div className={headerCls}>
          <Checkbox
            checked={allColsSelected}
            onChange={v => setSel(prev => {
              const cols = new Map(prev.cols);
              cols.set(activeTable, v ? new Set(activeColumns) : new Set());
              const tables = new Set(prev.tables);
              v ? tables.add(activeTable) : tables.delete(activeTable);
              return { tables, cols };
            })}
          />
          <span>Columns</span>
        </div>
        <div className="overflow-y-auto">
          {activeColumns.map(col => {
            const isChecked = activeCols.has(col);
            return (
              <button
                type="button"
                key={col}
                className={`${rowCls} ${isChecked ? 'bg-[#eaf3f5]' : 'bg-white'} hover:bg-[#eaf3f5]`}
                onClick={() => toggleCol(col)}
              >
                <Checkbox checked={isChecked} onChange={() => toggleCol(col)} />
                <span className="flex-1">{col}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
