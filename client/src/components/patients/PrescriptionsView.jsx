import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Pill } from "lucide-react";
import { api } from "../../lib/api";

export default function PrescriptionsView() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("his_user") || "{}");
  const nav = useNavigate();

  useEffect(() => {
    api("/pharmacy-ops/prescriptions")
      .then(setPrescriptions)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h2>{user.role === "patient" ? "My Prescriptions" : "Patient Prescriptions"}</h2>
          <p className="sub-text">Prescriptions are shared with the patient and authorized care team.</p>
        </div>
        {user.role === "doctor" && (
          <button className="btn-primary" onClick={() => nav("/medicines")}><Pill size={16} /> Write prescription</button>
        )}
      </div>
      {error && <div className="alert-banner alert-danger">{error}</div>}
      <div className="table-wrap">
        <table>
          <thead><tr><th>Prescription</th><th>Patient</th><th>Doctor</th><th>Appointment</th><th>Medicines / Instructions</th><th>Date</th></tr></thead>
          <tbody>
            {prescriptions.map((p) => (
              <tr key={p._id}>
                <td><strong>{p.pres_id}</strong></td>
                <td>{p.patient_id?.name || p.patient?.name || "Patient"}</td>
                <td>{p.doctor_emp_id?.name || p.doctor?.name || "Doctor"}</td>
                <td>{p.appointment_id?.appointment_id || "—"}</td>
                <td>
                  {(p.medicines || []).map((m, i) => <div key={i}><strong>{m.name || "Medicine"}</strong> — {m.quantity || 1} unit(s), {m.dosage || m.frequency || "As directed"}{m.duration ? ` for ${m.duration}` : ""}</div>)}
                  {p.instructions && <div><FileText size={13} /> {p.instructions}</div>}
                  {!p.medicines?.length && !p.instructions && "—"}
                </td>
                <td>{new Date(p.prescription_date).toLocaleDateString()}</td>
              </tr>
            ))}
            {!prescriptions.length && <tr><td colSpan="6" className="empty">No prescriptions available.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
