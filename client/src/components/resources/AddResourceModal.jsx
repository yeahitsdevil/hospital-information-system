import ResourceInput from "./ResourceInput";

function AddResourceModal({
  show,
  setShow,
  save,
  c,
  type,
  form,
  setForm,
  patients,
  doctors,
  setShowPatientForm,
}) {
  if (!show) return null;

  return (
    <div className="modal">
      <form className="modal-card" onSubmit={save}>
        <div className="modal-head">
          <h2>Add {c.title.slice(0, -1)}</h2>

          <button type="button" onClick={() => setShow(false)}>
            ×
          </button>
        </div>

        {c.fields.map((f) => (
          <label key={f}>
            {f.replace(/([A-Z])/g, " $1")}

            <ResourceInput
              type={type}
              field={f}
              form={form}
              setForm={setForm}
              patients={patients}
              doctors={doctors}
            />

            {type === "appointments" && f === "patient" && (
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setShowPatientForm(true)}
              >
                + Register New Patient
              </button>
            )}
          </label>
        ))}

        {type === "bills" && (
          <label>
            amount
            <input
              type="number"
              value={form.amount || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  amount: e.target.value,
                })
              }
            />
          </label>
        )}

        <button>Create Record</button>
      </form>
    </div>
  );
}

export default AddResourceModal;