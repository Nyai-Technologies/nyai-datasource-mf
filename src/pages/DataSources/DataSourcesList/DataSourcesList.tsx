import React, { useState, useEffect, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, FlaskConical, CircleDot, Pencil, Trash2 } from 'lucide-react';
import { AutorenewIcon, PlusIcon } from '../../../assets/layout/Icons';
import { Button, SearchInput, Table, Pagination } from '../../../components/Components';
import { DB_LOGOS, DB_BG } from '../../../assets/layout/dbLogos';
import { FilterDropdown } from '../../../components/ui/FilterDropdown/FilterDropdown';
import type { FilterOption } from '../../../components/ui/FilterDropdown/FilterDropdown';
import type { DataSource } from '../../../types/types';
import { api, type ApiDataSource } from '../../../lib/api';

function TypeCell({ type }: { readonly type: string }) {
  const key  = (type ?? '').toLowerCase();
  const logo = DB_LOGOS[key];
  const bg   = DB_BG[key] ?? '#f1f5f9';
  const label = type ? type.charAt(0).toUpperCase() + type.slice(1) : '—';
  return (
    <div className="flex items-center gap-2">
      {logo && (
        <div className="w-6 h-6 rounded-[4px] flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
          <img src={logo} alt={label} className="w-4 h-4 object-contain" />
        </div>
      )}
      <span>{label}</span>
    </div>
  );
}

const STATUS_META: Record<DataSource['status'], { label: string; icon: React.ReactNode; dot: string; text: string; bg: string }> = {
  completed:        { label: 'Completed',        icon: <CheckCircle  size={13} />, dot: '#16a34a', text: '#15803d', bg: '#f0fdf4' },
  sample_collected: { label: 'Sample Collected', icon: <FlaskConical size={13} />, dot: '#2563eb', text: '#1d4ed8', bg: '#eff6ff' },
  created:          { label: 'Created',           icon: <CircleDot    size={13} />, dot: '#9ca3af', text: '#6b7280', bg: '#f9fafb' },
};

function StatusCell({ status }: { readonly status: DataSource['status'] }) {
  const meta = STATUS_META[status] ?? STATUS_META.created;
  return (
    <span
      className="inline-flex items-center gap-[5px] px-[9px] py-[3px] rounded-full text-[12px] font-medium"
      style={{ background: meta.bg, color: meta.text }}
    >
      <span style={{ color: meta.dot }}>{meta.icon}</span>
      {meta.label}
    </span>
  );
}

const STATUS_OPTIONS: FilterOption[] = [
  { value: '',                 label: 'All Status'       },
  { value: 'completed',        label: 'Completed'        },
  { value: 'sample_collected', label: 'Sample Collected' },
  { value: 'created',          label: 'Created'          },
];

const TYPE_OPTIONS: FilterOption[] = [
  { value: '',           label: 'All Types'  },
  { value: 'PostgreSQL', label: 'PostgreSQL' },
  { value: 'Postgres',   label: 'Postgres'   },
  { value: 'MySQL',      label: 'MySQL'      },
  { value: 'MongoDB',    label: 'MongoDB'    },
];

function mapApiDataSource(src: ApiDataSource): DataSource {
  const statusMap: Record<string, DataSource['status']> = {
    COMPLETED:        'completed',
    SAMPLE_COLLECTED: 'sample_collected',
    CREATED:          'created',
  };
  const lastSynced = src.updated_at
    ? new Date(src.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
  return {
    id:         src.id,
    appName:    src.app_name,
    name:       src.name,
    status:     statusMap[src.status] ?? 'created',
    type:       src.type,
    lastSynced,
    addedBy:    src.created_by,
  };
}

function RowMenu({ onEdit, onDelete, disabled }: {
  readonly onEdit: () => void;
  readonly onDelete: () => void;
  readonly disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        className="w-7 h-7 flex items-center justify-center rounded text-gray-400 bg-transparent border-none cursor-pointer hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-40" style={{ minWidth: 160 }}>
            <div className="rounded-[10px] overflow-hidden" style={{ background: '#1e5f6e' }}>
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3.5 text-white text-[15px] font-medium border-b border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={e => { e.stopPropagation(); setOpen(false); onEdit(); }}
              >
                <Pencil size={18} strokeWidth={1.8} />
                Edit
              </button>
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3.5 text-white text-[15px] font-medium cursor-pointer hover:bg-white/10 transition-colors"
                onClick={e => { e.stopPropagation(); setOpen(false); onDelete(); }}
              >
                <Trash2 size={18} strokeWidth={1.8} />
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export const DataSourcesList = () => {
  const navigate = useNavigate();
  const [data, setData]                   = useState<DataSource[]>([]);
  const [loading, setLoading]             = useState(true);
  const [apiError, setApiError]           = useState<string | null>(null);
  const [syncing, setSyncing]             = useState(false);
  const [deletingId, setDeletingId]       = useState<string | null>(null);
  const [search, setSearch]               = useState('');
  const [statusFilter, setStatusFilter]   = useState('');
  const [typeFilter, setTypeFilter]       = useState('');
  const [addedByFilter, setAddedByFilter] = useState('');
  const [page, setPage]                   = useState(1);
  const [pageSize, setPageSize]           = useState(10);

  const fetchData = async () => {
    setApiError(null);
    try {
      const result = await api.listDataSources();
      setData(result.map(mapApiDataSource));
    } catch {
      setApiError('Failed to load data sources. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSync = async () => {
    setSyncing(true);
    await fetchData();
    setSyncing(false);
  };

  const handleDelete = async (row: DataSource) => {
    if (!confirm(`Delete "${row.name}"? This cannot be undone.`)) return;
    setDeletingId(row.id);
    try {
      await api.deleteDataSource(row.id);
      setData(prev => prev.filter(d => d.id !== row.id));
    } catch {
      setApiError('Failed to delete data source. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    { key: 'name',       label: 'Data Source', sortable: true },
    { key: 'status',     label: 'Status',      render: (val: unknown) => <StatusCell status={val as DataSource['status']} /> },
    { key: 'type',       label: 'Type',        sortable: true, render: (val: unknown) => <TypeCell type={String(val ?? '')} /> },
    { key: 'lastSynced', label: 'Last Synced', sortable: true },
    { key: 'addedBy',    label: 'Added By',    sortable: true },
    {
      key: 'actions',
      label: '',
      render: (_val: unknown, row: DataSource) => (
        <RowMenu
          disabled={deletingId === row.id}
          onEdit={() => navigate(`/data-sources/${row.id}/edit`, { state: { listRow: row } })}
          onDelete={() => handleDelete(row)}
        />
      ),
    },
  ];

  const addedByOptions: FilterOption[] = [
    { value: '', label: 'All Users' },
    ...Array.from(new Set(data.map(d => d.addedBy).filter(v => v && v !== '—')))
        .map(v => ({ value: v, label: v })),
  ];

  const filtered = data
    .filter(d => d.name.toLowerCase().includes(search.toLowerCase()))
    .filter(d => !statusFilter  || d.status  === statusFilter)
    .filter(d => !typeFilter    || d.type    === typeFilter)
    .filter(d => !addedByFilter || d.addedBy === addedByFilter);

  const resetPage = () => setPage(1);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <SearchInput
            placeholder="Search"
            value={search}
            onChange={e => { setSearch(e.target.value); resetPage(); }}
          />
          <FilterDropdown label="Status"   options={STATUS_OPTIONS}  value={statusFilter}  onChange={v => { setStatusFilter(v);  resetPage(); }} />
          <FilterDropdown label="Added By" options={addedByOptions}  value={addedByFilter} onChange={v => { setAddedByFilter(v); resetPage(); }} />
          <FilterDropdown label="Type"     options={TYPE_OPTIONS}    value={typeFilter}    onChange={v => { setTypeFilter(v);    resetPage(); }} />
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 h-9 px-3 border border-gray-200 rounded-lg bg-white text-sm text-gray-600 cursor-pointer transition-colors hover:border-gray-400 hover:text-gray-800 [&>svg]:w-[14px] [&>svg]:h-[14px]"
            onClick={handleSync}
            disabled={syncing}
          >
            <AutorenewIcon size={14} /> {syncing ? 'Syncing…' : 'Sync Data'}
          </button>
          <Button onClick={() => navigate('/data-sources/new/type')}>
            <PlusIcon size={15} /> New Data Source
          </Button>
        </div>
      </div>

      <div className="bg-white flex-1 flex flex-col overflow-hidden">
        {apiError && (
          <div className="px-4 py-3 bg-[#fef2f2] border border-[#fecaca] rounded-[6px] text-[#dc2626] text-[13px] mb-2">
            {apiError}
          </div>
        )}
        {loading ? (
          <div className="p-10 text-center text-[#6b7280] text-[14px]">Loading data sources…</div>
        ) : (
          <>
            <Table
              columns={columns}
              data={filtered.slice((page - 1) * pageSize, page * pageSize)}
              onRowClick={row => navigate(`/data-sources/${row.id}/edit`, { state: { listRow: row } })}
            />
            <Pagination
              page={page}
              total={filtered.length}
              pageSize={pageSize}
              onPage={setPage}
              onPageSize={ps => { setPageSize(ps); setPage(1); }}
            />
          </>
        )}
      </div>
    </div>
  );
};
