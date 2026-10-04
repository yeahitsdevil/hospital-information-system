import React, { useState, useEffect } from "react";
import { Pill, AlertTriangle, CheckCircle, Plus, Send, ShoppingCart, Calendar, ShieldCheck } from "lucide-react";
import { api } from "../../lib/api";

export default function PharmacyView() {
  const [medicines, setMedicines] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("inventory");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [showPrescribeModal, setShowPrescribeModal] = useState(false);

  // New Medicine Form
  const [medForm, setMedForm] = useState({
    name: "",
    manufacturer: "Generic Pharma",
    unit_price: 10,
    quantity: 100,
    reorder_level: 20,
    expiry_date: "",
    batch_no: "",
    category: "General",
  });

  // Prescribe Form
  const [presPatient, setPresPatient] = useState("");
  const [presAppointment, setPresAppointment] = useState("");
  const [presDoctor, setPresDoctor] = useState("");
  const [presInstructions, setPresInstructions] = useState("");
  const [selectedMeds, setSelectedMeds] = useState([{ med_id: "", quantity: 1, dosage: "1 tablet twice daily after meals", duration: "5 days" }]);
  const user = JSON.parse(localStorage.getItem("his_user") || "{}");
  const canWritePrescription = user.role === "doctor";
  const canManageInventory = ["admin", "pharmacist"].includes(user.role);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [medsData, presData, patsData, docsData, pharmsData, apptData] = await Promise.all([
        api("/pharmacy-ops/medicines"),
        api("/pharmacy-ops/prescriptions"),
        api("/patients"),
        api("/doctors"),
        api("/pharmacy-ops/pharmacies"),
        api("/appointment-ops"),
      ]);
      setMedicines(medsData);
      setPrescriptions(presData);
      setPatients(patsData);
      setDoctors(docsData);
      setPharmacies(pharmsData);
      const eligibleAppointments = apptData.filter((a) => a.payment_status === "paid" && ["scheduled", "completed"].includes(a.status));
      setAppointments(eligibleAppointments);

      if (eligibleAppointments.length > 0) {
        setPresAppointment(eligibleAppointments[0]._id);
        setPresPatient(eligibleAppointments[0].patient_id?._id || eligibleAppointments[0].patient?._id || eligibleAppointments[0].patient_id || "");
      } else if (patsData.length > 0) setPresPatient(patsData[0]._id);
      if (docsData.length > 0) setPresDoctor(docsData[0]._id);
      if (medsData.length > 0) setSelectedMeds([{ med_id: medsData[0]._id, quantity: 1, dosage: "1 tablet twice daily after meals", duration: "5 days" }]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await api("/pharmacy-ops/medicines", {
        method: "POST",
        body: JSON.stringify(medForm),
      });
      setSuccess(`Medicine '${res.name}' successfully added to inventory!`);
      setShowAddMedModal(false);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const payload = {
        patient_id: presPatient,
        doctor_emp_id: user.emp_id,
        appointment_id: presAppointment,
        pharmacy_id: pharmacies[0]?._id,
        instructions: presInstructions || "Take as directed by doctor.",
        medicines: selectedMeds.map((m) => {
          const item = medicines.find((x) => x._id === m.med_id);
          return {
            med_id: m.med_id,
            name: item?.name,
            quantity: Number(m.quantity),
            dosage: m.dosage,
            duration: m.duration,
            unit_price: item?.unit_price || item?.unitPrice || 10,
          };
        }),
      };

      const result = await api("/pharmacy-ops/prescriptions", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSuccess(`Prescription #${result.pres_id} created successfully! Forwarded to pharmacy.`);
      setShowPrescribeModal(false);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDispense = async (prescriptionId) => {
    setError("");
    setSuccess("");
    try {
      const result = await api(`/pharmacy-ops/prescriptions/${prescriptionId}/dispense`, {
        method: "POST",
        body: JSON.stringify({ pharmacy_id: pharmacies[0]?._id }),
      });
      setSuccess(result.message);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h2>Pharmacy Inventory & Digital Prescriptions (DFD 5.0 & 7.0)</h2>
          <p className="sub-text">
            Drug catalog with batch & expiry tracking, automatic expired medicine blocking , and real-time inventory deduction with billing .
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {canManageInventory && <button className="btn-secondary" onClick={() => setShowAddMedModal(true)}>
            <Plus size={16} /> Add Medicine
          </button>}
          {canWritePrescription && <button className="btn-primary" onClick={() => setShowPrescribeModal(true)}>
            <Plus size={16} /> Write Prescription
          </button>}
        </div>
      </div>

      {error && <div className="alert-banner alert-danger">{error}</div>}
      {success && <div className="alert-banner alert-success">{success}</div>}

      {/* TABS */}
      <div className="filter-tab-bar">
        <button className={`tab-btn ${activeTab === "inventory" ? "active" : ""}`} onClick={() => setActiveTab("inventory")}>
          Medicine Inventory ({medicines.length})
        </button>
        <button className={`tab-btn ${activeTab === "prescriptions" ? "active" : ""}`} onClick={() => setActiveTab("prescriptions")}>
          Doctor Prescriptions ({prescriptions.length})
        </button>
      </div>

      {/* 1. INVENTORY VIEW */}
      {activeTab === "inventory" && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Drug Code</th>
                <th>Medicine Name</th>
                <th>Manufacturer</th>
                <th>Unit Price</th>
                <th>Stock Level</th>
                <th>Batch No</th>
                <th>Expiry Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((m) => {
                const expiry = new Date(m.expiry_date || m.expiryDate);
                const isExpired = expiry <= new Date();
                const isLowStock = m.quantity <= (m.reorder_level || m.reorderLevel || 15);

                return (
                  <tr key={m._id}>
                    <td><strong>{m.med_id || m._id.slice(-6)}</strong></td>
                    <td><strong>{m.name}</strong></td>
                    <td>{m.manufacturer || "Generic"}</td>
                    <td>₹{m.unit_price || m.unitPrice || 0}</td>
                    <td>
                      <span className={`stock-counter ${isLowStock ? "low" : "ok"}`}>
                        {m.quantity} units
                      </span>
                    </td>
                    <td>{m.batch_no || m.batchNo || "BATCH-01"}</td>
                    <td>{expiry ? expiry.toLocaleDateString() : "—"}</td>
                    <td>
                      {isExpired ? (
                        <span className="badge-expired"><AlertTriangle size={13} /> EXPIRED</span>
                      ) : isLowStock ? (
                        <span className="badge-warning">LOW STOCK</span>
                      ) : (
                        <span className="status-pill available">IN STOCK</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. PRESCRIPTIONS VIEW */}
      {activeTab === "prescriptions" && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Rx ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Prescribed Medicines</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((p) => (
                <tr key={p._id}>
                  <td><strong>{p.pres_id || p._id.slice(-6)}</strong></td>
                  <td>{p.patient_id?.name || p.patient?.name || "Patient"}</td>
                  <td>{p.doctor_emp_id?.name || p.doctor?.name || "Doctor"}</td>
                  <td><ul className="mini-med-list">{p.medicines?.map((item, idx) => <li key={idx}><strong>{item.name}</strong>: {item.quantity} unit(s), {item.dosage}{item.duration ? ` for ${item.duration}` : ""}</li>)}</ul></td>
                  <td>{new Date(p.prescription_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-pill ${p.status === "dispensed" ? "available" : "primary"}`}>
                      {p.status?.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {p.status !== "dispensed" ? (
                      <button
                        type="button"
                        className="btn-primary-sm"
                        onClick={() => handleDispense(p._id)}
                      >
                        <ShoppingCart size={13} /> Dispense & Bill
                      </button>
                    ) : (
                      <span className="text-muted"><CheckCircle size={14} color="#15803d" /> Dispensed</span>
                    )}
                  </td>
                </tr>
              ))}
              {prescriptions.length === 0 && (
                <tr>
                  <td colSpan="7" className="empty">No prescriptions recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD MEDICINE MODAL */}
      {showAddMedModal && (
        <div className="modal">
          <form className="modal-card" onSubmit={handleAddMedicine}>
            <div className="modal-head">
              <h2>Add Medicine to Inventory (Page 23)</h2>
              <button type="button" className="close-btn" onClick={() => setShowAddMedModal(false)}>×</button>
            </div>

            <div className="grid-2-inputs">
              <label>
                Medicine Name
                <input
                  required
                  value={medForm.name}
                  onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                  placeholder="e.g. Ciprofloxacin 500mg"
                />
              </label>

              <label>
                Manufacturer
                <input
                  value={medForm.manufacturer}
                  onChange={(e) => setMedForm({ ...medForm, manufacturer: e.target.value })}
                  placeholder="e.g. Cipla, Sun Pharma"
                />
              </label>

              <label>
                Unit Price (₹)
                <input
                  type="number"
                  step="0.01"
                  required
                  value={medForm.unit_price}
                  onChange={(e) => setMedForm({ ...medForm, unit_price: Number(e.target.value) })}
                />
              </label>

              <label>
                Quantity in Stock
                <input
                  type="number"
                  required
                  value={medForm.quantity}
                  onChange={(e) => setMedForm({ ...medForm, quantity: Number(e.target.value) })}
                />
              </label>

              <label>
                Batch Number
                <input
                  required
                  value={medForm.batch_no}
                  onChange={(e) => setMedForm({ ...medForm, batch_no: e.target.value })}
                  placeholder="e.g. BATCH-2026-X"
                />
              </label>

              <label>
                Expiry Date:
                <input
                  type="date"
                  required
                  value={medForm.expiry_date}
                  onChange={(e) => setMedForm({ ...medForm, expiry_date: e.target.value })}
                />
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowAddMedModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Add Drug Record</button>
            </div>
          </form>
        </div>
      )}

      {/* WRITE PRESCRIPTION MODAL */}
      {showPrescribeModal && (
        <div className="modal">
          <form className="modal-card" onSubmit={handleCreatePrescription}>
            <div className="modal-head">
              <h2>Doctor Digital Prescription (DFD 5.0)</h2>
              <button type="button" className="close-btn" onClick={() => setShowPrescribeModal(false)}>×</button>
            </div>

            <label>
              Paid appointment
              <select value={presAppointment} onChange={(e) => {
                const appt = appointments.find((a) => a._id === e.target.value);
                setPresAppointment(e.target.value);
                setPresPatient(appt?.patient_id?._id || appt?.patient?._id || appt?.patient_id || "");
              }} required>
                {appointments.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.patient_id?.name || a.patient?.name || "Patient"} — {a.appointment_id} — {new Date(a.appointment_date).toLocaleDateString()}
                  </option>
                ))}
              </select>
              {!appointments.length && <small>No paid appointments are available for prescribing.</small>}
            </label>

            <div className="subform-title"><Pill size={14} /> Medicines and dosage</div>
            {selectedMeds.map((medicine, index) => (
              <div className="role-specific-inputs" key={`medicine-${index}`}>
                <div className="grid-2-inputs">
                  <label>Medicine
                    <select value={medicine.med_id} onChange={(e) => setSelectedMeds((items) => items.map((item, i) => i === index ? { ...item, med_id: e.target.value } : item))} required>
                      <option value="" disabled>Select a medicine</option>
                      {medicines.map((m) => <option key={m._id} value={m._id}>{m.name} (Stock: {m.quantity}) — ₹{m.unit_price || m.unitPrice}/unit</option>)}
                    </select>
                  </label>
                  <label>Quantity
                    <input type="number" min="1" value={medicine.quantity} onChange={(e) => setSelectedMeds((items) => items.map((item, i) => i === index ? { ...item, quantity: Number(e.target.value) } : item))} required />
                  </label>
                  <label>Dosage and frequency
                    <input value={medicine.dosage} onChange={(e) => setSelectedMeds((items) => items.map((item, i) => i === index ? { ...item, dosage: e.target.value } : item))} placeholder="e.g. 1 tablet twice daily after meals" required />
                  </label>
                  <label>Duration
                    <input value={medicine.duration} onChange={(e) => setSelectedMeds((items) => items.map((item, i) => i === index ? { ...item, duration: e.target.value } : item))} placeholder="e.g. 5 days" required />
                  </label>
                </div>
                {selectedMeds.length > 1 && <button type="button" className="btn-secondary" onClick={() => setSelectedMeds((items) => items.filter((_, i) => i !== index))}>Remove medicine</button>}
              </div>
            ))}
            <button type="button" className="btn-secondary" disabled={!medicines.length} onClick={() => setSelectedMeds((items) => [...items, { med_id: "", quantity: 1, dosage: "", duration: "" }])}><Plus size={15} /> Add another medicine</button>

            <label>
              Clinical Instructions
              <textarea
                value={presInstructions}
                onChange={(e) => setPresInstructions(e.target.value)}
                placeholder="Special instructions, dietary warnings..."
              />
            </label>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowPrescribeModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={!appointments.length || !medicines.length}>Generate Prescription</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
