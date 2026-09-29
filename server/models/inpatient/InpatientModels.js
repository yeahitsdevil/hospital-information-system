import mongoose from "mongoose";

const opts = { timestamps: true };

// 5. Room (Page 16)
// Physical rooms/beds available for patient admission.
export const RoomSchema = new mongoose.Schema(
  {
    room_id: { type: String, unique: true, required: true },
    hospital_id: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
    room_number: { type: String, required: true },
    room_type: {
      type: String,
      required: true,
      enum: ["General Ward", "ICU", "Semi-Private", "Deluxe", "Emergency"],
      default: "General Ward",
    },
    daily_rate: { type: Number, default: 500, min: 0 }, // For length of stay billing
    status: {
      type: String,
      enum: ["available", "occupied", "maintenance"],
      default: "available",
    },
    // Compatibility fields with legacy "Bed"
    ward: { type: String },
    bedNumber: { type: String },
    type: { type: String },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
  },
  opts
);

export const Room = mongoose.models.Room || mongoose.model("Room", RoomSchema);
export const Bed = Room; // Alias for backward-compatibility

// 13. Admission (Page 21)
// Records of patient stays in hospital rooms for treatment.
export const AdmissionSchema = new mongoose.Schema(
  {
    admission_id: { type: String, unique: true, required: true },
    room_id: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" }, // alias
    doctor_emp_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" }, // alias
    admission_date: { type: Date, default: Date.now },
    discharge_date: { type: Date },
    status: {
      type: String,
      enum: ["admitted", "discharged"],
      default: "admitted",
    },
    diagnosis: { type: String },
    notes: { type: String },
    stay_charges_calculated: { type: Boolean, default: false },
    assigned_nurse: { type: mongoose.Schema.Types.ObjectId, ref: "MedicalStaff" },
    nurse_name: { type: String },
  },
  opts
);

export const Admission =
  mongoose.models.Admission || mongoose.model("Admission", AdmissionSchema);

// 14. Nurse_assignment (Page 21)
// Link between nurses and specific inpatient stays with automated workload balancing (Page 2).
export const NurseAssignmentSchema = new mongoose.Schema(
  {
    admission_id: { type: mongoose.Schema.Types.ObjectId, ref: "Admission", required: true },
    nurse_emp_id: { type: mongoose.Schema.Types.ObjectId, ref: "MedicalStaff", required: true },
    assigned_date: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
  },
  opts
);

export const NurseAssignment =
  mongoose.models.NurseAssignment || mongoose.model("NurseAssignment", NurseAssignmentSchema);
