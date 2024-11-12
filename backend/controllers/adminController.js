import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import userModel from "../models/userModel.js";
import nodemailer from 'nodemailer';

// API for admin login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET);
            res.json({ success: true, token });
        } else  if (email === process.env.EMP_EMAIL && password === process.env.EMP_PASSWORD) { 
                const token = jwt.sign(email + password, process.env.JWT_SECRET);
                res.json({ success: true, token });
        } 
        else {
            res.json({ success: false, message: "Invalid credentials" });
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
            return res.json({ success: false, message: 'Appointment not found' });
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
                    <h2 style="color: #333;">Hi ${users[0].name},</h2>
                    <p style="font-size: 16px; line-height: 1.5; color: #555;">
                       Chúng tôi vui mừng thông báo với bạn rằng cuộc hẹn của bạn với Bác sĩ <strong>${doctors[0].name}</strong> vào ngày <strong>${date.toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</strong> đã diễn ra thành công
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

        res.json({ success: true, message: 'Thành công' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// API for adding Doctor
const addDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, address, services } = req.body;
        const imageFile = req.file;

        if (!name || !email || !password || !speciality || !degree || !experience || !about || !address || !services) {
            return res.json({ success: false, message: "Missing Details" });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

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

        res.json({ success: true, message: 'Thành công' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};




// API for adding Service
const addService = async (req, res) => {
    try {
        const { title, sortdes,fees,describe } = req.body;
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
        const { title, sortdes,describe } = req.body;
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
        console.log(req.body);
        const { doctorId, slotDate, slotTime } = req.body; // Cập nhật trường từ camelCase

        // Validate slot_date and slot_time
        if (!doctorId || !slotDate || !slotTime) {
            return res.json({ success: false, message: "Missing required fields" });
        }

        const validDate = /^\d{4}-\d{2}-\d{2}$/.test(slotDate); // YYYY-MM-DD
        const validTime = /^\d{2}:\d{2}(:\d{2})?$/.test(slotTime); // HH:MM or HH:MM:SS

        if (!validDate || !validTime) {
            return res.json({ success: false, message: "Invalid date or time format" });
        }

        // Check for duplicate slot
        const [existingSlot] = await req.app.locals.db.execute(
            'SELECT * FROM slots WHERE doctor_id = ? AND slot_date = ? AND slot_time = ?',
            [doctorId, slotDate, slotTime]
        );
        console.log("existingSlot", existingSlot)
        if (existingSlot.length > 0) {
            return res.json({ success: false, message: "Slot already exists for this doctor on the selected date and time" });
        }

        // Insert into the database
        await req.app.locals.db.execute(
            'INSERT INTO slots (doctor_id, slot_date, slot_time) VALUES (?, ?, ?)',
            [doctorId, slotDate, slotTime] // Cập nhật trường tại đây
        );

        res.json({ success: true, message: "Thành công" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// API to update an existing slot
const updateSlot = async (req, res) => {
    try {
        const { id, doctorId, slotDate, slotTime } = req.body; // Cập nhật trường từ camelCase

        // Validate slot_date and slot_time
        if (!id || !doctorId || !slotDate || !slotTime) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const validDate = /^\d{4}-\d{2}-\d{2}$/.test(slotDate);
        const validTime = /^\d{2}:\d{2}(:\d{2})?$/.test(slotTime);

        if (!validDate || !validTime) {
            return res.status(400).json({ success: false, message: "Invalid date or time format" });
        }

        // Update the slot in the database
        await req.app.locals.db.execute(
            'UPDATE slots SET doctor_id = ?, slot_date = ?, slot_time = ? WHERE id = ?',
            [doctorId, slotDate, slotTime, id] // Cập nhật trường tại đây
        );

        res.json({ success: true, message: "Slot updated successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
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

        res.json({ success: true, message: "Slot deleted successfully" });
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
    appointmentsAdmin,
    appointmentCancel,
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
    addNew
}