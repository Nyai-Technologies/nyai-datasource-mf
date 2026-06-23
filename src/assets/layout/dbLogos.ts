import postgresqlLogo from './img/postgresql logo.svg';
import mysqlLogo      from './img/mysql logo.svg';
import mongodbLogo    from './img/mongodb logo.svg';
import databricksLogo from './img/databricks logo.svg';
import redshiftLogo   from './img/redshift logo.svg';
import redisLogo      from './img/redis logo.svg';
import snowflakeLogo  from './img/snowflake logo.svg';
import oracleLogo     from './img/oracle logo.svg';

export const DB_LOGOS: Record<string, string> = {
  postgresql: postgresqlLogo,
  mysql:      mysqlLogo,
  mongodb:    mongodbLogo,
  databricks: databricksLogo,
  redshift:   redshiftLogo,
  redis:      redisLogo,
  snowflake:  snowflakeLogo,
  oracle:     oracleLogo,
};

export const DB_BG: Record<string, string> = {
  postgresql: '#e8f0fb',
  mysql:      '#e8f0fb',
  mongodb:    '#e8f6e8',
  databricks: '#fdecea',
  redshift:   '#e8f0fb',
  redis:      '#fdecea',
  snowflake:  '#e8f6fc',
  oracle:     '#fdecea',
};
