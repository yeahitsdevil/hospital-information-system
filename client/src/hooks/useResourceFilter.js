import { useMemo, useState } from "react";

function useResourceFilter(rows) {
  const [q, setQ] = useState("");

  const filteredRows = useMemo(() => {
    return rows.filter((r) =>
      JSON.stringify(r).toLowerCase().includes(q.toLowerCase()),
    );
  }, [rows, q]);

  return {
    q,
    setQ,
    filteredRows,
  };
}

export default useResourceFilter;