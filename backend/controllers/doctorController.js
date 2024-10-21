import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";

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
        const [appointments] = await req.app.locals.db.execute('SELECT * FROM appointments WHERE id= ?', [docId]);

        res.json({ success: true, appointments });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// API to cancel appointment for doctor panel
const appointmentCancel = async (req, res) => {
    try {
        const { docId, appointmentId } = req.body;
        const [appointmentData] = await req.app.locals.db.execute('SELECT * FROM appointments WHERE id = ?', [appointmentId]);

        if (appointmentData[0] && appointmentData[0].docId === docId) {
            await req.app.locals.db.execute('UPDATE appointments SET cancelled = 1 WHERE id = ?', [appointmentId]);
            return res.json({ success: true, message: 'Appointment Cancelled' });
        }

        res.json({ success: false, message: 'Appointment not found' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// API to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
    try {
        const { docId, appointmentId } = req.body;
        const [appointmentData] = await req.app.locals.db.execute('SELECT * FROM appointments WHERE id = ?', [appointmentId]);

        if (appointmentData[0] && appointmentData[0].docId === docId) {
            await req.app.locals.db.execute('UPDATE appointments SET isCompleted = 1 WHERE id = ?', [appointmentId]);
            return res.json({ success: true, message: 'Appointment Completed' });
        }

        res.json({ success: false, message: 'Appointment not found' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// API to get all doctors list for Frontend
const doctorList = async (req, res) => {
    try {
        const [doctors] = await req.app.locals.db.execute('SELECT id, name, speciality, degree, experience, about, fees, available, address, image FROM doctors');
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
        const [profileData] = await req.app.locals.db.execute('SELECT id, name, speciality, fees, address FROM doctors WHERE id = ?', [docId]);

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
        const [appointments] = await req.app.locals.db.execute('SELECT * FROM appointments WHERE docId = ?', [docId]);

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