import express from "express";
import Student from "../models/student.js";
import authMiddleware from "../middleware/token.js";

const router = express.Router();

/* ================= GET ALL TUTORS ================= */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tutors = await Student.find({ role: "tutor" });
    res.status(200).json(tutors);
  } catch (error) {
    console.error("GET /tutors error:", error);
    res.status(500).json({ message: "Failed to fetch tutors" });
  }
});

/* ================= GET TUTOR BY ID ================= */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const tutor = await Student.findById(req.params.id);
    if (!tutor) return res.status(404).json({ message: "User not found" });
    res.json(tutor);
  } catch (error) {
    res.status(404).json({ message: "User not found" });
  }
});

export default router;
