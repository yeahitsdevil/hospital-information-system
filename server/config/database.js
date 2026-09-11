import mongoose from "mongoose";

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");
    console.log("Database:", mongoose.connection.name);
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error);
    process.exit(1);
  }
}

export default connectDB;