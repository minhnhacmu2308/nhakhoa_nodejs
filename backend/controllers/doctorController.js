import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import nodemailer from 'nodemailer';

// API for doctor Login 
const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body;
        const [user] = await req.app.locals.db.execute('SELECT * FROM doctors WHERE email = ?', [email]);

        if (!user.length) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user[0].password);

        if (isMatch) {
            const token = jwt.sign({ id: user[0].id }, process.env.JWT_SECRET);
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
    try {
        const { docId } = req.body;
        const [appointments] = await req.app.locals.db.execute('SELECT a.*,b.name patname,c.slot_date,c.slot_time,d.name docname,e.title FROM appointments a left join users b on a.userId = b.id left join slots c on a.slotId = c.id left join doctors d on c.doctor_id = d.id left join services e on a.serviceId = e.id WHERE d.id= ?', [docId]);

        res.json({ success: true, appointments });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};



// API to cancel appointment for doctor panel
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
            subject: 'Lịch hẹn hủy bởi bác sĩ',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
                    <h2 style="color: #333;">Xin chào ${users[0].name},</h2>
                    <p style="font-size: 16px; line-height: 1.5; color: #555;">
                        Chúng tôi rất tiếc phải thông báo với bạn rằng cuộc hẹn của bạn với Bác sĩ <strong>${doctors[0].name}</strong> vào ngày <strong>${date.toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</strong> đã bị bác sĩ của chúng tôi hủy bỏ.
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


// API to mark appointment completed for doctor panel
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


// API to get all doctors list for Frontend
const doctorList = async (req, res) => {
    try {
        // const [doctors] = await req.app.locals.db.execute('SELECT id, name, speciality, degree, experience, about, available, address, image FROM doctors');
        //const [doctors] = await req.app.locals.db.execute('SELECT a.id, name, speciality, degree, experience, about, available, address, a.image, GROUP_CONCAT(c.title ORDER BY c.title SEPARATOR ', ') AS services FROM doctors a left join doc_ser b on a.id = b.doctor_id left join services c on b.service_id = c.id GROUP BY a.id, a.name, a.speciality, a.degree, a.experience, a.about, a.available, a.address, a.image;');
        const [doctors] = await req.app.locals.db.execute("SELECT a.id, name, speciality, degree, experience, about, available, address, a.image, GROUP_CONCAT(c.id ORDER BY c.id SEPARATOR ', ') AS services FROM doctors a LEFT JOIN doc_ser b ON a.id = b.doctor_id LEFT JOIN services c ON b.service_id = c.id GROUP BY a.id, a.name, a.speciality, a.degree, a.experience, a.about, a.available, a.address, a.image;");
        res.json({ success: true, doctors });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// API to change doctor availablity for Admin and Doctor Panel
const changeAvailablity = async (req, res) => {
    try {
        console.log(req.body)
        const { docId } = req.body;
        const [docData] = await req.app.locals.db.execute('SELECT available FROM doctors WHERE id = ?', [docId]);
        const newAvailability = !docData[0].available;
        await req.app.locals.db.execute('UPDATE doctors SET available = ? WHERE id = ?', [newAvailability, docId]);

        res.json({ success: true, message: 'Availability Changed' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// API to get doctor profile for  Doctor Panel
const doctorProfile = async (req, res) => {
    try {
        const { docId } = req.body;
        const [profileData] = await req.app.locals.db.execute('SELECT * FROM doctors WHERE id = ?', [docId]);

        res.json({ success: true, profileData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// API to update doctor profile data from  Doctor Panel
const updateDoctorProfile = async (req, res) => {
    try {
        const { docId, fees, address, available } = req.body;

        await req.app.locals.db.execute('UPDATE doctors SET fees = ?, address = ?, available = ? WHERE id = ?', [fees, address, available, docId]);

        res.json({ success: true, message: 'Profile Updated' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
    try {
        const { docId } = req.body;
        const [appointments] = await req.app.locals.db.execute('SELECT a.* FROM appointments a WHERE slotId = ?', [docId]);

        let earnings = 0;
        let patients = [];

        appointments.forEach((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount;
            }
            if (!patients.includes(item.userId)) {
                patients.push(item.userId);
            }
        });

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse()
        };

        res.json({ success: true, dashData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


export {
    loginDoctor,
    appointmentsDoctor,
    appointmentCancel,
    doctorList,
    changeAvailablity,
    appointmentComplete,
    doctorDashboard,
    doctorProfile,
    updateDoctorProfile
}