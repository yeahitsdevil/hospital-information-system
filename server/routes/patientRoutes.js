import express from "express";
import { auth } from "../middleware/auth.js";
import {
  getPatients,
  createPatient,
  getPatientById,
  addMedicalHistory,
  getPatientReport,
} from "../controllers/patientController.js";

const router = express.Router();

router.get("/", auth, getPatients);
router.post("/", auth, createPatient);
router.get("/:id", auth, getPatientById);
router.post("/:id/medical-history", auth, addMedicalHistory);
router.get("/:id/report", auth, getPatientReport);

export default router;
