-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th10 23, 2024 lúc 08:25 AM
-- Phiên bản máy phục vụ: 10.4.21-MariaDB
-- Phiên bản PHP: 7.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `nhakhoa_db`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `appointments`
--

CREATE TABLE `appointments` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `slotId` int(11) NOT NULL,
  `serviceId` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `date` datetime NOT NULL,
  `cancelled` tinyint(1) DEFAULT 0,
  `payment` tinyint(1) DEFAULT 0,
  `isCompleted` tinyint(1) DEFAULT 0,
  `isReview` tinyint(1) DEFAULT 0,
  `isConfirm` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Đang đổ dữ liệu cho bảng `appointments`
--

INSERT INTO `appointments` (`id`, `userId`, `slotId`, `serviceId`, `amount`, `date`, `cancelled`, `payment`, `isCompleted`, `isReview`, `isConfirm`) VALUES
(1, 2, 8, 1, '200000.00', '2024-10-29 12:52:43', 1, 0, 0, 0, NULL),
(2, 1, 8, 7, '200000.00', '2024-10-29 12:53:29', 1, 0, 0, 0, NULL),
(3, 1, 8, 7, '200000.00', '2024-10-29 13:01:42', 0, 0, 1, 0, NULL),
(4, 2, 13, 8, '200000.00', '2024-10-29 14:55:01', 0, 0, 0, 0, NULL),
(5, 2, 13, 7, '200000.00', '2024-10-29 14:56:22', 1, 0, 0, 0, NULL),
(6, 2, 13, 7, '200000.00', '2024-10-29 14:58:27', 1, 0, 0, 0, NULL),
(7, 2, 10, 7, '100000.00', '2024-10-29 15:01:02', 0, 0, 1, 0, NULL),
(8, 3, 14, 7, '400000.00', '2024-11-10 07:16:51', 1, 0, 0, 0, NULL),
(9, 3, 14, 1, '200000.00', '2024-11-11 23:54:44', 1, 0, 0, 0, NULL),
(10, 2, 17, 1, '200000.00', '2024-11-12 14:55:10', 0, 0, 1, 1, NULL),
(11, 2, 16, 7, '400000.00', '2024-11-12 16:06:42', 0, 1, 0, 0, NULL),
(12, 3, 21, 1, '200000.00', '2024-11-22 09:46:29', 0, 0, 1, 0, 1),
(13, 3, 18, 1, '200000.00', '2024-11-23 07:01:59', 0, 0, 0, 0, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `doctors`
--

CREATE TABLE `doctors` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `image` text DEFAULT 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAADwCAYAAAA+VemSAAAACXBIWXMAABCcAAAQnAEmzTo0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAA5uSURBVHgB7d0JchvHFcbxN+C+iaQolmzFsaWqHMA5QXID+wZJTmDnBLZu4BvER4hvYJ/AvoHlimPZRUngvoAg4PkwGJOiuGCd6df9/1UhoJZYJIBvXndPL5ndofljd8NW7bP8y79bZk+tmz8ATFdmu3nWfuiYfdNo2383389e3P5Xb9B82X1qs/YfU3AB1Cuzr+3cnt8U5Mb132i+7n5mc/a9EV4gDF37Z15Qv',
  `speciality` varchar(255) NOT NULL,
  `degree` varchar(255) NOT NULL,
  `experience` varchar(255) NOT NULL,
  `about` text NOT NULL,
  `available` tinyint(1) DEFAULT 1,
  `address` varchar(255) NOT NULL,
  `date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Đang đổ dữ liệu cho bảng `doctors`
--

INSERT INTO `doctors` (`id`, `name`, `email`, `password`, `image`, `speciality`, `degree`, `experience`, `about`, `available`, `address`, `date`) VALUES
(1, 'Lê Văn Lan', 'levanlan@gmail.com', '$2b$10$glum8EwwaRDhrDf065deBuGtultQtHqNhmd8MpvqRJTk8MbxkX.1W', 'https://res.cloudinary.com/db18w7hbk/image/upload/v1729484386/hq84mvk4cbqjurzzlzrx.jpg', 'Chuyên khoa người lớn', 'Ok', '1 Year', 'Xin chào mọi người mình là Bác sĩ Lan', 1, 'Hà Nội', '2024-10-21 11:18:07'),
(2, 'Nguyễn Trường Xuân', 'truongxuan@gmail.com', '$2b$10$M7z0poODjsEijGXWTk20JuKT0Vj.cLploTklYn2RsSe07IN4Kto/q', 'https://res.cloudinary.com/db18w7hbk/image/upload/v1730207508/snypxawa34e9te0sqgus.jpg', 'Chuyên khoa trẻ em', 'Bác sĩ nha khoa', '2 Year', 'Bác sĩ tốt nghiệp bằng xuất sắc chuyên ngành đa khoa', 1, 'Hà Nội', '2024-10-29 20:09:52'),
(3, 'Lê Thị Kiều Thu', 'kieuthu@gmail.com', '$2b$10$77dOQZrDoHZPx66X2FyfGeLsEYD78w7925BSpsm7jvrQ7kNG0Qgq2', 'https://res.cloudinary.com/db18w7hbk/image/upload/v1730207549/ha7iwisrpw5kgsplujsc.jpg', 'Chuyên khoa người lớn', 'Bác sĩ nha khoa', '4 Year', 'Bác sĩ tốt nghiệp bằng xuất sắc chuyên ngành đa khoa', 1, 'Hà Nội', '2024-10-29 20:10:32'),
(4, 'Hồ Gia Hào', 'giahao@gmail.com', '$2b$10$Rdg6uyib0K7kUknjoHfQWeipbAlVft7p.MzwRiCsUy2OAOcc9R3Ae', 'https://res.cloudinary.com/db18w7hbk/image/upload/v1730207645/d7kaslxowsj6njtop6wu.jpg', 'Chuyên khoa trẻ em', 'Bác sĩ nha khoa', '3 Year', 'Top Doctors to Book\r\nSimply browse through our extensive list of trusted', 1, 'Hà Nội', '2024-10-29 20:12:09'),
(6, 'Lê Viết Sang', 'sang@gmail.com', '$2b$10$AZdk1tljV56ebvZTaXrd2OkTbYbhybrgcHx9gDTHNBcVhJsJKrWra', 'https://res.cloudinary.com/db18w7hbk/image/upload/v1731260193/ovughhj9bc7zm6oep3vl.jpg', 'Chuyên khoa trẻ em', 'Nha khoa', '1 Year', 'Chuyên Nha Khoa', 1, 'Hà Nội', '2024-11-11 00:34:11'),
(7, 'Phạm Ngọc Thái', 'ngocthai@gmail.com', '$2b$10$glum8EwwaRDhrDf065deBuGtultQtHqNhmd8MpvqRJTk8MbxkX.1W', 'https://res.cloudinary.com/db18w7hbk/image/upload/v1731423231/uwbyeczxv7vnb3s6hzet.jpg', 'Chuyên khoa trẻ em', 'Thạc sĩ', '4 Năm', 'Thạc sĩ nha khoa', 1, 'Hà Nội', '2024-11-12 21:51:25');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `doc_ser`
--

CREATE TABLE `doc_ser` (
  `id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Đang đổ dữ liệu cho bảng `doc_ser`
--

INSERT INTO `doc_ser` (`id`, `doctor_id`, `service_id`) VALUES
(1, 6, 9),
(2, 6, 11),
(3, 1, 1),
(4, 2, 1),
(5, 3, 1),
(6, 4, 1),
(7, 7, 1),
(8, 7, 7),
(9, 7, 8);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `feedbacks`
--

CREATE TABLE `feedbacks` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `serviceId` int(11) NOT NULL,
  `rate` int(11) NOT NULL,
  `comment` text NOT NULL,
  `date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Đang đổ dữ liệu cho bảng `feedbacks`
--

INSERT INTO `feedbacks` (`id`, `userId`, `serviceId`, `rate`, `comment`, `date`) VALUES
(1, 2, 1, 4, 'ok', '2024-11-12 15:20:14');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `news`
--

CREATE TABLE `news` (
  `id` int(11) NOT NULL,
  `title` varchar(500) NOT NULL,
  `image` text DEFAULT 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAADwCAYAAAA+VemSAAAACXBIWXMAABCcAAAQnAEmzTo0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAA5uSURBVHgB7d0JchvHFcbxN+C+iaQolmzFsaWqHMA5QXID+wZJTmDnBLZu4BvER4hvYJ/AvoHlimPZRUngvoAg4PkwGJOiuGCd6df9/1UhoJZYJIBvXndPL5ndofljd8NW7bP8y79bZk+tmz8ATFdmu3nWfuiYfdNo2383389e3P5Xb9B82X1qs/YfU3AB1Cuzr+3cnt8U5Mb132i+7n5mc/a9EV4gDF37Z15Qv',
  `shortdes` text NOT NULL,
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Đang đổ dữ liệu cho bảng `news`
--

INSERT INTO `news` (`id`, `title`, `image`, `shortdes`, `description`) VALUES
(1, 'Sơ đồ răng vĩnh viễn và kí hiệu răng sữa', 'https://res.cloudinary.com/db18w7hbk/image/upload/v1731249917/f7l5syleg2fy5nwsrs9i.webp', 'Răng là một trong những bộ phận rất quan trọng đối với cơ thể người. Ngoài chức năng cắn, xé thức ăn và phát âm thì hàm răng còn ảnh hưởng trực tiếp đến thẩm mỹ. Vậy bạn có từng thắc mắc sơ đồ răng người sẽ như thế nào chưa? Cùng Nha Khoa Kim tìm hiểu về sơ đồ răng vĩnh viễn và răng sữa cũng như cách đọc tên răng nhé.', '<h2 style=\"margin-bottom: 0.5rem; font-weight: 400; line-height: 1.5; font-size: 24px; color: rgb(246, 146, 30); font-family: Roboto, sans-serif; text-align: justify;\"><span style=\"font-weight: 600;\">Cách đọc tên và số thứ tự sơ đồ răng vĩnh viễn</span><span class=\"ez-toc-section-end\"></span></h2><p style=\"color: rgb(64, 74, 100); font-size: 17.6px; overflow-wrap: break-word; font-family: Roboto, sans-serif; text-align: justify; margin-bottom: 1rem !important; line-height: 1.5 !important;\">Sơ đồ răng được thiết lập theo một tiêu chuẩn nhất định với mục đích dễ dàng hơn cho việc đọc, viết và nhận biết chính xác số thứ tự cũng như tên gọi của chúng.&nbsp;</p><h3 style=\"margin-bottom: 0.5rem; font-weight: bold; line-height: 1.5; font-size: 20px; color: rgb(48, 55, 75); font-family: Roboto, sans-serif; text-align: justify;\"><span class=\"ez-toc-section\" id=\"So_thu_tu_cac_rang\"></span>Số thứ tự các răng<span class=\"ez-toc-section-end\"></span></h3><p style=\"color: rgb(64, 74, 100); font-size: 17.6px; overflow-wrap: break-word; font-family: Roboto, sans-serif; text-align: justify; margin-bottom: 1rem !important; line-height: 1.5 !important;\">Răng của người trưởng thành sẽ có khoảng 32 chiếc và được phân thành 4 loại đó là răng cửa, răng nanh, răng hàm bé và răng hàm lớn. Tuy nhiên trên thực tế, số răng này có thể ít hơn vì sẽ tuỳ vào răng hàm lớn thứ ba, hay còn gọi là răng khôn. Nhóm răng này sẽ phát triển ở độ tuổi từ 17 đến 25 tuổi.&nbsp;</p><p style=\"color: rgb(64, 74, 100); font-size: 17.6px; overflow-wrap: break-word; font-family: Roboto, sans-serif; text-align: justify; margin-bottom: 1rem !important; line-height: 1.5 !important;\">32 chiếc răng vĩnh viễn sẽ chia đều cho cả 2 hàm trên và dưới, trong đó sẽ có tổng cộng: 8 răng cửa, 8 răng hàm nhỏ, 4 răng nanh và 12 răng hàm lớn. Đối với răng trên thì cung hàm sẽ được chia đều thành 4 phần từ 1 đến 4 theo chiều kim đồng hồ và được ghi theo số thứ tự tính từ vị trí răng cửa lần lượt từ 1 đến 8.&nbsp;</p><p style=\"color: rgb(64, 74, 100); font-size: 17.6px; overflow-wrap: break-word; font-family: Roboto, sans-serif; margin-bottom: 1rem !important; line-height: 1.5 !important;\"><img fetchpriority=\"high\" decoding=\"async\" class=\"aligncenter wp-image-59399 img-fluid\" src=\"https://nhakhoakim.com/wp-content/uploads/2024/10/So-do-rang-vinh-vien.jpg\" alt=\"Số thứ tự trên sơ đồ răng vĩnh viễn\" width=\"700\" height=\"389\" data-src=\"https://nhakhoakim.com/wp-content/uploads/2024/10/So-do-rang-vinh-vien.jpg\" data-srcset=\"https://nhakhoakim.com/wp-content/uploads/2024/10/So-do-rang-vinh-vien.jpg 900w, https://nhakhoakim.com/wp-content/uploads/2024/10/So-do-rang-vinh-vien-768x427.jpg 768w, https://nhakhoakim.com/wp-content/uploads/2024/10/So-do-rang-vinh-vien-555x308.jpg 555w, https://nhakhoakim.com/wp-content/uploads/2024/10/So-do-rang-vinh-vien-20x11.jpg 20w\" data-sizes=\"(max-width: 700px) 100vw, 700px\" data-style=\"\" data-l=\"\" srcset=\"https://nhakhoakim.com/wp-content/uploads/2024/10/So-do-rang-vinh-vien.jpg 900w, https://nhakhoakim.com/wp-content/uploads/2024/10/So-do-rang-vinh-vien-768x427.jpg 768w, https://nhakhoakim.com/wp-content/uploads/2024/10/So-do-rang-vinh-vien-555x308.jpg 555w, https://nhakhoakim.com/wp-content/uploads/2024/10/So-do-rang-vinh-vien-20x11.jpg 20w\" sizes=\"(max-width: 700px) 100vw, 700px\" style=\"border-style: none; clear: both; margin: 6px auto; text-align: center;\"></p><p style=\"color: rgb(64, 74, 100); font-size: 17.6px; overflow-wrap: break-word; font-family: Roboto, sans-serif; text-align: center; margin-bottom: 1rem !important; line-height: 1.5 !important;\"><span style=\"font-size: 14px;\"><em style=\"display: block;\">Một người trưởng thành sẽ có 32 răng vĩnh viễn được chia đều thành 2 hàm với 4 loại răng khác nhau</em></span></p><h3 style=\"margin-bottom: 0.5rem; font-weight: bold; line-height: 1.5; font-size: 20px; color: rgb(48, 55, 75); font-family: Roboto, sans-serif; text-align: justify;\"><span class=\"ez-toc-section\" id=\"Cach_goi_ten_rang\"></span>Cách gọi tên răng<span class=\"ez-toc-section-end\"></span></h3><p style=\"color: rgb(64, 74, 100); font-size: 17.6px; overflow-wrap: break-word; font-family: Roboto, sans-serif; text-align: justify; margin-bottom: 1rem !important; line-height: 1.5 !important;\">Khi đã hiểu và phân biệt được vị trí của răng vĩnh viễn thì việc đọc tên răng sẽ trở nên đơn giản hơn nhiều. Bạn có thể áp dụng theo công thức sau đây để có thể gọi tên chính xác cho từng chiếc răng:</p><p style=\"color: rgb(64, 74, 100); font-size: 17.6px; overflow-wrap: break-word; font-family: Roboto, sans-serif; text-align: center; margin-bottom: 1rem !important; line-height: 1.5 !important;\"><span style=\"font-weight: 600;\">R + số cung hàm + số thứ tự răng.</span></p><p style=\"color: rgb(64, 74, 100); font-size: 17.6px; overflow-wrap: break-word; font-family: Roboto, sans-serif; text-align: justify; margin-bottom: 1rem !important; line-height: 1.5 !important;\">Trong đó:</p><ul style=\"margin-bottom: 1rem; font-size: 16px; color: rgb(48, 55, 75); font-family: Roboto, sans-serif;\"><li style=\"text-align: justify;\">R là viết tắt của “Răng”</li><li style=\"text-align: justify;\">Số cung hàm từ 1 – 4 theo thứ tự trên phải, trên trái, dưới trái và dưới phải</li><li style=\"text-align: justify;\">Số thứ tự răng từ 1 – 8&nbsp;</li></ul><p style=\"color: rgb(64, 74, 100); font-size: 17.6px; overflow-wrap: break-word; font-family: Roboto, sans-serif; text-align: justify; margin-bottom: 1rem !important; line-height: 1.5 !important;\">Ví dụ:</p><ul style=\"margin-bottom: 1rem; font-size: 16px; color: rgb(48, 55, 75); font-family: Roboto, sans-serif;\"><li style=\"text-align: justify;\">Răng thứ 5 ở phía trên hàm bên phải đọc là R15.</li><li style=\"text-align: justify;\">Răng thứ 5 ở phía trên hàm bên trái đọc là R25.</li><li style=\"text-align: justify;\">Răng thứ 3 ở phía dưới hàm bên trái đọc là R33.</li><li style=\"text-align: justify;\">Răng thứ 8 ở phía dưới hàm bên phải đọc là R48.</li></ul><p style=\"color: rgb(64, 74, 100); font-size: 17.6px; overflow-wrap: break-word; font-family: Roboto, sans-serif; margin-bottom: 1rem !important; line-height: 1.5 !important;\"><span style=\"font-weight: 600;\">▷ Tham khảo:&nbsp;<a title=\"Con Người Có Tổng Cộng Bao Nhiêu Cái Răng?\" href=\"https://nhakhoakim.com/con-nguoi-co-bao-nhieu-cai-rang.html\" target=\"_blank\" rel=\"noopener\" style=\"color: rgb(1, 122, 253); text-decoration: none; background-color: transparent;\">Con Người Có Tổng Cộng Bao Nhiêu Cái Răng?</a></span></p><p style=\"color: rgb(64, 74, 100); font-size: 17.6px; overflow-wrap: break-word; font-family: Roboto, sans-serif; margin-bottom: 1rem !important; line-height: 1.5 !important;\"><img decoding=\"async\" class=\"aligncenter wp-image-59395 img-fluid\" src=\"https://nhakhoakim.com/wp-content/uploads/2024/10/Cach-goi-ten-rang-vinh-vien.jpg\" alt=\"Cách đọc tên trên sơ đồ răng vĩnh viễn\" width=\"700\" height=\"389\" data-src=\"https://nhakhoakim.com/wp-content/uploads/2024/10/Cach-goi-ten-rang-vinh-vien.jpg\" data-srcset=\"https://nhakhoakim.com/wp-content/uploads/2024/10/Cach-goi-ten-rang-vinh-vien.jpg 900w, https://nhakhoakim.com/wp-content/uploads/2024/10/Cach-goi-ten-rang-vinh-vien-768x427.jpg 768w, https://nhakhoakim.com/wp-content/uploads/2024/10/Cach-goi-ten-rang-vinh-vien-555x308.jpg 555w, https://nhakhoakim.com/wp-content/uploads/2024/10/Cach-goi-ten-rang-vinh-vien-20x11.jpg 20w\" data-sizes=\"(max-width: 700px) 100vw, 700px\" data-style=\"\" data-l=\"\" srcset=\"https://nhakhoakim.com/wp-content/uploads/2024/10/Cach-goi-ten-rang-vinh-vien.jpg 900w, https://nhakhoakim.com/wp-content/uploads/2024/10/Cach-goi-ten-rang-vinh-vien-768x427.jpg 768w, https://nhakhoakim.com/wp-content/uploads/2024/10/Cach-goi-ten-rang-vinh-vien-555x308.jpg 555w, https://nhakhoakim.com/wp-content/uploads/2024/10/Cach-goi-ten-rang-vinh-vien-20x11.jpg 20w\" sizes=\"(max-width: 700px) 100vw, 700px\" style=\"border-style: none; clear: both; margin: 6px auto; text-align: center;\"></p><p style=\"color: rgb(64, 74, 100); font-size: 17.6px; overflow-wrap: break-word; font-family: Roboto, sans-serif; text-align: center; margin-bottom: 1rem !important; line-height: 1.5 !important;\"><span style=\"font-size: 14px;\"><em style=\"display: block;\">Tên răng sẽ được đọc theo công thức R + số cung hàm + số thứ tự răng</em></span></p><h2 style=\"margin-bottom: 0.5rem; font-weight: 400; line-height: 1.5; font-size: 24px; color: rgb(246, 146, 30); font-family: Roboto, sans-serif; text-align: justify;\"><span class=\"ez-toc-section\" id=\"Cach_doc_ten_va_so_thu_tu_tren_so_do_rang_sua\"></span><span style=\"font-weight: 600;\">Cách đọc tên và số thứ tự trên sơ đồ răng sữa</span><span class=\"ez-toc-section-end\"></span></h2><p style=\"color: rgb(64, 74, 100); font-size: 17.6px; overflow-wrap: break-word; font-family: Roboto, sans-serif; text-align: justify; margin-bottom: 1rem !important; line-height: 1.5 !important;\"><span style=\"font-weight: 600;\"><a title=\"Răng sữa\" href=\"https://nhakhoakim.com/rang-sua-la-rang-gi.html\" target=\"_blank\" rel=\"noopener\" style=\"color: rgb(1, 122, 253); text-decoration: none; background-color: transparent;\">Răng sữa</a></span>&nbsp;là những chiếc răng được mọc đầu tiên trên cung hàm của trẻ và thường mọc vào khoảng từ 6 tháng tuổi đến hơn 2 tuổi. Răng sữa có tổng cộng khoảng 20 chiếc và sẽ được thay thế bằng răng vĩnh viễn sau khi các răng sữa rụng đi.</p><h3 style=\"margin-bottom: 0.5rem; font-weight: bold; line-height: 1.5; font-size: 20px; color: rgb(48, 55, 75); font-family: Roboto, sans-serif; text-align: justify;\"><span class=\"ez-toc-section\" id=\"So_thu_tu_cac_rang_sua\"></span>Số thứ tự các răng sữa&nbsp;<span class=\"ez-toc-section-end\"></span></h3><p style=\"color: rgb(64, 74, 100); font-size: 17.6px; overflow-wrap: break-word; font-family: Roboto, sans-serif; text-align: justify; margin-bottom: 1rem !important; line-height: 1.5 !important;\">Về cơ bản, sơ đồ răng sữa tương đối đơn giản với 20 chiếc răng chia đều trên 2 cung hàm. Trong đó, mỗi hàm sẽ gồm có: 4 răng cửa, 2 răng nanh (còn được gọi là răng mắt) và 4 răng hàm.&nbsp;</p><h3 style=\"margin-bottom: 0.5rem; font-weight: bold; line-height: 1.5; font-size: 20px; color: rgb(48, 55, 75); font-family: Roboto, sans-serif; text-align: justify;\"><span class=\"ez-toc-section\" id=\"Cach_goi_ten_rang_sua\"></span>Cách gọi tên răng sữa&nbsp;<span class=\"ez-toc-section-end\"></span></h3><p style=\"color: rgb(64, 74, 100); font-size: 17.6px; overflow-wrap: break-word; font-family: Roboto, sans-serif; text-align: justify; margin-bottom: 1rem !important; line-height: 1.5 !important;\">Về cơ bản thì cách gọi tên của răng sữa cũng giống với răng vĩnh viễn. Bạn chỉ cần áp dụng công thức: R + cung hàm + thứ tự răng (1 – 8) là có thể đọc thành thạo tên của răng sữa.</p><p style=\"color: rgb(64, 74, 100); font-size: 17.6px; overflow-wrap: break-word; font-family: Roboto, sans-serif; text-align: justify; margin-bottom: 1rem !important; line-height: 1.5 !important;\">Tuy nhiên, đối với răng sữa sẽ có 1 chút khác biệt ở phần cung hàm, thay vì gọi số thứ tự từ 1 – 4 thì ở răng sữa sẽ thay thế bằng 5,6,7,8. Tức là phần cung hàm 5 của răng sữa sẽ tương đương với cung hàm 1 của răng vĩnh viễn và tương tự cho những cung hàm còn lại.</p><p style=\"color: rgb(64, 74, 100); font-size: 17.6px; overflow-wrap: break-word; font-family: Roboto, sans-serif; margin-bottom: 1rem !important; line-height: 1.5 !important;\"><img decoding=\"async\" class=\"aligncenter wp-image-59394 img-fluid\" src=\"https://nhakhoakim.com/wp-content/uploads/2024/10/Cach-goi-ten-rang-sua.jpg\" alt=\"Cách đọc tên và số thứ tự trên sơ đồ răng sữa\" width=\"700\" height=\"389\" data-src=\"https://nhakhoakim.com/wp-content/uploads/2024/10/Cach-goi-ten-rang-sua.jpg\" data-srcset=\"https://nhakhoakim.com/wp-content/uploads/2024/10/Cach-goi-ten-rang-sua.jpg 900w, https://nhakhoakim.com/wp-content/uploads/2024/10/Cach-goi-ten-rang-sua-768x427.jpg 768w, https://nhakhoakim.com/wp-content/uploads/2024/10/Cach-goi-ten-rang-sua-555x308.jpg 555w, https://nhakhoakim.com/wp-content/uploads/2024/10/Cach-goi-ten-rang-sua-20x11.jpg 20w\" data-sizes=\"(max-width: 700px) 100vw, 700px\" data-style=\"\" data-l=\"\" srcset=\"https://nhakhoakim.com/wp-content/uploads/2024/10/Cach-goi-ten-rang-sua.jpg 900w, https://nhakhoakim.com/wp-content/uploads/2024/10/Cach-goi-ten-rang-sua-768x427.jpg 768w, https://nhakhoakim.com/wp-content/uploads/2024/10/Cach-goi-ten-rang-sua-555x308.jpg 555w, https://nhakhoakim.com/wp-content/uploads/2024/10/Cach-goi-ten-rang-sua-20x11.jpg 20w\" sizes=\"(max-width: 700px) 100vw, 700px\" style=\"border-style: none; clear: both; margin: 6px auto; text-align: center;\"></p><p style=\"color: rgb(64, 74, 100); font-size: 17.6px; overflow-wrap: break-word; font-family: Roboto, sans-serif; text-align: center; margin-bottom: 1rem !important; line-height: 1.5 !important;\"><span style=\"font-size: 14px;\"><em style=\"display: block;\">Hướng dẫn cách đọc tên và vị trí thứ tự răng sữa trên sơ đồ răng</em></span></p><h2 style=\"margin-bottom: 0.5rem; font-weight: 400; line-height: 1.5; font-size: 24px; color: rgb(246, 146, 30); font-family: Roboto, sans-serif; text-align: justify;\"><span class=\"ez-toc-section\" id=\"Cach_phan_biet_rang_sua_va_rang_vinh_vien\"></span><span style=\"font-weight: 600;\">Cách phân biệt răng sữa và răng vĩnh viễn</span><span class=\"ez-toc-section-end\"></span></h2><p style=\"color: rgb(64, 74, 100); font-size: 17.6px; overflow-wrap: break-word; font-family: Roboto, sans-serif; text-align: justify; margin-bottom: 1rem !important; line-height: 1.5 !important;\">Để phân biệt được răng sữa và răng vĩnh viễn chúng ta có thể dựa trên những yếu tố như:</p><ul style=\"margin-bottom: 1rem; font-size: 16px; color: rgb(48, 55, 75); font-family: Roboto, sans-serif; text-align: justify;\"><li aria-level=\"1\"><span style=\"font-weight: 600;\">Số lượng răng</span>: Như đã thông tin ở trên, răng người lớn (răng vĩnh viễn) có khoảng 32 chiếc còn răng sữa chỉ khoảng 20 chiếc mà thôi. Răng vĩnh viễn sẽ mọc sau khi những chiếc răng sữa mất đi. Nếu răng vĩnh viễn gãy thì chúng thì sẽ không thể mọc lại.</li><li aria-level=\"1\"><span style=\"font-weight: 600;\">Kích thước</span>: Răng vĩnh viễn có kích thước to hơn răng sữa.&nbsp;</li><li aria-level=\"1\"><span style=\"font-weight: 600;\">Men và ngà răng</span>: Lớp men và ngà của răng người lớn sẽ cứng và dày hơn răng sữa. Theo các chuyên gia, men răng của răng vĩnh viễn thường dày từ 2-3mm trong khi lớp men bên ngoài của răng sữa chỉ có khoảng 1mm. Chính vì thế, đây cũng là nguyên nhân làm cho răng sữa có tỷ lệ sâu răng cao vì khả năng bảo vệ ngà răng kém hơn.&nbsp;</li><li aria-level=\"1\"><span style=\"font-weight: 600;\">Màu răng</span>: Răng vĩnh viễn thường có màu vàng và trong còn răng sữa lại có màu trắng đục do chứa ít thành phần vô cơ.</li></ul><p style=\"color: rgb(64, 74, 100); font-size: 17.6px; overflow-wrap: break-word; font-family: Roboto, sans-serif; margin-bottom: 1rem !important; line-height: 1.5 !important;\"><img decoding=\"async\" class=\"aligncenter wp-image-59397 img-fluid\" src=\"https://nhakhoakim.com/wp-content/uploads/2024/10/Phan-biet-rang-sua-va-rang-vinh-vien.jpg\" alt=\"Cách phân biệt răng sữa và răng vĩnh viễn\" width=\"700\" height=\"389\" data-src=\"https://nhakhoakim.com/wp-content/uploads/2024/10/Phan-biet-rang-sua-va-rang-vinh-vien.jpg\" data-srcset=\"https://nhakhoakim.com/wp-content/uploads/2024/10/Phan-biet-rang-sua-va-rang-vinh-vien.jpg 900w, https://nhakhoakim.com/wp-content/uploads/2024/10/Phan-biet-rang-sua-va-rang-vinh-vien-768x427.jpg 768w, https://nhakhoakim.com/wp-content/uploads/2024/10/Phan-biet-rang-sua-va-rang-vinh-vien-555x308.jpg 555w, https://nhakhoakim.com/wp-content/uploads/2024/10/Phan-biet-rang-sua-va-rang-vinh-vien-20x11.jpg 20w\" data-sizes=\"(max-width: 700px) 100vw, 700px\" data-style=\"\" data-l=\"\" srcset=\"https://nhakhoakim.com/wp-content/uploads/2024/10/Phan-biet-rang-sua-va-rang-vinh-vien.jpg 900w, https://nhakhoakim.com/wp-content/uploads/2024/10/Phan-biet-rang-sua-va-rang-vinh-vien-768x427.jpg 768w, https://nhakhoakim.com/wp-content/uploads/2024/10/Phan-biet-rang-sua-va-rang-vinh-vien-555x308.jpg 555w, https://nhakhoakim.com/wp-content/uploads/2024/10/Phan-biet-rang-sua-va-rang-vinh-vien-20x11.jpg 20w\" sizes=\"(max-width: 700px) 100vw, 700px\" style=\"border-style: none; clear: both; margin: 6px auto; text-align: center;\"></p><p style=\"color: rgb(64, 74, 100); font-size: 17.6px; overflow-wrap: break-word; font-family: Roboto, sans-serif; text-align: center; margin-bottom: 1rem !important; line-height: 1.5 !important;\"><span style=\"font-size: 14px;\"><em style=\"display: block;\">Răng sữa thường có kích thước nhỏ và men răng mỏng hơn so với răng vĩnh viễn</em></span></p>');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `title` varchar(500) NOT NULL,
  `image` text DEFAULT 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAADwCAYAAAA+VemSAAAACXBIWXMAABCcAAAQnAEmzTo0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAA5uSURBVHgB7d0JchvHFcbxN+C+iaQolmzFsaWqHMA5QXID+wZJTmDnBLZu4BvER4hvYJ/AvoHlimPZRUngvoAg4PkwGJOiuGCd6df9/1UhoJZYJIBvXndPL5ndofljd8NW7bP8y79bZk+tmz8ATFdmu3nWfuiYfdNo2383389e3P5Xb9B82X1qs/YfU3AB1Cuzr+3cnt8U5Mb132i+7n5mc/a9EV4gDF37Z15Qv',
  `shortdes` text NOT NULL,
  `description` text NOT NULL,
  `price` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Đang đổ dữ liệu cho bảng `services`
--

INSERT INTO `services` (`id`, `title`, `image`, `shortdes`, `description`, `price`) VALUES
(1, 'Nhổ Răng Khôn', 'https://nhakhoatrongrang.com/wp-content/uploads/2024/01/nho-rang-khon-banner-mobile.jpg', 'Răng khôn là răng số 8 – chiếc răng mọc cuối cùng trên cung hàm gây nhiều phiền toái đau nhức kéo dài, nướu răng sưng tấy, tích đọng thức ăn gây hôi miệng', 'Răng khôn là răng số 8 – chiếc răng mọc cuối cùng trên cung hàm gây nhiều phiền toái đau nhức kéo dài, nướu răng sưng tấy, tích đọng thức ăn gây hôi miệng', '200000.00'),
(7, 'Trám răng thẩm mỹ', 'https://res.cloudinary.com/db18w7hbk/image/upload/v1729516921/uzfxpea9fwybgrbputvo.jpg', 'Trám răng là phương pháp sử dụng vật liệu nhân tạo để bổ sung vào phần mô răng bị thiếu do sâu răng hoặc do sứt, mẻ răng. Không chỉ giúp khôi phục hình dạng và chức năng ăn nhai cho răng, phương pháp này còn giúp ngăn chặn vi khuẩn và tránh mài cùi, giữ nguyên cấu trúc tự nhiên của răng.', 'Trám răng là phương pháp sử dụng vật liệu nhân tạo để bổ sung vào phần mô răng bị thiếu do sâu răng hoặc do sứt, mẻ răng. Không chỉ giúp khôi phục hình dạng và chức năng ăn nhai cho răng, phương pháp này còn giúp ngăn chặn vi khuẩn và tránh mài cùi, giữ nguyên cấu trúc tự nhiên của răng.', '400000.00'),
(8, 'Tẩy Trắng Răng', 'https://res.cloudinary.com/db18w7hbk/image/upload/v1729519506/jtdmm8l8gkmomli72g1b.jpg', 'Tẩy trắng răng là quá trình loại bỏ các vết ố vàng, bám mảng từ bề mặt răng, giúp răng trở nên sáng hơn. Tuy nhiên, an toàn của quá trình tẩy trắng răng phụ thuộc', 'Tẩy trắng răng là quá trình loại bỏ các vết ố vàng, bám mảng từ bề mặt răng, giúp răng trở nên sáng hơn. Tuy nhiên, an toàn của quá trình tẩy trắng răng phụ thuộc', '300000.00'),
(9, 'Dán Sứ Veneer', 'https://res.cloudinary.com/db18w7hbk/image/upload/v1729520057/ocyaoudtba9iyackeegq.jpg', 'Dán răng sứ Veneer sử dụng mặt dán siêu mỏng 0.2 mm – 0.5 mm làm từ 100% sứ nguyên khối ốp lên bề mặt của răng thật để cải thiện tình trạng: răng ố vàng', 'Dán răng sứ Veneer sử dụng mặt dán siêu mỏng 0.2 mm – 0.5 mm làm từ 100% sứ nguyên khối ốp lên bề mặt của răng thật để cải thiện tình trạng: răng ố vàng', '100000.00'),
(10, 'Trồng Răng Implant', 'https://res.cloudinary.com/db18w7hbk/image/upload/v1731250585/roxggfyanuvgb9zdyg6m.jpg', 'Trồng răng Implant là giải pháp tối ưu để thay thế một hoặc nhiều răng bị mất, thậm chí toàn hàm, giúp tăng tính thẩm mỹ và khôi phục gần 100% chức năng ăn', 'Trồng răng Implant là giải pháp tối ưu để thay thế một hoặc nhiều răng bị mất, thậm chí toàn hàm, giúp tăng tính thẩm mỹ và khôi phục gần 100% chức năng ăn', '250000.00'),
(11, 'Niềng Răng Thẩm Mỹ', 'https://res.cloudinary.com/db18w7hbk/image/upload/v1731254096/bixlcmxekoyry44t2lbn.jpg', 'Niềng răng thẩm mỹ là phương pháp giải quyết triệt để các vấn đề răng mọc lệch, răng bị thưa, răng hô, răng móm,… thông qua cơ chế sử dụng bộ dây cung', 'Niềng răng thẩm mỹ là phương pháp giải quyết triệt để các vấn đề răng mọc lệch, răng bị thưa, răng hô, răng móm,… thông qua cơ chế sử dụng bộ dây cung', '150000.00'),
(12, 'Cạo Vôi Răng', 'https://res.cloudinary.com/db18w7hbk/image/upload/v1731254251/ssogvoj5zdm7djexyeuk.jpg', 'Cạo vôi răng là thủ thuật sử dụng các dụng cụ nha khoa chuyên dụng để làm sạch các mảng bám ra khỏi thân răng và nướu một cách nhanh chóng', 'Cạo vôi răng là thủ thuật sử dụng các dụng cụ nha khoa chuyên dụng để làm sạch các mảng bám ra khỏi thân răng và nướu một cách nhanh chóng', '240000.00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `slots`
--

CREATE TABLE `slots` (
  `id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `slot_date` date NOT NULL,
  `slot_time` time NOT NULL,
  `is_booked` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Đang đổ dữ liệu cho bảng `slots`
--

INSERT INTO `slots` (`id`, `doctor_id`, `slot_date`, `slot_time`, `is_booked`) VALUES
(8, 1, '2024-10-30', '13:00:00', 1),
(9, 1, '2024-10-30', '14:00:00', 1),
(10, 2, '2024-10-30', '14:00:00', 1),
(11, 3, '2024-10-30', '14:00:00', 0),
(12, 4, '2024-10-30', '14:00:00', 0),
(13, 1, '2024-10-30', '15:00:00', 1),
(14, 1, '2024-11-15', '14:00:00', 0),
(15, 1, '2024-11-12', '14:00:00', 0),
(16, 7, '2024-11-13', '10:00:00', 1),
(17, 7, '2024-11-14', '11:00:00', 1),
(18, 1, '2024-11-28', '08:00:00', 1),
(19, 2, '2024-11-27', '09:00:00', 0),
(20, 3, '2024-11-28', '10:00:00', 0),
(21, 1, '2024-11-26', '08:00:00', 1),
(22, 3, '2024-11-26', '08:00:00', 0),
(23, 4, '2024-11-28', '08:00:00', 0),
(24, 4, '2024-11-22', '11:00:00', 0),
(25, 7, '2024-11-29', '09:00:00', 0),
(26, 7, '2024-11-27', '16:00:00', 0),
(27, 7, '2024-11-29', '08:00:00', 0);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(15) DEFAULT '000000000',
  `address` varchar(255) DEFAULT NULL,
  `gender` varchar(50) DEFAULT NULL,
  `dob` varchar(50) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `image` text DEFAULT 'data:image/png;base64,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'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `address`, `gender`, `dob`, `password`, `image`) VALUES
(1, 'Levannguyen', 'nguyencaonguyncmu@gmail.com', '000000000', NULL, 'Male', '2024-10-23', '$2b$10$zatit8LE/WwY5yzLr585fuqpz/IeAFPegMlRP9P8IJaO4AsrBJx8q', 'data:image/png;base64,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'),
(2, 'Bùi Viết Hoàng', 'tranhonghoanghuy1@gmail.com', '000000000', NULL, NULL, NULL, '$2b$10$kVUOrIexXG1stdS5O25Gpub6VAOlFo4r76qFasV7Yw68oQWSRJG.C', 'data:image/png;base64,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'),
(3, 'Nguyen Cao Nguyen', 'nguyencaonguyencmu@gmail.com', '0394073759', 'Hà nội', 'Male', '1999-11-09', '$2b$10$38UwThTEzQWP3ltX/iephenELcixOW3SOfp31.SCNUW80PWgtByVa', 'data:image/png;base64,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'),
(4, 'nguyen', 'lenguyen@gmail.com', '0394878545', 'Hà Nội', 'Nam', '1996-11-05', '$2b$10$k//e5HbU0vcYy8B7tm21iu/V4TPXJixXUwc5HbvT80F2NUgJiudTC', 'data:image/png;base64,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'),
(5, 'Bùi Xuân Thịnh ', 'thinh@gmail.com', '090535465', 'Đà Nẵng', 'Nam', '1994-12-06', '$2b$10$2NyTo/G7LLhmcyvS/6vIce41NfIUcV4W4sv.KNEjkVGeBIN5xFRlO', 'data:image/png;base64,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'),
(6, 'Nguyễn Lê Toàn', 'letoan@gmail.com', '0354073756', 'Đà Nẵng', 'Nam', '1995-11-06', '$2b$10$IpXY4l12VY5PlMUGWUfeDObMHsI6ULohvSQJS5ui8XhRGQPobLjWu', 'data:image/png;base64,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');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `doctors`
--
ALTER TABLE `doctors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Chỉ mục cho bảng `doc_ser`
--
ALTER TABLE `doc_ser`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `feedbacks`
--
ALTER TABLE `feedbacks`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `news`
--
ALTER TABLE `news`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `slots`
--
ALTER TABLE `slots`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT cho bảng `doctors`
--
ALTER TABLE `doctors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `doc_ser`
--
ALTER TABLE `doc_ser`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `feedbacks`
--
ALTER TABLE `feedbacks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `news`
--
ALTER TABLE `news`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT cho bảng `slots`
--
ALTER TABLE `slots`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
