import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Student from "../models/student.js";

const router = express.Router();

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      course,
      year,
      skills = [],
      helpNeeded = [],
      bio,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password, and role are required",
      });
    }

    if (!["student", "tutor"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role selected",
      });
    }

    const exists = await Student.findOne({ email });
    if (exists) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      password: hashedPassword,
      role,
      course,
      year,
      bio,
      skills: role === "tutor" ? skills : [],
      helpNeeded: role === "student" ? helpNeeded : [],
    };

    const student = await Student.create(userData);

    res.status(201).json({
      message: "Registration successful",
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        skills: student.skills,
        helpNeeded: student.helpNeeded,
      },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({
      message: "Server error during registration",
    });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: student._id, role: student.role },
      process.env.JWT_SECRET || "SECRET_KEY",
      { expiresIn: "1d" }
    );

    // ✅ IMPORTANT: send skills + helpNeeded
    res.json({
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        skills: student.skills,
        helpNeeded: student.helpNeeded,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({
      message: "Server error during login",
    });
  }
});

export default router;
