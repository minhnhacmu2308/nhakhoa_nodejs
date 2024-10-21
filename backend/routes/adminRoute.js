import express from 'express';
import {
  loginAdmin, appointmentsAdmin, appointmentCancel, addDoctor, allDoctors, adminDashboard
  , getSlotById, allSlot, addSlot, updateSlot, deleteSlot,addService
} from '../controllers/adminController.js';
import { changeAvailablity } from '../controllers/doctorController.js';
import authAdmin from '../middleware/authAdmin.js';
import upload from '../middleware/multer.js';
const adminRouter = express.Router();

// API để tạo bảng appointments
adminRouter.get('/createTable', async (req, res) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS appointments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      slotId INT NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      date DATETIME NOT NULL,
      cancelled BOOLEAN DEFAULT false,
      payment BOOLEAN DEFAULT false,
      isCompleted BOOLEAN DEFAULT false
    )
  `;

  try {
    await req.app.locals.db.execute(sql);
    res.send('Bảng appointments đã được tạo hoặc đã tồn tại');
  } catch (err) {
    console.error(err);
    res.status(500).send('Đã xảy ra lỗi khi tạo bảng');
  }
});

adminRouter.post("/login", loginAdmin)
adminRouter.post("/add-doctor", authAdmin, upload.single('image'), addDoctor)
adminRouter.post("/add-service", authAdmin, upload.single('image'), addService)
adminRouter.get("/appointments", appointmentsAdmin)
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel)
adminRouter.get("/all-doctors", authAdmin, allDoctors)
adminRouter.post("/change-availability", authAdmin, changeAvailablity)
adminRouter.get("/dashboard", adminDashboard)
adminRouter.get("/all-slot", authAdmin, allSlot)
adminRouter.post("/add-slot", authAdmin, addSlot)
adminRouter.post("/update-slot", authAdmin, updateSlot)
adminRouter.post("/delete-slot", authAdmin, deleteSlot)
adminRouter.get("/get-slot-by-id", authAdmin, getSlotById)

export default adminRouter;