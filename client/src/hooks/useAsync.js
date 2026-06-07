import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Runs an async function on mount and whenever `deps` change, exposing
 * { data, loading, error, refetch }. Ignores stale resolutions so a slow
 * earlier request can't overwrite a newer one.
 *
 * @param {() => Promise<any>} asyncFn
 * @param {any[]} deps
 */
export function useAsync(asyncFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const callId = useRef(0);

  const run = useCallback(() => {
    const id = ++callId.current;
    setLoading(true);
    setError('');
    asyncFn()
      .then((result) => {
        if (id === callId.current) setData(result);
      })
      .catch((err) => {
        if (id === callId.current) setError(err.message || 'Something went wrong');
      })
      .finally(() => {
        if (id === callId.current) setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, error, refetch: run };
}
