import mongoose from "mongoose";
import {
  Admission,
  Room,
  Patient,
  Doctor,
  MedicalStaff,
  NurseAssignment,
} from "../models/index.js";
import { TriggerEngine } from "../services/triggerEngine.js";

export const getRooms = async (req, res) => {
  try {
    const list = await Room.find().populate("patient").sort({ room_number: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createRoom = async (req, res) => {
  try {
    const count = await Room.countDocuments();
    const room_id = req.body.room_id || `RM-${String(count + 101).padStart(3, "0")}`;
    const newRoom = await Room.create({
      ...req.body,
      room_id,
      bedNumber: req.body.room_number || req.body.bedNumber,
      ward: req.body.room_type || req.body.ward,
    });
    res.status(201).json(newRoom);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAdmissions = async (req, res) => {
  try {
    const { status, patient } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (patient) filter.patient_id = patient;

    const list = await Admission.find(filter)
      .populate("patient_id")
      .populate("room_id")
      .populate("doctor_emp_id")
      .populate("assigned_nurse")
      .sort({ admission_date: -1 });

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DFD 8.0 & 11: Patient Admission Flow
export const admitPatient = async (req, res) => {
  try {
    const {
      patient_id,
      patient,
      room_id,
      doctor_emp_id,
      doctor,
      admission_date,
      diagnosis,
      notes,
    } = req.body;

    const actualPatientId = patient_id || patient;
    const actualDoctorId = doctor_emp_id || doctor;

    // RUN TRIGGER 16: Ensure patient doesn't already have an active admission
    await TriggerEngine.checkSingleAdmission(actualPatientId);

    // RUN TRIGGER 17: Ensure room is available
    const room = await TriggerEngine.checkRoomAvailable(room_id);

    const count = await Admission.countDocuments();
    const admission_id = req.body.admission_id || `ADM-${String(count + 1001).padStart(4, "0")}`;

    const newAdmission = await Admission.create({
      admission_id,
      room_id,
      patient_id: actualPatientId,
      patient: actualPatientId,
      doctor_emp_id: actualDoctorId,
      doctor: actualDoctorId,
      admission_date: admission_date || new Date(),
      status: "admitted",
      diagnosis: diagnosis || "Inpatient Care Observation",
      notes,
    });

    // RUN TRIGGER 18: Mark room occupied and patient as IPD
    await TriggerEngine.markRoomOccupied(room_id, actualPatientId);

    // RUN TRIGGER 21: Smart workload-balanced nurse assignment
    const assignedNurse = await TriggerEngine.autoAssignNurse(newAdmission);

    // RUN TRIGGER 22: Ensure a pending master bill exists for patient
    await TriggerEngine.createBillAfterAdmission(newAdmission);

    // Update patient record with active admission
    await Patient.findByIdAndUpdate(actualPatientId, {
      active_admission_id: newAdmission._id,
      status: "IPD",
    });

    const populated = await Admission.findById(newAdmission._id)
      .populate("patient_id")
      .populate("room_id")
      .populate("doctor_emp_id")
      .populate("assigned_nurse");

    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DFD 8.0 & 11: Patient Discharge Flow
export const dischargePatient = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) return res.status(404).json({ message: "Admission record not found" });

    if (admission.status === "discharged") {
      return res.status(400).json({ message: "Patient is already discharged" });
    }

    const dischargeDate = req.body.discharge_date || new Date();

    // RUN TRIGGER 19: Discharge date must be after admission date
    TriggerEngine.validateDischargeDate(admission.admission_date, dischargeDate);

    admission.discharge_date = dischargeDate;
    admission.status = "discharged";
    admission.notes = req.body.notes || admission.notes;
    await admission.save();

    // RUN TRIGGER 20: Free the room (status -> available)
    await TriggerEngine.freeRoomOnDischarge(admission.room_id, admission.patient_id);

    // RUN TRIGGER 23: Calculate stay charges based on days stayed & room rate, add to bill
    await TriggerEngine.addAdmissionCharge(admission);

    // Clear active admission from patient
    await Patient.findByIdAndUpdate(admission.patient_id, {
      active_admission_id: null,
      status: "Discharged",
    });

    res.json({
      message: "Patient discharged successfully. Room freed and stay charges billed.",
      admission,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getDischargeSummary = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id)
      .populate("patient_id")
      .populate("room_id")
      .populate("doctor_emp_id")
      .populate("assigned_nurse");

    if (!admission) return res.status(404).json({ message: "Admission not found" });

    res.json({
      institution: "Maulana Azad National Institute of Technology (MANIT) Bhopal",
      title: "INPATIENT DISCHARGE SUMMARY & CASE CLOSURE",
      admissionNo: admission.admission_id,
      admissionDate: admission.admission_date,
      dischargeDate: admission.discharge_date,
      patientName: admission.patient_id?.name,
      patientId: admission.patient_id?.patient_id,
      roomAllocated: admission.room_id?.room_number,
      roomType: admission.room_id?.room_type,
      attendingDoctor: admission.doctor_emp_id?.name,
      assignedNurse: admission.assigned_nurse?.name || admission.nurse_name || "Assigned Floor Nurse",
      diagnosis: admission.diagnosis,
      dischargeAdvice: admission.notes || "Continue prescribed home medications. Follow up in OPD after 7 days.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
