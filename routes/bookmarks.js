import express from "express";
import Student from "../models/student.js";
import authMiddleware from "../middleware/token.js";

const router = express.Router();

/* ===== ADD / REMOVE BOOKMARK ===== */
router.post("/:tutorId", authMiddleware, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    const tutorId = req.params.tutorId;

    if (!student || student.role !== "student") {
      return res.status(403).json({ message: "Only students can bookmark tutors" });
    }

    const tutor = await Student.findById(tutorId);
    if (!tutor || tutor.role !== "tutor") {
      return res.status(404).json({ message: "Tutor not found" });
    }

    if (!student.bookmarks) student.bookmarks = [];

    const index = student.bookmarks.findIndex(
      (id) => id.toString() === tutorId
    );

    if (index >= 0) {
      student.bookmarks.splice(index, 1);
    } else {
      student.bookmarks.push(tutorId);
    }

    await student.save();

    res.json({
      message: index >= 0 ? "Bookmark removed" : "Tutor bookmarked",
    });
  } catch (err) {
    res.status(500).json({ message: "Bookmark failed" });
  }
});

/* ===== GET BOOKMARKED TUTORS ===== */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id)
      .populate("bookmarks", "-password");

    if (!student || student.role !== "student") {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(student.bookmarks || []);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bookmarks" });
  }
});

export default router;
