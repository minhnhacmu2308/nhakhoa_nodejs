import React, { useContext, useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { toast } from "react-toastify";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom"; // Thêm useNavigate để chuyển hướng

const ServiceList = () => {
  const { backendUrl } = useContext(AppContext);
  const { aToken } = useContext(AdminContext);
  const navigate = useNavigate(); // Sử dụng hook useNavigate

  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // Quản lý trạng thái modal
  const [modalContent, setModalContent] = useState(""); // Nội dung modal

  // Lấy danh sách dịch vụ
  const fetchServices = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/service/list`, {
        headers: { aToken },
      });
      setServices(data.services || []);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách dịch vụ");
      console.error(error);
    }
  };

  useEffect(() => {
    if (aToken) {
      fetchServices();
    }
  }, [aToken]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  const handleAddService = () => {
    navigate('/add-service'); // Điều hướng đến trang AddService
  };

  const handleEditService = (service) => {
    navigate(`/edit-service/${service.id}`); // Điều hướng đến trang EditService với id dịch vụ
  };

  // Hàm mở modal với nội dung
  const openModal = (shortdes) => {
    setModalContent(shortdes); // Lưu nội dung mô tả vào state
    setIsModalOpen(true); // Mở modal
  };

  // Hàm đóng modal
  const closeModal = () => {
    setIsModalOpen(false); // Đóng modal
    setModalContent(""); // Xóa nội dung modal
  };

  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll">
      <h1 className="text-lg font-medium">Danh sách dịch vụ</h1>
      <button
        onClick={handleAddService}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Thêm Dịch Vụ Mới
      </button>

      {/* Danh sách dịch vụ */}
      <table className="border border-[#C9D8FF] text-left text-sm lg:text-base" style={{ width: "900px", margin: "0 auto" }}>
        <thead>
          <tr className="bg-[#EAEFFF] text-left">
            <th className="p-4 border-b border-[#C9D8FF]">Tên dịch vụ</th>
            <th className="p-4 border-b border-[#C9D8FF]">Hình ảnh</th>
            <th className="p-4 border-b border-[#C9D8FF]">Giá</th>
            <th className="p-4 border-b border-[#C9D8FF]">Mô tả ngắn</th>
            <th className="p-4 border-b border-[#C9D8FF]">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service, index) => (
            <tr key={index} className="hover:bg-[#F7FAFC]">
              <td className="p-4 border-b border-[#C9D8FF]">{service.title}</td>
              <td className="p-4 border-b border-[#C9D8FF]">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-36 h-24 object-cover rounded"
                />
              </td>
              <td className="p-4 border-b border-[#C9D8FF]">{formatCurrency(service.price)}</td>
              <td className="p-4 border-b border-[#C9D8FF]">
                <button
                  onClick={() => openModal(service.shortdes)} // Mở modal khi nhấn "Xem"
                  className="text-blue-500 underline"
                >
                  Xem
                </button>
              </td>
              <td className="p-4 border-b border-[#C9D8FF]">
                <Link to={`/edit-service/${service.id}`} state={service}>
                  <button>Chỉnh sửa</button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal hiển thị nội dung mô tả */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h3 className="text-lg font-semibold mb-4">Mô tả ngắn</h3>
            <p>{modalContent}</p>
            <button
              onClick={closeModal}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceList;
