
import { useCallback, useEffect, useState } from "react";

const STUDENT_API =
  (import.meta.env.VITE_STUDENT_API_URL ||
    (import.meta.env.DEV ? "http://localhost:5001" : "")).replace(/\/+$/, "");

const COURSE_API =
  (import.meta.env.VITE_COURSE_API_URL ||
    (import.meta.env.DEV ? "http://localhost:5002" : "")).replace(/\/+$/, "");

function apiUrl(baseUrl, variableName, path) {
  if (!baseUrl) {
    throw new Error(`${variableName} must be configured for this deployment.`);
  }

  return `${baseUrl}${path}`;
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return data;
}

function App() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [courseForm, setCourseForm] = useState({
    courseId: "",
    courseName: "",
    credits: 3
  });

  const [studentForm, setStudentForm] = useState({
    studentId: "",
    name: "",
    email: "",
    courseId: ""
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const courseUrl = apiUrl(COURSE_API, "VITE_COURSE_API_URL", "/api/courses");
      const studentUrl = apiUrl(
        STUDENT_API,
        "VITE_STUDENT_API_URL",
        "/api/students"
      );
      const [courseData, studentData] = await Promise.all([
        request(courseUrl),
        request(studentUrl)
      ]);

      setCourses(courseData);
      setStudents(studentData);

      setStudentForm((previous) => ({
        ...previous,
        courseId: previous.courseId || courseData[0]?.courseId || ""
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function addCourse(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const course = await request(
        apiUrl(COURSE_API, "VITE_COURSE_API_URL", "/api/courses"),
        {
          method: "POST",
          body: JSON.stringify({
            ...courseForm,
            credits: Number(courseForm.credits)
          })
        }
      );

      setMessage(`Course ${course.courseName} added successfully.`);
      setCourseForm({ courseId: "", courseName: "", credits: 3 });
      setStudentForm((previous) => ({
        ...previous,
        courseId: previous.courseId || course.courseId
      }));

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function addStudent(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const result = await request(
        apiUrl(STUDENT_API, "VITE_STUDENT_API_URL", "/api/students"),
        {
          method: "POST",
          body: JSON.stringify(studentForm)
        }
      );

      setMessage(
        `Student ${result.student.name} added successfully to ` +
        `${result.course.courseName}.`
      );

      setStudentForm({
        studentId: "",
        name: "",
        email: "",
        courseId: courses[0]?.courseId || ""
      });

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="container">
      <header className="hero">
        <p className="eyebrow">MERN STACK · MICROSERVICES</p>
        <h1>Student–Course Management</h1>
        <p>
          Manage students and courses through two independent REST services.
        </p>
      </header>

      {message && <div className="notice success">{message}</div>}
      {error && <div className="notice error">{error}</div>}

      <div className="service-status">
        <span>Student Service: {STUDENT_API || "not configured"}</span>
        <span>Course Service: {COURSE_API || "not configured"}</span>
        <button type="button" onClick={loadData}>Refresh data</button>
      </div>

      <section className="forms">
        <form className="panel" onSubmit={addCourse}>
          <h2>Add Course</h2>

          <label>
            Course ID
            <input
              required
              placeholder="e.g. CS101"
              value={courseForm.courseId}
              onChange={(e) =>
                setCourseForm({
                  ...courseForm,
                  courseId: e.target.value
                })
              }
            />
          </label>

          <label>
            Course Name
            <input
              required
              placeholder="e.g. Data Structures"
              value={courseForm.courseName}
              onChange={(e) =>
                setCourseForm({
                  ...courseForm,
                  courseName: e.target.value
                })
              }
            />
          </label>

          <label>
            Credits
            <input
              type="number"
              min="1"
              required
              value={courseForm.credits}
              onChange={(e) =>
                setCourseForm({
                  ...courseForm,
                  credits: e.target.value
                })
              }
            />
          </label>

          <button type="submit">Add Course</button>
        </form>

        <form className="panel" onSubmit={addStudent}>
          <h2>Add Student</h2>

          <label>
            Student ID
            <input
              required
              placeholder="e.g. ST001"
              value={studentForm.studentId}
              onChange={(e) =>
                setStudentForm({
                  ...studentForm,
                  studentId: e.target.value
                })
              }
            />
          </label>

          <label>
            Student Name
            <input
              required
              placeholder="Full name"
              value={studentForm.name}
              onChange={(e) =>
                setStudentForm({
                  ...studentForm,
                  name: e.target.value
                })
              }
            />
          </label>

          <label>
            Email
            <input
              type="email"
              required
              placeholder="student@example.com"
              value={studentForm.email}
              onChange={(e) =>
                setStudentForm({
                  ...studentForm,
                  email: e.target.value
                })
              }
            />
          </label>

          <label>
            Course
            <select
              required
              value={studentForm.courseId}
              onChange={(e) =>
                setStudentForm({
                  ...studentForm,
                  courseId: e.target.value
                })
              }
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.courseId} value={course.courseId}>
                  {course.courseId} — {course.courseName}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" disabled={courses.length === 0}>
            Add Student
          </button>

          {courses.length === 0 && (
            <p className="hint">Add a course before adding a student.</p>
          )}
        </form>
      </section>

      <section className="panel table-panel">
        <div className="section-heading">
          <div>
            <h2>Student Records</h2>
            <p>Student details combined with Course Service data</p>
          </div>
          <span className="count">{students.length} students</span>
        </div>

        {loading && <p>Loading records...</p>}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Course ID</th>
                <th>Course Name</th>
                <th>Credits</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.studentId}>
                  <td>{student.studentId}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.courseId}</td>
                  <td>
                    {student.course?.courseName ||
                      student.courseError ||
                      "Course unavailable"}
                  </td>
                  <td>{student.course?.credits ?? "—"}</td>
                </tr>
              ))}

              {!loading && students.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty">
                    No students found. Add a course and then a student.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel table-panel">
        <h2>Available Courses</h2>
        <div className="course-list">
          {courses.map((course) => (
            <article className="course-card" key={course.courseId}>
              <span>{course.courseId}</span>
              <h3>{course.courseName}</h3>
              <p>{course.credits} credits</p>
            </article>
          ))}
        </div>
      </section>

      <footer>
        Student Service · Course Service · MongoDB Atlas
      </footer>
    </main>
  );
}

export default App;
