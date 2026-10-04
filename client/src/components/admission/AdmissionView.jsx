import React, { useState, useEffect } from "react";
import { BedDouble, CheckCircle, AlertTriangle, UserCheck, Plus, LogOut, Printer, ShieldAlert } from "lucide-react";
import { api } from "../../lib/api";
import PrintModal from "../common/PrintModal";

export default function AdmissionView() {
  const [rooms, setRooms] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState(null);

  // Admit Form
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [diagnosis, setDiagnosis] = useState("");

  // Discharge Form
  const [dischargeNotes, setDischargeNotes] = useState("");

  // Print Summary State
  const [summaryDoc, setSummaryDoc] = useState(null);
  const [showPrint, setShowPrint] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [roomsData, admData, patsData, docsData] = await Promise.all([
        api("/admission-ops/rooms"),
        api("/admission-ops"),
        api("/patients"),
        api("/doctors"),
      ]);
      setRooms(roomsData);
      setAdmissions(admData);
      setPatients(patsData);
      setDoctors(docsData);

      // Default room selection to first available room
      const firstAvail = roomsData.find((r) => r.status === "available");
      if (firstAvail) setSelectedRoom(firstAvail._id);
      if (patsData.length > 0) setSelectedPatient(patsData[0]._id);
      if (docsData.length > 0) setSelectedDoctor(docsData[0]._id);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const payload = {
        patient_id: selectedPatient,
        room_id: selectedRoom,
        doctor_emp_id: selectedDoctor,
        diagnosis: diagnosis || "Inpatient Care & Monitoring",
      };

      const result = await api("/admission-ops/admit", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSuccess(`Patient admitted to Room ${result.room_id?.room_number}! Nurse ${result.assigned_nurse?.name || result.nurse_name || "Assigned"} assigned via automated workload balancing.`);
      setShowAdmitModal(false);
      setDiagnosis("");
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDischarge = async (e) => {
    e.preventDefault();
    if (!selectedAdmission) return;
    setError("");
    setSuccess("");

    try {
      const result = await api(`/admission-ops/${selectedAdmission._id}/discharge`, {
        method: "POST",
        body: JSON.stringify({ notes: dischargeNotes, discharge_date: new Date() }),
      });

      setSuccess("Patient discharged successfully! Room freed and stay charges calculated and added to the master bill.");
      setShowDischargeModal(false);
      setDischargeNotes("");
      loadData();

      // View discharge summary
      handlePrintSummary(selectedAdmission._id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePrintSummary = async (admissionId) => {
    try {
      const summary = await api(`/admission-ops/${admissionId}/discharge-summary`);
      setSummaryDoc(summary);
      setShowPrint(true);
    } catch (err) {
      setError("Failed to fetch discharge summary: " + err.message);
    }
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h2>Bed & Ward Management / Inpatient Care </h2>
          <p className="sub-text">
            Real-time room occupancy, doctor admission authorization, automated nurse workload balancing , and stay billing.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdmitModal(true)}>
          <Plus size={16} /> Admit Patient (IPD)
        </button>
      </div>

      {error && <div className="alert-banner alert-danger">{error}</div>}
      {success && <div className="alert-banner alert-success">{success}</div>}

      {/* ROOM & BED VISUAL BOARD */}
      <div className="room-board-section">
        <h3>Room & Bed Availability Board (Live Status)</h3>
        <div className="rooms-grid">
          {rooms.map((r) => (
            <div key={r._id} className={`room-card ${r.status}`}>
              <div className="room-card-head">
                <strong>{r.room_number || r.bedNumber}</strong>
                <span className={`room-status-badge ${r.status}`}>{r.status?.toUpperCase()}</span>
              </div>
              <div className="room-type-text">{r.room_type || r.ward}</div>
              <div className="room-rate-text">₹{r.daily_rate || 500} / day</div>
              {r.patient && (
                <div className="room-patient-name">
                  Occupant: {r.patient?.name || "Admitted Patient"}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* INPATIENT ADMISSIONS TABLE */}
      <div className="section-title-row" style={{ marginTop: "30px" }}>
        <h3>Active & Recent Inpatient Admissions</h3>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Admission ID</th>
              <th>Patient</th>
              <th>Room Allocated</th>
              <th>Attending Doctor</th>
              <th>Assigned Nurse (Balanced)</th>
              <th>Admission Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admissions.map((adm) => (
              <tr key={adm._id}>
                <td><strong>{adm.admission_id}</strong></td>
                <td>{adm.patient_id?.name || adm.patient?.name || "Patient"}</td>
                <td>
                  <span className="badge-room">
                    {adm.room_id?.room_number || "Ward"} ({adm.room_id?.room_type || "General"})
                  </span>
                </td>
                <td>{adm.doctor_emp_id?.name || adm.doctor?.name || "Attending Doctor"}</td>
                <td>
                  <span className="nurse-tag">
                    <UserCheck size={14} /> {adm.assigned_nurse?.name || adm.nurse_name || "Floor Nurse"}
                  </span>
                </td>
                <td>{new Date(adm.admission_date).toLocaleString()}</td>
                <td>
                  <span className={`status-pill ${adm.status === "admitted" ? "occupied" : "available"}`}>
                    {adm.status?.toUpperCase()}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {adm.status === "admitted" && (
                      <button
                        type="button"
                        className="btn-discharge-sm"
                        onClick={() => {
                          setSelectedAdmission(adm);
                          setShowDischargeModal(true);
                        }}
                      >
                        <LogOut size={13} /> Discharge
                      </button>
                    )}
                    <button
                      type="button"
                      className="action-btn-sm"
                      onClick={() => handlePrintSummary(adm._id)}
                    >
                      <Printer size={13} /> Summary
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {admissions.length === 0 && (
              <tr>
                <td colSpan="8" className="empty">No inpatient admissions recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADMIT PATIENT MODAL */}
      {showAdmitModal && (
        <div className="modal">
          <form className="modal-card" onSubmit={handleAdmit}>
            <div className="modal-head">
              <h2>Doctor Admission Order</h2>
              <button type="button" className="close-btn" onClick={() => setShowAdmitModal(false)}>×</button>
            </div>

            <label>
              Select Patient
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                required
              >
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.patient_id || p.patientId}) - Current State: {p.status || "OPD"}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Select Room / Bed (Must be 'Available')
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                required
              >
                {rooms.map((r) => (
                  <option key={r._id} value={r._id} disabled={r.status !== "available"}>
                    {r.room_number || r.bedNumber} - {r.room_type || r.ward} (₹{r.daily_rate}/day) [{r.status?.toUpperCase()}]
                  </option>
                ))}
              </select>
            </label>

            <label>
              Attending Doctor
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                required
              >
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.specialization || d.department})
                  </option>
                ))}
              </select>
            </label>

            <div className="nurse-auto-info-box">
              <UserCheck size={16} />
              <span>
                <strong>Smart Workload Balancing :</strong> An active nursing officer with the lowest current inpatient load will be automatically assigned.
              </span>
            </div>

            <label>
              Clinical Admission Diagnosis / Reasons
              <textarea
                required
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Acute chest pain under observation, post-operative surgical monitoring, respiratory distress"
              />
            </label>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowAdmitModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Admit & Allocate Room</button>
            </div>
          </form>
        </div>
      )}

      {/* DISCHARGE PATIENT MODAL */}
      {showDischargeModal && selectedAdmission && (
        <div className="modal">
          <form className="modal-card" onSubmit={handleDischarge}>
            <div className="modal-head">
              <h2>Discharge Process Initiation </h2>
              <button type="button" className="close-btn" onClick={() => setShowDischargeModal(false)}>×</button>
            </div>

            <div className="discharge-info-box">
              <p><strong>Patient:</strong> {selectedAdmission.patient_id?.name || "Patient"}</p>
              <p><strong>Allocated Room:</strong> {selectedAdmission.room_id?.room_number} ({selectedAdmission.room_id?.room_type})</p>
              <p><strong>Admitted Date:</strong> {new Date(selectedAdmission.admission_date).toLocaleString()}</p>
              <p><strong>Automatic Action:</strong> Room will be freed, nurse assignment deactivated, and length-of-stay charges will be auto-calculated into patient's master invoice.</p>
            </div>

            <label>
              Discharge Instructions & Medical Protocol
              <textarea
                required
                value={dischargeNotes}
                onChange={(e) => setDischargeNotes(e.target.value)}
                placeholder="Discharge summary, home medications, follow-up schedule..."
              />
            </label>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowDischargeModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Confirm Discharge & Bill Stay</button>
            </div>
          </form>
        </div>
      )}

      {/* PRINT DISCHARGE SUMMARY MODAL */}
      <PrintModal
        show={showPrint}
        onClose={() => setShowPrint(false)}
        title="Inpatient Discharge Summary"
        data={summaryDoc}
        type="discharge"
      />
    </div>
  );
}
