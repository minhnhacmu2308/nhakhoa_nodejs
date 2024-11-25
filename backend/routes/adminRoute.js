import express from 'express';
import {
  loginAdmin, appointmentsAdmin, appointmentCancel, appointmentConfirm, addDoctor,editDoctor, allDoctors, adminDashboard
  , getSlotById, allSlot, addSlot, updateSlot, deleteSlot, addService,editService,editNews, appointmentComplete, addNew, addSlotsFromExcel, uploadA, downloadFileExcel, statisical
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
      serviceId INT NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      date DATETIME NOT NULL,
      cancelled BOOLEAN DEFAULT false,
      payment BOOLEAN DEFAULT false,
      isCompleted BOOLEAN DEFAULT false,
      isReview BOOLEAN DEFAULT false,
      isConfirm BOOLEAN DEFAULT false
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
adminRouter.post('/edit-doctor/:id', upload.single('image'), editDoctor)
adminRouter.post("/add-slot-excel", authAdmin, uploadA.single('file'), addSlotsFromExcel)
adminRouter.post("/add-service", authAdmin, upload.single('image'), addService)
adminRouter.put('/edit-service', upload.single('image'), editService);
adminRouter.put('/edit-news', upload.single('image'), editNews);
adminRouter.post("/add-news", authAdmin, upload.single('image'), addNew)
adminRouter.get("/appointments", appointmentsAdmin)
adminRouter.get("/monthly", statisical)
adminRouter.post("/cancel-appointment", appointmentCancel)
adminRouter.post("/confirm-appointment", appointmentConfirm)
adminRouter.post("/complete-appointment", appointmentComplete)
adminRouter.get("/all-doctors", authAdmin, allDoctors)
adminRouter.post("/change-availability", authAdmin, changeAvailablity)
adminRouter.get("/dashboard", adminDashboard)
adminRouter.get("/all-slot", authAdmin, allSlot)
adminRouter.post("/add-slot", authAdmin, addSlot)
adminRouter.post("/update-slot", authAdmin, updateSlot)
adminRouter.post("/delete-slot", authAdmin, deleteSlot)
adminRouter.get("/get-slot-by-id", authAdmin, getSlotById)
adminRouter.get("/download-excel", authAdmin, downloadFileExcel)


export default adminRouter;