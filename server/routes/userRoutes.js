import express from "express";
import { auth, permission } from "../middleware/auth.js";
import {
  getUsers,
  createUser,
  updateUser,
  deactivateUser,
  getProfile,
  updateProfile,
  updateAvailability,
} from "../controllers/userController.js";

const router = express.Router();

const adminOnly = permission(["admin"]);

// Authenticated current user profile endpoints
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.patch("/availability", auth, updateAvailability);

// Admin-only user management endpoints
router.get("/", auth, adminOnly, getUsers);
router.post("/", auth, adminOnly, createUser);
router.put("/:id", auth, adminOnly, updateUser);
router.patch("/:id/deactivate", auth, adminOnly, deactivateUser);

export default router;
