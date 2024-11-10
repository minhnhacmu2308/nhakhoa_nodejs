import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const Services = () => {
  const { services } = useContext(AppContext); // Lấy dữ liệu từ AppContext
  const navigate = useNavigate();

  const handleServiceClick = (id) => {
    navigate(`/service-details/${id}`); // Chuyển đến trang chi tiết dịch vụ
  };

  return (
    <div>
      <p className='text-gray-600'>List our services</p>
      <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>
        <div className='w-full grid grid-cols-1 sm:grid-cols-4 gap-4 gap-y-6'>
          {services.map((item) => (
            <div
              className='border border-[#C9D8FF] rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500'
              key={item.id}
              onClick={() => handleServiceClick(item.id)} // Bấm vào dịch vụ để chuyển đến chi tiết
            >
              <img className='bg-[#EAEFFF]' src={item.image} alt={item.title} />
              <div className='p-4'>
                <p className='text-[#262626] text-lg font-medium'>{item.title}</p>
                <p className='text-[#5C5C5C] text-sm'>{item.shortdes}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
