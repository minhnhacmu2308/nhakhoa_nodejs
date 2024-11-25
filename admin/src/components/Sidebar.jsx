import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { NavLink } from 'react-router-dom';
import { DoctorContext } from '../context/DoctorContext';
import { AdminContext } from '../context/AdminContext';

const Sidebar = () => {

  const { dToken } = useContext(DoctorContext);
  const { aToken } = useContext(AdminContext);

  const [doctorMenuOpen, setDoctorMenuOpen] = useState(false); // Trạng thái cho nhóm bác sĩ

  const toggleDoctorMenu = () => {
    setDoctorMenuOpen(!doctorMenuOpen); // Đổi trạng thái khi bấm vào nhóm bác sĩ
  };
  
  const [serviceMenuOpen, setServiceMenuOpen] = useState(false); // Trạng thái cho nhóm Dịch vụ
  const [newsMenuOpen, setNewsMenuOpen] = useState(false); // Trạng thái cho nhóm Tin tức

  const toggleServiceMenu = () => {
    setServiceMenuOpen(!serviceMenuOpen); // Đổi trạng thái khi bấm vào nhóm Dịch vụ
  };

  const toggleNewsMenu = () => {
    setNewsMenuOpen(!newsMenuOpen); // Đổi trạng thái khi bấm vào nhóm Tin tức
  };

  return (
    <div className='min-h-screen bg-white border-r'>
      {aToken && (
        <ul className='text-[#515151] mt-5'>
          {aToken !== "eyJhbGciOiJIUzI1NiJ9.bmhhbnZpZW5AZ21haWwuY29tMTIzNDU2Nzg5.X50HKqcCT48nLV1sMwwHGT0jB3c9ev0RWAUjUYB8t18" && (
            <NavLink 
              to={'/admin-dashboard'} 
              className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}>
              <img className='min-w-5' src={assets.dashboard_icon} alt='' style={{ width: '64px' }} />
              <p className='hidden md:block'>Bảng điều khiển</p>
            </NavLink>
          )}
          
          <NavLink 
            to={'/all-appointments'} 
            className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}>
            <img className='min-w-5' src={assets.appointments_icon} alt='' />
            <p className='hidden md:block'>Lịch hẹn</p>
          </NavLink>

          {aToken !== "eyJhbGciOiJIUzI1NiJ9.bmhhbnZpZW5AZ21haWwuY29tMTIzNDU2Nzg5.X50HKqcCT48nLV1sMwwHGT0jB3c9ev0RWAUjUYB8t18" && (
            <div>
              <button 
                onClick={toggleDoctorMenu} 
                className='flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer'>
                <img className='min-w-5' src={assets.doctor_icon} alt='' />
                <p className='hidden md:block'>Bác sĩ</p>
              </button>

              {doctorMenuOpen && (
                <div className='pl-8'>
                  <NavLink 
                    to={'/doctor-list'} 
                    className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}>
                    <img className='min-w-5' src={assets.list_icon} alt='' />
                    <p className='hidden md:block'>Danh sách bác sĩ</p>
                  </NavLink>
                  <NavLink 
                    to={'/add-doctor'} 
                    className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}>
                    <img className='min-w-5' src={assets.add_icon} alt='' />
                    <p className='hidden md:block'>Thêm bác sĩ</p>
                  </NavLink>

                  <NavLink 
                    to={'/add-slot'} 
                    className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}>
                    <img className='min-w-5' src={assets.add_icon} alt='' />
                    <p className='hidden md:block'>Thêm ca</p>
                  </NavLink>
                </div>
              )}
            </div>
          )}
          {aToken !== "eyJhbGciOiJIUzI1NiJ9.bmhhbnZpZW5AZ21haWwuY29tMTIzNDU2Nzg5.X50HKqcCT48nLV1sMwwHGT0jB3c9ev0RWAUjUYB8t18" && (
          <div>
            <button 
              onClick={toggleServiceMenu} 
              className='flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer'>
              <img className='min-w-5' src={assets.service_icon} style={{ width: '64px' }} alt='' />
              <p className='hidden md:block'>Dịch vụ</p>
            </button>

            {serviceMenuOpen && (
              <div className='pl-8'>
                 <NavLink 
                    to={'/service-list'} 
                    className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}>
                    <img className='min-w-5' src={assets.list_icon} alt='' />
                    <p className='hidden md:block'>Danh sách dịch vụ</p>
                  </NavLink>
                <NavLink 
                  to={'/add-service'} 
                  className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}>
                  <img className='min-w-5' src={assets.add_icon} alt='' />
                  <p className='hidden md:block'>Thêm dịch vụ</p>
                </NavLink>
              </div>
            )}
          </div>
          )}
          <div>
            <button 
              onClick={toggleNewsMenu} 
              className='flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer'>
              <img className='min-w-5' src={assets.news_icon} alt='' style={{ width: '64px' }} />
              <p className='hidden md:block'>Tin tức</p>
            </button>

            {newsMenuOpen && (
              <div className='pl-8'>
                <NavLink 
                    to={'/news-list'} 
                    className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}>
                    <img className='min-w-5' src={assets.list_icon} alt='' />
                    <p className='hidden md:block'>Danh sách tin tức</p>
                  </NavLink>
                <NavLink 
                  to={'/add-news'} 
                  className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}>
                  <img className='min-w-5' src={assets.add_icon} alt='' />
                  <p className='hidden md:block'>Thêm tin tức</p>
                </NavLink>
              </div>
            )}
          </div>
          
          {/* Mục Bệnh nhân không có dropdown */}
          <NavLink 
            to={'/user-list'} 
            className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}>
            <img className='min-w-5' src={assets.patients_icon} alt='' />
            <p className='hidden md:block'>Bệnh nhân</p>
          </NavLink>
        </ul>
      )}

      {dToken && (
        <ul className='text-[#515151] mt-5'>
          <NavLink 
            to={'/doctor-appointments'} 
            className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}>
            <img className='min-w-5' src={assets.appointment_icon} alt='' />
            <p className='hidden md:block'>Lịch hẹn</p>
          </NavLink>
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
