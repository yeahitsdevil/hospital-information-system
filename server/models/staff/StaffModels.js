import mongoose from "mongoose";

const opts = { timestamps: true };

// 6. Employee (Superclass - Page 17)
// Base profile for every staff member hired by the hospital.
export const EmployeeSchema = new mongoose.Schema(
  {
    emp_id: { type: String, unique: true, required: true },
    department_id: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    department_name: { type: String }, // cached for easy display
    role_id: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
    role_name: { type: String }, // e.g. Doctor, Nurse, Lab Technician, Pharmacist, Admin
    name: { type: String, required: true },
    dob: { type: Date },
    gender: { type: String, enum: ["M", "F", "O", "Male", "Female", "Other"], required: true },
    hire_date: {
      type: Date,
      default: Date.now,
      validate: {
        validator: function (v) {
          return !v || v <= new Date(Date.now() + 86400000); // cannot be in future (Trigger 3)
        },
        message: "Hire date cannot be in the future (trg_check_hire_date)",
      },
    },
    salary: {
      type: Number,
      min: [0, "Salary cannot be negative"],
      default: 0,
    },
    employment_status: {
      type: String,
      enum: ["active", "resigned", "terminated"],
      default: "active",
    },
    email: { type: String, lowercase: true },
    phone: { type: String },
  },
  opts
);

export const Employee = mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema);

// 7. Doctor (Subclass of Employee - Page 18)
// Specialty attributes for doctors.
export const DoctorSchema = new mongoose.Schema(
  {
    emp_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: false },
    employee_code: { type: String }, // cached emp_id string
    name: { type: String, required: true }, // cached for seamless lookup
    specialization: { type: String, required: true },
    license_no: { type: String, unique: true, sparse: true },
    department: { type: String },
    phone: { type: String },
    email: { type: String },
    availableDays: { type: [String], default: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
    consultation_fee: { type: Number, default: 500, min: 0 },
    consultationFee: { type: Number, default: 500 }, // alias for backward-compatibility
    is_available: { type: Boolean, default: true },
    status_note: { type: String, default: "Available" },
  },
  opts
);

// Keep legacy consultationFee records readable when the snake_case field is absent.
DoctorSchema.pre("init", function (doc) {
  if (doc.consultation_fee == null && doc.consultationFee != null) {
    doc.consultation_fee = doc.consultationFee;
  }
});

export const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);

// 8. Medical_staff (Subclass of Employee - Page 18)
// Clinical support staff such as Nurses, Lab Technicians, and Pharmacists.
export const MedicalStaffSchema = new mongoose.Schema(
  {
    emp_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    name: { type: String, required: true },
    staff_type: {
      type: String,
      required: true,
      enum: ["Nurse", "Lab Technician", "Pharmacist"],
    },
    department: { type: String },
    active_assignments: { type: Number, default: 0 }, // For nurse workload balancing (Slide 2)
  },
  opts
);

export const MedicalStaff =
  mongoose.models.MedicalStaff || mongoose.model("MedicalStaff", MedicalStaffSchema);

// 9. Admin (Subclass of Employee - Page 19)
// Specific roles for non-clinical management staff.
export const AdminStaffSchema = new mongoose.Schema(
  {
    emp_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    name: { type: String, required: true },
    admin_role: {
      type: String,
      required: true,
      enum: ["HR", "IT", "Billing", "Receptionist", "Executive"],
    },
    email: { type: String },
  },
  opts
);

export const AdminStaff =
  mongoose.models.AdminStaff || mongoose.model("AdminStaff", AdminStaffSchema);
