function PatientRegistrationModal({
  showPatientForm,
  setShowPatientForm,
  newPatientForm,
  setNewPatientForm,
  registerPatient,
}) {
  if (!showPatientForm) return null;

  return (
    <div className="modal">
      <div className="modal-card">
        <div className="modal-head">
          <h2>Register New Patient</h2>

          <button
            type="button"
            onClick={() => {
              setShowPatientForm(false);
              setNewPatientForm({});
            }}
          >
            ×
          </button>
        </div>

        <label>
          Name
          <input
            type="text"
            required
            value={newPatientForm.name || ""}
            onChange={(e) =>
              setNewPatientForm({
                ...newPatientForm,
                name: e.target.value,
              })
            }
          />
        </label>

        <label>
          Phone
          <input
            type="text"
            value={newPatientForm.phone || ""}
            onChange={(e) =>
              setNewPatientForm({
                ...newPatientForm,
                phone: e.target.value,
              })
            }
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={newPatientForm.email || ""}
            onChange={(e) =>
              setNewPatientForm({
                ...newPatientForm,
                email: e.target.value,
              })
            }
          />
        </label>

        <label>
          Date of Birth
          <input
            type="date"
            value={newPatientForm.dob || ""}
            onChange={(e) =>
              setNewPatientForm({
                ...newPatientForm,
                dob: e.target.value,
              })
            }
          />
        </label>

        <label>
          Gender
          <select
            value={newPatientForm.gender || ""}
            onChange={(e) =>
              setNewPatientForm({
                ...newPatientForm,
                gender: e.target.value,
              })
            }
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <label>
          Blood Group
          <select
            value={newPatientForm.bloodGroup || ""}
            onChange={(e) =>
              setNewPatientForm({
                ...newPatientForm,
                bloodGroup: e.target.value,
              })
            }
          >
            <option value="">Select blood group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </label>

        <label>
          Address
          <input
            type="text"
            value={newPatientForm.address || ""}
            onChange={(e) =>
              setNewPatientForm({
                ...newPatientForm,
                address: e.target.value,
              })
            }
          />
        </label>

        <label>
          Emergency Contact
          <input
            type="text"
            value={newPatientForm.emergencyContact || ""}
            onChange={(e) =>
              setNewPatientForm({
                ...newPatientForm,
                emergencyContact: e.target.value,
              })
            }
          />
        </label>

        <label>
          Allergies
          <input
            type="text"
            value={newPatientForm.allergies || ""}
            onChange={(e) =>
              setNewPatientForm({
                ...newPatientForm,
                allergies: e.target.value,
              })
            }
          />
        </label>

        <label>
          History
          <input
            type="text"
            value={newPatientForm.history || ""}
            onChange={(e) =>
              setNewPatientForm({
                ...newPatientForm,
                history: e.target.value,
              })
            }
          />
        </label>

        <button
          type="button"
          onClick={registerPatient}
        >
          Register Patient
        </button>
      </div>
    </div>
  );
}

export default PatientRegistrationModal;