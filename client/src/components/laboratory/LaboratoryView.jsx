import React, { useState, useEffect } from "react";
import { FlaskConical, Plus, Printer, CheckCircle, AlertTriangle, FileCheck, Layers } from "lucide-react";
import { api } from "../../lib/api";
import PrintModal from "../common/PrintModal";

export default function LaboratoryView() {
  const [labTests, setLabTests] = useState([]);
  const [testTypes, setTestTypes] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  // Order Form
  const [orderPatient, setOrderPatient] = useState("");
  const [orderAppointment, setOrderAppointment] = useState("");
  const [orderTestType, setOrderTestType] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  // Result Form
  const [testResult, setTestResult] = useState("");
  const [resultNotes, setResultNotes] = useState("");

  // Report Print State
  const [reportDoc, setReportDoc] = useState(null);
  const [showPrint, setShowPrint] = useState(false);
  const user = JSON.parse(localStorage.getItem("his_user") || "{}");
  const isDoctor = user.role === "doctor";
  const isLabTech = user.role === "lab";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [testsData, typesData, apptData] = await Promise.all([
        api("/lab-ops/tests"),
        api("/lab-ops/test-types"),
        isDoctor ? api("/appointment-ops") : Promise.resolve([]),
      ]);
      setLabTests(testsData);
      setTestTypes(typesData);
      const eligibleAppointments = apptData.filter((a) => a.payment_status === "paid" && ["scheduled", "completed"].includes(a.status));
      setAppointments(eligibleAppointments);
      if (eligibleAppointments.length > 0) {
        setOrderAppointment(eligibleAppointments[0]._id);
        setOrderPatient(eligibleAppointments[0].patient_id?._id || eligibleAppointments[0].patient?._id || eligibleAppointments[0].patient_id || "");
      }
      if (typesData.length > 0) setOrderTestType(typesData[0]._id);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderTest = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const selectedType = testTypes.find((t) => t._id === orderTestType);
      const payload = {
        patient_id: orderPatient,
        doctor_emp_id: user.emp_id,
        appointment_id: orderAppointment,
        test_type_id: orderTestType,
        testName: selectedType?.test_name || "Diagnostic Test",
        notes: orderNotes,
      };

      const result = await api("/lab-ops/tests", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSuccess(`Lab Test order ${result.test_id} created! Test fee ₹${result.charge_amount} auto-added to active bill`);
      setShowOrderModal(false);
      setOrderNotes("");
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmitResult = async (e) => {
    e.preventDefault();
    if (!selectedTest) return;
    setError("");
    setSuccess("");

    try {
      const payload = {
        result: testResult,
        notes: resultNotes,
      };

      const res = await api(`/lab-ops/tests/${selectedTest._id}/result`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setSuccess(res.message);
      setShowResultModal(false);
      setTestResult("");
      setResultNotes("");
      loadData();

      // Automatically view printable report
      handlePrintReport(selectedTest._id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePrintReport = async (testId) => {
    try {
      const report = await api(`/lab-ops/tests/${testId}/report`);
      setReportDoc(report);
      setShowPrint(true);
    } catch (err) {
      setError("Failed to fetch lab report: " + err.message);
    }
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h2>Laboratory Management & Diagnostic Reports </h2>
          <p className="sub-text">
            Test types catalog with standard pricing, doctor test requisitions, lab technician result submission , and auto-billing.
          </p>
        </div>
        {isDoctor && <button className="btn-primary" onClick={() => setShowOrderModal(true)}>
          <Plus size={16} /> Requisition Lab Test
        </button>}
      </div>

      {error && <div className="alert-banner alert-danger">{error}</div>}
      {success && <div className="alert-banner alert-success">{success}</div>}

      {/* TEST TYPES CATALOG PREVIEW */}
      <div className="catalog-preview-box">
        <h3>Standard Diagnostic Test Catalog & Pricing (Page 22)</h3>
        <div className="catalog-chips-grid">
          {testTypes.map((tt) => (
            <div key={tt._id} className="catalog-card">
              <strong>{tt.test_name}</strong>
              <div className="catalog-sub">{tt.category || "Pathology"} • Ref: {tt.normal_range}</div>
              <div className="catalog-price">₹{tt.price}</div>
            </div>
          ))}
        </div>
      </div>

      {/* LAB TESTS TABLE */}
      <div className="table-wrap" style={{ marginTop: "25px" }}>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Patient</th>
              <th>Test Name</th>
              <th>Ordering Doctor</th>
              <th>Date</th>
              <th>Status</th>
              <th>Result Summary</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {labTests.map((t) => (
              <tr key={t._id}>
                <td><strong>{t.test_id || t._id.slice(-6)}</strong></td>
                <td>{t.patient_id?.name || t.patient?.name || "Patient"}</td>
                <td><strong>{t.testName}</strong></td>
                <td>{t.doctor_emp_id?.name || t.doctor?.name || "Doctor"}</td>
                <td>{new Date(t.test_date || t.orderedAt).toLocaleDateString()}</td>
                <td>
                  <span className={`status-pill ${t.status === "completed" ? "available" : "primary"}`}>
                    {t.status?.toUpperCase()}
                  </span>
                </td>
                <td>{t.result || <em style={{ color: "var(--text-muted)" }}>Awaiting Lab Findings</em>}</td>
                <td>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {t.status !== "completed" && isLabTech ? (
                      <button
                        type="button"
                        className="btn-primary-sm"
                        onClick={() => {
                          setSelectedTest(t);
                          setShowResultModal(true);
                        }}
                      >
                        <FileCheck size={13} /> Enter Result
                      </button>
                    ) : t.status === "completed" ? (
                      <button
                        type="button"
                        className="action-btn-sm"
                        onClick={() => handlePrintReport(t._id)}
                      >
                        <Printer size={13} /> View Report
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {labTests.length === 0 && (
              <tr>
                <td colSpan="8" className="empty">No diagnostic tests ordered yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ORDER TEST MODAL */}
      {showOrderModal && (
        <div className="modal">
          <form className="modal-card" onSubmit={handleOrderTest}>
            <div className="modal-head">
              <h2>Requisition Lab Test</h2>
              <button type="button" className="close-btn" onClick={() => setShowOrderModal(false)}>×</button>
            </div>

            <label>
              Paid appointment
              <select
                value={orderAppointment}
                onChange={(e) => {
                  const appt = appointments.find((a) => a._id === e.target.value);
                  setOrderAppointment(e.target.value);
                  setOrderPatient(appt?.patient_id?._id || appt?.patient?._id || appt?.patient_id || "");
                }}
                required
              >
                {appointments.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.patient_id?.name || a.patient?.name || "Patient"} — {a.appointment_id}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Diagnostic Test Type (Test_type)
              <select
                value={orderTestType}
                onChange={(e) => setOrderTestType(e.target.value)}
                required
              >
                {testTypes.map((tt) => (
                  <option key={tt._id} value={tt._id}>
                    {tt.test_name} (₹{tt.price}) — {tt.category}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Clinical Indication / Reason for Order
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="e.g. Rule out anemia, routine lipid monitoring, pre-operative screening"
              />
            </label>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowOrderModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Order Test & Auto-Bill</button>
            </div>
          </form>
        </div>
      )}

      {/* ENTER RESULTS MODAL */}
      {showResultModal && selectedTest && (
        <div className="modal">
          <form className="modal-card" onSubmit={handleSubmitResult}>
            <div className="modal-head">
              <h2>Submit Laboratory Findings </h2>
              <button type="button" className="close-btn" onClick={() => setShowResultModal(false)}>×</button>
            </div>

            <div className="discharge-info-box">
              <p><strong>Patient:</strong> {selectedTest.patient_id?.name || selectedTest.patient?.name}</p>
              <p><strong>Test:</strong> {selectedTest.testName}</p>
              <p><strong>Standard Reference Range:</strong> {selectedTest.normal_range || "Standard biological limits"}</p>
            </div>

            <label>
              Reporting technician
              <input value={user.name || "Laboratory staff"} readOnly />
            </label>

            <label>
              Observed Analytical Result
              <input
                required
                value={testResult}
                onChange={(e) => setTestResult(e.target.value)}
                placeholder="e.g. Hb: 13.8 g/dL, Total WBC: 7,200 /mcL, Platelets: 2.4 Lakhs"
              />
            </label>

            <label>
              Pathologist / Technician Remarks
              <textarea
                value={resultNotes}
                onChange={(e) => setResultNotes(e.target.value)}
                placeholder="Observations, morphology notes, recommendations..."
              />
            </label>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowResultModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Submit Report to Doctor</button>
            </div>
          </form>
        </div>
      )}

      {/* PRINT LAB REPORT MODAL */}
      <PrintModal
        show={showPrint}
        onClose={() => setShowPrint(false)}
        title="Diagnostic Pathology Report"
        data={reportDoc}
        type="lab"
      />
    </div>
  );
}
