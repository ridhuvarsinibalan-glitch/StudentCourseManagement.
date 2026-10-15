
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    courseName: {
      type: String,
      required: true,
      trim: true
    },
    credits: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
