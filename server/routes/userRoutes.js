import express from "express";
import { auth, permission } from "../middleware/auth.js";
import {
  getUsers,
  createUser,
  updateUser,
  deactivateUser,
} from "../controllers/userController.js";

const router = express.Router();

const adminOnly = permission(["admin"]);

router.get("/", auth, adminOnly, getUsers);

router.post("/", auth, adminOnly, createUser);

router.put("/:id", auth, adminOnly, updateUser);

router.patch("/:id/deactivate", auth, adminOnly, deactivateUser);

export default router;
