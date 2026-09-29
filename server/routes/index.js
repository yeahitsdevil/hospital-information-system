import express from "express";

import userRoutes from "./userRoutes.js";
import authRoutes from "./authRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import alertRoutes from "./alertRoutes.js";
import healthRoutes from "./healthRoutes.js";
import resourceRoutes from "./resourceRoutes.js";

// Specific HIS DFD Domain Routes
import patientRoutes from "./patientRoutes.js";
import appointmentRoutes from "./appointmentRoutes.js";
import pharmacyRoutes from "./pharmacyRoutes.js";
import labRoutes from "./labRoutes.js";
import admissionRoutes from "./admissionRoutes.js";
import billingRoutes from "./billingRoutes.js";
import staffRoutes from "./staffRoutes.js";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/alerts", alertRoutes);
router.use("/health", healthRoutes);

// Dedicated DFD Workflow Endpoints
router.use("/patient-ops", patientRoutes);
router.use("/appointment-ops", appointmentRoutes);
router.use("/pharmacy-ops", pharmacyRoutes);
router.use("/lab-ops", labRoutes);
router.use("/admission-ops", admissionRoutes);
router.use("/billing-ops", billingRoutes);
router.use("/staff-ops", staffRoutes);

// Base generic CRUD routes
router.use("/", resourceRoutes);

export default router;