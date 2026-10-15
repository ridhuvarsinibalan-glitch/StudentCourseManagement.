# Student–Course Management System
### MERN Stack Application Using Microservices

## 1. Project Overview

The Student–Course Management System is a full-stack web application developed using the MERN stack and a microservices architecture. It manages student and course information through two independent REST API services.

The Student Service manages student details, while the Course Service manages course details. The Student Service communicates with the Course Service to retrieve course information associated with each student. A React frontend displays the combined information through a user-friendly interface.

## 2. Objectives

- Develop two independent Node.js and Express microservices.
- Implement REST APIs to create and retrieve student and course records.
- Connect both services to MongoDB databases using Mongoose.
- Implement HTTP-based communication between microservices.
- Develop a React frontend to manage and display student and course information.
- Deploy the backend services and frontend independently on cloud platforms.

## 3. Technologies Used

| Component | Technology |
|---|---|
| Frontend | React.js |
| Frontend Build Tool | Vite |
| Backend | Node.js |
| API Framework | Express.js |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Inter-Service Communication | REST API and HTTP fetch |
| Environment Configuration | dotenv |
| Cross-Origin Requests | CORS |
| Development Tool | Nodemon |
| Backend Deployment | Render |
| Frontend Deployment | Vercel |
| Version Control | Git and GitHub |

## 4. System Architecture

The application consists of three independently runnable applications.

1. **Student Service:** Manages student records and retrieves associated course information by communicating with the Course Service.
2. **Course Service:** Manages course records and provides course information through REST APIs.
3. **React Frontend:** Provides forms for adding students and courses and displays combined student–course information.

### Architecture Flow

React Frontend → Student Service → Course Service

The Student Service stores student records in `StudentDB`, while the Course Service stores course records in `CourseDB`. Both databases can reside in the same MongoDB Atlas cluster while remaining logically separate.

## 5. Project Structure

```text
StudentCourseManagement/
├── student-service/
│   ├── models/
│   │   └── Student.js
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── .gitignore
├── course-service/
│   ├── models/
│   │   └── Course.js
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env
│   └── .gitignore
└── README.md
```

## 6. Database Design

### Student Collection

Database: `StudentDB`

Collection: `students`

| Field | Data Type | Description |
|---|---|---|
| studentId | String | Unique student identifier |
| name | String | Student name |
| email | String | Unique student email |
| courseId | String | Identifier of the associated course |

### Course Collection

Database: `CourseDB`

Collection: `courses`

| Field | Data Type | Description |
|---|---|---|
| courseId | String | Unique course identifier |
| courseName | String | Name of the course |
| credits | Number | Number of course credits |

Mongoose schemas provide data validation and enforce uniqueness for student IDs, student emails and course IDs.

The `courseId` field links a student to a course logically. Course details are retrieved from the Course Service at request time instead of duplicating the course document in the Student Service database.

## 7. REST API Endpoints

### Student Service

Base URL: `http://localhost:5001`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Check service status |
| POST | `/api/students` | Add a student after validating the associated course |
| GET | `/api/students` | Retrieve all students with course details |
| GET | `/api/students/:studentId` | Retrieve one student with course details |

### Course Service

Base URL: `http://localhost:5002`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Check service status |
| POST | `/api/courses` | Add a course |
| GET | `/api/courses` | Retrieve all courses |
| GET | `/api/courses/:courseId` | Retrieve one course |

### Sample Course Request

```json
{
  "courseId": "CS101",
  "courseName": "Data Structures",
  "credits": 4
}
```

### Sample Student Request

```json
{
  "studentId": "ST001",
  "name": "Arun Kumar",
  "email": "arun@example.com",
  "courseId": "CS101"
}
```

## 8. Prerequisites

Install the following before running the application:

- Node.js 20.19 or later (or 22.12 or later)
- npm
- MongoDB Atlas account
- Git
- Visual Studio Code or another code editor
- A modern web browser

## 9. Installation and Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/StudentCourseManagement.git
cd StudentCourseManagement
```

Replace `YOUR_USERNAME` with your GitHub username.

If the project already exists locally, navigate directly to the project folder.

### Step 2: Configure MongoDB Atlas

1. Sign in to MongoDB Atlas.
2. Create a cluster or use an existing cluster.
3. Create a database user.
4. Configure Network Access to permit connections from your development machine.
5. Open Connect → Drivers → Node.js and copy the MongoDB connection URI.

### Step 3: Configure Student Service

Create `student-service/.env`:

```dotenv
PORT=5001
MONGODB_URI=your-atlas-connection-string-for-StudentDB
COURSE_SERVICE_URL=http://localhost:5002
FRONTEND_URL=http://localhost:5173
```

Replace the placeholders with your actual MongoDB Atlas credentials and cluster address.

### Step 4: Configure Course Service

Create `course-service/.env`:

```dotenv
PORT=5002
MONGODB_URI=your-atlas-connection-string-for-CourseDB
FRONTEND_URL=http://localhost:5173
```

Use the same cluster credentials but the appropriate database name.

### Step 5: Configure Frontend

Create `frontend/.env`:

```dotenv
VITE_STUDENT_API_URL=http://localhost:5001
VITE_COURSE_API_URL=http://localhost:5002
```

Do not commit `.env` files or expose database credentials in the frontend.

## 10. Running the Application

Run each component in a separate terminal.

### Terminal 1: Course Service

```bash
cd course-service
npm install
npm run dev
```

Expected message:

```text
CourseDB connected successfully
Course Service running on port 5002
```

### Terminal 2: Student Service

```bash
cd student-service
npm install
npm run dev
```

Expected message:

```text
StudentDB connected successfully
Student Service running on port 5001
```

### Terminal 3: React Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, normally:

`http://localhost:5173`

## 11. Testing the Application

### Verify the Services

- Student Service: `http://localhost:5001/`
- Course Service: `http://localhost:5002/`
- Retrieve courses: `http://localhost:5002/api/courses`
- Retrieve students: `http://localhost:5001/api/students`

### Functional Testing

1. Start both backend services and the frontend.
2. Add a course with a unique course ID.
3. Add a student and assign the newly created course.
4. Verify that the Student Service returns the student's details and associated course information.
5. Refresh the frontend and confirm that the records persist in MongoDB.
6. Test duplicate IDs and nonexistent course IDs to verify error handling.

## 12. Inter-Service Communication

The Student Service communicates with the Course Service using HTTP requests.

When a student is added:

1. The frontend submits student details to the Student Service.
2. The Student Service sends a GET request to the Course Service using the supplied `courseId`.
3. The Course Service retrieves the corresponding course from MongoDB.
4. If the course exists, the Student Service saves the student.
5. The response includes both student information and the retrieved course details.

When students are retrieved, the Student Service fetches their associated course information and returns the combined response.

This approach demonstrates service-to-service communication without directly accessing another service's database.

## 13. Error Handling

The application handles common errors using appropriate HTTP status codes.

| Status Code | Meaning |
|---|---|
| 201 | Resource created successfully |
| 400 | Invalid input or nonexistent course assignment |
| 404 | Requested student or course not found |
| 409 | Duplicate unique identifier |
| 500 | Internal server error |
| 502 | Upstream Course Service error |
| 503 | Course Service unavailable during student creation |

## 14. Deployment

### Backend Deployment — Render

Deploy the two backend services independently.

**Course Service**
- Root Directory: `course-service`
- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variables: `MONGODB_URI`, `FRONTEND_URL`

**Student Service**
- Root Directory: `student-service`
- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variables: `MONGODB_URI`, `COURSE_SERVICE_URL`, `FRONTEND_URL`

Set `COURSE_SERVICE_URL` to the deployed Course Service's public HTTPS URL.

### Frontend Deployment — Vercel

- Root Directory: `frontend`
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

Configure the following environment variables using the deployed backend URLs:

```dotenv
VITE_STUDENT_API_URL=https://YOUR-STUDENT-SERVICE.onrender.com
VITE_COURSE_API_URL=https://YOUR-COURSE-SERVICE.onrender.com
```

Redeploy the frontend after configuring the variables.

Ensure MongoDB Atlas permits connections from the deployed backend services and configure CORS to allow the deployed frontend origin.

## 15. Advantages

- Independent development and deployment of services.
- Separation of student and course data.
- Reusable REST APIs.
- Centralized course information.
- Persistent storage using MongoDB.
- Clear separation between frontend and backend.
- Improved maintainability and modularity.

## 16. Limitations and Future Enhancements

- Add authentication and role-based access control.
- Implement update and delete operations.
- Introduce API request timeouts and retries.
- Add pagination and filtering.
- Implement automated unit and integration tests.
- Add structured logging and monitoring.
- Introduce stronger input validation and production security controls.

## 17. Conclusion

The Student–Course Management System demonstrates the development of a MERN-based microservices application using React, Node.js, Express.js and MongoDB. Two independent backend services expose REST APIs, and the Student Service retrieves course information through HTTP communication. The React frontend presents the combined information in an integrated interface.

The project illustrates microservice separation, database connectivity, REST API implementation, inter-service communication and independent cloud deployment, fulfilling the core objectives of the Full Stack Application Development Laboratory exercise.

## 18. References

1. MongoDB Documentation: https://www.mongodb.com/docs/
2. Mongoose Documentation: https://mongoosejs.com/docs/
3. Node.js Documentation: https://nodejs.org/docs/
4. Express.js Documentation: https://expressjs.com/
5. React Documentation: https://react.dev/
6. Vite Documentation: https://vite.dev/
7. Render Documentation: https://render.com/docs
8. Vercel Documentation: https://vercel.com/docs
