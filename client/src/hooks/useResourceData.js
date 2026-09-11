import { useEffect, useState } from "react";
import { api } from "../lib/api";

function useResourceData(type) {
  const [rows, setRows] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const load = () => {
    api("/" + type)
      .then((data) => {
        setRows(data);
      })
      .catch((e) => alert(e.message));
  };

  const loadPatients = () => {
    api("/patients")
      .then(setPatients)
      .catch((e) => console.error("Failed to load patients:", e));
  };

  const loadDoctors = () => {
    api("/doctors")
      .then(setDoctors)
      .catch((e) => console.error("Failed to load doctors:", e));
  };

  useEffect(() => {
    load();

    if (
      ["appointments", "prescriptions", "lab-tests", "bills"].includes(type)
    ) {
      loadPatients();
    }

    if (["appointments", "prescriptions"].includes(type)) {
      loadDoctors();
    }
  }, [type]);

  return {
    rows,
    setRows,
    patients,
    setPatients,
    doctors,
    setDoctors,
    load,
  };
}

export default useResourceData;