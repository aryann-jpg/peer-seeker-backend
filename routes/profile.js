import express from "express";
import Student from "../models/student.js";
import authMiddleware from "../middleware/token.js";

const router = express.Router();

/* ================= GET OWN PROFILE ================= */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await Student.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= UPDATE OWN PROFILE ================= */
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const updates = req.body;

    // Prevent role & password edits here
    delete updates.role;
    delete updates.password;

    const updatedUser = await Student.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;
