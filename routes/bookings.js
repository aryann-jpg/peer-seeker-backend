import express from "express";
import Booking from "../models/bookings.js";
import Student from "../models/student.js";
import authMiddleware from "../middleware/token.js";

const router = express.Router();

/* =====================================================
   CREATE BOOKING (STUDENT)
===================================================== */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { tutorId, date, duration, message } = req.body;

    const student = await Student.findById(req.user.id);
    if (!student || student.role !== "student") {
      return res.status(403).json({ message: "Only students can book sessions" });
    }

    const tutor = await Student.findById(tutorId);
    if (!tutor || tutor.role !== "tutor") {
      return res.status(404).json({ message: "Tutor not found" });
    }

    const bookingDate = new Date(date);
    if (bookingDate <= new Date()) {
      return res.status(400).json({ message: "Date must be in the future" });
    }

    const conflict = await Booking.findOne({
      tutor: tutorId,
      date: bookingDate,
      status: { $ne: "cancelled" },
    });

    if (conflict) {
      return res.status(409).json({ message: "Tutor already booked at this time" });
    }

    const booking = await Booking.create({
      student: student._id,
      tutor: tutor._id,
      date: bookingDate,
      duration,
      message,
      status: "pending",
    });

    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create booking" });
  }
});

/* =====================================================
   GET STUDENT BOOKINGS
===================================================== */
router.get("/my", authMiddleware, async (req, res) => {
  const bookings = await Booking.find({ student: req.user.id })
    .populate("tutor", "name course year")
    .sort({ date: 1 });
  res.json(bookings);
});

/* =====================================================
   GET TUTOR BOOKINGS
===================================================== */
router.get("/tutor", authMiddleware, async (req, res) => {
  const bookings = await Booking.find({ tutor: req.user.id })
    .populate("student", "name course year helpNeeded")
    .sort({ date: 1 });
  res.json(bookings);
});

/* =====================================================
   TUTOR ACCEPT / REJECT BOOKING
===================================================== */
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    let { status } = req.body;

    // Map frontend status to backend enum
    const statusMap = { accepted: "confirmed", rejected: "cancelled" };
    status = statusMap[status] || status;

    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.tutor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    booking.status = status;
    await booking.save();

    res.json({ booking });
  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    res.status(500).json({ message: "Failed to update booking status" });
  }
});

/* =====================================================
   DELETE BOOKING (STUDENT CANCEL)
===================================================== */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.student.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled" });
  } catch (err) {
    console.error("DELETE BOOKING ERROR:", err);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
});
/* =====================================================
   UPDATE BOOKING (STUDENT)
===================================================== */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { date, duration, message } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Only the student who created it can edit
    if (booking.student.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Only pending bookings can be edited
    if (booking.status !== "pending") {
      return res.status(400).json({ message: "Only pending bookings can be updated" });
    }

    // Update fields
    if (date) booking.date = new Date(date);
    if (duration) booking.duration = duration;
    if (message !== undefined) booking.message = message;

    await booking.save();

    // Populate tutor info for frontend
    await booking.populate("tutor", "name course year");

    res.json(booking);
  } catch (err) {
    console.error("UPDATE BOOKING ERROR:", err);
    res.status(500).json({ message: "Failed to update booking" });
  }
});

export default router;
