import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import postgresqlLogo from '../../../assets/layout/img/postgresql logo.svg';
import mysqlLogo from '../../../assets/layout/img/mysql logo.svg';
import mongodbLogo from '../../../assets/layout/img/mongodb logo.svg';
import databricksLogo from '../../../assets/layout/img/databricks logo.svg';
import redshiftLogo from '../../../assets/layout/img/redshift logo.svg';
import redisLogo from '../../../assets/layout/img/redis logo.svg';
import snowflakeLogo from '../../../assets/layout/img/snowflake logo.svg';
import oracleLogo from '../../../assets/layout/img/oracle logo.svg';

const DB_TYPES = [
  { id: 'postgresql', name: 'PostgreSQL', bg: '#e8f0fb', logo: postgresqlLogo },
  { id: 'mysql',      name: 'MySQL',      bg: '#e8f0fb', logo: mysqlLogo },
  { id: 'mongodb',    name: 'MongoDB',    bg: '#e8f6e8', logo: mongodbLogo },
  { id: 'databricks', name: 'Databricks', bg: '#fdecea', logo: databricksLogo },
  { id: 'redshift',   name: 'Redshift',   bg: '#e8f0fb', logo: redshiftLogo },
  { id: 'redis',      name: 'Redis',      bg: '#fdecea', logo: redisLogo },
  { id: 'snowflake',  name: 'Snowflake',  bg: '#e8f6fc', logo: snowflakeLogo },
  { id: 'oracle',     name: 'Oracle',     bg: '#fdecea', logo: oracleLogo },
];

export const DataSourceTypeSelect = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('');

  const handleClick = (id: string) => {
    if (id !== 'postgresql') return;
    setSelected(id);
    navigate('/data-sources/new');
  };

  return (
    <div className="p-4">
      <h2 className="text-[18px] font-semibold text-[#1a2030] mb-5">Select Data Source Type</h2>

      <div className="grid grid-cols-4 gap-4 mb-6 max-[900px]:grid-cols-2">
        {DB_TYPES.map(db => {
          const enabled = db.id === 'postgresql';
          const isSelected = selected === db.id;
          return (
            <button
              key={db.id}
              type="button"
              className={[
                'flex flex-row items-center gap-3 p-4 border-[1.5px] rounded-[8px] bg-white cursor-pointer transition-all text-left',
                isSelected
                  ? 'border-[#1e7070] bg-[rgba(30,112,112,0.04)] shadow-[0_0_0_3px_rgba(30,112,112,0.1)]'
                  : 'border-[#b8c1d3] hover:border-[#1e7070] hover:shadow-[0_0_0_3px_rgba(30,112,112,0.08)]',
                enabled ? '' : 'opacity-45 cursor-not-allowed pointer-events-none grayscale-[40%]',
              ].filter(Boolean).join(' ')}
              onClick={() => handleClick(db.id)}
              disabled={!enabled}
              title={enabled ? db.name : 'Coming soon'}
            >
              <div
                className="w-9 h-9 rounded-[6px] flex items-center justify-center flex-shrink-0"
                style={{ background: db.bg }}
              >
                <img src={db.logo} alt={db.name} className="w-6 h-6 object-contain" />
              </div>
              <span className="text-[14px] font-medium text-[#1a2030]">{db.name}</span>
              {!enabled && (
                <span className="ml-auto text-[12px] text-[#9ca3af] bg-[#f1f5f9] px-[6px] py-[2px] rounded-full whitespace-nowrap">
                  Coming soon
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        className="bg-transparent border-none text-[#1e7070] text-[14px] cursor-pointer p-0 hover:underline"
        onClick={() => navigate('/data-sources')}
      >
        Back
      </button>
    </div>
  );
};
