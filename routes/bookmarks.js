import express from "express";
import Student from "../models/student.js";
import authMiddleware from "../middleware/token.js";

const router = express.Router();

/* =====================================================
   BOOKMARK / UNBOOKMARK USER
   - student → tutor
   - tutor → student
===================================================== */
router.post("/:targetId", authMiddleware, async (req, res) => {
  try {
    const user = await Student.findById(req.user.id);
    const targetId = req.params.targetId;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const target = await Student.findById(targetId);
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only allow student <-> tutor bookmarking
    if (
      (user.role === "student" && target.role !== "tutor") ||
      (user.role === "tutor" && target.role !== "student")
    ) {
      return res.status(403).json({ message: "Invalid bookmark target" });
    }

    if (!user.bookmarks) user.bookmarks = [];

    const index = user.bookmarks.findIndex(
      (id) => id.toString() === targetId
    );

    // TOGGLE
    if (index >= 0) {
      user.bookmarks.splice(index, 1);
      await user.save();
      return res.json({ message: "Bookmark removed" });
    } else {
      user.bookmarks.push(targetId);
      await user.save();
      return res.json({ message: "Bookmarked successfully" });
    }
  } catch (err) {
    console.error("BOOKMARK ERROR:", err);
    res.status(500).json({ message: "Bookmark failed" });
  }
});

/* =====================================================
   GET ALL BOOKMARKS FOR LOGGED-IN USER
===================================================== */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await Student.findById(req.user.id)
      .populate("bookmarks", "-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.json(user.bookmarks || []);
  } catch (err) {
    console.error("FETCH BOOKMARKS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch bookmarks" });
  }
});

export default router;
