import mongoose from "mongoose";
import { LabTest, TestType, MedicalStaff, Patient, Doctor, Appointment } from "../models/index.js";
import { TriggerEngine } from "../services/triggerEngine.js";

export const getTestTypes = async (req, res) => {
  try {
    const list = await TestType.find().sort({ test_name: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createTestType = async (req, res) => {
  try {
    const count = await TestType.countDocuments();
    const test_type_id = req.body.test_type_id || `TT-${String(count + 1001).padStart(4, "0")}`;
    const newType = await TestType.create({
      ...req.body,
      test_type_id,
    });
    res.status(201).json(newType);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getLabTests = async (req, res) => {
  try {
    const { patient, status } = req.query;
    let filter = {};
    if (patient) filter.patient_id = patient;
    if (status) filter.status = status;
    if (req.user?.role === "patient") {
      if (!req.user.patient_id) return res.json([]);
      filter.$or = [{ patient_id: req.user.patient_id }, { patient: req.user.patient_id }];
    } else if (req.user?.role === "doctor") {
      if (!req.user.emp_id) return res.json([]);
      filter.$or = [{ doctor_emp_id: req.user.emp_id }, { doctor: req.user.emp_id }];
    }

    const list = await LabTest.find(filter)
      .populate("patient_id")
      .populate("doctor_emp_id")
      .populate("doctor")
      .populate("test_type_id")
      .populate("appointment_id")
      .populate("medicalstaff_emp_id")
      .sort({ test_date: -1 });

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const orderLabTest = async (req, res) => {
  try {
    const {
      patient_id,
      patient,
      test_type_id,
      testName,
      doctor_emp_id,
      doctor,
      appointment_id,
      notes,
    } = req.body;

    if (req.user?.role !== "doctor") {
      return res.status(403).json({ message: "Only the treating doctor can order a lab test" });
    }
    const actualDoctorId = req.user.emp_id;
    const appointment = appointment_id ? await Appointment.findById(appointment_id) : null;
    if (!actualDoctorId || !appointment || String(appointment.doctor_emp_id) !== String(actualDoctorId)) {
      return res.status(400).json({ message: "Select one of your own patient appointments first" });
    }
    if (appointment.payment_status !== "paid" || !["scheduled", "completed"].includes(appointment.status)) {
      return res.status(400).json({ message: "A paid, confirmed appointment is required before ordering a lab test" });
    }
    const actualPatientId = String(patient_id || patient || appointment.patient_id) === String(appointment.patient_id)
      ? appointment.patient_id
      : null;
    if (!actualPatientId) return res.status(403).json({ message: "Test patient must match the selected appointment" });

    let testTypeName = testName;
    let price = 300;
    let normalRange = "Normal";

    if (test_type_id) {
      const typeDoc = await TestType.findById(test_type_id);
      if (typeDoc) {
        testTypeName = typeDoc.test_name;
        price = typeDoc.price;
        normalRange = typeDoc.normal_range;
      }
    }

    const count = await LabTest.countDocuments();
    const test_id = req.body.test_id || `LAB-${String(count + 1001).padStart(4, "0")}`;

    const newTest = await LabTest.create({
      test_id,
      test_type_id,
      testName: testTypeName || "Diagnostic Panel",
      patient_id: actualPatientId,
      patient: actualPatientId,
      doctor_emp_id: actualDoctorId,
      doctor: actualDoctorId,
      appointment_id: appointment._id,
      test_date: new Date(),
      status: "ordered",
      charge_amount: price,
      normal_range: normalRange,
      notes,
    });

    // RUN TRIGGER 15: Automatically add test charge to active patient Bill
    await TriggerEngine.addTestCharge(newTest);

    const populated = await LabTest.findById(newTest._id)
      .populate("patient_id")
      .populate("doctor_emp_id")
      .populate("doctor")
      .populate("test_type_id");

    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const submitLabResult = async (req, res) => {
  try {
    if (req.user?.role !== "lab") {
      return res.status(403).json({ message: "Only laboratory technicians can submit test results" });
    }
    const { result, notes } = req.body;

    // RUN TRIGGER 14: Check that staff is a qualified Lab Technician
    const test = await LabTest.findById(req.params.id);
    if (!test) return res.status(404).json({ message: "Lab test not found" });

    if (test.status === "cancelled") return res.status(400).json({ message: "Cancelled tests cannot receive a result" });
    if (!result?.trim()) return res.status(400).json({ message: "Enter a laboratory result" });
    test.result = result;
    test.status = "completed";
    test.completedAt = new Date();
    test.technician_name = req.user.name;
    if (notes) test.notes = notes;

    await test.save();

    res.json({
      message: "Lab test results successfully updated and submitted to consulting doctor.",
      test,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getLabReport = async (req, res) => {
  try {
    const test = await LabTest.findById(req.params.id)
      .populate("patient_id")
      .populate("patient")
      .populate("doctor_emp_id")
      .populate("doctor")
      .populate("medicalstaff_emp_id")
      .populate("test_type_id");

    if (!test) return res.status(404).json({ message: "Lab test not found" });

    if (req.user?.role === "patient" && String(test.patient_id?._id || test.patient_id || test.patient?._id || test.patient) !== String(req.user.patient_id)) {
      return res.status(403).json({ message: "You can only view your own laboratory report" });
    }
    if (req.user?.role === "doctor" && String(test.doctor_emp_id?._id || test.doctor_emp_id || test.doctor?._id || test.doctor) !== String(req.user.emp_id)) {
      return res.status(403).json({ message: "You can only view reports for your patients" });
    }

    res.json({
      institution: "Maulana Azad National Institute of Technology (MANIT) Bhopal",
      department: "Diagnostic Laboratory Services",
      reportNo: `REP-${test.test_id}`,
      testDate: test.test_date,
      completedDate: test.completedAt,
      patientName: test.patient_id?.name || test.patient?.name,
      patientId: test.patient_id?.patient_id || test.patient?.patient_id,
      patientAge: (test.patient_id || test.patient)?.dob
        ? Math.floor((new Date() - new Date((test.patient_id || test.patient).dob)) / 31557600000)
        : "N/A",
      gender: test.patient_id?.gender || test.patient?.gender,
      referringDoctor: test.doctor_emp_id?.name || test.doctor?.name,
      testName: test.testName,
      result: test.result || "Pending Analysis",
      normalRange: test.normal_range || "N/A",
      status: test.status,
      technician: test.technician_name || test.medicalstaff_emp_id?.name || "Lab Staff",
      notes: test.notes,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
