import mongoose from "mongoose";
const opts = { timestamps: true };
export const User = mongoose.model(
  "User",
  new mongoose.Schema(
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
        ],
        default: "receptionist",
      },
      phone: String,
      active: { type: Boolean, default: true },
    },
    opts,
  ),
);
export const Patient = mongoose.model(
  "Patient",
  new mongoose.Schema(
    {
      patientId: { type: String, unique: true, sparse: true },
      name: { type: String, required: true },
      dob: Date,
      gender: String,
      bloodGroup: String,
      phone: String,
      email: String,
      address: String,
      emergencyContact: String,
      history: String,
      allergies: String,
    },
    opts,
  ),
);
export const Doctor = mongoose.model(
  "Doctor",
  new mongoose.Schema(
    {
      name: { type: String, required: true },
      specialization: String,
      department: String,
      phone: String,
      email: String,
      availableDays: [String],
      consultationFee: { type: Number, default: 0 },
    },
    opts,
  ),
);
export const Appointment = mongoose.model(
  "Appointment",
  new mongoose.Schema(
    {
      patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
      },
      doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
      },
      date: { type: Date, required: true },
      status: {
        type: String,
        enum: ["scheduled", "completed", "cancelled", "no-show"],
        default: "scheduled",
      },
      reason: String,
      notes: String,
    },
    opts,
  ),
);
export const Prescription = mongoose.model(
  "Prescription",
  new mongoose.Schema(
    {
      patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
      },
      doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
      medicines: [
        {
          name: String,
          dosage: String,
          frequency: String,
          duration: String,
          quantity: Number,
        },
      ],
      instructions: String,
    },
    opts,
  ),
);
export const Medicine = mongoose.model(
  "Medicine",
  new mongoose.Schema(
    {
      name: { type: String, required: true },
      batchNo: String,
      category: String,
      quantity: { type: Number, default: 0 },
      reorderLevel: { type: Number, default: 10 },
      unitPrice: { type: Number, default: 0 },
      expiryDate: Date,
    },
    opts,
  ),
);
export const LabTest = mongoose.model(
  "LabTest",
  new mongoose.Schema(
    {
      patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
      },
      testName: { type: String, required: true },
      status: {
        type: String,
        enum: ["ordered", "processing", "completed"],
        default: "ordered",
      },
      result: String,
      orderedAt: { type: Date, default: Date.now },
      completedAt: Date,
    },
    opts,
  ),
);
export const Bed = mongoose.model(
  "Bed",
  new mongoose.Schema(
    {
      ward: String,
      bedNumber: { type: String, unique: true },
      type: String,
      status: {
        type: String,
        enum: ["available", "occupied", "maintenance"],
        default: "available",
      },
      patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
    },
    opts,
  ),
);
export const Bill = mongoose.model(
  "Bill",
  new mongoose.Schema(
    {
      patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
      },
      items: [{ description: String, category: String, amount: Number }],
      total: { type: Number, default: 0 },
      status: {
        type: String,
        enum: ["pending", "paid", "partial"],
        default: "pending",
      },
      paymentMethod: String,
      paidAt: Date,
    },
    opts,
  ),
);
