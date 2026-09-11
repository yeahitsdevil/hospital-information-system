import { configs } from "../config/resourceConfig";

import useResourceData from "../hooks/useResourceData";
import useResourceSelection from "../hooks/useResourceSelection";
import useResourceCrud from "../hooks/useResourceCrud";
import usePatientRegistration from "../hooks/usePatientRegistration";
import useResourceFilter from "../hooks/useResourceFilter";
import useResourceForm from "../hooks/useResourceForm";

import ResourceHeader from "../components/resources/ResourceHeader";
import ResourceToolbar from "../components/resources/ResourceToolbar";
import ResourceTable from "../components/resources/ResourceTable";
import AddResourceModal from "../components/resources/AddResourceModal";
import PatientRegistrationModal from "../components/resources/PatientRegistrationModal";

function ResourcePage({ type }) {
  const c = configs[type];

  const {
    show,
    setShow,
    form,
    setForm,
    showPatientForm,
    setShowPatientForm,
    newPatientForm,
    setNewPatientForm,
  } = useResourceForm();

  const {
    rows,
    patients,
    setPatients,
    doctors,
    load,
  } = useResourceData(type);

  const { q, setQ, filteredRows } = useResourceFilter(rows);

  const {
    selected,
    setSelected,
    allVisibleSelected,
    toggleSelect,
    toggleSelectAll,
  } = useResourceSelection(filteredRows);

  const { deleteOne, deleteSelected, save } = useResourceCrud({
    type,
    rows,
    selected,
    setSelected,
    form,
    setShow,
    setForm,
    load,
  });

  const { registerPatient } = usePatientRegistration({
    newPatientForm,
    setPatients,
    setForm,
    setShowPatientForm,
    setNewPatientForm,
  });

  return (
    <>
      <ResourceHeader
        c={c}
        setShow={setShow}
        deleteSelected={deleteSelected}
      />

      <ResourceToolbar
        q={q}
        setQ={setQ}
        filteredRows={filteredRows}
        rows={rows}
      />

      <ResourceTable
        c={c}
        filteredRows={filteredRows}
        selected={selected}
        allVisibleSelected={allVisibleSelected}
        toggleSelect={toggleSelect}
        toggleSelectAll={toggleSelectAll}
        deleteOne={deleteOne}
        q={q}
      />

      <AddResourceModal
        show={show}
        setShow={setShow}
        save={save}
        c={c}
        type={type}
        form={form}
        setForm={setForm}
        patients={patients}
        doctors={doctors}
        setShowPatientForm={setShowPatientForm}
      />

      <PatientRegistrationModal
        showPatientForm={showPatientForm}
        setShowPatientForm={setShowPatientForm}
        newPatientForm={newPatientForm}
        setNewPatientForm={setNewPatientForm}
        registerPatient={registerPatient}
      />
    </>
  );
}

export default ResourcePage;