import mongoose from "mongoose";

const opts = { timestamps: true };

// 10. Patient (Page 19)
// Master record for all patients.
export const PatientSchema = new mongoose.Schema(
  {
    patient_id: { type: String, unique: true, required: true },
    patientId: { type: String }, // alias for backward-compatibility
    name: { type: String, required: true },
    dob: { type: Date },
    gender: { type: String, enum: ["M", "F", "O", "Male", "Female", "Other"], required: true },
    phone: { type: String },
    email: { type: String, lowercase: true },
    address: { type: String },
    blood_group: { type: String },
    bloodGroup: { type: String }, // alias
    allergies: { type: String },
    emergency_contact: { type: String },
    emergencyContact: { type: String }, // alias
    status: { type: String, enum: ["OPD", "IPD", "Discharged"], default: "OPD" }, // OPD vs IPD (Slide 7)
    active_admission_id: { type: mongoose.Schema.Types.ObjectId, ref: "Admission" },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  opts
);

export const Patient = mongoose.models.Patient || mongoose.model("Patient", PatientSchema);

// 11. Medical_history (Page 20)
// Longitudinal record of a patient's conditions and past diagnoses.
export const MedicalHistorySchema = new mongoose.Schema(
  {
    history_id: { type: String, unique: true, required: true },
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    condition_md: { type: String, required: true }, // Medical condition summary
    diagnosis_date: { type: Date, default: Date.now },
    doctor_emp_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    notes: { type: String },
  },
  opts
);

export const MedicalHistory =
  mongoose.models.MedicalHistory || mongoose.model("MedicalHistory", MedicalHistorySchema);
