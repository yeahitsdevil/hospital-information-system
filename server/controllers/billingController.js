import mongoose from "mongoose";
import {
  Bill,
  AppointmentCharge,
  MedicineCharge,
  TestCharge,
  AdmissionCharge,
  Patient,
  Appointment,
} from "../models/index.js";
import { TriggerEngine } from "../services/triggerEngine.js";

export const getBills = async (req, res) => {
  try {
    const { status, patient } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (patient) filter.patient_id = patient;
    if (req.user?.role === "patient") {
      let patientId = req.user.patient_id;
      if (!patientId) patientId = (await Patient.findOne({ user_id: req.user.id }))?._id;
      if (!patientId) return res.json([]);
      filter.patient_id = patientId;
    }

    const list = await Bill.find(filter)
      .populate("patient_id")
      .populate("patient")
      .sort({ bill_date: -1 });

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate("patient_id")
      .populate("patient");

    if (!bill) return res.status(404).json({ message: "Bill not found" });
    if (req.user?.role === "patient") {
      let patientId = req.user.patient_id;
      if (!patientId) patientId = (await Patient.findOne({ user_id: req.user.id }))?._id;
      if (String(bill.patient_id?._id || bill.patient_id) !== String(patientId)) return res.status(403).json({ message: "You can only view your own bills" });
    }

    // Always fetch freshest itemized charges
    const [apptCharges, medCharges, testCharges, admCharges] = await Promise.all([
      AppointmentCharge.find({ bill_id: bill._id }).populate("appointment_id"),
      MedicineCharge.find({ bill_id: bill._id }).populate("med_id"),
      TestCharge.find({ bill_id: bill._id }).populate("test_id"),
      AdmissionCharge.find({ bill_id: bill._id }).populate("adm_id"),
    ]);

    res.json({
      bill,
      breakdown: {
        appointmentCharges: apptCharges,
        medicineCharges: medCharges,
        testCharges: testCharges,
        admissionCharges: admCharges,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DFD 9.0 & 12: Payment Processing
export const processPayment = async (req, res) => {
  try {
    const { payment_method } = req.body;
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    if (req.user?.role === "patient") {
      let patientId = req.user.patient_id;
      if (!patientId) patientId = (await Patient.findOne({ user_id: req.user.id }))?._id;
      if (String(bill.patient_id) !== String(patientId)) return res.status(403).json({ message: "You can only pay your own bills" });
    }

    const cashCharge = await AppointmentCharge.findOne({ bill_id: bill._id });
    if (cashCharge) {
      const cashAppointment = await Appointment.findById(cashCharge.appointment_id);
      if (cashAppointment?.payment_method === "Cash" && cashAppointment.payment_status !== "paid") {
        return res.status(400).json({ message: "Cash appointments must be settled by staff using the cash receipt workflow" });
      }
    }

    if (bill.status === "paid") {
      return res.status(400).json({ message: "This bill has already been fully paid." });
    }

    bill.status = "paid";
    bill.amount_paid = Number(bill.total_amount || bill.total || 0);
    bill.payment_method = payment_method || "UPI / Card";
    bill.paymentMethod = bill.payment_method;
    bill.paid_at = new Date();
    bill.paidAt = bill.paid_at;
    await bill.save();

    res.json({
      message: "Demo payment recorded. This build is not connected to a payment gateway.",
      bill,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DFD 12: Generate Final Bill Receipt
export const getBillReceipt = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate("patient_id")
      .populate("patient");

    if (!bill) return res.status(404).json({ message: "Bill not found" });
    if (req.user?.role === "patient") {
      let patientId = req.user.patient_id;
      if (!patientId) patientId = (await Patient.findOne({ user_id: req.user.id }))?._id;
      if (String(bill.patient_id?._id || bill.patient_id) !== String(patientId)) return res.status(403).json({ message: "You can only view your own receipt" });
    }

    const [apptCharges, medCharges, testCharges, admCharges] = await Promise.all([
      AppointmentCharge.find({ bill_id: bill._id }),
      MedicineCharge.find({ bill_id: bill._id }),
      TestCharge.find({ bill_id: bill._id }),
      AdmissionCharge.find({ bill_id: bill._id }),
    ]);

    const patient = bill.patient_id || bill.patient;

    res.json({
      institution: "Maulana Azad National Institute of Technology (MANIT) Bhopal",
      department: "Consolidated Healthcare Billing & Accounts",
      receiptNo: `RCT-${bill.bill_id}`,
      billId: bill.bill_id,
      billDate: bill.bill_date,
      paymentStatus: bill.status,
      paymentMethod: bill.payment_method || "Pending",
      paidAt: bill.paid_at,
      patientDetails: {
        name: patient?.name || "Patient",
        id: patient?.patient_id || "PAT-N/A",
        phone: patient?.phone || "N/A",
        address: patient?.address || "N/A",
      },
      itemizedCharges: {
        consultations: apptCharges.map((c) => ({
          desc: `Consultation Fee (${c.charge_id})`,
          amount: c.consultation_fee,
        })),
        pharmacy: medCharges.map((c) => ({
          desc: `${c.medicine_name || "Prescribed Medicine"} (Qty: ${c.quantity})`,
          amount: c.amount,
        })),
        laboratory: testCharges.map((c) => ({
          desc: `Diagnostic Test: ${c.test_name || "Diagnostic Panel"}`,
          amount: c.amount,
        })),
        inpatientStay: admCharges.map((c) => ({
          desc: `Room Stay: ${c.room_number || "Ward"} (${c.days_stayed} days @ ₹${c.daily_rate}/day)`,
          amount: c.amount,
        })),
      },
      totals: {
        consultationTotal: bill.consultation_charges || 0,
        pharmacyTotal: bill.pharmacy_charges || 0,
        labTotal: bill.lab_charges || 0,
        roomTotal: bill.room_charges || 0,
        grandTotal: bill.total_amount || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
