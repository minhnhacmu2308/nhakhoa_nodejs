import express from 'express';
import { loginDoctor, appointmentsDoctor, appointmentCancel, doctorList, changeAvailablity, appointmentComplete, doctorDashboard, doctorProfile, updateDoctorProfile } from '../controllers/doctorController.js';
import authDoctor from '../middleware/authDoctor.js';
const doctorRouter = express.Router();

doctorRouter.get('/createTable', async (req, res) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS doctors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      image TEXT DEFAULT 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAADwCAYAAAA+VemSAAAACXBIWXMAABCcAAAQnAEmzTo0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAA5uSURBVHgB7d0JchvHFcbxN+C+iaQolmzFsaWqHMA5QXID+wZJTmDnBLZu4BvER4hvYJ/AvoHlimPZRUngvoAg4PkwGJOiuGCd6df9/1UhoJZYJIBvXndPL5ndofljd8NW7bP8y79bZk+tmz8ATFdmu3nWfuiYfdNo2383389e3P5Xb9B82X1qs/YfU3AB1Cuzr+3cnt8U5Mb132i+7n5mc/a9EV4gDF37Z15Qv',
      speciality VARCHAR(255) NOT NULL,
      degree VARCHAR(255) NOT NULL,
      experience VARCHAR(255) NOT NULL,
      about TEXT NOT NULL,
      available BOOLEAN DEFAULT true,
      address VARCHAR(255) NOT NULL,
      date DATETIME NOT NULL
    )
  `;

  try {
    await req.app.locals.db.execute(sql);
    res.send('Bảng doctors đã được tạo hoặc đã tồn tại');
  } catch (err) {
    console.error(err);
    res.status(500).send('Đã xảy ra lỗi khi tạo bảng');
  }
});

doctorRouter.get('/createTable-slot', async (req, res) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS slots (
      id INT AUTO_INCREMENT PRIMARY KEY,
      doctor_id INT NOT NULL,
      slot_date DATE NOT NULL, 
      slot_time TIME NOT NULL, 
      is_booked BOOLEAN DEFAULT false
    )
  `;

  try {
    await req.app.locals.db.execute(sql);
    res.send('Bảng doctors đã được tạo hoặc đã tồn tại');
  } catch (err) {
    console.error(err);
    res.status(500).send('Đã xảy ra lỗi khi tạo bảng');
  }
});

doctorRouter.get('/createTable-docser', async (req, res) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS doc_ser (
      id INT AUTO_INCREMENT PRIMARY KEY,
      doctor_id INT NOT NULL,
      service_id INT NOT NULL 
    )
  `;

  try {
    await req.app.locals.db.execute(sql);
    res.send('Bảng doctors đã được tạo hoặc đã tồn tại');
  } catch (err) {
    console.error(err);
    res.status(500).send('Đã xảy ra lỗi khi tạo bảng');
  }
});

doctorRouter.get('/createTable-service', async (req, res) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS services (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      image TEXT DEFAULT 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAADwCAYAAAA+VemSAAAACXBIWXMAABCcAAAQnAEmzTo0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAA5uSURBVHgB7d0JchvHFcbxN+C+iaQolmzFsaWqHMA5QXID+wZJTmDnBLZu4BvER4hvYJ/AvoHlimPZRUngvoAg4PkwGJOiuGCd6df9/1UhoJZYJIBvXndPL5ndofljd8NW7bP8y79bZk+tmz8ATFdmu3nWfuiYfdNo2383389e3P5Xb9B82X1qs/YfU3AB1Cuzr+3cnt8U5Mb132i+7n5mc/a9EV4gDF37Z15Qv',
      shortdes TEXT NOT NULL,
      description TEXT NOT NULL
    )
  `;

  try {
    await req.app.locals.db.execute(sql);
    res.send('Bảng services đã được tạo hoặc đã tồn tại');
  } catch (err) {
    console.error(err);
    res.status(500).send('Đã xảy ra lỗi khi tạo bảng');
  }
});

doctorRouter.post("/login", loginDoctor)
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel)
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor)
doctorRouter.get("/list", doctorList)
doctorRouter.post("/change-availability", authDoctor, changeAvailablity)
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete)
doctorRouter.get("/dashboard", authDoctor, doctorDashboard)
doctorRouter.get("/profile", authDoctor, doctorProfile)
doctorRouter.post("/update-profile", authDoctor, updateDoctorProfile)

export default doctorRouter;