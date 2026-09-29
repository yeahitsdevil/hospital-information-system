import mongoose from "mongoose";

const opts = { timestamps: true };

export const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: [
        "admin",
        "doctor",
        "nurse",
        "receptionist",
        "pharmacist",
        "lab",
        "accountant",
        "patient",
      ],
      default: "patient",
    },
    emp_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
    phone: String,
    is_available: { type: Boolean, default: true },
    status_note: { type: String, default: "Available" },
    active: { type: Boolean, default: true },
  },
  opts
);

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
