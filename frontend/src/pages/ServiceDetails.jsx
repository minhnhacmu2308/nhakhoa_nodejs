import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const ServiceDetails = () => {
  const { id } = useParams(); // Lấy id từ URL
  const { services } = useContext(AppContext); // Lấy dữ liệu dịch vụ từ AppContext

  // Tìm dịch vụ dựa trên id
  const service = services.find((service) => service.id === parseInt(id));

  if (!service) {
    return <div>Dịch vụ không tồn tại.</div>; // Nếu không tìm thấy dịch vụ
  }

  return (
    <div className="service-detail-container p-8 bg-white rounded-xl shadow-md max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-[#262626] mb-6">{service.title}</h1>

      <div className="service-info flex flex-col gap-10">
        {/* Hình ảnh dịch vụ */}
        <div className="service-image mb-6">
          <img
            className="service-image-img w-full rounded-lg object-cover"
            src={service.image}
            alt={service.title}
          />
        </div>

        {/* Thông tin chi tiết dịch vụ */}
        <div className="service-details">
          <p className="text-lg font-medium text-[#5C5C5C]">{service.shortdes}</p>
          <div className="description mt-4 text-sm text-[#555]">
            <p><strong>Mô tả:</strong></p>
            {/* Sử dụng dangerouslySetInnerHTML để hiển thị HTML */}
            <div
              className="description-content"
              dangerouslySetInnerHTML={{ __html: service.description }}
            />
          </div>
          <div className="price mt-6 text-xl font-semibold text-[#e44d4d]">
            <p><strong>Giá: </strong>{service.price} VND</p>
          </div>
        </div>
      </div>

      <div className="back-button mt-10 text-center">
        <button
          onClick={() => window.history.back()} // Quay lại trang trước
          className="px-6 py-2 bg-primary text-white rounded-full hover:scale-105 transition-all duration-300"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
};

export default ServiceDetails;

<style jsx>{`
  .service-detail-container {
    max-width: 1600px;
    margin: auto;
    padding: 2rem;
    background-color: #ffffff;
    border-radius: 1rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden; /* Đảm bảo nội dung không tràn ra ngoài */
  }

  .service-info {
    display: flex;
    flex-direction: column; /* Sắp xếp theo chiều dọc */
    gap: 20px;
  }

  .service-image-img {
    width: 100%;
    height: auto; /* Đảm bảo ảnh không bị méo */
    object-fit: cover;
    border-radius: 8px;
    margin: auto;
    max-height: 400px; /* Giới hạn chiều cao ảnh */
  }

  .service-details {
    font-family: Arial, sans-serif;
    line-height: 1.6;
  }

  .price {
    font-size: 1.25rem;
    color: #e44d4d;
  }

  .back-button button:hover {
    transform: scale(1.05);
  }

  .back-button button {
    background-color: #3498db;
    padding: 12px 30px;
    border-radius: 25px;
    color: white;
    border: none;
  }

  /* Đảm bảo nội dung không tràn ra ngoài div và có thanh cuộn nếu cần */
  .description-content {
    max-width: 100%;  /* Giới hạn chiều rộng */
    width: 100%;      /* Đảm bảo chiếm hết chiều rộng của div cha */
    word-wrap: break-word; /* Đảm bảo từ không tràn ra ngoài */
    overflow-wrap: break-word; /* Dùng để ngắt từ khi cần thiết */
    word-break: break-word; /* Ngắt từ ở cuối dòng nếu cần */
    overflow: hidden; /* Đảm bảo không tràn ra ngoài */
    padding-bottom: 20px; /* Thêm một chút khoảng cách dưới nội dung */
  }
`}</style>
