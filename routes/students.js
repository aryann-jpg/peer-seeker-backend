import express from "express";
import Student from "../models/student.js";
import authMiddleware from "../middleware/token.js";

const router = express.Router();

/* ================= GET ALL STUDENTS ================= */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const students = await Student.find({ role: "student" })
      .select("-password"); // 🔒 never send password

    res.status(200).json(students);
  } catch (error) {
    console.error("GET /students error:", error);
    res.status(500).json({ message: "Failed to fetch students" });
  }
});

/* ================= GET STUDENT BY ID ================= */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const student = await Student.findOne({
      _id: req.params.id,
      role: "student",
    }).select("-password");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error("GET /students/:id error:", error);
    res.status(500).json({ message: "Failed to fetch student" });
  }
});

export default router;
