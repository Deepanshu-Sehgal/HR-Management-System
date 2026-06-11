# 💼 HR Management System (MERN Stack)

An end-to-end Human Resource Management System developed using the MERN stack (MongoDB, Express.js, React.js, Node.js). The system simplifies HR operations like employee management, attendance tracking, leave handling, and payroll management — all in one place.

---

## 🚀 Features

- 🔐 Role-Based Authentication (Admin, HR, Employee)
- 👤 Employee Management (Add, Update, Delete, View)
- 🕒 Attendance Tracking with In/Out Timings
- 📅 Leave Management System
- 💰 Payroll Generation and Salary Slips
- 📊 HR Dashboard with Analytics and Reports
- 📧 Email Notifications for Leave and Payroll Actions
- 📁 Document Upload (Resume, Offer Letters, etc.)

---

## 🛠 Tech Stack

| Layer      | Technology              |
|------------|--------------------------|
| Frontend   | React.js, Redux, TailwindCSS/Bootstrap |
| Backend    | Node.js, Express.js      |
| Database   | MongoDB (Mongoose)       |
| Authentication | JWT (JSON Web Tokens) |
| Deployment | Vercel (Frontend) + Render/Heroku (Backend) |

---

## 📂 Project Structure
```
hr-management-system/
│
├── backend/                # Express.js REST API
│   ├── models/             # Mongoose Schemas
│   ├── routes/             # Route definitions
│   ├── controllers/        # Business logic
│   └── middleware/         # Auth & Error handlers
│
├── frontend/               # React.js Frontend
│   ├── components/         # UI Components
│   ├── pages/              # Page Views
│   └── redux/              # State Management
│
├── .env                    # Environment Variables
├── package.json
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/YourUsername/hr-management-system.git
cd hr-management-system
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
npm start
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm start
```

### 4️⃣ Environment Variables

Create \`.env\` files in both \`frontend/\` and \`backend/\` directories:

#### 🔐 Backend \`.env\`

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

#### 🌐 Frontend \`.env\`

```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🔗 API Endpoints (Sample)

| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| POST   | /api/auth/login           | User Login               |
| POST   | /api/employees            | Add New Employee         |
| GET    | /api/employees            | List All Employees       |
| PUT    | /api/employees/:id        | Update Employee          |
| DELETE | /api/employees/:id        | Delete Employee          |
| POST   | /api/attendance/mark      | Mark Attendance          |
| POST   | /api/leave/apply          | Apply for Leave          |
| GET    | /api/payroll/generate     | Generate Payroll         |

---

## ✨ Future Enhancements

- 📱 Mobile App Integration (React Native)
- 🧠 AI-based Leave/Resignation Prediction
- 👁️‍🗨️ Face Recognition for Attendance
- 📈 Performance Tracking and Appraisals
- 🔗 Integration with Slack/Teams

---

## 📸 Demo

_Demo video or screenshots will be added soon._

---

## 🤝 Contributor

- **Deepanshu Sehgal**  
  [GitHub](https://github.com/Deepanshu-Sehgal) | [LinkedIn](https://linkedin.com/in/your-profile)

---

## 📩 Contact

If you have any feedback or questions, feel free to reach out:  
📧 **deepanshu20@s.amity.edu**

---

## 📄 License

This project is licensed under the **MIT License**.
