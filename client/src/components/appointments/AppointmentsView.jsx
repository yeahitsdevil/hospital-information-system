import React, { useState, useEffect } from "react";
import { CalendarDays, Clock, Plus, Printer, CheckCircle, AlertTriangle, User, Stethoscope, ShieldCheck, XCircle } from "lucide-react";
import { api } from "../../lib/api";
import PrintModal from "../common/PrintModal";

const todayLocal = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

export default function AppointmentsView() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayLocal);
  const [selectedSlot, setSelectedSlot] = useState("10:00");
  const [reason, setReason] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [cashAppointment, setCashAppointment] = useState(null);
  const [cashAmount, setCashAmount] = useState("");
  const [cashReceipt, setCashReceipt] = useState("");
  const [availability, setAvailability] = useState(null);

  // Print slip state
  const [printDoc, setPrintDoc] = useState(null);
  const [showPrint, setShowPrint] = useState(false);

  const user = JSON.parse(localStorage.getItem("his_user") || "{}");
  const isPatient = user.role === "patient";
  const canBook = ["patient", "receptionist", "admin"].includes(user.role);
  const canCollectCash = ["admin", "receptionist", "accountant"].includes(user.role);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [apptsData, docsData] = await Promise.all([
        api("/appointment-ops"),
        api("/doctors"),
      ]);

      setAppointments(apptsData);
      setDoctors(docsData);

      if (docsData.length > 0) {
        // Prefer an available doctor by default
        const firstAvailable = docsData.find((d) => d.is_available !== false) || docsData[0];
        setSelectedDoctor(firstAvailable._id);
      }

      if (!isPatient) {
        const patsData = await api("/patients").catch(() => []);
        setPatients(patsData);
        if (patsData.length > 0) setSelectedPatient(patsData[0]._id);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Check doctor availability when doctor or date changes
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      api(`/appointment-ops/doctor/${selectedDoctor}/availability?date=${selectedDate}`)
        .then((data) => setAvailability(data))
        .catch(() => setAvailability(null));
    }
  }, [selectedDoctor, selectedDate]);

  const selectedDoctorObj = doctors.find((d) => d._id === selectedDoctor);
  const isDoctorAvailable = selectedDoctorObj?.is_available !== false && availability?.is_available !== false;

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isDoctorAvailable) {
      setError(`Cannot book: Dr. ${selectedDoctorObj?.name || "Selected doctor"} is currently marked as Not Available.`);
      return;
    }

    try {
      const consultationFee = Number(selectedDoctorObj?.consultation_fee ?? selectedDoctorObj?.consultationFee ?? 500);
      const payload = {
        patient_id: isPatient ? (user.patient_id || undefined) : selectedPatient,
        doctor_emp_id: selectedDoctor,
        appointment_date: selectedDate,
        start_time: selectedSlot,
        reason: reason || "General Outpatient Consultation",
        payment_confirmed: paymentMethod !== "Cash",
        payment_amount: consultationFee,
        payment_method: paymentMethod,
        ...(paymentMethod === "Cash" ? {} : { payment_reference: `DEMO-${Date.now()}` }),
      };

      const result = await api("/appointment-ops", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSuccess(paymentMethod === "Cash"
        ? `Appointment ${result.appointment_id} reserved. Collect ₹${result.consultation_fee} at reception before the visit.`
        : `Payment recorded and appointment ${result.appointment_id} confirmed. Consultation fee: ₹${result.consultation_fee}.`);
      setShowModal(false);
      setReason("");
      loadData();

      // Open print slip automatically
      handlePrintSlip(result._id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePrintSlip = async (id) => {
    try {
      const slipData = await api(`/appointment-ops/${id}/slip`);
      setPrintDoc(slipData);
      setShowPrint(true);
    } catch (err) {
      setError("Failed to generate appointment slip: " + err.message);
    }
  };

  const handleCashPayment = async (e) => {
    e.preventDefault();
    if (!cashAppointment) return;
    setError("");
    try {
      const result = await api(`/appointment-ops/${cashAppointment._id}/cash-payment`, {
        method: "POST",
        body: JSON.stringify({ amount: Number(cashAmount), receipt_number: cashReceipt }),
      });
      setSuccess(result.message);
      setCashAppointment(null);
      setCashAmount("");
      setCashReceipt("");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h2>
            {isPatient ? "My Consultations & Appointments" : "Appointment Scheduling & Doctor Slots"}
          </h2>
          <p className="sub-text">
            {isPatient
              ? "Book 30-minute consultation slots with your preferred specialist doctor and view confirmation slips."
              : "30-minute time-slot consultations with doctor schedule conflict prevention and daily quota enforcement (Max 20/day)."}
          </p>
        </div>
        {canBook && <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> {isPatient ? "Book My Appointment" : "Book Appointment"}
        </button>}
      </div>

      {error && <div className="alert-banner alert-danger"><AlertTriangle size={18} /> {error}</div>}
      {success && <div className="alert-banner alert-success"><CheckCircle size={18} /> {success}</div>}

      {/* Appointments List Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Appt ID</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Slot (30m)</th>
              <th>Status</th>
              <th>Fee</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a._id}>
                <td><strong>{a.appointment_id || a._id.slice(-6)}</strong></td>
                <td>
                  {a.patient_id?.name || a.patient?.name || (isPatient ? user.name : "Patient")}
                  {isPatient && <small className="text-muted block"> (You)</small>}
                </td>
                <td>{a.doctor_emp_id?.name || a.doctor?.name || "Doctor"}</td>
                <td>{new Date(a.appointment_date || a.date).toLocaleDateString()}</td>
                <td>
                  <span className="badge-time">
                    <Clock size={13} /> {a.start_time || "10:00"} - {a.end_time || "10:30"}
                  </span>
                </td>
                <td>
                  <span className={`status-pill ${a.status}`}>
                    {a.status?.toUpperCase()}
                  </span>
                </td>
                <td>₹{a.consultation_fee || 500}</td>
                <td><span className={`status-pill ${a.payment_status === "paid" ? "available" : "primary"}`}>{a.payment_status === "paid" ? "PAID" : `DUE${a.payment_method === "Cash" ? " · CASH" : ""}`}</span></td>
                <td>
                  <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    type="button"
                    className="action-btn-sm"
                    title="Print Confirmation Slip"
                    onClick={() => handlePrintSlip(a._id)}
                  >
                    <Printer size={15} /> Slip
                  </button>
                  {canCollectCash && a.payment_method === "Cash" && a.payment_status !== "paid" && <button type="button" className="btn-primary-sm" onClick={() => { setCashAppointment(a); setCashAmount(String(a.consultation_fee || 500)); setCashReceipt(""); }}>Record cash</button>}
                  </div>
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr>
                <td colSpan="9" className="empty">
                  {isPatient
                    ? "You have no appointments scheduled. Click 'Book My Appointment' above to schedule one!"
                    : "No appointments scheduled yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* BOOK APPOINTMENT MODAL */}
      {showModal && (
        <div className="modal">
          <form className="modal-card" onSubmit={handleBookAppointment}>
            <div className="modal-head">
              <h2>{isPatient ? "Book Your Doctor Consultation" : "Book Consultation Slot "}</h2>
              <button type="button" className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            {/* PATIENT SELECTION: Locked to current user if patient */}
            {isPatient ? (
              <div className="patient-preselected-card">
                <div className="preselected-avatar">
                  {user.name?.[0]?.toUpperCase() || "P"}
                </div>
                <div>
                  <div className="preselected-name">
                    <strong>{user.name}</strong> (Self Booking)
                  </div>
                  <small className="preselected-meta">
                    Email: {user.email} • ID: {user.patient_id ? "PAT-" + user.patient_id.slice(-4) : "Registered Patient"}
                  </small>
                </div>
              </div>
            ) : (
              <label>
                Select Patient
                <select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  required
                >
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.patient_id || p.patientId}) - {p.status || "OPD"}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {/* DOCTOR SELECTION WITH LIVE AVAILABILITY STATUS */}
            <label>
              Consulting Doctor & Live Availability
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                required
              >
                {doctors.map((d) => {
                  const isAvail = d.is_available !== false;
                  return (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.specialization || d.department}) - Fee: ₹{d.consultation_fee || d.consultationFee || 500} {isAvail ? "[● Available]" : `[● NOT AVAILABLE - ${d.status_note || "Off Duty"}]`}
                    </option>
                  );
                })}
              </select>
            </label>

            {/* DOCTOR AVAILABILITY WARNING BANNER */}
            {!isDoctorAvailable && (
              <div className="alert-banner alert-danger">
                <XCircle size={18} />
                <div>
                  <strong>Doctor is currently Not Available:</strong>{" "}
                  Dr. {selectedDoctorObj?.name} is marked as Not Available ({selectedDoctorObj?.status_note || availability?.status_note || "Off Duty"}).
                  Please choose another doctor to schedule your consultation.
                </div>
              </div>
            )}

            {isDoctorAvailable && (
              <div className="alert-banner alert-success" style={{ padding: "8px 12px", fontSize: "13px" }}>
                <ShieldCheck size={16} />
                <span>
                  Dr. {selectedDoctorObj?.name} is <strong>Available</strong> ({selectedDoctorObj?.status_note || "On Duty"}).
                </span>
              </div>
            )}

            <label>
              Appointment Date (No Past Dates)
              <input
                type="date"
                min={todayLocal()}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
              />
            </label>

            {/* Doctor Daily Quota Info (Trigger 9) */}
            {availability && isDoctorAvailable && (
              <div className="quota-indicator">
                <strong>Doctor Daily Quota:</strong> {availability.totalBooked} / {availability.maxAllowed} booked on this date.
                {availability.totalBooked >= 20 && (
                  <span className="text-danger"> Limit reached for this doctor on this day.</span>
                )}
              </div>
            )}

            {/* 30-Minute Time Slot Picker */}
            <label>
              Select 30-Min Time Slot (Conflict Prevention)
              <div className="slots-grid">
                {availability?.slots?.map((slot) => (
                  <button
                    type="button"
                    key={slot.start_time}
                    className={`slot-chip ${selectedSlot === slot.start_time ? "selected" : ""} ${!slot.available ? "unavailable" : ""}`}
                    disabled={!slot.available || !isDoctorAvailable}
                    onClick={() => setSelectedSlot(slot.start_time)}
                  >
                    {slot.start_time}
                  </button>
                ))}
                {!availability && (
                  <small>Loading available consultation slots...</small>
                )}
              </div>
            </label>

            <label>
              Reason for Visit / Clinical Symptoms
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Chest pain follow-up, general health check, fever and cold, blood pressure review"
                rows={2}
              />
            </label>

            <div className="discharge-info-box">
              <strong>Consultation charge: ₹{selectedDoctorObj?.consultation_fee ?? selectedDoctorObj?.consultationFee ?? 500}</strong>
              <p>Payment is required before the appointment is confirmed.</p>
              <label>
                Payment method
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} required>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Cash">Cash at reception</option>
                </select>
              </label>
              {paymentMethod === "Cash"
                ? <small>The appointment stays unpaid until reception or accounts records the cash receipt.</small>
                : <small>This project records a demo payment confirmation; no bank or payment gateway is connected.</small>}
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={!isDoctorAvailable || !availability || availability.totalBooked >= 20 || !availability.slots?.some((slot) => slot.start_time === selectedSlot && slot.available)}
              >
                {paymentMethod === "Cash" ? "Reserve and pay at reception" : `Pay ₹${selectedDoctorObj?.consultation_fee ?? selectedDoctorObj?.consultationFee ?? 500} & Confirm`}
              </button>
            </div>
          </form>
        </div>
      )}

      {cashAppointment && (
        <div className="modal">
          <form className="modal-card" onSubmit={handleCashPayment}>
            <div className="modal-head">
              <h2>Record cash consultation payment</h2>
              <button type="button" className="close-btn" onClick={() => setCashAppointment(null)}>×</button>
            </div>
            <div className="discharge-info-box">
              <p><strong>Appointment:</strong> {cashAppointment.appointment_id}</p>
              <p><strong>Patient:</strong> {cashAppointment.patient_id?.name || cashAppointment.patient?.name || "Patient"}</p>
              <p><strong>Amount due:</strong> ₹{cashAppointment.consultation_fee || 500}</p>
            </div>
            <label>Cash received (₹)
              <input type="number" min="0" step="0.01" value={cashAmount} onChange={(e) => setCashAmount(e.target.value)} required />
            </label>
            <label>Cash receipt number
              <input value={cashReceipt} onChange={(e) => setCashReceipt(e.target.value)} placeholder="Enter the receipt issued at reception" required />
            </label>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setCashAppointment(null)}>Cancel</button>
              <button type="submit" className="btn-primary">Confirm cash received</button>
            </div>
          </form>
        </div>
      )}

      {/* PRINT CONFIRMATION SLIP MODAL */}
      <PrintModal
        show={showPrint}
        onClose={() => setShowPrint(false)}
        title="Appointment Confirmation Slip"
        data={printDoc}
        type="appointment"
      />
    </div>
  );
}
