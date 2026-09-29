import mongoose from "mongoose";

const opts = { timestamps: true };

// 1. Hospital (Page 15)
// Primary entity representing the medical facility's physical and contact identity.
export const HospitalSchema = new mongoose.Schema(
  {
    hospital_id: { type: String, unique: true, required: true },
    h_name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
  },
  opts
);

export const Hospital = mongoose.models.Hospital || mongoose.model("Hospital", HospitalSchema);

// 2. Department (Page 15)
// Specific medical or administrative divisions within the hospital.
export const DepartmentSchema = new mongoose.Schema(
  {
    department_id: { type: String, unique: true, required: true },
    hospital_id: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
    dept_name: {
      type: String,
      required: true,
      enum: [
        "Cardiology",
        "Emergency",
        "Pharmacy",
        "Laboratory",
        "Radiology",
        "Neurology",
        "Orthopedics",
        "Administration",
        "General Medicine",
        "Pediatrics",
        "General Surgery",
      ],
    },
    description: String,
  },
  opts
);

export const Department = mongoose.models.Department || mongoose.model("Department", DepartmentSchema);

// 3. Role (Page 15)
// Master list of official job titles within the hospital.
export const RoleSchema = new mongoose.Schema(
  {
    role_id: { type: String, unique: true, required: true },
    role_name: { type: String, unique: true, required: true },
    description: String,
  },
  opts
);

export const Role = mongoose.models.Role || mongoose.model("Role", RoleSchema);

// 4. Role_department (Page 16)
// Mapping table that defines which roles are permitted in specific departments.
export const RoleDepartmentSchema = new mongoose.Schema(
  {
    role_id: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
    department_id: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  },
  opts
);

export const RoleDepartment =
  mongoose.models.RoleDepartment || mongoose.model("RoleDepartment", RoleDepartmentSchema);
