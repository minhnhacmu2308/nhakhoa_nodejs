import multer from "multer";
import { dirname } from 'path';
import { fileURLToPath } from 'url';


// Chuyển đổi import.meta.url thành đường dẫn tệp
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Sử dụng __dirname thay vì __dirname trong môi trường ES Module
        cb(null, `${__dirname}/uploads`); // Sử dụng __dirname để chỉ đường dẫn thư mục upload
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname)
    }
});

const upload = multer({ storage: storage })

export default upload