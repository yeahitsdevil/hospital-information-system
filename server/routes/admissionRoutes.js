import express from "express";
import { auth } from "../middleware/auth.js";
import {
  getRooms,
  createRoom,
  getAdmissions,
  admitPatient,
  dischargePatient,
  getDischargeSummary,
} from "../controllers/admissionController.js";

const router = express.Router();

router.get("/rooms", auth, getRooms);
router.post("/rooms", auth, createRoom);
router.get("/", auth, getAdmissions);
router.post("/admit", auth, admitPatient);
router.post("/:id/discharge", auth, dischargePatient);
router.get("/:id/discharge-summary", auth, getDischargeSummary);

export default router;
