import { CSSProperties, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loading } from './commons';
import axios from 'axios';
import useAsync from './useAysnc';
import moment from 'moment';
import styles from './pagination.module.css';
import classNames from 'classnames';

export interface IAccessLog {
  method: string;
  path: string;
  ipAddress: string;
  timestamp: string;
}

interface IPaginatedAccessLog {
  logs: IAccessLog[];
  totalPages: number;
}

const fetchAccessLog = async (page: number): Promise<IPaginatedAccessLog> =>
  (await axios.get(`${import.meta.env.VITE_API_SERVER}/access-log?page=${page}`)).data;

export default function AccessLogPage() {
  const [page, setPage] = useState(1);
  const { data: paginatedLogs, isLoading, error } = useAsync(() => fetchAccessLog(page), [page]);

  if (isLoading) return <Loading />;
  if (error) return <div>error occured</div>;
  if (!paginatedLogs) return null;

  const { logs, totalPages } = paginatedLogs;

  const onPageIncrease = () => void setPage(page + 1);
  const onPageDecrease = () => void setPage(page - 1);
  const onPageChange = (p: number) => void setPage(p);

  return (
    <>
      <ul>
        {logs.map(({ timestamp, method, path, ipAddress }) => (
          <li key={new Date(timestamp).getTime()}>
            <span>{moment(timestamp).format('YYYY-MM-D HH:mm:ss')} </span>
            <span>
              {ipAddress} {method} {path}
            </span>
          </li>
        ))}
      </ul>
      <Pagenation
        totalPages={totalPages}
        page={page}
        onIncrease={onPageIncrease}
        onDecrease={onPageDecrease}
        onPageChange={onPageChange}
      />
      <div>
        <Link to="/">
          <button>메인으로</button>
        </Link>
      </div>
    </>
  );
}

function Pagenation({
  page,
  onIncrease,
  onDecrease,
  onPageChange,
  totalPages,
}: {
  page: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onPageChange: (p: number) => void;
  totalPages: number;
}) {
  const offset = Math.floor((page - 1) / 10) * 10 + 1;
  const pageNumbers = Array.from(
    { length: totalPages - offset < 10 ? totalPages - offset + 1 : 10 },
    (_, i) => offset + i
  );
  const pageNumbersClass = (p: number) =>
    classNames(styles.pagination, { [styles.paginationActive]: p === page });

  return (
    <div>
      <button onClick={onDecrease} disabled={page <= 1}>
        prev
      </button>
      <ul className={styles.paginationBlock}>
        {pageNumbers.map((p) => (
          <li key={p} className={pageNumbersClass(p)} onClick={() => onPageChange(p)}>
            {p}
          </li>
        ))}
      </ul>
      <button onClick={onIncrease} disabled={page >= totalPages}>
        next
      </button>
    </div>
  );
}
