import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

export const login = async (req, res) => {
  try {
    const u = await User.findOne({ email: req.body.email });

    if (!u || !(await bcrypt.compare(req.body.password, u.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: u._id, role: u.role, name: u.name },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.json({
      token,
      user: {
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
      },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};