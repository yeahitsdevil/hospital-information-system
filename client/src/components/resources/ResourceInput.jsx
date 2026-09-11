function ResourceInput({
  type,
  field,
  form,
  setForm,
  patients,
  doctors,
}) {
  // PATIENT DROPDOWN
  if (field === "patient") {
    return (
      <select
        value={form[field] || ""}
        onChange={(e) =>
          setForm({
            ...form,
            [field]: e.target.value,
          })
        }
        required
      >
        <option value="">Select patient</option>

        {patients.map((patient) => (
          <option key={patient._id} value={patient._id}>
            {patient.name}
            {patient.patientId ? ` (${patient.patientId})` : ""}
          </option>
        ))}
      </select>
    );
  }

  // DOCTOR DROPDOWN
  if (field === "doctor") {
    return (
      <select
        value={form[field] || ""}
        onChange={(e) =>
          setForm({
            ...form,
            [field]: e.target.value,
          })
        }
        required
      >
        <option value="">Select doctor</option>

        {doctors.map((doctor) => (
          <option key={doctor._id} value={doctor._id}>
            {doctor.name}
            {doctor.specialization
              ? ` - ${doctor.specialization}`
              : ""}
          </option>
        ))}
      </select>
    );
  }

  // APPOINTMENT STATUS
  if (type === "appointments" && field === "status") {
    return (
      <select
        value={form[field] || "scheduled"}
        onChange={(e) =>
          setForm({
            ...form,
            [field]: e.target.value,
          })
        }
      >
        <option value="scheduled">Scheduled</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
        <option value="no-show">No Show</option>
      </select>
    );
  }

  // PRESCRIPTION INSTRUCTIONS
  if (type === "prescriptions" && field === "instructions") {
    return (
      <textarea
        value={form[field] || ""}
        onChange={(e) =>
          setForm({
            ...form,
            [field]: e.target.value,
          })
        }
      />
    );
  }

  // LAB TEST STATUS
  if (type === "lab-tests" && field === "status") {
    return (
      <select
        value={form[field] || "ordered"}
        onChange={(e) =>
          setForm({
            ...form,
            [field]: e.target.value,
          })
        }
      >
        <option value="ordered">Ordered</option>
        <option value="processing">Processing</option>
        <option value="completed">Completed</option>
      </select>
    );
  }

  // BED STATUS
  if (type === "beds" && field === "status") {
    return (
      <select
        value={form[field] || "available"}
        onChange={(e) =>
          setForm({
            ...form,
            [field]: e.target.value,
          })
        }
      >
        <option value="available">Available</option>
        <option value="occupied">Occupied</option>
        <option value="maintenance">Maintenance</option>
      </select>
    );
  }

  // BILL STATUS
  if (type === "bills" && field === "status") {
    return (
      <select
        value={form[field] || "pending"}
        onChange={(e) =>
          setForm({
            ...form,
            [field]: e.target.value,
          })
        }
      >
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
        <option value="partial">Partial</option>
      </select>
    );
  }

  // NORMAL INPUT
  return (
    <input
      type={
        field.toLowerCase().includes("date") || field === "dob"
          ? "date"
          : field === "email"
            ? "email"
            : field === "consultationFee" ||
                field === "quantity" ||
                field === "reorderLevel" ||
                field === "unitPrice"
              ? "number"
              : "text"
      }
      value={form[field] || ""}
      onChange={(e) =>
        setForm({
          ...form,
          [field]: e.target.value,
        })
      }
    />
  );
}

export default ResourceInput;