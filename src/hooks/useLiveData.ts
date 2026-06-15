import { useEffect, useState } from "react";
import type { Table } from "dexie";

export function useLiveData<T>(loader: () => Promise<T>, fallback: T, deps: unknown[] = []) {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    loader()
      .then((result) => {
        if (alive) setData(result);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, deps);

  return { data, loading, reload: async () => setData(await loader()) };
}

export const all = <T>(table: Table<T, string>) => table.toArray();
