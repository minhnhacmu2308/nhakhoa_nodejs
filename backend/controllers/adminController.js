import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import userModel from "../models/userModel.js";
import nodemailer from "nodemailer";
import multer from "multer";
import XLSX from "xlsx";
import path from "path";
import fs from "fs";


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads"); // Lưu file vào thư mục uploads
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Đặt tên file theo timestamp
    },
});

// Middleware upload
const uploadA = multer({ storage });

// API tải file Excel
const downloadFileExcel = async (req, res) => {
    const filePath = path.join("./uploads", "template_tamthoi.xlsx"); // Đường dẫn file Excel gốc

    // Kiểm tra file có tồn tại không
    if (!fs.existsSync(filePath)) {
        return res.status(404).send("Không tìm thấy file");
    }

    try {
        // Đọc file Excel gốc, giữ lại cả dữ liệu và định dạng
        const workbook = XLSX.readFile(filePath, { cellStyles: true }); // Thêm option cellStyles để giữ lại định dạng

        // Lấy danh sách bác sĩ từ database
        const [doctors] = await req.app.locals.db.execute(
            "SELECT id doctor_id, name `Tên bác sĩ` FROM doctors"
        );

        // Chuyển đổi danh sách bác sĩ thành sheet
        const doctorSheet = XLSX.utils.json_to_sheet(doctors);

        // Thêm sheet mới vào workbook
        XLSX.utils.book_append_sheet(workbook, doctorSheet, "Danh sách bác sĩ");

        // Lưu workbook vào file tạm thời
        const tempFilePath = path.join("./uploads", "updated_template.xlsx");
        XLSX.writeFile(workbook, tempFilePath);

        // Gửi file Excel với sheet mới
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="template_with_doctors.xlsx"'
        );
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        const fileStream = fs.createReadStream(tempFilePath);
        fileStream.pipe(res);

        // Xóa file tạm sau khi gửi xong
        fileStream.on("close", () => {
            fs.unlinkSync(tempFilePath);
        });
    } catch (error) {
        console.error("Lỗi khi xử lý file Excel:", error);
        res.status(500).send("Lỗi máy chủ nội bộ");
    }
};


const addSlotsFromExcel = async (req, res) => {
    try {
        // Kiểm tra tệp đã được tải lên chưa
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Không có tập tin nào được tải lên' });
        }

        const filePath = path.join("./uploads", req.file.filename);
        console.log(filePath);

        // Đọc tệp Excel
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // Lấy sheet đầu tiên
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        console.log(data);

        if (data.length === 0) {
            return res.status(400).json({ success: false, message: 'Không có dữ liệu nào được tìm thấy trong tập tin' });
        }

        // Lọc và kiểm tra dữ liệu trong tệp
        const slots = [];
        data.forEach(item => {
            const { doctor_id, slot_date, slot_time } = item;

            // Kiểm tra các trường bắt buộc
            if (!doctor_id || !slot_date || !slot_time) {
                return; // Bỏ qua nếu thiếu thông tin
            }

            // Kiểm tra định dạng ngày và giờ
            const validDate = /^\d{4}-\d{2}-\d{2}$/.test(slot_date); // YYYY-MM-DD
            const validTime = /^\d{2}:\d{2}(:\d{2})?$/.test(slot_time); // HH:MM or HH:MM:SS

            if (validDate && validTime) {
                slots.push({ doctor_id, slot_date, slot_time });
            }
        });

        if (slots.length === 0) {
            return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ trong tệp' });
        }

        // Thêm các slot vào cơ sở dữ liệu
        for (const slot of slots) {
            const { doctor_id, slot_date, slot_time } = slot;

            // Kiểm tra xem slot đã tồn tại chưa
            const [existingSlot] = await req.app.locals.db.execute(
                'SELECT * FROM slots WHERE doctor_id = ? AND slot_date = ? AND slot_time = ?',
                [doctor_id, slot_date, slot_time]
            );

            if (existingSlot.length > 0) {
                return res.json({ success: false, message: `Đã có chỗ dành cho bác sĩ ${doctor_id} vào ${slot_date} lúc ${slot_time}` });
            }

            // Thêm slot vào cơ sở dữ liệu
            await req.app.locals.db.execute(
                'INSERT INTO slots (doctor_id, slot_date, slot_time) VALUES (?, ?, ?)',
                [doctor_id, slot_date, slot_time]
            );
        }

        // Xóa file sau khi xử lý
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error("Lỗi khi xóa file:", err);
            } else {
                console.log("File đã được xóa thành công");
            }
        });

        res.json({ success: true, message: 'Các slot đã được thêm thành công' });

    } catch (error) {
        console.log("Lỗi:", error);
        res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi xử lý tệp' });
    }
};


// API for admin login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET);
            res.json({ success: true, token });
        } else if (email === process.env.EMP_EMAIL && password === process.env.EMP_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET);
            res.json({ success: true, token });
        }
        else {
            res.json({ success: false, message: "Thất bại" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};



// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
    try {
        const [appointments] = await req.app.locals.db.execute('SELECT a.*,b.name patname,c.slot_date,c.slot_time,d.name docname,e.title FROM appointments a left join users b on a.userId = b.id left join slots c on a.slotId = c.id left join doctors d on c.doctor_id = d.id left join services e on a.serviceId = e.id ');
        res.json({ success: true, appointments });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get all appointments list
const statisical = async (req, res) => {
    try {
        const [statisical] = await req.app.locals.db.execute(
            "SELECT DATE_FORMAT(date, '%Y-%m') AS month, SUM(amount) AS total_revenue FROM appointments WHERE cancelled = 0 AND isCompleted = 1 GROUP BY DATE_FORMAT(date, '%Y-%m') ORDER BY month DESC;"
        );
        res.json({ success: true, statisical });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// API for admin to cancel appointment
const appointmentCancel = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        // Lấy thông tin cuộc hẹn
        const [appointments] = await req.app.locals.db.execute(
            'SELECT * FROM appointments WHERE id = ?',
            [appointmentId]
        );

        if (appointments.length === 0) {
            return res.json({ success: false, message: 'Appointment not found' });
        }

        const { userId, doctor_id, date } = appointments[0];

        // Cập nhật trạng thái của cuộc hẹn
        await req.app.locals.db.execute('UPDATE appointments SET cancelled = 1 WHERE id = ?', [appointmentId]);
        const { slotId } = appointments[0];
        await req.app.locals.db.execute("UPDATE slots SET is_booked = 0 WHERE id = ?", [slotId]);

        // Lấy thông tin người dùng và bác sĩ
        const [users] = await req.app.locals.db.execute("SELECT * FROM users WHERE id = ?", [userId]);
        const [slots] = await req.app.locals.db.execute("SELECT * FROM slots WHERE id = ?", [slotId]);
        const [doctors] = await req.app.locals.db.execute("SELECT * FROM doctors WHERE id = ?", [slots[0].doctor_id]);

        // Thiết lập và gửi email thông báo hủy
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: '"Nha Khoa Care" <nhakhoa@gmail.com>',
            to: users[0].email,
            subject: 'Lịch hẹn hủy bởi quản trị viên',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
                    <h2 style="color: #333;">Xin chào ${users[0].name},</h2>
                    <p style="font-size: 16px; line-height: 1.5; color: #555;">
                        Chúng tôi rất tiếc phải thông báo với bạn rằng cuộc hẹn của bạn với Bác sĩ <strong>${doctors[0].name}</strong> vào ngày <strong>${date.toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</strong> đã bị đội ngũ hành chính của chúng tôi hủy bỏ.
                    </p>
                    <p style="font-size: 16px; line-height: 1.5; color: #555;">
                        Nếu bạn muốn lên lịch lại, vui lòng liên hệ với chúng tôi hoặc truy cập trang web của chúng tôi.
                    </p>
                    <p style="font-size: 16px; line-height: 1.5; color: #555;">
                        Chúng tôi xin lỗi vì bất kỳ sự bất tiện nào gây ra.
                    </p>
                    <p style="font-size: 14px; line-height: 1.5; color: #777;">
                        Để được hỗ trợ thêm, vui lòng liên hệ với chúng tôi qua email này hoặc số điện thoại hỗ trợ của chúng tôi.
                    </p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: 'Thành công' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const appointmentConfirm = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        // Lấy thông tin cuộc hẹn
        const [appointments] = await req.app.locals.db.execute(
            'SELECT * FROM appointments WHERE id = ?',
            [appointmentId]
        );

        if (appointments.length === 0) {
            return res.json({ success: false, message: 'Không tìm thấy cuộc hẹn' });
        }

        const { userId, doctor_id, date, slotId } = appointments[0];

        // Kiểm tra trạng thái cuộc hẹn xem đã xác nhận hay chưa
        if (appointments[0].confirmed === 1) {
            return res.json({ success: false, message: 'Cuộc hẹn đã được xác nhận' });
        }

        // Cập nhật trạng thái xác nhận cuộc hẹn
        await req.app.locals.db.execute('UPDATE appointments SET isConfirm = 1 WHERE id = ?', [appointmentId]);
        await req.app.locals.db.execute('UPDATE slots SET is_booked = 1 WHERE id = ?', [slotId]);

        // Lấy thông tin người dùng, bác sĩ và slot
        const [users] = await req.app.locals.db.execute('SELECT * FROM users WHERE id = ?', [userId]);
        const [slots] = await req.app.locals.db.execute('SELECT * FROM slots WHERE id = ?', [slotId]);
        const [doctors] = await req.app.locals.db.execute("SELECT * FROM doctors WHERE id = ?", [slots[0].doctor_id]);

        // Thiết lập và gửi email thông báo xác nhận
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: '"Nha Khoa Care" <nhakhoa@gmail.com>',
            to: users[0].email,
            subject: 'Lịch hẹn xác nhận thành công',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
                    <h2 style="color: #333;">Xin chào ${users[0].name},</h2>
                    <p style="font-size: 16px; line-height: 1.5; color: #555;">
                        Chúng tôi vui mừng thông báo rằng cuộc hẹn của bạn với Bác sĩ <strong>${doctors[0].name}</strong> vào ngày <strong>${date.toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</strong> đã được xác nhận.
                    </p>
                    <p style="font-size: 16px; line-height: 1.5; color: #555;">
                        Bạn vui lòng đến đúng giờ và địa điểm để cuộc hẹn được diễn ra thuận lợi.
                    </p>
                    <p style="font-size: 16px; line-height: 1.5; color: #555;">
                        Nếu bạn không thể tham gia cuộc hẹn, xin vui lòng thông báo lại với chúng tôi càng sớm càng tốt để chúng tôi có thể điều chỉnh lịch trình.
                    </p>
                    <p style="font-size: 14px; line-height: 1.5; color: #777;">
                        Để được hỗ trợ thêm, vui lòng liên hệ với chúng tôi qua email này hoặc số điện thoại hỗ trợ của chúng tôi.
                    </p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: 'Cuộc hẹn đã được xác nhận thành công' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Đã xảy ra lỗi: ' + error.message });
    }
};




// API for marking an appointment as completed
const appointmentComplete = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        // Lấy thông tin cuộc hẹn
        const [appointments] = await req.app.locals.db.execute(
            'SELECT * FROM appointments WHERE id = ?',
            [appointmentId]
        );

        if (appointments.length === 0) {
            return res.json({ success: false, message: 'Không tìm thấy cuộc hẹn' });
        }

        const { userId, doctor_id, date } = appointments[0];
        const { slotId } = appointments[0];

        // Cập nhật trạng thái của cuộc hẹn
        await req.app.locals.db.execute('UPDATE appointments SET isCompleted = 1 WHERE id = ?', [appointmentId]);

        // Lấy thông tin người dùng và bác sĩ
        const [users] = await req.app.locals.db.execute("SELECT * FROM users WHERE id = ?", [userId]);
        const [slots] = await req.app.locals.db.execute("SELECT * FROM slots WHERE id = ?", [slotId]);
        const [doctors] = await req.app.locals.db.execute("SELECT * FROM doctors WHERE id = ?", [slots[0].doctor_id]);

        // Thiết lập và gửi email thông báo hoàn tất
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: '"Nha Khoa Care" <nhakhoa@gmail.com>',
            to: users[0].email,
            subject: 'Hoàn thành lịch hẹn',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
                    <h2 style="color: #333;">Chào ${users[0].name},</h2>
                    <p style="font-size: 16px; line-height: 1.5; color: #555;">
                       Chúng tôi vui mừng thông báo với bạn rằng cuộc hẹn của bạn với Bác sĩ <strong>${doctors[0].name}</strong> vào ngày <strong>${date.toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</strong> đã diễn ra thành công.
                    </p>
                    <p style="font-size: 16px; line-height: 1.5; color: #555;">
                        Cảm ơn bạn đã lựa chọn dịch vụ của chúng tôi! Nếu bạn có bất kỳ câu hỏi nào hoặc cần hỗ trợ thêm, vui lòng liên hệ với chúng tôi.
                    </p>
                    <p style="font-size: 14px; line-height: 1.5; color: #777;">
                        Chúng tôi mong được gặp lại bạn!
                    </p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: 'Cuộc hẹn đã được hoàn thành thành công' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Đã xảy ra lỗi: ' + error.message });
    }
};



const addDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, address, services } = req.body;
        const imageFile = req.file;

        // Kiểm tra tất cả các trường bắt buộc
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !address || !services || !imageFile) {
            return res.json({ success: false, message: "Thiếu thông tin" });
        }

        // Kiểm tra email hợp lệ
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Vui lòng nhập email hợp lệ" });
        }

        // Kiểm tra độ dài mật khẩu
        if (password.length < 8) {
            return res.json({ success: false, message: "Vui lòng nhập mật khẩu mạnh hơn (ít nhất 8 ký tự)" });
        }

        // Kiểm tra loại file ảnh
        const allowedFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedFileTypes.includes(imageFile.mimetype)) {
            return res.json({ success: false, message: "Vui lòng tải lên tệp hình ảnh hợp lệ" });
        }

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Upload ảnh lên Cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url;

        // Lưu thông tin bác sĩ vào bảng doctors
        const [doctorResult] = await req.app.locals.db.execute(
            'INSERT INTO doctors (name, email, password, image, speciality, degree, experience, about, address, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, imageUrl, speciality, degree, experience, about, address, new Date()]
        );

        const doctorId = doctorResult.insertId;

        // Thêm dịch vụ vào bảng doc_ser
        const serviceInsertPromises = services.map(serviceId => {
            return req.app.locals.db.execute(
                'INSERT INTO doc_ser (doctor_id, service_id) VALUES (?, ?)',
                [doctorId, serviceId]
            );
        });

        // Chờ tất cả các dịch vụ được thêm vào bảng doc_ser
        await Promise.all(serviceInsertPromises);

        res.json({ success: true, message: 'Thêm bác sĩ thành công' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Đã xảy ra lỗi: ' + error.message });
    }
};




// API for adding Service
const addService = async (req, res) => {
    try {
        const { title, sortdes, fees, describe } = req.body;
        const imageFile = req.file;

        if (!title || !fees || !sortdes) {
            return res.json({ success: false, message: "Missing Infor" });
        }


        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url;

        await req.app.locals.db.execute(
            'INSERT INTO services (title, image, shortdes, description, price) VALUES (?, ?, ?, ?, ?)',
            [title, imageUrl, sortdes, describe, fees]
        );

        res.json({ success: true, message: 'Thành công' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API for adding New
const addNew = async (req, res) => {
    try {
        const { title, sortdes, describe } = req.body;
        const imageFile = req.file;

        if (!title || !describe || !sortdes) {
            return res.json({ success: false, message: "Missing Infor" });
        }


        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url;

        await req.app.locals.db.execute(
            'INSERT INTO news (title, image, shortdes, description) VALUES (?, ?, ?, ?)',
            [title, imageUrl, sortdes, describe]
        );

        res.json({ success: true, message: 'Thành công' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
    try {
        const [doctors] = await req.app.locals.db.execute('SELECT id, name, speciality, degree, experience, about, available, address, image FROM doctors');
        res.json({ success: true, doctors });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {
        const [doctors] = await req.app.locals.db.execute('SELECT id FROM doctors');
        const [users] = await req.app.locals.db.execute('SELECT id FROM users');
        const [appointments] = await req.app.locals.db.execute('SELECT * FROM appointments');

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse()
        };

        res.json({ success: true, dashData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to add a new slot
const addSlot = async (req, res) => {
    try {
        const { doctorId, slotDate, slotTime } = req.body;

        // Validate required fields
        if (!doctorId || !slotDate || !slotTime) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc" });
        }

        // Validate slotDate format (YYYY-MM-DD)
        const validDate = /^\d{4}-\d{2}-\d{2}$/.test(slotDate);
        // Validate slotTime format (HH:MM or HH:MM:SS)
        const validTime = /^\d{2}:\d{2}(:\d{2})?$/.test(slotTime);

        if (!validDate || !validTime) {
            return res.status(400).json({ success: false, message: "Định dạng ngày giờ không hợp lệ" });
        }

        // Check if the slot already exists for the doctor at the specified date and time
        const [existingSlot] = await req.app.locals.db.execute(
            'SELECT * FROM slots WHERE doctor_id = ? AND slot_date = ? AND slot_time = ?',
            [doctorId, slotDate, slotTime]
        );

        if (existingSlot.length > 0) {
            return res.status(400).json({ success: false, message: "Slot đã tồn tại cho bác sĩ vào thời gian này" });
        }

        // Insert new slot into the database
        await req.app.locals.db.execute(
            'INSERT INTO slots (doctor_id, slot_date, slot_time) VALUES (?, ?, ?)',
            [doctorId, slotDate, slotTime]
        );

        res.status(200).json({ success: true, message: "Thêm lịch hẹn thành công" });
    } catch (error) {
        console.error("Error adding slot:", error);
        res.status(500).json({ success: false, message: "Đã xảy ra lỗi. Vui lòng thử lại sau." });
    }
};



const updateSlot = async (req, res) => {
    try {
        const { id, doctorId, slotDate, slotTime } = req.body;

        // Validate required fields
        if (!id || !doctorId || !slotDate || !slotTime) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc" });
        }

        // Validate slot_date and slot_time formats
        const validDate = /^\d{4}-\d{2}-\d{2}$/.test(slotDate);
        const validTime = /^\d{2}:\d{2}(:\d{2})?$/.test(slotTime);

        if (!validDate || !validTime) {
            return res.status(400).json({ success: false, message: "Định dạng ngày giờ không hợp lệ" });
        }

        // Check if the slot exists before updating
        const [existingSlot] = await req.app.locals.db.execute(
            'SELECT * FROM slots WHERE id = ?',
            [id]
        );

        if (existingSlot.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy slot với ID này" });
        }

        // Check for duplicate slot after the update (same doctor, date, time)
        const [duplicateSlot] = await req.app.locals.db.execute(
            'SELECT * FROM slots WHERE doctor_id = ? AND slot_date = ? AND slot_time = ? AND id != ?',
            [doctorId, slotDate, slotTime, id]
        );

        if (duplicateSlot.length > 0) {
            return res.status(400).json({ success: false, message: "Slot đã tồn tại cho bác sĩ vào thời gian này" });
        }

        // Update the slot in the database
        await req.app.locals.db.execute(
            'UPDATE slots SET doctor_id = ?, slot_date = ?, slot_time = ? WHERE id = ?',
            [doctorId, slotDate, slotTime, id]
        );

        res.status(200).json({ success: true, message: "Lịch hẹn đã được cập nhật thành công" });
    } catch (error) {
        console.error("Error updating slot:", error);
        res.status(500).json({ success: false, message: "Đã xảy ra lỗi. Vui lòng thử lại sau." });
    }
};


// API to delete a slot
const deleteSlot = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Slot ID is required" });
        }

        // Delete the slot from the database
        await req.app.locals.db.execute('DELETE FROM slots WHERE id = ?', [id]);

        res.json({ success: true, message: "Slot xóa thành công" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// API to get all slots
const allSlot = async (req, res) => {
    try {
        const [slots] = await req.app.locals.db.execute('SELECT * FROM slots');

        res.json({ success: true, slots });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get a slot by ID
const getSlotById = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Slot ID is required" });
        }

        const [slot] = await req.app.locals.db.execute('SELECT * FROM slots WHERE id = ?', [id]);

        if (slot.length === 0) {
            return res.status(404).json({ success: false, message: "Slot not found" });
        }

        res.json({ success: true, slot: slot[0] });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


export {
    loginAdmin,
    statisical,
    appointmentsAdmin,
    appointmentCancel,
    appointmentConfirm,
    appointmentComplete,
    addDoctor,
    allDoctors,
    adminDashboard,
    addSlot,
    updateSlot,
    deleteSlot,
    allSlot,
    getSlotById,
    addService,
    addNew,
    addSlotsFromExcel,
    uploadA,
    downloadFileExcel
}