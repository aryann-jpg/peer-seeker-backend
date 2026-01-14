import express from "express";
import Student from "../models/student.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const students = await Student.find({});
    res.status(200).json(students);
  } catch (error) {
    console.error("GET /students error:", error);
    res.status(500).json({ message: "Failed to fetch students" });
  }
});
// GET student by ID
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    res.json(student);
  } catch (error) {
    res.status(404).json({ message: "User not found" });
  }
});


export default router;
