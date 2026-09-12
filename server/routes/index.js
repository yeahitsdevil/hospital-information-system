import express from "express";

import userRoutes from "./userRoutes.js";
import authRoutes from "./authRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import alertRoutes from "./alertRoutes.js";
import healthRoutes from "./healthRoutes.js";
import resourceRoutes from "./resourceRoutes.js";

const router = express.Router();
router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/alerts", alertRoutes);
router.use("/health", healthRoutes);
router.use("/", resourceRoutes);

export default router;