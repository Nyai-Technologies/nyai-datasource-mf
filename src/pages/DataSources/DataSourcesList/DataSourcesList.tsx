import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AutorenewIcon, PlusIcon } from '../../../assets/layout/Icons';
import { Button, SearchInput, Table, Pagination } from '../../../components/Components';
import { FilterDropdown } from '../../../components/ui/FilterDropdown/FilterDropdown';
import type { Column } from '../../../components/Components';
import type { FilterOption } from '../../../components/ui/FilterDropdown/FilterDropdown';
import type { DataSource } from '../../../types/types';
import { api, type ApiDataSource } from '../../../lib/api';
import styles from './DataSourcesList.module.scss';

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

const COLUMNS: Column<DataSource>[] = [
  { key: 'name',       label: 'Data Source', sortable: true },
  { key: 'status',     label: 'Status' },
  { key: 'type',       label: 'Type',        sortable: true },
  { key: 'lastSynced', label: 'Last Synced', sortable: true },
  { key: 'addedBy',    label: 'Added By',    sortable: true },
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
  const [data, setData]                       = useState<DataSource[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [apiError, setApiError]               = useState<string | null>(null);
  const [syncing, setSyncing]                 = useState(false);
  const [search, setSearch]                   = useState('');
  const [statusFilter, setStatusFilter]       = useState('');
  const [typeFilter, setTypeFilter]           = useState('');
  const [addedByFilter, setAddedByFilter]     = useState('');
  const [page, setPage]                       = useState(1);
  const [pageSize, setPageSize]               = useState(10);

  const fetchData = async () => {
    setApiError(null);
    try {
      const result = await api.listDataSources();
      setData(result.map(mapApiDataSource));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load data sources';
      setApiError(msg);
      console.error('[DataSourcesList]', msg);
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

  // Derive unique Added By options from live data
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
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <SearchInput
            placeholder="Search"
            value={search}
            onChange={e => { setSearch(e.target.value); resetPage(); }}
          />
          <FilterDropdown
            label="Status"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={v => { setStatusFilter(v); resetPage(); }}
          />
          <FilterDropdown
            label="Added By"
            options={addedByOptions}
            value={addedByFilter}
            onChange={v => { setAddedByFilter(v); resetPage(); }}
          />
          <FilterDropdown
            label="Type"
            options={TYPE_OPTIONS}
            value={typeFilter}
            onChange={v => { setTypeFilter(v); resetPage(); }}
          />
        </div>
        <div className={styles.actions}>
          <button className={styles.syncBtn} onClick={handleSync} disabled={syncing}>
            <AutorenewIcon size={14} /> {syncing ? 'Syncing…' : 'Sync Data'}
          </button>
          <Button onClick={() => navigate('/data-sources/new/type')}>
            <PlusIcon size={15} /> New Data Source
          </Button>
        </div>
      </div>

      <div className={styles.card}>
        {apiError && (
          <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, color: '#dc2626', fontSize: 13, margin: '0 0 8px' }}>
            {apiError}
          </div>
        )}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
            Loading data sources…
          </div>
        ) : (
          <>
            <Table
              columns={COLUMNS}
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
