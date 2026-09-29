import React from "react";
import { Printer, X, CheckCircle, Hospital } from "lucide-react";

export default function PrintModal({ show, onClose, title, data, type }) {
  if (!show || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal print-modal-overlay">
      <div className="modal-card print-document-card">
        {/* Modal Controls (Hidden in Print) */}
        <div className="modal-head no-print">
          <h2>{title || "Official Document"}</h2>
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" className="btn-primary" onClick={handlePrint}>
              <Printer size={16} /> Print / Save PDF
            </button>
            <button type="button" className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="printable-canvas" id="printable-area">
          {/* Institution Header */}
          <div className="doc-header">
            <div className="doc-logo-area">
              <div className="doc-emblem">
                <Hospital size={36} color="#1769e0" />
              </div>
              <div>
                <h1 className="doc-institution-name">
                  MAULANA AZAD NATIONAL INSTITUTE OF TECHNOLOGY BHOPAL
                </h1>
                <p className="doc-hospital-title">
                  MANIT Health Care & Research Hospital — Information System (HIS)
                </p>
                <small className="doc-address">
                  Link Road Number 3, MANIT Campus, Bhopal, Madhya Pradesh 462003 | Phone: +91-755-4051000
                </small>
              </div>
            </div>
            <div className="doc-badge-tag">{data.slipNo || data.reportNo || data.receiptNo || data.admissionNo || "OFFICIAL RECORD"}</div>
          </div>

          <hr className="doc-divider" />

          {/* DOCUMENT BODY ACCORDING TO TYPE */}

          {/* 1. Appointment Slip */}
          {type === "appointment" && (
            <div className="doc-body">
              <h3 className="doc-section-title">APPOINTMENT CONFIRMATION SLIP</h3>
              <div className="doc-grid-2">
                <div>
                  <p><strong>Slip No:</strong> {data.slipNo}</p>
                  <p><strong>Patient Name:</strong> {data.patientName}</p>
                  <p><strong>Patient ID:</strong> {data.patientId}</p>
                </div>
                <div>
                  <p><strong>Consulting Doctor:</strong> {data.doctorName}</p>
                  <p><strong>Department:</strong> {data.department}</p>
                  <p><strong>Date & Time Slot:</strong> {new Date(data.appointmentDate).toLocaleDateString()} ({data.timeSlot})</p>
                  <p><strong>Consultation Fee:</strong> ₹{data.consultationFee}</p>
                  <p><strong>Payment:</strong> {data.paymentStatus?.toUpperCase()} · {data.paymentMethod}</p>
                  {data.paymentReference && <p><strong>Receipt / Reference:</strong> {data.paymentReference}</p>}
                </div>
              </div>
              <div className="doc-notice-box">
                <strong>Notice:</strong> {data.instructions}
              </div>
            </div>
          )}

          {/* 2. Diagnostic Lab Report */}
          {type === "lab" && (
            <div className="doc-body">
              <h3 className="doc-section-title">DIAGNOSTIC PATHOLOGY REPORT</h3>
              <div className="doc-grid-2">
                <div>
                  <p><strong>Report No:</strong> {data.reportNo}</p>
                  <p><strong>Patient Name:</strong> {data.patientName} ({data.patientId})</p>
                  <p><strong>Age / Gender:</strong> {data.patientAge} yrs / {data.gender}</p>
                  <p><strong>Referring Doctor:</strong> {data.referringDoctor || "Attending Physician"}</p>
                </div>
                <div>
                  <p><strong>Test Date:</strong> {new Date(data.testDate).toLocaleDateString()}</p>
                  <p><strong>Report Status:</strong> <span className="doc-tag-success">{data.status?.toUpperCase()}</span></p>
                  <p><strong>Reporting Technician:</strong> {data.technician}</p>
                </div>
              </div>

              <table className="doc-table">
                <thead>
                  <tr>
                    <th>Investigation / Parameter</th>
                    <th>Observed Result</th>
                    <th>Biological Reference Range</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>{data.testName}</strong></td>
                    <td style={{ fontWeight: "bold", color: "#1769e0" }}>{data.result}</td>
                    <td>{data.normalRange}</td>
                  </tr>
                </tbody>
              </table>

              {data.notes && (
                <div className="doc-clinical-notes">
                  <strong>Clinical Impressions:</strong> {data.notes}
                </div>
              )}
            </div>
          )}

          {/* 3. Inpatient Discharge Summary */}
          {type === "discharge" && (
            <div className="doc-body">
              <h3 className="doc-section-title">INPATIENT DISCHARGE SUMMARY & CASE CLOSURE</h3>
              <div className="doc-grid-2">
                <div>
                  <p><strong>Admission No:</strong> {data.admissionNo}</p>
                  <p><strong>Patient Name:</strong> {data.patientName} ({data.patientId})</p>
                  <p><strong>Room Allocated:</strong> {data.roomAllocated} ({data.roomType})</p>
                </div>
                <div>
                  <p><strong>Admission Date:</strong> {new Date(data.admissionDate).toLocaleString()}</p>
                  <p><strong>Discharge Date:</strong> {new Date(data.dischargeDate).toLocaleString()}</p>
                  <p><strong>Attending Doctor:</strong> {data.attendingDoctor}</p>
                  <p><strong>Assigned Nurse:</strong> {data.assignedNurse}</p>
                </div>
              </div>

              <div className="doc-block">
                <h4>Primary Diagnosis:</h4>
                <p>{data.diagnosis || "Acute medical care observation completed."}</p>
              </div>

              <div className="doc-block">
                <h4>Discharge Advice & Prescribed Protocol:</h4>
                <p>{data.dischargeAdvice}</p>
              </div>
            </div>
          )}

          {/* 4. Consolidated Billing Receipt */}
          {type === "bill" && (
            <div className="doc-body">
              <h3 className="doc-section-title">OFFICIAL HEALTHCARE TAX INVOICE & RECEIPT</h3>
              <div className="doc-grid-2">
                <div>
                  <p><strong>Receipt No:</strong> {data.receiptNo}</p>
                  <p><strong>Invoice ID:</strong> {data.billId}</p>
                  <p><strong>Billing Date:</strong> {new Date(data.billDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p><strong>Patient Name:</strong> {data.patientDetails?.name}</p>
                  <p><strong>Patient ID:</strong> {data.patientDetails?.id}</p>
                  <p><strong>Payment Status:</strong> <span className={data.paymentStatus === "paid" ? "doc-tag-success" : "doc-tag-warning"}>{data.paymentStatus?.toUpperCase()}</span></p>
                  <p><strong>Payment Mode:</strong> {data.paymentMethod}</p>
                </div>
              </div>

              <table className="doc-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Category</th>
                    <th style={{ textAlign: "right" }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.itemizedCharges?.consultations?.map((c, i) => (
                    <tr key={`c-${i}`}>
                      <td>{c.desc}</td>
                      <td>Doctor Consultation</td>
                      <td style={{ textAlign: "right" }}>₹{c.amount}</td>
                    </tr>
                  ))}
                  {data.itemizedCharges?.pharmacy?.map((m, i) => (
                    <tr key={`m-${i}`}>
                      <td>{m.desc}</td>
                      <td>Pharmacy Medication</td>
                      <td style={{ textAlign: "right" }}>₹{m.amount}</td>
                    </tr>
                  ))}
                  {data.itemizedCharges?.laboratory?.map((l, i) => (
                    <tr key={`l-${i}`}>
                      <td>{l.desc}</td>
                      <td>Diagnostic Laboratory</td>
                      <td style={{ textAlign: "right" }}>₹{l.amount}</td>
                    </tr>
                  ))}
                  {data.itemizedCharges?.inpatientStay?.map((s, i) => (
                    <tr key={`s-${i}`}>
                      <td>{s.desc}</td>
                      <td>Inpatient Room Stay</td>
                      <td style={{ textAlign: "right" }}>₹{s.amount}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan="2" style={{ textAlign: "right" }}>GRAND TOTAL:</th>
                    <th style={{ textAlign: "right", fontSize: "16px", color: "#1769e0" }}>
                      ₹{data.totals?.grandTotal?.toLocaleString()}
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* 5. Patient Clinical Report (DFD 2.7) */}
          {type === "patientReport" && (
            <div className="doc-body">
              <h3 className="doc-section-title">PATIENT COMPREHENSIVE CLINICAL SUMMARY</h3>
              <div className="doc-grid-2">
                <div>
                  <p><strong>Patient Name:</strong> {data.patient?.name}</p>
                  <p><strong>Unique Patient ID:</strong> {data.patient?.patient_id}</p>
                  <p><strong>Gender / Blood Group:</strong> {data.patient?.gender} / {data.patient?.blood_group || "N/A"}</p>
                </div>
                <div>
                  <p><strong>Contact:</strong> {data.patient?.phone}</p>
                  <p><strong>Current Clinical State:</strong> <span className="doc-tag-primary">{data.patient?.status || "OPD"}</span></p>
                  <p><strong>Address:</strong> {data.patient?.address}</p>
                </div>
              </div>

              <h4>Longitudinal Medical History</h4>
              <ul className="doc-list">
                {data.clinicalData?.history?.map((h, i) => (
                  <li key={i}>
                    <strong>{new Date(h.diagnosis_date).toLocaleDateString()}:</strong> {h.condition_md} — <em>{h.notes}</em>
                  </li>
                ))}
                {(!data.clinicalData?.history || data.clinicalData?.history?.length === 0) && (
                  <li>No chronic medical conditions recorded.</li>
                )}
              </ul>
            </div>
          )}

          {/* Document Footer with Mentors & Students */}
          <div className="doc-footer">
            <div className="doc-sign-area">
              <div>
                <div className="signature-line"></div>
                <small>Authorized Medical Officer / Attending Staff</small>
              </div>
              <div>
                <div className="signature-line"></div>
                <small>System Admin / Registrar</small>
              </div>
            </div>
            <div className="doc-academic-credit">
              Project Mentors: <strong>Dr. Jay Kumar Jain & Dr. Kuldeep Singh Yadav</strong> | Dept. of Computer Applications, MANIT Bhopal
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
