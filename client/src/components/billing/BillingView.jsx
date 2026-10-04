import React, { useState, useEffect } from "react";
import { Receipt, CreditCard, Printer, CheckCircle, AlertTriangle, ArrowRight, DollarSign } from "lucide-react";
import { api } from "../../lib/api";
import PrintModal from "../common/PrintModal";

export default function BillingView() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedBill, setSelectedBill] = useState(null);
  const [billDetails, setBillDetails] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("UPI / Online Transfer");

  // Receipt Print State
  const [receiptDoc, setReceiptDoc] = useState(null);
  const [showPrint, setShowPrint] = useState(false);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      setLoading(true);
      const data = await api("/billing-ops");
      setBills(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = async (bill) => {
    setSelectedBill(bill);
    try {
      const details = await api(`/billing-ops/${bill._id}`);
      setBillDetails(details);
      setShowDetailModal(true);
    } catch (err) {
      setError("Failed to fetch bill details: " + err.message);
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!selectedBill) return;
    setError("");
    setSuccess("");

    try {
      const result = await api(`/billing-ops/${selectedBill._id}/pay`, {
        method: "POST",
        body: JSON.stringify({ payment_method: paymentMethod }),
      });

      setSuccess("Payment processed successfully! Master invoice marked as PAID.");
      setShowPayModal(false);
      loadBills();

      // Automatically open receipt print modal
      handlePrintReceipt(selectedBill._id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePrintReceipt = async (billId) => {
    try {
      const receipt = await api(`/billing-ops/${billId}/receipt`);
      setReceiptDoc(receipt);
      setShowPrint(true);
    } catch (err) {
      setError("Failed to fetch receipt: " + err.message);
    }
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h2>Consolidated Billing & Healthcare Invoicing</h2>
          <p className="sub-text">
            Auto-calculated master billing aggregating consultation, medication, lab tests, and room stay charges with official tax receipts.
          </p>
        </div>
      </div>

      {error && <div className="alert-banner alert-danger">{error}</div>}
      {success && <div className="alert-banner alert-success">{success}</div>}

      {/* BILLS TABLE */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Patient</th>
              <th>Billing Date</th>
              <th>Consultation</th>
              <th>Pharmacy</th>
              <th>Laboratory</th>
              <th>Room Stay</th>
              <th>Grand Total</th>
              <th>Payment Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((b) => {
              const total = b.total_amount || b.total || 0;
              const isPaid = b.status === "paid";

              return (
                <tr key={b._id}>
                  <td><strong>{b.bill_id || b._id.slice(-6)}</strong></td>
                  <td>{b.patient_id?.name || b.patient?.name || "Patient"}</td>
                  <td>{new Date(b.bill_date || b.createdAt).toLocaleDateString()}</td>
                  <td>₹{b.consultation_charges || 0}</td>
                  <td>₹{b.pharmacy_charges || 0}</td>
                  <td>₹{b.lab_charges || 0}</td>
                  <td>₹{b.room_charges || 0}</td>
                  <td style={{ fontSize: "15px", fontWeight: "bold", color: "#1769e0" }}>
                    ₹{total.toLocaleString()}
                  </td>
                  <td>
                    <span className={`status-pill ${isPaid ? "available" : "occupied"}`}>
                      {b.status?.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        className="action-btn-sm"
                        onClick={() => handleOpenDetails(b)}
                      >
                        Itemized Breakdown
                      </button>
                      {!isPaid ? (
                        <button
                          type="button"
                          className="btn-primary-sm"
                          onClick={() => {
                            setSelectedBill(b);
                            setShowPayModal(true);
                          }}
                        >
                          <CreditCard size={13} /> Pay
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="action-btn-sm"
                          onClick={() => handlePrintReceipt(b._id)}
                        >
                          <Printer size={13} /> Receipt
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {bills.length === 0 && (
              <tr>
                <td colSpan="10" className="empty">No billing invoices found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ITEMIZED BREAKDOWN MODAL */}
      {showDetailModal && billDetails && (
        <div className="modal">
          <div className="modal-card wide-modal-card">
            <div className="modal-head">
              <div>
                <h2>Consolidated Bill Breakdown — {billDetails.bill?.bill_id}</h2>
                <small>Patient: {billDetails.bill?.patient_id?.name || billDetails.bill?.patient?.name}</small>
              </div>
              <button type="button" className="close-btn" onClick={() => setShowDetailModal(false)}>×</button>
            </div>

            <div className="bill-breakdown-body">
              {/* Charge Category 1: Consultation */}
              <div className="breakdown-category-card">
                <h4>1. Doctor Consultation Charges (Appointment_charge)</h4>
                <ul>
                  {billDetails.breakdown?.appointmentCharges?.map((c) => (
                    <li key={c._id}>
                      <span>Consultation ({c.charge_id})</span>
                      <strong>₹{c.consultation_fee}</strong>
                    </li>
                  ))}
                  {billDetails.breakdown?.appointmentCharges?.length === 0 && <li>No consultation charges.</li>}
                </ul>
              </div>

              {/* Charge Category 2: Pharmacy */}
              <div className="breakdown-category-card">
                <h4>2. Dispensed Pharmacy Charges (Medicine_charge)</h4>
                <ul>
                  {billDetails.breakdown?.medicineCharges?.map((c) => (
                    <li key={c._id}>
                      <span>{c.medicine_name || "Medicine"} (Qty: {c.quantity})</span>
                      <strong>₹{c.amount}</strong>
                    </li>
                  ))}
                  {billDetails.breakdown?.medicineCharges?.length === 0 && <li>No pharmacy charges.</li>}
                </ul>
              </div>

              {/* Charge Category 3: Lab Tests */}
              <div className="breakdown-category-card">
                <h4>3. Diagnostic Laboratory Charges (Test_charge)</h4>
                <ul>
                  {billDetails.breakdown?.testCharges?.map((c) => (
                    <li key={c._id}>
                      <span>{c.test_name || "Lab Investigation"} ({c.charge_id})</span>
                      <strong>₹{c.amount}</strong>
                    </li>
                  ))}
                  {billDetails.breakdown?.testCharges?.length === 0 && <li>No laboratory charges.</li>}
                </ul>
              </div>

              {/* Charge Category 4: Inpatient Stay */}
              <div className="breakdown-category-card">
                <h4>4. Inpatient Ward / Room Stay Charges (Admission_charge)</h4>
                <ul>
                  {billDetails.breakdown?.admissionCharges?.map((c) => (
                    <li key={c._id}>
                      <span>Room {c.room_number || "Ward"} ({c.days_stayed} days @ ₹{c.daily_rate}/day)</span>
                      <strong>₹{c.amount}</strong>
                    </li>
                  ))}
                  {billDetails.breakdown?.admissionCharges?.length === 0 && <li>No room stay charges.</li>}
                </ul>
              </div>

              <div className="breakdown-grand-total">
                <span>Grand Total:</span>
                <span className="total-amount">₹{(billDetails.bill?.total_amount || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: "15px" }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => handlePrintReceipt(billDetails.bill._id)}
              >
                <Printer size={15} /> Print Official Hospital Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROCESS PAYMENT MODAL */}
      {showPayModal && selectedBill && (
        <div className="modal">
          <form className="modal-card" onSubmit={handlePay}>
            <div className="modal-head">
              <h2>Collect Healthcare Payment</h2>
              <button type="button" className="close-btn" onClick={() => setShowPayModal(false)}>×</button>
            </div>

            <div className="discharge-info-box">
              <p><strong>Invoice ID:</strong> {selectedBill.bill_id}</p>
              <p><strong>Patient:</strong> {selectedBill.patient_id?.name || selectedBill.patient?.name}</p>
              <p><strong>Total Amount Due:</strong> ₹{(selectedBill.total_amount || selectedBill.total || 0).toLocaleString()}</p>
            </div>

            <label>
              Select Payment Method
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="UPI / Online QR">UPI / GooglePay / PhonePe</option>
                <option value="Credit / Debit Card">Credit / Debit Card (POS)</option>
                <option value="Cash Counter">Cash Counter</option>
                <option value="Medical Insurance (TPA)">Medical Insurance (TPA Direct)</option>
              </select>
            </label>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowPayModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Process Payment & Generate Receipt</button>
            </div>
          </form>
        </div>
      )}

      {/* PRINT RECEIPT MODAL */}
      <PrintModal
        show={showPrint}
        onClose={() => setShowPrint(false)}
        title="Official Healthcare Tax Invoice"
        data={receiptDoc}
        type="bill"
      />
    </div>
  );
}
