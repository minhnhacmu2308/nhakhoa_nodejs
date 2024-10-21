import express from 'express';
import { serviceList, serviceDetail } from '../controllers/serviceController.js';
const serviceRouter = express.Router();

serviceRouter.get('/createTable-service', async (req, res) => {
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


serviceRouter.get("/list", serviceList)
serviceRouter.get("/detail", serviceDetail)

export default serviceRouter;