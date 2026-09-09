import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User, Doctor, Medicine, Bed } from "./models/index.js";
dotenv.config();
await mongoose.connect(
  process.env.MONGO_URI || "mongodb+srv://sumitsahai068_db_user:pztV5XGLbtTioYMX@cluster0.reajzuq.mongodb.net/hospital_information_system",
);
console.log("Connected to MongoDB database:", mongoose.connection.name);
await User.updateOne(
  { email: "admin@his.local" },
  {
    $set: {
      name: "System Administrator",
      password: await bcrypt.hash("Admin@123", 10),
      role: "admin",
    },
  },
  { upsert: true },
);
if ((await Doctor.countDocuments()) === 0)
  await Doctor.insertMany([
    {
      name: "Dr. Ananya Sharma",
      specialization: "Cardiology",
      department: "Cardiology",
      consultationFee: 800,
    },
    {
      name: "Dr. Rahul Verma",
      specialization: "General Medicine",
      department: "Medicine",
      consultationFee: 500,
    },
  ]);
if ((await Medicine.countDocuments()) === 0)
  await Medicine.insertMany([
    {
      name: "Paracetamol 500mg",
      category: "Analgesic",
      quantity: 120,
      reorderLevel: 30,
      unitPrice: 2,
    },
    {
      name: "Amoxicillin 500mg",
      category: "Antibiotic",
      quantity: 12,
      reorderLevel: 20,
      unitPrice: 8,
    },
  ]);
if ((await Bed.countDocuments()) === 0)
  await Bed.insertMany([
    { ward: "General", bedNumber: "G-101", type: "General" },
    { ward: "General", bedNumber: "G-102", type: "General" },
    { ward: "ICU", bedNumber: "I-01", type: "ICU", status: "occupied" },
  ]);
console.log("Seed complete");
await mongoose.disconnect();
