import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { v2 as cloudinary } from 'cloudinary'
import stripe from "stripe";
import razorpay from 'razorpay';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import axios from 'axios';
import https from 'https';


// Gateway Initialize
const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)
const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// API đăng ký người dùng
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Cần điền đầy đủ thông tin' });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Vui lòng nhập đúng định dạng email" });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Vui lòng nhập mật khẩu hơn 8 ký tự" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            name,
            email,
            password: hashedPassword,
        };

        // Thêm người dùng mới vào cơ sở dữ liệu
        await req.app.locals.db.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name, email, hashedPassword]
        );

        const [newUser] = await req.app.locals.db.execute(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        const token = jwt.sign({ id: newUser[0].id }, process.env.JWT_SECRET);

        res.json({ success: true, token });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API thêm người dùng mới
const addUser = async (req, res) => {
    try {
        const { name, email, password, phone, address, gender, dob } = req.body;

        // Kiểm tra dữ liệu bắt buộc
        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Thiếu thông tin bắt buộc' });
        }

        // Kiểm tra email hợp lệ
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Vui lòng nhập email hợp lệ" });
        }

        // Kiểm tra độ dài mật khẩu
        if (password.length < 8) {
            return res.json({ success: false, message: "Vui lòng nhập mật khẩu mạnh" });
        }

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Thêm người dùng mới vào cơ sở dữ liệu
        await req.app.locals.db.execute(
            "INSERT INTO users (name, email, password, phone, address, gender, dob) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [name, email, hashedPassword, phone, address, gender, dob]
        );

        res.json({ success: true, message: 'Thêm người dùng thành công' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
    }
};

// API chỉnh sửa thông tin người dùng
const editUser = async (req, res) => {
    try {
        const { userId, name, phone, address, dob, gender } = req.body;

        // Kiểm tra dữ liệu bắt buộc
        if (!userId || !name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Thiếu thông tin bắt buộc" });
        }

        // Cập nhật thông tin người dùng
        await req.app.locals.db.execute(
            "UPDATE users SET name = ?, phone = ?, address = ?, dob = ?, gender = ? WHERE id = ?",
            [name, phone, address, dob, gender, userId]
        );

        res.json({ success: true, message: 'Cập nhật thông tin người dùng thành công' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
    }
};



// API to login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Truy vấn để tìm người dùng theo email
        const [users] = await req.app.locals.db.execute(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.json({ success: false, message: "Người dùng không tồn tại" });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "Thông tin xác thực không hợp lệ" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get user profile data
const getProfile = async (req, res) => {
    try {
        const { userId } = req.body;

        // Truy vấn lấy thông tin người dùng, loại bỏ trường `password`
        const [users] = await req.app.locals.db.execute(
            "SELECT id, name, email, phone, address, dob, gender FROM users WHERE id = ?",
            [userId]
        );

        if (users.length === 0) {
            return res.json({ success: false, message: "Người dùng không được tìm thấy" });
        }

        res.json({ success: true, userData: users[0] });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get feedback data by doctor ID
// API to get feedback data by doctor ID with service name
const getFeedbacksByDoctor = async (req, res) => {
    try {
        const { doctorId } = req.query;

        // Truy vấn lấy thông tin feedback, người dùng và tên dịch vụ
        const [feedbacks] = await req.app.locals.db.execute(
            `SELECT 
                f.id, 
                f.userId, 
                u.name AS userName, 
                u.email, 
                u.image,
                f.serviceId, 
                s.title AS serviceName,  -- Lấy tên dịch vụ
                f.rate, 
                f.comment,
                f.date
             FROM feedbacks f
             JOIN users u ON f.userId = u.id
             JOIN services s ON f.serviceId = s.id  -- Kết nối với bảng services
             WHERE f.serviceId IN (
                SELECT service_id
                FROM doc_ser
                WHERE doctor_id = ?
             )`,
            [doctorId]
        );

        if (feedbacks.length === 0) {
            return res.json({ success: false, message: "Không tìm thấy feedback cho bác sĩ này" });
        }

        res.json({ success: true, feedbackData: feedbacks });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};




// API to update user profile
const updateProfile = async (req, res) => {
    try {
        const { userId, name, phone, address, dob, gender } = req.body;
        const imageFile = req.file;

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Cần điền đầy đủ thông tin" });
        }

        await req.app.locals.db.execute(
            "UPDATE users SET name = ?, phone = ?, address = ?, dob = ?, gender = ? WHERE id = ?",
            [name, phone, address, dob, gender, userId]
        );

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            const imageURL = imageUpload.secure_url;

            await req.app.locals.db.execute(
                "UPDATE users SET image = ? WHERE id = ?",
                [imageURL, userId]
            );
        }

        res.json({ success: true, message: 'Cập nhập thông tin thành công' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// API to book appointment 
const bookAppointment = async (req, res) => {
    try {
        const { userId, docId, slotDate, slotTime, serviceId } = req.body;
        const dateSlot = new Date(slotDate);
        const formattedDate = `${dateSlot.getFullYear()}-${(dateSlot.getMonth() + 1).toString().padStart(2, '0')}-${dateSlot.getDate().toString().padStart(2, '0')}`;

        // Kiểm tra bác sĩ có sẵn không
        const [doctors] = await req.app.locals.db.execute(
            "SELECT * FROM doctors WHERE id = ? and available = 1",
            [docId]
        );

        // Kiểm tra người dùng
        const [users] = await req.app.locals.db.execute(
            "SELECT * FROM users WHERE id = ?",
            [userId]
        );

        if (doctors.length === 0) {
            return res.json({ success: false, message: 'Bác sĩ không có săn' });
        }

        // Kiểm tra slot
        const [slot] = await req.app.locals.db.execute(
            "SELECT * FROM slots WHERE slot_date = ? and slot_time = ? and doctor_id = ?",
            [formattedDate, slotTime, docId]
        );

        const now = new Date(Date.now());
        const dateNow = now.toISOString().slice(0, 19).replace('T', ' ');

        const [services] = await req.app.locals.db.execute(
            "SELECT * FROM services WHERE id = ?",
            [serviceId]
        );

        // Chèn vào bảng appointments
        await req.app.locals.db.execute(
            "INSERT INTO appointments (userId, slotId, amount, date, serviceId) VALUES (?, ?, ?, ?, ?)",
            [userId, slot[0].id, services[0].price, dateNow, serviceId]
        );

        // Cập nhật trạng thái slot
        await req.app.locals.db.execute(
            "UPDATE slots SET is_booked = 1 WHERE id = ?",
            [slot[0].id]
        );

        // Gửi email thông báo
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Địa chỉ email của bạn
                pass: process.env.EMAIL_PASS  // Mật khẩu hoặc token ứng dụng của bạn
            }
        });
        const mailOptions = {
            from: '"Nha Khoa Care" <nhakhoa@gmail.com>', // Địa chỉ email của bạn
            to: users[0].email, // Địa chỉ email của người dùng
            subject: 'Đặt lịch hẹn thành công',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
                    <h2 style="color: #333;">Xin chào ${users[0].name},</h2>
                    <p style="font-size: 16px; line-height: 1.5; color: #555;">
                        Bạn đã đặt lịch hẹn thành công với bác sĩ <strong>${doctors[0].name}</strong> vào ngày <strong>${formattedDate}</strong> lúc <strong>${slotTime}</strong>.
                    </p>
                    <p style="font-size: 16px; line-height: 1.5; color: #555;">
                        Vui lòng đến đúng giờ để đảm bảo cuộc hẹn diễn ra thuận lợi.
                    </p>
                    <p style="font-size: 16px; line-height: 1.5; color: #555;">
                        Cảm ơn bạn đã tin tưởng và lựa chọn Nha Khoa Care!
                    </p>
                    <p style="font-size: 14px; line-height: 1.5; color: #777;">
                        Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua email này hoặc số điện thoại hỗ trợ.
                    </p>
                </div>
            `,
        };



        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: 'Đã đặt lịch hẹn và đã gửi email' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


const editAppointment = async (req, res) => {
    try {
        const { appointmentId, slotDate, slotTime, serviceId, doctorId } = req.body;

        const dateSlot = new Date(slotDate);
        const formattedDate = `${dateSlot.getFullYear()}-${(dateSlot.getMonth() + 1).toString().padStart(2, '0')}-${dateSlot.getDate().toString().padStart(2, '0')}`;

        // Kiểm tra bác sĩ có sẵn không
        const [doctors] = await req.app.locals.db.execute(
            "SELECT * FROM doctors WHERE id = ? and available = 1",
            [doctorId]
        );

        if (doctors.length === 0) {
            return res.json({ success: false, message: 'Bác sĩ hiện không có sẵn' });
        }

        // Kiểm tra cuộc hẹn có tồn tại không
        const [appointment] = await req.app.locals.db.execute(
            "SELECT * FROM appointments WHERE id = ?",
            [appointmentId]
        );

        // Kiểm tra slot
        const [slot] = await req.app.locals.db.execute(
            "SELECT * FROM slots WHERE slot_date = ? and slot_time = ? and doctor_id = ?",
            [formattedDate, slotTime, doctorId]
        );

        if (slot[0].id === appointment[0].slotId && appointment[0].serviceId === serviceId) {
            return res.json({ success: false, message: 'Không có thay đổi nào' });
        }

        if (appointment.length === 0) {
            return res.json({ success: false, message: 'Không tìm thấy cuộc hẹn' });
        }

        // Kiểm tra thông tin người dùng và bác sĩ
        const [users] = await req.app.locals.db.execute("SELECT * FROM users WHERE id = ?", [appointment[0].userId]);

        if (slot.length === 0) {
            return res.json({ success: false, message: 'Khung giờ đã được đặt, vui lòng chọn thời gian khác' });
        }

        // Cập nhật thông tin cuộc hẹn
        await req.app.locals.db.execute(
            "UPDATE appointments SET slotId = ?, serviceId = ? WHERE id = ?",
            [slot[0].id, serviceId, appointmentId]
        );

        // Cập nhật trạng thái slot mới và cũ
        if (slot[0].id !== appointment[0].slotId) {
            await req.app.locals.db.execute("UPDATE slots SET is_booked = 1 WHERE id = ?", [slot[0].id]);
            await req.app.locals.db.execute("UPDATE slots SET is_booked = 0 WHERE id = ?", [appointment[0].slotId]);
        }

        // Thiết lập và gửi email thông báo
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
            subject: 'Cập nhật lịch hẹn thành công',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
                    <h2 style="color: #333;">Xin chào ${users[0].name},</h2>
                    <p style="font-size: 16px; line-height: 1.5; color: #555;">
                        Lịch hẹn của bạn với bác sĩ <strong>${doctors[0].name}</strong> đã được cập nhật thành công vào ngày <strong>${formattedDate}</strong> lúc <strong>${slotTime}</strong>.
                    </p>
                    <p style="font-size: 16px; line-height: 1.5; color: #555;">
                        Vui lòng đến đúng giờ để đảm bảo cuộc hẹn diễn ra thuận lợi.
                    </p>
                    <p style="font-size: 16px; line-height: 1.5; color: #555;">
                        Cảm ơn bạn đã tin tưởng và lựa chọn Nha Khoa Care!
                    </p>
                    <p style="font-size: 14px; line-height: 1.5; color: #777;">
                        Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua email này hoặc số điện thoại hỗ trợ.
                    </p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: 'Cập nhật lịch hẹn thành công và email đã được gửi' });
    } catch (error) {
        res.json({ success: false, message: `Lỗi: ${error.message}` });
    }
};


const cancelAppointment = async (req, res) => {
    try {
        const { userId, appointmentId } = req.body;
        console.log(userId, appointmentId);

        // Lấy thông tin cuộc hẹn
        const [appointments] = await req.app.locals.db.execute(
            "SELECT * FROM appointments WHERE id = ?",
            [appointmentId]
        );

        if (appointments.length === 0 || appointments[0].userId !== userId) {
            return res.json({ success: false, message: 'Không được phép thực hiện hành động này' });
        }

        // Cập nhật trạng thái của cuộc hẹn và slot
        await req.app.locals.db.execute("UPDATE appointments SET cancelled = true WHERE id = ?", [appointmentId]);
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
            subject: 'Hủy lịch hẹn thành công',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
                    <h2 style="color: #333;">Xin chào ${users[0].name},</h2>
                    <p style="font-size: 16px; line-height: 1.5; color: #555;">
                        Cuộc hẹn của bạn với bác sĩ <strong>${doctors[0].name}</strong> vào ngày <strong>${appointments[0].date}</strong> đã được hủy thành công.
                    </p>
                    <p style="font-size: 16px; line-height: 1.5; color: #555;">
                        Chúng tôi rất tiếc khi biết rằng bạn không thể tham gia cuộc hẹn. Nếu bạn muốn đặt lại, vui lòng truy cập website của chúng tôi hoặc liên hệ trực tiếp.
                    </p>
                    <p style="font-size: 16px; line-height: 1.5; color: #555;">
                        Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.
                    </p>
                    <p style="font-size: 14px; line-height: 1.5; color: #777;">
                        Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email này hoặc số điện thoại hỗ trợ.
                    </p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: 'Đã hủy lịch hẹn và gửi email thông báo' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: `Lỗi: ${error.message}` });
    }
};



// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
    try {
        const { userId } = req.body;

        // Câu truy vấn để lấy thông tin chi tiết về các cuộc hẹn
        const [appointments] = await req.app.locals.db.execute(
            `SELECT 
                a.id AS appointment_id,
                u.name AS user_name,
                d.image,
                u.address AS user_address,
                s.slot_date,
                s.slot_time,
                s.doctor_id AS doctor_id,
                sv.title AS service_name,
                sv.id as service_id,
                d.name AS doctor_name,
                d.speciality,
                d.address AS doctor_address,
                ds.services,
                a.amount,
                a.cancelled,
                a.payment,
                a.isCompleted,
                a.isReview,
                a.isConfirm
            FROM 
                appointments a
            JOIN 
                users u ON a.userId = u.id
            JOIN 
                slots s ON a.slotId = s.id
            JOIN 
                doctors d ON s.doctor_id = d.id
            JOIN 
                services sv ON a.serviceId = sv.id
            LEFT JOIN 
            (SELECT a.id doctor_id, GROUP_CONCAT(c.id ORDER BY c.id SEPARATOR ', ') AS services FROM doctors a LEFT JOIN doc_ser b ON a.id = b.doctor_id LEFT JOIN services c ON b.service_id = c.id GROUP BY a.id) ds on d.id = ds.doctor_id
            WHERE 
                a.userId = ? 
            ORDER BY 
                s.slot_date ASC, s.slot_time ASC`,
            [userId]
        );

        res.json({ success: true, appointments });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// API to make payment of appointment using razorpay
const paymentRazorpay = async (req, res) => {
    try {

        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' })
        }

        // creating options for razorpay payment
        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId,
        }

        // creation of an order
        const order = await razorpayInstance.orders.create(options)

        res.json({ success: true, order })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to verify payment of razorpay
const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id } = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if (orderInfo.status === 'paid') {
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true })
            res.json({ success: true, message: "Payment Successful" })
        }
        else {
            res.json({ success: false, message: 'Payment Failed' })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to make payment of appointment using Stripe
const paymentStripe = async (req, res) => {
    try {

        const { appointmentId } = req.body
        const { origin } = req.headers

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' })
        }

        const currency = process.env.CURRENCY.toLocaleLowerCase()

        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: "Appointment Fees"
                },
                unit_amount: appointmentData.amount * 100
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&appointmentId=${appointmentData._id}`,
            cancel_url: `${origin}/verify?success=false&appointmentId=${appointmentData._id}`,
            line_items: line_items,
            mode: 'payment',
        })

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const verifyStripe = async (req, res) => {
    try {

        const { appointmentId, success } = req.body

        if (success === "true") {
            await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true })
            return res.json({ success: true, message: 'Payment Successful' })
        }

        res.json({ success: false, message: 'Payment Failed' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

const allSlotUser = async (req, res) => {
    try {
        const [slots] = await req.app.locals.db.execute('SELECT * FROM slots WHERE slot_date > CURRENT_DATE OR (slot_date = CURRENT_DATE AND slot_time > CURRENT_TIME) order by slot_date,slot_time');
        res.json({ success: true, slots });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        console.log("email", email);

        // Kiểm tra email đầu vào
        if (!email) {
            return res.status(400).json({ success: false, message: "Vui lòng cung cấp email" });
        }

        // Kiểm tra xem email có tồn tại trong cơ sở dữ liệu không
        const [user] = await req.app.locals.db.execute("SELECT * FROM users WHERE email = ?", [email]);

        if (user.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng với email này" });
        }

        // Tạo mật khẩu mới, ví dụ: "123456789"
        const newPassword = generatePassword();

        // Mã hóa mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Cập nhật mật khẩu mới trong cơ sở dữ liệu
        await req.app.locals.db.execute(
            "UPDATE users SET password = ? WHERE email = ?",
            [hashedPassword, email]
        );

        // Cấu hình transporter để gửi email bằng Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Địa chỉ email của bạn
                pass: process.env.EMAIL_PASS  // Mật khẩu hoặc token ứng dụng của bạn
            }
        });

        // Tạo nội dung email
        const mailOptions = {
            from: "nhakhoa@gmail.com",
            to: email,
            subject: 'Mật khẩu mới của bạn',
            text: `Mật khẩu của bạn đã được đặt lại. Mật khẩu mới của bạn là: ${newPassword}`
        };

        // Gửi email chứa mật khẩu mới
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Lỗi khi gửi email: ", err);
                return res.status(500).json({ success: false, message: "Lỗi khi gửi email" });
            } else {
                console.log("Email đã được gửi: " + info.response);
            }
        });

        res.json({ success: true, message: "Mật khẩu mới đã được gửi tới email của bạn" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: `Lỗi: ${error.message}` });
    }
};


const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        // Xác thực token từ request headers
        const token = req.headers.token;
        if (!token) {
            return res.status(401).json({ success: false, message: 'Không được phép truy cập' });
        }

        // Giải mã token để lấy thông tin người dùng
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Kiểm tra xem người dùng có tồn tại trong cơ sở dữ liệu
        const [user] = await req.app.locals.db.execute(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );

        if (!user.length) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        // Kiểm tra mật khẩu cũ có khớp không
        const isMatch = await bcrypt.compare(oldPassword, user[0].password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Mật khẩu cũ không đúng' });
        }

        // Kiểm tra độ dài mật khẩu mới
        if (newPassword.length < 8) {
            return res.json({ success: false, message: 'Mật khẩu mới phải có ít nhất 8 ký tự' });
        }

        // Hash mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Cập nhật mật khẩu mới vào cơ sở dữ liệu
        await req.app.locals.db.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, userId]
        );

        res.json({ success: true, message: 'Thay đổi mật khẩu thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};


const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';

    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }

    return password;
};

const userList = async (req, res) => {
    try {
        const [users] = await req.app.locals.db.execute('SELECT * FROM users');
        res.json({ success: true, users });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Hàm tạo đơn thanh toán MoMo
const createMoMoPayment = async (req, res) => {
    const { appointmentId } = req.body;
    // Lấy thông tin cuộc hẹn
    const [appointments] = await req.app.locals.db.execute(
        "SELECT * FROM appointments WHERE id = ?",
        [appointmentId]
    );

    function removeDecimalPart(numberString) {
        return numberString.includes(".") ? numberString.split(".")[0] : numberString;
    }


    //https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method
    //parameters
    var accessKey = 'F8BBA842ECF85';
    var secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    var orderInfo = 'Thanh toán chi phí tại nha khoa';
    var partnerCode = 'MOMO';
    var redirectUrl = 'http://localhost:5173/my-appointments';
    var ipnUrl = 'http://localhost:5173/my-appointments';
    var requestType = "payWithMethod";
    var amount = removeDecimalPart(appointments[0].amount.toString());
    var orderId = partnerCode + new Date().getTime();
    var requestId = appointmentId;
    var extraData = '';
    var paymentCode = 'T8Qii53fAXyUftPV3m9ysyRhEanUs9KlOPfHgpMR0ON50U10Bh+vZdpJU7VY4z+Z2y77fJHkoDc69scwwzLuW5MzeUKTwPo3ZMaB29imm6YulqnWfTkgzqRaion+EuD7FN9wZ4aXE1+mRt0gHsU193y+yxtRgpmY7SDMU9hCKoQtYyHsfFR5FUAOAKMdw2fzQqpToei3rnaYvZuYaxolprm9+/+WIETnPUDlxCYOiw7vPeaaYQQH0BF0TxyU3zu36ODx980rJvPAgtJzH1gUrlxcSS1HQeQ9ZaVM1eOK/jl8KJm6ijOwErHGbgf/hVymUQG65rHU2MWz9U8QUjvDWA==';
    var orderGroupId = '';
    var autoCapture = true;
    var lang = 'vi';

    //before sign HMAC SHA256 with format
    //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
    var rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl + "&requestId=" + requestId + "&requestType=" + requestType;
    //puts raw signature
    console.log("--------------------RAW SIGNATURE----------------")
    console.log(rawSignature)

    var signature = crypto.createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');
    console.log("--------------------SIGNATURE----------------")
    console.log(signature)

    //json object send to MoMo endpoint
    const requestBody = JSON.stringify({
        partnerCode: partnerCode,
        partnerName: "Test",
        storeId: "MomoTestStore",
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        lang: lang,
        requestType: requestType,
        autoCapture: autoCapture,
        extraData: extraData,
        orderGroupId: orderGroupId,
        signature: signature
    });

    try {
        // //Create the HTTPS objects
        const options = {
            method: "POST",
            url: "https://test-payment.momo.vn/v2/gateway/api/create",
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestBody)
            },
            data: requestBody
        }

        const response = await axios(options)
        console.log(response)

        if (response.data && response.data.payUrl) {
            res.json({ payUrl: response.data.payUrl });
        } else {
            res.status(500).json({ message: 'Không thể tạo thanh toán MoMo.' });
        }
    } catch (error) {
        console.error('Lỗi khi tạo thanh toán MoMo:', error);
        res.status(500).json({ message: 'Lỗi khi tạo thanh toán MoMo.' });
    }
};

const inputUrl = async (req, res) => {
    // Xử lý dữ liệu nhận được từ MoMo
    const { appointmentId } = req.body;
    await req.app.locals.db.execute('UPDATE appointments SET payment = 1 WHERE id = ?', [appointmentId]);
    res.sendStatus(200);
}

const ratingAppointment = async (req, res) => {
    // Xử lý dữ liệu nhận được từ MoMo
    try {
        const { serviceId, appointmentId, rating, comment } = req.body;

        if (!appointmentId || !rating || !comment || !serviceId) {
            return res.json({ success: false, message: "Missing Infor" });
        }

        // Xác thực token từ request headers
        const token = req.headers.token;
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Giải mã token để lấy thông tin người dùng
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Kiểm tra xem người dùng có tồn tại trong cơ sở dữ liệu
        const [user] = await req.app.locals.db.execute(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );

        const now = new Date(Date.now());
        const dateNow = now.toISOString().slice(0, 19).replace('T', ' ');

        await req.app.locals.db.execute(
            'INSERT INTO feedbacks (userId, serviceId, rate, comment, date) VALUES (?, ?, ?,?, ?)',
            [userId, serviceId, rating, comment, dateNow]
        );

        await req.app.locals.db.execute('UPDATE appointments SET isReview = 1 WHERE id = ?', [appointmentId]);

        res.json({ success: true, message: 'Đánh gía thành công' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export {
    loginUser,
    registerUser,
    addUser,
    editUser,
    userList,
    getProfile,
    updateProfile,
    forgotPassword,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    editAppointment,
    paymentRazorpay,
    verifyRazorpay,
    paymentStripe,
    verifyStripe,
    allSlotUser,
    changePassword,
    createMoMoPayment,
    inputUrl,
    ratingAppointment,
    getFeedbacksByDoctor
}