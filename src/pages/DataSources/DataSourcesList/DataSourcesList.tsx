import React, { useState, useEffect, useRef} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { AutorenewIcon, PlusIcon } from '../../../assets/layout/Icons';
import { Button, SearchInput, Table, Pagination } from '../../../components/Components';
import { DB_LOGOS, DB_BG } from '../../../assets/layout/dbLogos';
import { FilterDropdown } from '../../../components/ui/FilterDropdown/FilterDropdown';
import type { FilterOption } from '../../../components/ui/FilterDropdown/FilterDropdown';
import type { DataSource } from '../../../types/types';
import { api, type ApiDataSource } from '../../../lib/api';

function CompletedIcon({ color }: { color: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path d="M12 21.5C10.6872 21.5 9.45292 21.2503 8.29725 20.751C7.14142 20.2517 6.13592 19.5744 5.28075 18.7193C4.42558 17.8641 3.74833 16.8586 3.249 15.7028C2.74967 14.5471 2.5 13.3128 2.5 12C2.5 10.6872 2.74967 9.45292 3.249 8.29725C3.74833 7.14142 4.42558 6.13592 5.28075 5.28075C6.13592 4.42558 7.14142 3.74833 8.29725 3.249C9.45292 2.74967 10.6872 2.5 12 2.5C12.832 2.5 13.6384 2.60608 14.4193 2.81825C15.2001 3.03042 15.9469 3.33717 16.6598 3.7385C16.8519 3.84617 16.9775 4.00133 17.0365 4.204C17.0955 4.4065 17.0609 4.59558 16.9327 4.77125C16.8046 4.94692 16.635 5.05683 16.424 5.101C16.2132 5.14517 16.0097 5.11342 15.8135 5.00575C15.2288 4.67892 14.6137 4.42958 13.9682 4.25775C13.3227 4.08592 12.6667 4 12 4C9.78333 4 7.89583 4.77917 6.3375 6.3375C4.77917 7.89583 4 9.78333 4 12C4 14.2167 4.77917 16.1042 6.3375 17.6625C7.89583 19.2208 9.78333 20 12 20C14.2167 20 16.1042 19.2208 17.6625 17.6625C19.2208 16.1042 20 14.2167 20 12C20 11.809 19.9927 11.6222 19.978 11.4395C19.9632 11.2567 19.9378 11.0698 19.902 10.8788C19.8687 10.6659 19.9052 10.4624 20.0115 10.2682C20.118 10.0741 20.2776 9.94817 20.4902 9.8905C20.6929 9.83267 20.8804 9.85767 21.0527 9.9655C21.2252 10.0732 21.3282 10.2282 21.3615 10.4307C21.4077 10.6832 21.4423 10.939 21.4653 11.198C21.4884 11.457 21.5 11.7243 21.5 12C21.5 13.3128 21.2503 14.5471 20.751 15.7028C20.2517 16.8586 19.5744 17.8641 18.7193 18.7193C17.8641 19.5744 16.8586 20.2517 15.7028 20.751C14.5471 21.2503 13.3128 21.5 12 21.5ZM10.5808 14.1463L19.9193 4.79225C20.0578 4.65392 20.2293 4.58058 20.4338 4.57225C20.6381 4.56392 20.8178 4.63725 20.973 4.79225C21.1178 4.93725 21.1903 5.11292 21.1903 5.31925C21.1903 5.52558 21.1178 5.70125 20.973 5.84625L11.2135 15.6212C11.0327 15.8019 10.8218 15.8923 10.5808 15.8923C10.3398 15.8923 10.1288 15.8019 9.948 15.6212L7.20375 12.877C7.06542 12.7385 6.99458 12.5644 6.99125 12.3548C6.98808 12.1453 7.05892 11.968 7.20375 11.823C7.34875 11.6782 7.52442 11.6058 7.73075 11.6058C7.93708 11.6058 8.11275 11.6782 8.25775 11.823L10.5808 14.1463Z" fill={color}/>
    </svg>
  );
}

function SampleCollectedIcon({ color }: { color: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path d="M7.90375 20H16.0962V17C16.0962 15.8615 15.6982 14.8877 14.902 14.0787C14.1058 13.2697 13.1385 12.8652 12 12.8652C10.8615 12.8652 9.89417 13.2702 9.098 14.08C8.30183 14.8897 7.90375 15.863 7.90375 17V20ZM14.902 9.92C15.6982 9.11033 16.0962 8.137 16.0962 7V4H7.90375V7C7.90375 8.1385 8.30183 9.11225 9.098 9.92125C9.89417 10.7302 10.8615 11.1348 12 11.1348C13.1385 11.1348 14.1058 10.7298 14.902 9.92ZM5.25 21.5C5.0375 21.5 4.85942 21.4281 4.71575 21.2843C4.57192 21.1404 4.5 20.9623 4.5 20.7498C4.5 20.5371 4.57192 20.359 4.71575 20.2155C4.85942 20.0718 5.0375 20 5.25 20H6.404V17C6.404 15.8743 6.712 14.8497 7.328 13.926C7.944 13.0022 8.76033 12.3602 9.777 12C8.76033 11.6333 7.944 10.9898 7.328 10.0693C6.712 9.14875 6.404 8.12567 6.404 7V4H5.25C5.0375 4 4.85942 3.92808 4.71575 3.78425C4.57192 3.64042 4.5 3.46225 4.5 3.24975C4.5 3.03708 4.57192 2.859 4.71575 2.7155C4.85942 2.57183 5.0375 2.5 5.25 2.5H18.75C18.9625 2.5 19.1406 2.57192 19.2843 2.71575C19.4281 2.85958 19.5 3.03775 19.5 3.25025C19.5 3.46292 19.4281 3.641 19.2843 3.7845C19.1406 3.92817 18.9625 4 18.75 4H17.596V7C17.596 8.12567 17.288 9.14875 16.672 10.0693C16.056 10.9898 15.2397 11.6333 14.223 12C15.2397 12.3602 16.056 13.0022 16.672 13.926C17.288 14.8497 17.596 15.8743 17.596 17V20H18.75C18.9625 20 19.1406 20.0719 19.2843 20.2157C19.4281 20.3596 19.5 20.5377 19.5 20.7502C19.5 20.9629 19.4281 21.141 19.2843 21.2845C19.1406 21.4282 18.9625 21.5 18.75 21.5H5.25Z" fill={color}/>
    </svg>
  );
}

function CreatedIcon({ color }: { color: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path d="M8.075 20.5C6.81083 20.5 5.73233 20.0535 4.8395 19.1605C3.9465 18.2677 3.5 17.1892 3.5 15.925C3.5 15.3097 3.61383 14.7244 3.8415 14.1692C4.069 13.6141 4.40008 13.1193 4.83475 12.6848L7.479 10.05C7.62767 9.90133 7.80425 9.82542 8.00875 9.82225C8.21325 9.81892 8.393 9.89483 8.548 10.05C8.70317 10.2052 8.78075 10.3808 8.78075 10.577C8.78075 10.7732 8.70317 10.9488 8.548 11.1038L5.8885 13.7537C5.59233 14.0499 5.36858 14.3852 5.21725 14.7595C5.06608 15.134 4.9905 15.5225 4.9905 15.925C4.9905 16.7802 5.29075 17.5064 5.89125 18.1038C6.49192 18.7013 7.21983 19 8.075 19C8.4775 19 8.8685 18.9243 9.248 18.773C9.6275 18.6218 9.96533 18.3982 10.2615 18.102L12.9057 15.452C13.0544 15.3135 13.2285 15.2427 13.428 15.2395C13.6273 15.2362 13.8045 15.3121 13.9595 15.4672C14.1147 15.6224 14.1923 15.7981 14.1923 15.9943C14.1923 16.1904 14.1147 16.366 13.9595 16.521L11.3152 19.1557C10.8807 19.5904 10.3859 19.9231 9.83075 20.1538C9.27558 20.3846 8.69033 20.5 8.075 20.5ZM9.4405 14.55C9.29167 14.4013 9.21725 14.2248 9.21725 14.0203C9.21725 13.8158 9.29167 13.6392 9.4405 13.4905L13.4905 9.4405C13.6392 9.29167 13.8158 9.21567 14.0203 9.2125C14.2248 9.20933 14.4045 9.28533 14.5595 9.4405C14.7147 9.5955 14.7923 9.77367 14.7923 9.975C14.7923 10.1763 14.7147 10.3545 14.5595 10.5095L10.5095 14.55C10.3608 14.6987 10.1827 14.7746 9.975 14.7778C9.76733 14.7811 9.58917 14.7052 9.4405 14.55ZM15.452 13.9595C15.2968 13.8108 15.2208 13.6352 15.224 13.4327C15.2272 13.2301 15.3032 13.0544 15.452 12.9058L18.1115 10.2615C18.4013 9.97183 18.6193 9.644 18.7655 9.278C18.9115 8.91183 18.9845 8.5275 18.9845 8.125C18.9845 7.25967 18.6868 6.5225 18.0913 5.9135C17.4958 5.3045 16.7653 5 15.9 5C15.4975 5 15.109 5.07567 14.7345 5.227C14.3602 5.37817 14.0282 5.59867 13.7385 5.8885L11.0942 8.548C10.9456 8.69683 10.7699 8.77283 10.5673 8.776C10.3648 8.77917 10.1892 8.70317 10.0405 8.548C9.89167 8.39933 9.81725 8.22275 9.81725 8.01825C9.81725 7.81375 9.89167 7.63717 10.0405 7.4885L12.6848 4.84425C13.1193 4.40958 13.6141 4.07692 14.1693 3.84625C14.7244 3.61542 15.3097 3.5 15.925 3.5C17.1892 3.5 18.2651 3.94808 19.1528 4.84425C20.0406 5.74042 20.4845 6.82567 20.4845 8.1C20.4845 8.70517 20.3733 9.28367 20.151 9.8355C19.9285 10.3875 19.5999 10.8807 19.1652 11.3152L16.5115 13.9595C16.3628 14.1083 16.1863 14.1827 15.9818 14.1827C15.7773 14.1827 15.6007 14.1083 15.452 13.9595Z" fill={color}/>
    </svg>
  );
}

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

const STATUS_META: Record<DataSource['status'], { label: string; color: string; bg: string; Icon: React.ComponentType<{ color: string }> }> = {
  completed:        { label: 'Completed',    color: '#2BBF6A', bg: '#edfbf3', Icon: CompletedIcon       },
  sample_collected: { label: 'PII Updated',  color: '#F6A700', bg: '#fff8e6', Icon: SampleCollectedIcon },
  created:          { label: 'Connected',    color: '#003DE6', bg: '#e6ecff', Icon: CreatedIcon         },
};

function StatusCell({ status }: { readonly status: DataSource['status'] }) {
  const meta = STATUS_META[status] ?? STATUS_META.created;
  return (
    <span
      className="inline-flex items-center gap-[5px] px-[9px] py-[3px] rounded-full text-[12px] font-medium"
      style={{ background: meta.bg, color: meta.color }}
    >
      <meta.Icon color={meta.color} />
      {meta.label}
    </span>
  );
}

const STATUS_OPTIONS: FilterOption[] = [
  { value: '',                 label: 'All Status'  },
  { value: 'completed',        label: 'Completed'   },
  { value: 'sample_collected', label: 'PII Updated' },
  { value: 'created',          label: 'Connected'   },
];

const TYPE_OPTIONS: FilterOption[] = [
  { value: '',         label: 'All Types'  },
  { value: 'Postgres', label: 'PostgreSQL' },
  { value: 'MySQL',    label: 'MySQL'      },
  { value: 'MongoDB',  label: 'MongoDB'    },
];

function mapApiDataSource(src: ApiDataSource): DataSource {
  const rawStatus = (src.status ?? '').trim().toLowerCase().replace(/[\s-]+/g, '_') as DataSource['status'];
  const lastSynced = src.updated_at
    ? new Date(src.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
  return {
    id:         src.id,
    appName:    src.app_name,
    name:       src.name,
    status:     rawStatus,
    type:       src.type,
    lastSynced,
    addedBy:    src.created_by,
  };
}

function RowMenu({ onEdit, onDelete, disabled, canEdit }: {
  readonly onEdit: () => void;
  readonly onDelete: () => void;
  readonly disabled: boolean;
  readonly canEdit: boolean;
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
              {canEdit && (
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-white text-[15px] font-medium border-b border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={e => { e.stopPropagation(); setOpen(false); onEdit(); }}
                >
                  <Pencil size={18} strokeWidth={1.8} />
                  Edit
                </button>
              )}
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
  const location = useLocation();
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

  const fetchData = async (resetToPage1 = false) => {
    setApiError(null);
    try {
      const result = await api.listDataSources();
      setData(result.map(mapApiDataSource));
      if (resetToPage1) setPage(1);
    } catch {
      setApiError('Failed to load data sources. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch every time the user navigates back to this page
  useEffect(() => { fetchData(true); }, [location.key]);

  const handleSync = async () => {
    setSyncing(true);
    await fetchData(true);
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
          canEdit={row.status === 'completed'}
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  // Snap page state back to 1 when it goes beyond available pages
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

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
              onRowClick={row => { if (row.status === 'completed') navigate(`/data-sources/${row.id}/edit`, { state: { listRow: row } }); }}
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
