// Core Entities (Pages 15-16)
export { Hospital, Department, Role, RoleDepartment } from "./core/CoreModels.js";

// Staff Hierarchy Models (Pages 17-19)
export { Employee, Doctor, MedicalStaff, AdminStaff } from "./staff/StaffModels.js";

// Patient & History Models (Pages 19-20)
export { Patient, MedicalHistory } from "./patient/PatientModels.js";

// Clinical & Prescription Models (Pages 20, 25)
export { Appointment, Prescription, PrescriptionMedicine } from "./clinical/ClinicalModels.js";

// Laboratory Models (Page 22)
export { TestType, LabTest } from "./lab/LabModels.js";

// Pharmacy & Inventory Models (Pages 23-24)
export { Medicine, Pharmacy, PharmacyStaff, PharmacyMedicineStock } from "./pharmacy/PharmacyModels.js";

// Inpatient & Room Models (Pages 16, 21)
export { Room, Bed, Admission, NurseAssignment } from "./inpatient/InpatientModels.js";

// Billing & Charge Models (Pages 26-28)
export {
  Bill,
  AppointmentCharge,
  MedicineCharge,
  TestCharge,
  AdmissionCharge,
} from "./billing/BillingModels.js";

// User Auth Model
export { User } from "./auth/UserModel.js";
