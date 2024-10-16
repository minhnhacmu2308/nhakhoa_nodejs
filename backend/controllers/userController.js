import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { v2 as cloudinary } from 'cloudinary'
import stripe from "stripe";
import razorpay from 'razorpay';
import db from '../config/mysql.js';

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

        const [doctors] = await req.app.locals.db.execute(
            "SELECT * FROM doctors WHERE id = ?",
            [docId]
        );

        if (doctors.length === 0) {
            return res.json({ success: false, message: 'Doctor Not Available' });
        }

        const doctor = doctors[0];
        let slots_booked = JSON.parse(doctor.slots_booked || "{}");

        if (slots_booked[slotDate]?.includes(slotTime)) {
            return res.json({ success: false, message: 'Slot Not Available' });
        }

        slots_booked[slotDate] = slots_booked[slotDate] || [];
        slots_booked[slotDate].push(slotTime);

        const [user] = await req.app.locals.db.execute(
            "SELECT * FROM users WHERE id = ?",
            [userId]
        );

        await req.app.locals.db.execute(
            "INSERT INTO appointments (userId, docId, userData, docData, amount, slotTime, slotDate, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [userId, docId, JSON.stringify(user[0]), JSON.stringify(doctor), doctor.fees, slotTime, slotDate, Date.now()]
        );

        await req.app.locals.db.execute(
            "UPDATE doctors SET slots_booked = ? WHERE id = ?",
            [JSON.stringify(slots_booked), docId]
        );

        res.json({ success: true, message: 'Appointment Booked' });
    } catch (error) {
        console.log(error);
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

        const [appointments] = await req.app.locals.db.execute(
            "SELECT * FROM appointments WHERE userId = ?",
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
    verifyStripe
}