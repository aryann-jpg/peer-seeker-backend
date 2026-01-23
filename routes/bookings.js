import express from "express";
import Booking from "../models/bookings.js";
import Student from "../models/student.js";
import authMiddleware from "../middleware/token.js";

const router = express.Router();

/* =====================================================
   CREATE BOOKING
===================================================== */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { tutorId, date, duration, message } = req.body;
    const student = await Student.findById(req.user.id);
    if (!student || student.role !== "student") {
      return res.status(403).json({ message: "Only students can book sessions" });
    }
    if (!tutorId || !date || !duration) {
      return res.status(400).json({ message: "Tutor, date, and duration are required" });
    }
    if (duration < 30 || duration > 180) {
      return res.status(400).json({ message: "Duration must be between 30 and 180 minutes" });
    }
    const bookingDate = new Date(date);
    if (isNaN(bookingDate) || bookingDate <= new Date()) {
      return res.status(400).json({ message: "Booking date must be in the future" });
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
      return res.status(409).json({ message: "Tutor already has a booking at this time" });
    }
    const booking = await Booking.create({
      student: student._id,
      tutor: tutor._id,
      date: bookingDate,
      duration,
      message,
    });
    res.status(201).json({ message: "Booking created successfully", booking });
  } catch (err) {
    console.error("CREATE BOOKING ERROR:", err);
    res.status(500).json({ message: "Failed to create booking" });
  }
});

/* =====================================================
   GET STUDENT BOOKINGS
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
   UPDATE BOOKING (PUT /api/bookings/:id)
===================================================== */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { date, duration, message } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    
    // Check if the user owns the booking
    if (booking.student.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    if (date) {
      const updatedDate = new Date(date);
      if (isNaN(updatedDate) || updatedDate <= new Date()) {
        return res.status(400).json({ message: "Date must be in the future" });
      }
      booking.date = updatedDate;
    }

    if (duration) {
      if (duration < 30 || duration > 180) {
        return res.status(400).json({ message: "Duration between 30-180 mins" });
      }
      booking.duration = duration;
    }

    if (message !== undefined) booking.message = message;

    await booking.save();

    // Re-populate to keep John Doe's name on screen
    const updated = await Booking.findById(booking._id).populate("tutor", "name course");
    res.json(updated);
  } catch (err) {
    console.error("UPDATE ERROR LOG:", err);
    res.status(500).json({ message: err.message || "Failed to update booking" });
  }
});

/* =====================================================
   DELETE / CANCEL BOOKING
===================================================== */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.student.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized action" });
    }
    await booking.deleteOne();
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: "Failed to delete booking" });
  }
});

export default router;