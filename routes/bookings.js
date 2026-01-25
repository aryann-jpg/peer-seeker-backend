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
      status: "pending",
    });

    res.status(201).json({ message: "Booking request sent", booking });
  } catch (err) {
    console.error("CREATE BOOKING ERROR:", err);
    res.status(500).json({ message: "Failed to create booking" });
  }
});

/* =====================================================
   GET STUDENT BOOKINGS
===================================================== */
router.get("/my", authMiddleware, async (req, res) => {
  const user = await Student.findById(req.user.id);
  if (!user || user.role !== "student") {
    return res.status(403).json({ message: "Access denied" });
  }

  const bookings = await Booking.find({ student: user._id })
    .populate("tutor", "name course year")
    .sort({ date: 1 });

  res.json(bookings);
});

/* =====================================================
   GET TUTOR BOOKINGS
===================================================== */
router.get("/tutor", authMiddleware, async (req, res) => {
  const tutor = await Student.findById(req.user.id);
  if (!tutor || tutor.role !== "tutor") {
    return res.status(403).json({ message: "Access denied" });
  }

  const bookings = await Booking.find({ tutor: tutor._id })
    .populate("student", "name course year helpNeeded")
    .sort({ date: 1 });

  res.json(bookings);
});

/* =====================================================
   TUTOR ACCEPT / REJECT BOOKING
===================================================== */
router.patch("/:id/status", authMiddleware, async (req, res) => {
  const { status } = req.body;

  if (!["confirmed", "cancelled"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  if (booking.tutor.toString() !== req.user.id) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  booking.status = status;
  await booking.save();

  res.json({ message: `Booking ${status}`, booking });
});

/* =====================================================
   STUDENT UPDATE (ONLY IF PENDING)
===================================================== */
router.put("/:id", authMiddleware, async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  if (booking.student.toString() !== req.user.id) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  if (booking.status !== "pending") {
    return res.status(400).json({ message: "Cannot edit confirmed booking" });
  }

  const { date, duration, message } = req.body;

  if (date) booking.date = new Date(date);
  if (duration) booking.duration = duration;
  if (message !== undefined) booking.message = message;

  await booking.save();

  const updated = await Booking.findById(booking._id).populate("tutor", "name course");
  res.json(updated);
});

/* =====================================================
   DELETE BOOKING (STUDENT)
===================================================== */
router.delete("/:id", authMiddleware, async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  if (booking.student.toString() !== req.user.id) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  booking.status = "cancelled";
  await booking.save();

  res.json({ message: "Booking cancelled" });
});

export default router;
