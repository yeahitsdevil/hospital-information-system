import React, { useState, useEffect } from "react";
import { Users, FileText, Plus, Search, Activity, Heart, AlertCircle, History } from "lucide-react";
import { api } from "../../lib/api";
import PrintModal from "../common/PrintModal";

export default function PatientsView() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);

  // New Patient Form
  const [formData, setFormData] = useState({
    name: "",
    gender: "M",
    dob: "",
    phone: "",
    email: "",
    address: "",
    blood_group: "B+",
    allergies: "None",
    history: "Routine health screening",
    status: "OPD",
  });

  // New Medical History Note Form
  const [conditionMd, setConditionMd] = useState("");
  const [notes, setNotes] = useState("");

  // Report Modal
  const [reportDoc, setReportDoc] = useState(null);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await api("/patient-ops");
      setPatients(data);
      setFilteredPatients(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = patients;
    if (activeTab !== "ALL") {
      result = result.filter((p) => (p.status || "OPD") === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.patient_id || p.patientId || "").toLowerCase().includes(q) ||
          (p.phone || "").includes(q)
      );
    }
    setFilteredPatients(result);
  }, [activeTab, searchQuery, patients]);

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const result = await api("/patient-ops", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setSuccess(`Patient ${result.name} successfully registered with ID ${result.patient_id}!`);
      setShowAddModal(false);
      setFormData({
        name: "",
        gender: "M",
        dob: "",
        phone: "",
        email: "",
        address: "",
        blood_group: "B+",
        allergies: "None",
        history: "Routine health screening",
        status: "OPD",
      });
      loadPatients();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOpenHistory = async (patient) => {
    setSelectedPatient(patient);
    try {
      const details = await api(`/patient-ops/${patient._id}`);
      setPatientDetails(details);
      setShowHistoryModal(true);
    } catch (err) {
      setError("Failed to load patient history: " + err.message);
    }
  };

  const handleAddHistoryNote = async (e) => {
    e.preventDefault();
    if (!selectedPatient || !conditionMd.trim()) return;
    try {
      await api(`/patient-ops/${selectedPatient._id}/medical-history`, {
        method: "POST",
        body: JSON.stringify({ condition_md: conditionMd, notes }),
      });
      setConditionMd("");
      setNotes("");
      const details = await api(`/patient-ops/${selectedPatient._id}`);
      setPatientDetails(details);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGenerateReport = async (patientId) => {
    try {
      const report = await api(`/patient-ops/${patientId}/report`);
      setReportDoc(report);
      setShowReport(true);
    } catch (err) {
      setError("Failed to generate clinical report: " + err.message);
    }
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h2>Patient Administration & EMR Records</h2>
          <p className="sub-text">
            Unique digital health identifier, Outpatient (OPD) & Inpatient (IPD) lifecycle tracking, and longitudinal medical history.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Register New Patient
        </button>
      </div>

      {error && <div className="alert-banner alert-danger">{error}</div>}
      {success && <div className="alert-banner alert-success">{success}</div>}

      {/* TABS FOR OPD vs IPD  */}
      <div className="filter-tab-bar">
        <button className={`tab-btn ${activeTab === "ALL" ? "active" : ""}`} onClick={() => setActiveTab("ALL")}>
          All Patients ({patients.length})
        </button>
        <button className={`tab-btn ${activeTab === "OPD" ? "active" : ""}`} onClick={() => setActiveTab("OPD")}>
          OPD - Outpatients ({patients.filter((p) => (p.status || "OPD") === "OPD").length})
        </button>
        <button className={`tab-btn ${activeTab === "IPD" ? "active" : ""}`} onClick={() => setActiveTab("IPD")}>
          IPD - Admitted Inpatients ({patients.filter((p) => p.status === "IPD").length})
        </button>
        <button className={`tab-btn ${activeTab === "Discharged" ? "active" : ""}`} onClick={() => setActiveTab("Discharged")}>
          Discharged ({patients.filter((p) => p.status === "Discharged").length})
        </button>
      </div>

      {/* SEARCH TOOLBAR */}
      <div className="module-search-row">
        <div className="search-input-wrap">
          <Search size={16} />
          <input
            placeholder="Search by patient name, unique ID, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* PATIENT TABLE */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Full Name</th>
              <th>Gender / DOB</th>
              <th>Blood Group</th>
              <th>Contact Phone</th>
              <th>Department / Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((p) => (
              <tr key={p._id}>
                <td><strong>{p.patient_id || p.patientId || p._id.slice(-6)}</strong></td>
                <td>{p.name}</td>
                <td>{p.gender || "M"} • {p.dob ? new Date(p.dob).toLocaleDateString() : "N/A"}</td>
                <td><span className="blood-tag">{p.blood_group || p.bloodGroup || "O+"}</span></td>
                <td>{p.phone || "—"}</td>
                <td>
                  <span className={`status-pill ${p.status === "IPD" ? "occupied" : p.status === "Discharged" ? "available" : "primary"}`}>
                    {p.status || "OPD"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      className="action-btn-sm"
                      title="View EMR & Medical History"
                      onClick={() => handleOpenHistory(p)}
                    >
                      <History size={14} /> EMR History
                    </button>
                    <button
                      type="button"
                      className="action-btn-sm"
                      title="Generate Full Patient Clinical Report"
                      onClick={() => handleGenerateReport(p._id)}
                    >
                      <FileText size={14} /> Report
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredPatients.length === 0 && (
              <tr>
                <td colSpan="7" className="empty">No matching patient records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* REGISTER NEW PATIENT MODAL */}
      {showAddModal && (
        <div className="modal">
          <form className="modal-card" onSubmit={handleRegisterPatient}>
            <div className="modal-head">
              <h2>Register New Patient</h2>
              <button type="button" className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>

            <div className="grid-2-inputs">
              <label>
                Full Name
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Chandra"
                />
              </label>

              <label>
                Gender
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </label>

              <label>
                Date of Birth
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                />
              </label>

              <label>
                Blood Group
                <select
                  value={formData.blood_group}
                  onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                >
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </label>

              <label>
                Contact Phone
                <input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="10-digit mobile number"
                />
              </label>

              <label>
                Email Address
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="patient@example.com"
                />
              </label>
            </div>

            <label>
              Residential Address
              <input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address, City, Pin Code"
              />
            </label>

            <label>
              Known Allergies
              <input
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                placeholder="e.g. Penicillin, Sulfa drugs, Peanuts"
              />
            </label>

            <label>
              Initial Medical History Notes (Medical_history)
              <textarea
                value={formData.history}
                onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                placeholder="Past diagnoses, surgeries, chronic medications..."
              />
            </label>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Register & Create Digital ID</button>
            </div>
          </form>
        </div>
      )}

      {/* LONGITUDINAL MEDICAL HISTORY MODAL */}
      {showHistoryModal && selectedPatient && (
        <div className="modal">
          <div className="modal-card wide-modal-card">
            <div className="modal-head">
              <div>
                <h2>Electronic Medical Record (EMR) — {selectedPatient.name}</h2>
                <small>Unique ID: {selectedPatient.patient_id || selectedPatient.patientId} | Status: {selectedPatient.status || "OPD"}</small>
              </div>
              <button type="button" className="close-btn" onClick={() => setShowHistoryModal(false)}>×</button>
            </div>

            <div className="history-modal-content">
              {/* Existing History Timeline */}
              <div className="history-timeline-section">
                <h3>Longitudinal Diagnoses & Clinical Timeline (Medical_history)</h3>
                <div className="timeline-items">
                  {patientDetails?.history?.map((h) => (
                    <div key={h._id} className="timeline-item">
                      <div className="timeline-date">{new Date(h.diagnosis_date).toLocaleDateString()}</div>
                      <div className="timeline-bubble">
                        <strong>{h.condition_md}</strong>
                        <p>{h.notes}</p>
                      </div>
                    </div>
                  ))}
                  {(!patientDetails?.history || patientDetails.history.length === 0) && (
                    <p className="empty">No chronic diagnoses logged yet.</p>
                  )}
                </div>

                {/* Add Diagnosis Entry Form */}
                <form className="add-history-form" onSubmit={handleAddHistoryNote}>
                  <h4>Log New Clinical Finding / Diagnosis</h4>
                  <input
                    required
                    value={conditionMd}
                    onChange={(e) => setConditionMd(e.target.value)}
                    placeholder="Clinical condition / diagnosis (e.g. Stage 1 Hypertension)"
                  />
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Doctor observations, clinical plan, prescribed treatment..."
                  />
                  <button type="submit" className="btn-primary" style={{ alignSelf: "flex-start" }}>
                    + Record Diagnosis to EMR
                  </button>
                </form>
              </div>

              {/* Quick Summary of Encounters */}
              <div className="encounters-summary-section">
                <h4>Clinical Encounters Summary</h4>
                <div className="summary-stat-box">
                  <div><strong>Appointments:</strong> {patientDetails?.appointments?.length || 0}</div>
                  <div><strong>Prescriptions:</strong> {patientDetails?.prescriptions?.length || 0}</div>
                  <div><strong>Admissions (IPD):</strong> {patientDetails?.admissions?.length || 0}</div>
                  <div><strong>Invoices:</strong> {patientDetails?.bills?.length || 0}</div>
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  style={{ width: "100%", marginTop: "15px" }}
                  onClick={() => handleGenerateReport(selectedPatient._id)}
                >
                  <FileText size={16} /> Print Full Case Summary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT PATIENT REPORT MODAL */}
      <PrintModal
        show={showReport}
        onClose={() => setShowReport(false)}
        title="Comprehensive Patient Case Report"
        data={reportDoc}
        type="patientReport"
      />
    </div>
  );
}
