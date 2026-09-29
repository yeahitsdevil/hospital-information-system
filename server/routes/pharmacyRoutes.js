import express from "express";
import { auth, roles } from "../middleware/auth.js";
import {
  getMedicines,
  createMedicine,
  getPrescriptions,
  createPrescription,
  dispensePrescription,
  getPharmacies,
} from "../controllers/pharmacyController.js";

const router = express.Router();

router.get("/medicines", auth, roles("admin", "doctor", "nurse", "pharmacist"), getMedicines);
router.post("/medicines", auth, roles("admin", "pharmacist"), createMedicine);
router.get("/prescriptions", auth, roles("admin", "doctor", "nurse", "receptionist", "lab", "patient", "pharmacist"), getPrescriptions);
router.post("/prescriptions", auth, roles("doctor"), createPrescription);
router.post("/prescriptions/:id/dispense", auth, roles("admin", "pharmacist"), dispensePrescription);
router.get("/pharmacies", auth, roles("admin", "doctor", "nurse", "pharmacist"), getPharmacies);

export default router;
