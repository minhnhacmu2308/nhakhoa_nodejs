import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";


// API to get all services list for Frontend
const serviceList = async (req, res) => {
    try {
        const [services] = await req.app.locals.db.execute('SELECT * FROM services order by id desc');
        res.json({ success: true, services });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get all services list for Frontend
const newList = async (req, res) => {
    try {
        const [news] = await req.app.locals.db.execute('SELECT id, title, image, shortdes, description  FROM news order by id desc');
        res.json({ success: true, news });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// API to get service detail
const serviceDetail = async (req, res) => {
    try {
        const { serId } = req.body;
        const [detailSerData] = await req.app.locals.db.execute('SELECT id, title, image, shortdes , price, description FROM services WHERE id = ?', [serId]);

        res.json({ success: true, detailSerData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const listFeedbackByServiceId = async (req, res) => {
    try {

        const { serviceId } = req.query;

        // Câu truy vấn để lấy thông tin chi tiết về các cuộc hẹn
        const [feedbacks] = await req.app.locals.db.execute(
            `SELECT 
                f.id, 
                f.userId, 
                u.name, 
                u.email, 
                u.image,
                f.serviceId, 
                f.rate, 
                f.comment,
                f.date
            FROM 
                feedbacks f
            JOIN 
                users u ON f.userId = u.id
            WHERE 
                f.serviceId = ?`,
            [serviceId]
        );

        res.json({ success: true, feedbacks });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


export {
    serviceList,
    newList,
    serviceDetail,
    listFeedbackByServiceId
}