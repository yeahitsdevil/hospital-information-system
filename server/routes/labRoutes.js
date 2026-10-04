import express from "express";
import { auth, roles } from "../middleware/auth.js";
import {
  getTestTypes,
  createTestType,
  getLabTests,
  orderLabTest,
  submitLabResult,
  getLabReport,
} from "../controllers/labController.js";

const router = express.Router();

router.get(
  "/test-types",
  auth,
  roles("admin", "doctor", "nurse", "receptionist", "lab", "patient"),
  getTestTypes,
);
router.post("/test-types", auth, roles("admin"), createTestType);
router.get(
  "/tests",
  auth,
  roles("admin", "doctor", "nurse", "receptionist", "lab", "patient"),
  getLabTests,
);
router.post("/tests", auth, roles("doctor"), orderLabTest);
router.put("/tests/:id/result", auth, roles("lab"), submitLabResult);
router.get(
  "/tests/:id/report",
  auth,
  roles("admin", "doctor", "nurse", "receptionist", "lab", "patient"),
  getLabReport,
);

export default router;
