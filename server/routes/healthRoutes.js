import express from "express";

const router = express.Router();

router.get("/", (req, res) =>
  res.json({
    ok: true,
    service: "Hospital Information System",
  }),
);

export default router;