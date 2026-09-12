import bcrypt from "bcryptjs";
import { User } from "../models/index.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error("GET /api/users failed:", error);

    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password, and role are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
    });

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(201).json(safeUser);
  } catch (error) {
    console.error("POST /api/users failed:", error);

    res.status(400).json({
      message: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, phone, active } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (active === false && req.user.id === id) {
      return res.status(400).json({
        message: "You cannot deactivate your own account",
      });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: id },
      });

      if (existingUser) {
        return res.status(409).json({
          message: "User with this email already exists",
        });
      }
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (phone !== undefined) user.phone = phone;
    if (active !== undefined) user.active = active;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;

    res.json(safeUser);
  } catch (error) {
    console.error("PUT /api/users/:id failed:", error);

    res.status(400).json({
      message: error.message,
    });
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({
        message: "You cannot deactivate your own account",
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { active: false },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    console.error("PATCH /api/users/:id/deactivate failed:", error);

    res.status(400).json({
      message: error.message,
    });
  }
};
