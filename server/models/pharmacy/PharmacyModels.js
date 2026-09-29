import mongoose from "mongoose";

const opts = { timestamps: true };

// 17. Medicine (Page 23)
// Inventory list of drugs, including costs and safety dates.
export const MedicineSchema = new mongoose.Schema(
  {
    med_id: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    manufacturer: { type: String, default: "Generic Pharma" },
    unit_price: { type: Number, required: true, min: [0.01, "Unit price must be positive"] },
    unitPrice: { type: Number }, // alias
    expiry_date: { type: Date, required: true },
    expiryDate: { type: Date }, // alias
    batch_no: { type: String, default: "BATCH-01" },
    batchNo: { type: String }, // alias
    category: { type: String, default: "General" },
    quantity: { type: Number, default: 0, min: 0 }, // global or default stock
    reorder_level: { type: Number, default: 15 },
    reorderLevel: { type: Number, default: 15 }, // alias
  },
  opts
);

export const Medicine = mongoose.models.Medicine || mongoose.model("Medicine", MedicineSchema);

// 18. Pharmacy (Page 23)
// Physical medicine dispensary locations within the hospital.
export const PharmacySchema = new mongoose.Schema(
  {
    pharmacy_id: { type: String, unique: true, required: true },
    hospital_id: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
    name: { type: String, required: true },
    location: { type: String, default: "Ground Floor, Main Block" },
    phone: { type: String },
  },
  opts
);

export const Pharmacy = mongoose.models.Pharmacy || mongoose.model("Pharmacy", PharmacySchema);

// 19. Pharmacy_staff (Page 24)
// Staff assigned to specific pharmacies (must be Pharmacist).
export const PharmacyStaffSchema = new mongoose.Schema(
  {
    pharmacy_id: { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy", required: true },
    emp_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    assigned_role: { type: String, default: "Pharmacist" },
  },
  opts
);

export const PharmacyStaff =
  mongoose.models.PharmacyStaff || mongoose.model("PharmacyStaff", PharmacyStaffSchema);

// 20. Pharmacy_medicine_stock (Page 24)
// Current inventory levels of drugs at specific pharmacies.
export const PharmacyMedicineStockSchema = new mongoose.Schema(
  {
    pharmacy_id: { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy", required: true },
    med_id: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
    quantity: { type: Number, default: 0, min: [0, "Stock cannot be negative"] },
  },
  opts
);

export const PharmacyMedicineStock =
  mongoose.models.PharmacyMedicineStock ||
  mongoose.model("PharmacyMedicineStock", PharmacyMedicineStockSchema);
