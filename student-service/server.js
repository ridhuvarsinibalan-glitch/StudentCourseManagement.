

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Student = require("./models/Student");

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
    service: "Student Service",
    status: "running"
  });
});

// Add a student
app.post("/api/students", async (req, res) => {
  try {
    const { studentId, name, email, courseId } = req.body;

    if (!studentId || !name || !email || !courseId) {
      return res.status(400).json({
        message: "studentId, name, email and courseId are required"
      });
    }

    // Verify the course using the Course Service
    const courseURL =
      `${COURSE_SERVICE_URL}/api/courses/` +
      encodeURIComponent(courseId);

    let courseResponse;

    try {
      courseResponse = await fetch(courseURL);
    } catch (error) {
      return res.status(503).json({
        message: "Course Service is unavailable"
      });
    }

    if (courseResponse.status === 404) {
      return res.status(400).json({
        message: "Cannot assign a student to a non-existent course"
      });
    }

    if (!courseResponse.ok) {
      return res.status(502).json({
        message: "Course Service returned an error"
      });
    }

    const student = await Student.create({
      studentId,
      name,
      email,
      courseId
    });

    res.status(201).json({
      message: "Student created successfully",
      student,
      course: await courseResponse.json()
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Student ID or email already exists"
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message
      });
    }

    console.error(error);
    res.status(500).json({
      message: "Failed to create student"
    });
  }
});

// Retrieve students with course details
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find().sort({ studentId: 1 });

    const enrichedStudents = await Promise.all(
      students.map(async (student) => {
        let course = null;
        let courseError = null;

        try {
          const response = await fetch(
            `${COURSE_SERVICE_URL}/api/courses/` +
            encodeURIComponent(student.courseId)
          );

          if (response.ok) {
            course = await response.json();
          } else {
            courseError = `Course Service returned ${response.status}`;
          }
        } catch (error) {
          courseError = "Course Service is unavailable";
        }

        return {
          ...student.toObject(),
          course,
          courseError
        };
      })
    );

    res.json(enrichedStudents);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to retrieve students"
    });
  }
});

// Retrieve one student with course details
app.get("/api/students/:studentId", async (req, res) => {
  try {
    const student = await Student.findOne({
      studentId: req.params.studentId
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    let course = null;
    let courseError = null;

    try {
      const response = await fetch(
        `${COURSE_SERVICE_URL}/api/courses/` +
        encodeURIComponent(student.courseId)
      );

      if (response.ok) {
        course = await response.json();
      } else {
        courseError = `Course Service returned ${response.status}`;
      }
    } catch (error) {
      courseError = "Course Service is unavailable";
    }

    res.json({
      ...student.toObject(),
      course,
      courseError
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve student"
    });
  }
});

const PORT = process.env.PORT || 5001;
const COURSE_SERVICE_URL = (process.env.COURSE_SERVICE_URL || "")
  .replace(/\/+$/, "");

async function startServer() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is required");
    process.exit(1);
  }

  if (!COURSE_SERVICE_URL) {
    console.error("COURSE_SERVICE_URL is required");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("StudentDB connected successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Student Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("StudentDB connection failed:", error.name);
    process.exit(1);
  }
}

startServer();
