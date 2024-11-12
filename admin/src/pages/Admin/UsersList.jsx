import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const UsersList = () => {
  const { backendUrl } = useContext(AppContext)
  const { users, aToken, getAllUser } = useContext(AdminContext)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    dob: '',
    password: ''  // Thêm trường password
  })

  useEffect(() => {
    if (aToken) {
      getAllUser()
    }
  }, [aToken])

  const openModal = (user = null) => {
    setIsEditMode(!!user)
    setUserData(user || {
      name: '',
      email: '',
      phone: '',
      address: '',
      gender: '',
      dob: '',
      password: ''  // Reset password khi mở modal
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setUserData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveUser = async () => {
    try {
        if (isEditMode) {
            // Gọi API chỉnh sửa người dùng
            await axios.post(
                `${backendUrl}/api/user/edit-user`,
                { ...userData, userId: userData.id },
                { headers: { aToken } }
            );
            toast.success('Thành công');
        } else {
            // Gọi API thêm người dùng
            await axios.post(
                `${backendUrl}/api/user/add-user`,
                userData,
                { headers: { aToken } }
            );
            toast.success('Thành công');
        }
        getAllUser();
        closeModal();
    } catch (error) {
        toast.error('Lỗi');
        console.error(error);
    }
};


  return (
    <div className='m-5 max-h-[90vh] overflow-y-scroll'>
      <h1 className='text-lg font-medium'>Danh sách bệnh nhân</h1>
      <button onClick={() => openModal()} className='mt-4 mb-4 bg-blue-500 text-white px-4 py-2 rounded'>Thêm Mới</button>
      
      <div className='w-full pt-5'>
        <table className='min-w-full border border-[#C9D8FF]'>
          <thead>
            <tr className='bg-[#EAEFFF] text-left'>
              <th className='p-4 border-b border-[#C9D8FF]'>Họ tên</th>
              <th className='p-4 border-b border-[#C9D8FF]'>Email</th>
              <th className='p-4 border-b border-[#C9D8FF]'>SDT</th>
              <th className='p-4 border-b border-[#C9D8FF]'>Địa chỉ</th>
              <th className='p-4 border-b border-[#C9D8FF]'>Giới tính</th>
              <th className='p-4 border-b border-[#C9D8FF]'>Ngày sinh</th>
              <th className='p-4 border-b border-[#C9D8FF]'>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((item, index) => (
              <tr key={index} className='hover:bg-[#F7FAFC]'>
                <td className='p-4 border-b border-[#C9D8FF] text-sm text-[#262626]'>{item.name}</td>
                <td className='p-4 border-b border-[#C9D8FF] text-sm text-[#5C5C5C]'>{item.email}</td>
                <td className='p-4 border-b border-[#C9D8FF] text-sm text-[#5C5C5C]'>{item.phone}</td>
                <td className='p-4 border-b border-[#C9D8FF] text-sm text-[#5C5C5C]'>{item.address}</td>
                <td className='p-4 border-b border-[#C9D8FF] text-sm text-[#5C5C5C]'>{item.gender}</td>
                <td className='p-4 border-b border-[#C9D8FF] text-sm text-[#5C5C5C]'>{item.dob}</td>
                <td className='p-4 border-b border-[#C9D8FF] text-sm text-[#5C5C5C]'>
                  <button onClick={() => openModal(item)} className='text-blue-500'>Chỉnh Sửa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal thêm mới / chỉnh sửa */}
      {isModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center'>
          <div className='bg-white p-8 rounded w-96'>
            <h2 className='text-lg font-medium mb-4'>{isEditMode ? 'Chỉnh Sửa User' : 'Thêm Mới User'}</h2>
            <form>
              <input type='text' name='name' value={userData.name} onChange={handleInputChange} placeholder='Họ tên' className='w-full mb-2 p-2 border' />
              <input type='email' name='email' value={userData.email} onChange={handleInputChange} placeholder='Email' className='w-full mb-2 p-2 border' readOnly={isEditMode} />
              {/* Trường nhập mật khẩu chỉ hiển thị khi thêm mới */}
                 {!isEditMode && (
                <input type='password' name='password' value={userData.password} onChange={handleInputChange} placeholder='Mật khẩu' className='w-full mb-4 p-2 border' />
              )}
              <input type='text' name='phone' value={userData.phone} onChange={handleInputChange} placeholder='Số điện thoại' className='w-full mb-2 p-2 border' />
              <input type='text' name='address' value={userData.address} onChange={handleInputChange} placeholder='Địa chỉ' className='w-full mb-2 p-2 border' />
              <select 
              name='gender' 
              value={userData.gender} 
              onChange={handleInputChange} 
              className='w-full mb-2 p-2 border'
            >
              <option value=''>Chọn giới tính</option>
              <option value='Nam'>Nam</option>
              <option value='Nữ'>Nữ</option>
            </select>

              <input type='date' name='dob' value={userData.dob} onChange={handleInputChange} placeholder='Ngày sinh' className='w-full mb-2 p-2 border' />
              
           

              <button type='button' onClick={handleSaveUser} className='w-full bg-blue-500 text-white py-2 rounded'>{isEditMode ? 'Cập Nhật' : 'Thêm Mới'}</button>
              <button type='button' onClick={closeModal} className='w-full mt-2 py-2 border'>Hủy</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersList
