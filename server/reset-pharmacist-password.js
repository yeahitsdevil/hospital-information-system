import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./models/index.js";

dotenv.config();

const demoUsers = [
  "doctor@his.local",
  "nurse@his.local",
  "reception@his.local",
  "pharmacy@his.local",
  "lab@his.local",
  "accounts@his.local",
];

async function resetDemoPasswords() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    if (!process.env.DEMO_PASSWORD) {
      throw new Error("DEMO_PASSWORD is not configured");
    }

    const hashedPassword = await bcrypt.hash(process.env.DEMO_PASSWORD, 10);

    const result = await User.updateMany(
      {
        email: { $in: demoUsers },
      },
      {
        $set: {
          password: hashedPassword,
        },
      },
    );

    console.log("Demo passwords reset successfully.");
    console.log("Users matched:", result.matchedCount);
    console.log("Users modified:", result.modifiedCount);
  } catch (error) {
    console.error("Password reset failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

resetDemoPasswords();
