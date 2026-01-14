import express from "express";
import Booking from "../models/bookings.js";
import Student from "../models/student.js";
import authMiddleware from "../middleware/token.js";

const router = express.Router();

/* =====================================================
   CREATE BOOKING (STUDENT → TUTOR)
   POST /api/bookings
===================================================== */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { tutorId, date, duration, message } = req.body;

    const student = await Student.findById(req.user.id);
    if (!student || student.role !== "student") {
      return res
        .status(403)
        .json({ message: "Only students can book sessions" });
    }

   
    if (!tutorId || !date || !duration) {
      return res.status(400).json({
        message: "Tutor, date, and duration are required",
      });
    }

    if (duration < 30 || duration > 180) {
      return res.status(400).json({
        message: "Duration must be between 30 and 180 minutes",
      });
    }

    const bookingDate = new Date(date);
    if (isNaN(bookingDate) || bookingDate <= new Date()) {
      return res.status(400).json({
        message: "Booking date must be in the future",
      });
    }

    const tutor = await Student.findById(tutorId);
    if (!tutor || tutor.role !== "tutor") {
      return res.status(404).json({ message: "Tutor not found" });
    }

  
    const conflict = await Booking.findOne({
      tutor: tutorId,
      date: bookingDate,
      status: { $ne: "cancelled" },
    });

    if (conflict) {
      return res.status(409).json({
        message: "Tutor already has a booking at this time",
      });
    }

    const booking = await Booking.create({
      student: student._id,
      tutor: tutor._id,
      date: bookingDate,
      duration,
      message,
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (err) {
    console.error("CREATE BOOKING ERROR:", err);
    res.status(500).json({ message: "Failed to create booking" });
  }
});

/* =====================================================
   GET STUDENT BOOKINGS
   GET /api/bookings/my
===================================================== */
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student || student.role !== "student") {
      return res.status(403).json({ message: "Access denied" });
    }

    const bookings = await Booking.find({ student: student._id })
      .populate("tutor", "name course year skills")
      .sort({ date: 1 });

    res.json(bookings);
  } catch (err) {
    console.error("FETCH BOOKINGS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

/* =====================================================
   DELETE / CANCEL BOOKING
   DELETE /api/bookings/:id
===================================================== */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.student.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    await booking.deleteOne();

    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.error("DELETE BOOKING ERROR:", err);
    res.status(500).json({ message: "Failed to delete booking" });
  }
});

export default router;
