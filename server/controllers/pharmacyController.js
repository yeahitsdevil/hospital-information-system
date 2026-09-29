import mongoose from "mongoose";
import {
  Medicine,
  Prescription,
  PrescriptionMedicine,
  Pharmacy,
  PharmacyMedicineStock,
  Patient,
  Doctor,
  Appointment,
} from "../models/index.js";
import { TriggerEngine } from "../services/triggerEngine.js";

export const getMedicines = async (req, res) => {
  try {
    const list = await Medicine.find().sort({ name: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createMedicine = async (req, res) => {
  try {
    const count = await Medicine.countDocuments();
    const med_id = req.body.med_id || `MED-${String(count + 1001).padStart(4, "0")}`;
    const newMed = await Medicine.create({
      ...req.body,
      med_id,
      unitPrice: req.body.unit_price || req.body.unitPrice,
      expiryDate: req.body.expiry_date || req.body.expiryDate,
      batchNo: req.body.batch_no || req.body.batchNo,
    });
    res.status(201).json(newMed);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getPrescriptions = async (req, res) => {
  try {
    const { patient, doctor } = req.query;
    let filter = {};
    if (patient) filter.patient_id = patient;
    if (doctor) filter.$or = [{ doctor_emp_id: doctor }, { doctor }];
    if (req.user?.role === "doctor") {
      if (!req.user.emp_id) return res.json([]);
      filter.$or = [{ doctor_emp_id: req.user.emp_id }, { doctor: req.user.emp_id }];
    }
    if (req.user?.role === "patient") {
      if (!req.user.patient_id) return res.json([]);
      filter.$or = [{ patient_id: req.user.patient_id }, { patient: req.user.patient_id }];
    }

    const list = await Prescription.find(filter)
      .populate("patient_id")
      .populate("patient")
      .populate("doctor_emp_id")
      .populate("doctor")
      .populate("appointment_id")
      .populate("pharmacy_id")
      .sort({ prescription_date: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createPrescription = async (req, res) => {
  try {
    const {
      patient_id,
      patient,
      doctor_emp_id,
      doctor,
      pharmacy_id,
      instructions,
      medicines = [],
      appointment_id,
    } = req.body;

    if (req.user?.role !== "doctor") {
      return res.status(403).json({ message: "Only the treating doctor can write prescriptions" });
    }
    const actualDoctorId = req.user.emp_id;
    if (!actualDoctorId || (doctor_emp_id || doctor) && String(doctor_emp_id || doctor) !== String(actualDoctorId)) {
      return res.status(403).json({ message: "Prescription must be issued by your own doctor account" });
    }
    const appointment = appointment_id ? await Appointment.findById(appointment_id) : null;
    if (!appointment || String(appointment.doctor_emp_id) !== String(actualDoctorId)) {
      return res.status(400).json({ message: "Select one of your own patient appointments first" });
    }
    if (appointment.payment_status !== "paid" || !["scheduled", "completed"].includes(appointment.status)) {
      return res.status(400).json({ message: "A paid, confirmed appointment is required before prescribing" });
    }
    const actualPatientId = String(patient_id || patient || appointment.patient_id) === String(appointment.patient_id)
      ? appointment.patient_id
      : null;
    if (!actualPatientId) return res.status(403).json({ message: "Prescription patient must match the selected appointment" });

    // RUN TRIGGER 11: Check for expired medicines before prescribing
    for (const item of medicines) {
      if (item.med_id) {
        await TriggerEngine.checkExpiredMedicine(item.med_id);
      }
    }

    const count = await Prescription.countDocuments();
    const pres_id = req.body.pres_id || `RX-${String(count + 1001).padStart(4, "0")}`;

    const newPrescription = await Prescription.create({
      pres_id,
      patient_id: actualPatientId,
      patient: actualPatientId,
      doctor_emp_id: actualDoctorId,
      doctor: actualDoctorId,
      appointment_id: appointment._id,
      pharmacy_id,
      instructions,
      medicines,
      status: "prescribed",
    });

    // Populate normalized Prescription_medicine entries
    for (const item of medicines) {
      if (item.med_id) {
        await PrescriptionMedicine.create({
          pres_id: newPrescription._id,
          med_id: item.med_id,
          quantity: item.quantity || 1,
          dosage: item.dosage || "1x daily",
        });
      }
    }

    const populated = await Prescription.findById(newPrescription._id)
      .populate("patient_id")
      .populate("doctor_emp_id");

    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DFD 7.0: Pharmacy Dispense Medication -> Runs Triggers 11, 12, 13
export const dispensePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ message: "Prescription not found" });

    if (prescription.status === "dispensed") {
      return res.status(400).json({ message: "Prescription is already dispensed" });
    }

    const { pharmacy_id } = req.body;
    const items = prescription.medicines || [];

    // Verify stock and expiry (Triggers 11 & 12)
    for (const item of items) {
      if (item.med_id) {
        await TriggerEngine.checkExpiredMedicine(item.med_id);
        await TriggerEngine.checkMedicineStock(pharmacy_id, item.med_id, item.quantity || 1);
      }
    }

    // Reduce stock and create billing charges (Trigger 13)
    await TriggerEngine.reduceStockAndCharge(prescription, pharmacy_id, items);

    prescription.status = "dispensed";
    prescription.pharmacy_id = pharmacy_id || prescription.pharmacy_id;
    await prescription.save();

    res.json({
      message: "Prescription dispensed successfully. Pharmacy stock updated and charges billed.",
      prescription,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getPharmacies = async (req, res) => {
  try {
    const list = await Pharmacy.find();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
