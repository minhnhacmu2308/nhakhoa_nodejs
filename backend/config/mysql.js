// db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: 3308
    });

    console.log("Database Connected");

    // Bạn có thể thêm các sự kiện hoặc thao tác khác tại đây nếu cần

    return connection;
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1); // Thoát ứng dụng nếu kết nối thất bại
  }
}

export default connectDB;
