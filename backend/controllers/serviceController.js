import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";


// API to get all services list for Frontend
const serviceList = async (req, res) => {
    try {
        const [services] = await req.app.locals.db.execute('SELECT id, title, image, shortdes FROM services');
        res.json({ success: true, services });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// API to get service detail
const serviceDetail = async (req, res) => {
    try {
        const { serId } = req.body;
        const [detailSerData] = await req.app.locals.db.execute('SELECT id, title, image, shortdes, description FROM services WHERE id = ?', [serId]);

        res.json({ success: true, detailSerData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


export {
    serviceList,
    serviceDetail,
}