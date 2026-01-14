import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Routes
import studentRoutes from "./routes/students.js";
import authRoutes from "./routes/auth.js";
import tutorRoutes from "./routes/tutors.js";
import profileRoutes from "./routes/profile.js";
import bookmarkRoutes from "./routes/bookmarks.js";
import bookingRoutes from "./routes/bookings.js";

dotenv.config();

const app = express();

/* =========================
   CORS CONFIG (IMPORTANT)
========================= */

const allowedOrigins = [
  "http://localhost:5173",
  "https://peer-seeker-frontend.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, Render health checks)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight requests
app.options("*", cors());

/* =========================
   MIDDLEWARE
========================= */

app.use(express.json());

/* =========================
   API ROUTES
========================= */

app.use("/students", studentRoutes);
app.use("/auth", authRoutes);
app.use("/tutors", tutorRoutes);
app.use("/profile", profileRoutes);
app.use("/bookmarks", bookmarkRoutes);
app.use("/bookings", bookingRoutes);

/* =========================
   DATABASE
========================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

/* =========================
   HEALTH CHECK
========================= */

app.get("/", (req, res) => {
  res.send("Peer Seeker API running");
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
