import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

// Routes
import studentRoutes from "./routes/students.js";
import authRoutes from "./routes/auth.js";
import tutorRoutes from "./routes/tutors.js";
import profileRoutes from "./routes/profile.js";
import bookmarkRoutes from "./routes/bookmarks.js";
import bookingRoutes from "./routes/bookings.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/students", studentRoutes);
app.use("/auth", authRoutes);
app.use("/tutors", tutorRoutes);
app.use("/profile", profileRoutes);
app.use("/bookmarks", bookmarkRoutes);
app.use("/bookings", bookingRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Serve frontend React build
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "../Frontend/dist"))); // For Vite, build goes to 'dist'

app.get('/', (req, res) => {
  res.send('API running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
