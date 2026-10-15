require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Course = require("./models/Course");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    process.env.FRONTEND_URL
  ].filter(Boolean)
}));

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    service: "Course Service",
    status: "running"
  });
});

// Add a course
app.post("/api/courses", async (req, res) => {
  try {
    const { courseId, courseName, credits } = req.body;

    if (!courseId || !courseName || credits == null) {
      return res.status(400).json({
        message: "courseId, courseName and credits are required"
      });
    }

    const course = await Course.create({
      courseId,
      courseName,
      credits
    });

    res.status(201).json(course);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Course ID already exists"
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message
      });
    }

    console.error(error);
    res.status(500).json({
      message: "Failed to create course"
    });
  }
});

// Retrieve all courses
app.get("/api/courses", async (req, res) => {
  try {
    const courses = await Course.find().sort({ courseId: 1 });
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to retrieve courses"
    });
  }
});

// Retrieve one course by course ID
app.get("/api/courses/:courseId", async (req, res) => {
  try {
    const course = await Course.findOne({
      courseId: req.params.courseId
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve course"
    });
  }
});

const PORT = process.env.PORT || 5002;

async function startServer() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is required");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("CourseDB connected successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Course Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("CourseDB connection failed:", error.name);
    process.exit(1);
  }
}

startServer();
