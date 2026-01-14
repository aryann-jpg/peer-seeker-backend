import express from "express";
import Student from "../models/student.js";

const router = express.Router();

// GET all tutors
router.get("/", async (req, res) => {
  try {
    const tutors = await Student.find({ role: "tutor" });
    res.json(tutors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
