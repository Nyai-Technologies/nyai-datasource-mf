import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { AutorenewIcon, PlusIcon } from '../../../assets/layout/Icons';
import { Button, SearchInput, Table, Pagination } from '../../../components/Components';
import { FilterDropdown } from '../../../components/ui/FilterDropdown/FilterDropdown';
import type { FilterOption } from '../../../components/ui/FilterDropdown/FilterDropdown';
import type { DataSource } from '../../../types/types';
import { api, type ApiDataSource } from '../../../lib/api';

const STATUS_OPTIONS: FilterOption[] = [
  { value: '',        label: 'All Status'  },
  { value: 'valid',   label: 'Completed'   },
  { value: 'pending', label: 'Pending'     },
];

const TYPE_OPTIONS: FilterOption[] = [
  { value: '',           label: 'All Types'  },
  { value: 'PostgreSQL', label: 'PostgreSQL' },
  { value: 'MySQL',      label: 'MySQL'      },
  { value: 'MongoDB',    label: 'MongoDB'    },
];

function mapApiDataSource(src: ApiDataSource): DataSource {
  const statusMap: Record<string, DataSource['status']> = {
    SAMPLE_COLLECTED: 'valid',
    CREATED:          'pending',
  };
  return {
    id:         src.id,
    appName:    src.app_name,
    name:       src.name,
    status:     statusMap[src.status] ?? 'pending',
    type:       src.type,
    lastSynced: '—',
    addedBy:    src.created_by,
  };
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
    { key: 'status',     label: 'Status' },
    { key: 'type',       label: 'Type',        sortable: true },
    { key: 'lastSynced', label: 'Last Synced', sortable: true },
    { key: 'addedBy',    label: 'Added By',    sortable: true },
    {
      key: 'actions',
      label: '',
      render: (_val: unknown, row: DataSource) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Edit"
            className="flex items-center justify-center w-8 h-8 rounded-[4px] text-[#6b7280] bg-transparent border-none cursor-pointer hover:bg-[#f1f5f9] hover:text-[#1e7070] transition-colors"
            onClick={e => { e.stopPropagation(); navigate(`/data-sources/${row.id}/edit`, { state: { listRow: row } }); }}
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            title="Delete"
            disabled={deletingId === row.id}
            className="flex items-center justify-center w-8 h-8 rounded-[4px] text-[#6b7280] bg-transparent border-none cursor-pointer hover:bg-[#fef2f2] hover:text-[#dc2626] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={e => { e.stopPropagation(); handleDelete(row); }}
          >
            <Trash2 size={15} />
          </button>
        </div>
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
            className="flex items-center gap-[6px] h-9 px-3 border border-[#b8c1d3] rounded-[6px] bg-white text-[14px] text-[#6b7280] cursor-pointer transition-all hover:border-[#d1d5db] hover:text-[#1a2030] [&>svg]:w-[14px] [&>svg]:h-[14px]"
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

      <div className="bg-white rounded-[8px] flex-1 flex flex-col overflow-hidden">
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
