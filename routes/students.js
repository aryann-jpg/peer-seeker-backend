import express from "express";
import Student from "../models/student.js";
import authMiddleware from "../middleware/token.js";

const router = express.Router();

/* =====================================================
   GET ALL STUDENTS 
   Filtered to show only users with 'student' role
===================================================== */
router.get("/", authMiddleware, async (req, res) => {
  try {
    // We filter by role so tutors only see students
    const students = await Student.find({ role: "student" });
    res.status(200).json(students);
  } catch (error) {
    console.error("GET /students error:", error);
    res.status(500).json({ message: "Failed to fetch students" });
  }
});

/* =====================================================
   GET STUDENT BY ID
===================================================== */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "User not found" });
    res.json(student);
  } catch (error) {
    res.status(404).json({ message: "User not found" });
  }
});

export default router;