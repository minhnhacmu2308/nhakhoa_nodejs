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
            return res.json({ success: false, message: 'Missing Details' });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" });
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
            return res.json({ success: false, message: "User does not exist" });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
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
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ success: true, userData: users[0] });
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
            return res.json({ success: false, message: "Data Missing" });
        }

        await req.app.locals.db.execute(
            "UPDATE users SET name = ?, phone = ?, address = ?, dob = ?, gender = ? WHERE id = ?",
            [name, phone, JSON.stringify(address), dob, gender, userId]
        );

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            const imageURL = imageUpload.secure_url;

            await req.app.locals.db.execute(
                "UPDATE users SET image = ? WHERE id = ?",
                [imageURL, userId]
            );
        }

        res.json({ success: true, message: 'Profile Updated' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to book appointment 
const bookAppointment = async (req, res) => {
    try {
        const { userId, docId, slotDate, slotTime } = req.body;
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
            return res.json({ success: false, message: 'Doctor Not Available' });
        }

        // Kiểm tra slot
        const [slot] = await req.app.locals.db.execute(
            "SELECT * FROM slots WHERE slot_date = ? and slot_time = ? and doctor_id = ?",
            [formattedDate, slotTime, docId]
        );

        const now = new Date(Date.now());
        const dateNow = now.toISOString().slice(0, 19).replace('T', ' ');

        // Chèn vào bảng appointments
        await req.app.locals.db.execute(
            "INSERT INTO appointments (userId, slotId, amount, date) VALUES (?, ?, ?, ?)",
            [userId, slot[0].id, doctors[0].fees, dateNow]
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
                user: 'purplerose2305@gmail.com', // Thay đổi với email của bạn
                pass: 'vtsvzroezxsrvvze', // Thay đổi với mật khẩu của bạn
            },
        });

        const mailOptions = {
            from: '"Nha Khoa Care" <nhakhoa@gmail.com>', // Your email address
            to: users[0].email, // User's email address
            subject: 'Appointment Booked Successfully',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
                    <h2 style="color: #333;">Hi ${users[0].name},</h2>
                    <p style="font-size: 16px; line-height: 1.5; color: #555;">
                        You have successfully booked an appointment with Dr. <strong>${doctors[0].name}</strong> on <strong>${formattedDate}</strong> at <strong>${slotTime}</strong>.
                    </p>
                    <p style="font-size: 16px; line-height: 1.5; color: #555;">
                        Please make sure to arrive on time for your appointment.
                    </p>
                    <p style="font-size: 16px; line-height: 1.5; color: #555;">
                        Thank you!
                    </p>
                    <p style="font-size: 14px; line-height: 1.5; color: #777;">
                        If you have any questions, feel free to reach out to us via this email or our support phone number.
                    </p>
                </div>
            `,
        };


        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: 'Appointment Booked and Email Sent' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};




// API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {
        const { userId, appointmentId } = req.body;

        const [appointments] = await req.app.locals.db.execute(
            "SELECT * FROM appointments WHERE id = ?",
            [appointmentId]
        );

        if (appointments.length === 0 || appointments[0].userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' });
        }

        await req.app.locals.db.execute(
            "UPDATE appointments SET cancelled = true WHERE id = ?",
            [appointmentId]
        );

        const { docId, slotDate, slotTime } = appointments[0];

        const [doctors] = await req.app.locals.db.execute(
            "SELECT * FROM doctors WHERE id = ?",
            [docId]
        );

        let slots_booked = JSON.parse(doctors[0].slots_booked || "{}");
        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);

        await req.app.locals.db.execute(
            "UPDATE doctors SET slots_booked = ? WHERE id = ?",
            [JSON.stringify(slots_booked), docId]
        );

        res.json({ success: true, message: 'Appointment Cancelled' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
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
                u.image,
                u.address AS user_address,
                s.slot_date,
                s.slot_time,
                d.name AS doctor_name,
                d.speciality,
                a.amount,
                a.cancelled,
                a.payment,
                a.isCompleted
            FROM 
                appointments a
            JOIN 
                users u ON a.userId = u.id
            JOIN 
                slots s ON a.slotId = s.id
            JOIN 
                doctors d ON s.doctor_id = d.id
            WHERE 
                a.userId = ?`, // Thêm điều kiện để chỉ lấy các cuộc hẹn của userId cụ thể
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
        const [slots] = await req.app.locals.db.execute('SELECT * FROM slots');
        res.json({ success: true, slots });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export {
    loginUser,
    registerUser,
    getProfile,
    updateProfile,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    paymentRazorpay,
    verifyRazorpay,
    paymentStripe,
    verifyStripe,
    allSlotUser
}