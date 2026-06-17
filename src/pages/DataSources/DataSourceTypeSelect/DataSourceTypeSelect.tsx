import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DataSourceTypeSelect.module.scss';
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
    <div className={styles.page}>
      <h2 className={styles.title}>Select Data Source Type</h2>

      <div className={styles.grid}>
        {DB_TYPES.map(db => {
          const enabled = db.id === 'postgresql';
          const isSelected = selected === db.id;
          return (
            <button
              key={db.id}
              type="button"
              className={[
                styles.card,
                isSelected ? styles.cardSelected : '',
                enabled ? '' : styles.cardDisabled,
              ].filter(Boolean).join(' ')}
              onClick={() => handleClick(db.id)}
              disabled={enabled === false}
              title={enabled ? db.name : 'Coming soon'}
            >
              <div className={styles.iconWrap} style={{ background: db.bg }}>
                <img src={db.logo} alt={db.name} />
              </div>
              <span className={styles.cardName}>{db.name}</span>
              {enabled ? null : <span className={styles.comingSoon}>Coming soon</span>}
            </button>
          );
        })}
      </div>

      <button className={styles.back} onClick={() => navigate('/data-sources')}>
        Back
      </button>
    </div>
  );
};
