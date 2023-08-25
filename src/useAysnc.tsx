import { useEffect, useState } from 'react';

export default function useAsync<T>(
  callback: (args?: any) => Promise<T>,
  deps: any[] = [],
  skip: boolean = false
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<T | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setData(null);

      const data = await callback();
      setData(data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (skip) return;

    fetchData();
  }, deps);

  return { isLoading, error, data, refetch: fetchData };
}
