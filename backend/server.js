import express from "express";
import cors from 'cors';
import 'dotenv/config';
import connectDB from "./config/mysql.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import adminRouter from "./routes/adminRoute.js";
import serviceRouter from "./routes/serviceRoute.js";

// app config
const app = express();
const port = process.env.PORT || 4000;

// Kết nối tới MySQL khi khởi động ứng dụng
connectDB().then((connection) => {
  // Lưu connection vào app.locals để sử dụng sau này
  app.locals.db = connection;

  // Khởi động server sau khi kết nối thành công
  app.listen(port, () => {
    console.log(`Server chạy trên cổng ${port}`);
  });
}).catch((error) => {
  console.error("Không thể kết nối tới cơ sở dữ liệu:", error);
});

connectCloudinary();

// middlewares
app.use(express.json());
app.use(cors());

// api endpoints
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/service", serviceRouter);

app.get("/", (req, res) => {
  res.send("API is working");
});

// Xóa bỏ lần gọi app.listen thứ hai vì server đã được khởi động trong khối connectDB
