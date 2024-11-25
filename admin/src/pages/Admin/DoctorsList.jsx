import React, { useContext, useEffect } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { useNavigate } from 'react-router-dom'; // Thêm useNavigate
import { Link } from 'react-router-dom';

const DoctorsList = () => {
  const { doctors, changeAvailability, aToken, getAllDoctors } = useContext(AdminContext);
  const navigate = useNavigate(); // Khai báo hook điều hướng

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken]);

  // Hàm điều hướng đến trang thêm bác sĩ mới
  const handleAddDoctor = () => {
    navigate('/add-doctor'); // Điều hướng đến trang thêm bác sĩ mới
  };

  return (
    <div className='m-5 max-h-[90vh] overflow-y-scroll'>
      <h1 className='text-lg font-medium'>Danh sách bác sĩ</h1>
      
      {/* Nút thêm bác sĩ mới */}
      <button
        onClick={handleAddDoctor}
        className='bg-blue-500 text-white px-4 py-2 rounded mb-4'
      >
        Thêm Bác sĩ Mới
      </button>

      {/* Bảng hiển thị danh sách bác sĩ */}
      <table className='border border-[#C9D8FF] text-left text-sm lg:text-base' style={{ width: '900px', margin: '0 auto' }}>
        <thead>
          <tr className='bg-[#EAEFFF] text-left'>
            <th className='p-4 border-b border-[#C9D8FF]'>Tên bác sĩ</th>
            <th className='p-4 border-b border-[#C9D8FF]'>Thông tin</th>
            <th className='p-4 border-b border-[#C9D8FF]'>Kinh nghiệm</th>
            <th className='p-4 border-b border-[#C9D8FF]'>Địa chỉ</th>
            <th className='p-4 border-b border-[#C9D8FF]'>Ảnh</th>
            <th className='p-4 border-b border-[#C9D8FF]'>Sẵn sàng</th>
            <th className='p-4 border-b border-[#C9D8FF]'>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((item, index) => (
            <tr key={index} className='hover:bg-[#F7FAFC]'>
              <td className='p-4 border-b border-[#C9D8FF]'>{item.name}</td>
              <td className='p-4 border-b border-[#C9D8FF]'>{item.about}</td>
              <td className='p-4 border-b border-[#C9D8FF]'>{item.experience}</td>
              <td className='p-4 border-b border-[#C9D8FF]'>{item.address}</td>
              <td className='p-4 border-b border-[#C9D8FF]'>
                <img src={item.image} alt={item.name} className='w-36 h-24 object-cover rounded' />
              </td>
              <td className='p-4 border-b border-[#C9D8FF]'>
                <input
                  type='checkbox'
                  checked={item.available}
                  onChange={() => changeAvailability(item.id)}
                />
              </td>
              <td className='p-4 border-b border-[#C9D8FF]'>
              <Link to={`/edit-doctor/${item.id}`} state={{ doctor: item }}>Chỉnh sửa</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DoctorsList;
