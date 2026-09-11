import { useState } from "react";

function useResourceForm() {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({});

  const [showPatientForm, setShowPatientForm] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({});

  return {
    show,
    setShow,
    form,
    setForm,
    showPatientForm,
    setShowPatientForm,
    newPatientForm,
    setNewPatientForm,
  };
}

export default useResourceForm;