import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import routes from "./routes/index.js";

dotenv.config();
const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", process.env.CLIENT_URL].filter(Boolean),
  }),
);
app.use(express.json());

app.use("/api", routes);

const port = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`HIS API running on ${port}`);
  });
});
