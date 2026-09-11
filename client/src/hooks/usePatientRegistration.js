import { api } from "../lib/api";

function usePatientRegistration({
  newPatientForm,
  setPatients,
  setForm,
  setShowPatientForm,
  setNewPatientForm,
}) {
  const registerPatient = async (e) => {
    e.preventDefault();

    try {
      const patient = await api("/patients", {
        method: "POST",
        body: JSON.stringify(newPatientForm),
      });

      // Add the newly created patient to the dropdown
      setPatients((prev) => [...prev, patient]);

      // Automatically select the new patient
      setForm((prev) => ({
        ...prev,
        patient: patient._id,
      }));

      // Close patient registration modal
      setShowPatientForm(false);

      // Clear patient form
      setNewPatientForm({});

      alert("Patient registered successfully.");
    } catch (e) {
      alert(e.message);
    }
  };

  return {
    registerPatient,
  };
}

export default usePatientRegistration;