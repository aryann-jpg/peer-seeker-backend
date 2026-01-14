import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "tutor"],
      required: true,
    },

    course: {
      type: String,
      trim: true,
    },

    year: {
      type: String,
      trim: true,
    },

    /* ========== ROLE-SPECIFIC ========== */

    // Tutor-only
    skills: {
      type: [String],
      default: [],
    },

    // Student-only
    helpNeeded: {
      type: [String],
      default: [],
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    /* ========== BOOKMARKS ========== */
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student", 
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);
