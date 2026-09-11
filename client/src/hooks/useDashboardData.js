import { useEffect, useState } from "react";
import { api } from "../lib/api";

function useDashboardData() {
  const [d, setD] = useState({});

  useEffect(() => {
    api("/dashboard").then(setD).catch(console.error);
  }, []);

  return d;
}

export default useDashboardData;