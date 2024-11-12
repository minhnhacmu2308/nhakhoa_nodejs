import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { useNavigate } from 'react-router-dom'


const Navbar = () => {

  const { dToken, setDToken } = useContext(DoctorContext)
  const { aToken, setAToken } = useContext(AdminContext)

  const navigate = useNavigate()

  const logout = () => {
    navigate('/')
    dToken && setDToken('')
    dToken && localStorage.removeItem('dToken')
    aToken && setAToken('')
    aToken && localStorage.removeItem('aToken')
  }

  const checkTokenType = (token) => {
    if (token === "eyJhbGciOiJIUzI1NiJ9.bmhhbnZpZW5AZ21haWwuY29tMTIzNDU2Nzg5.X50HKqcCT48nLV1sMwwHGT0jB3c9ev0RWAUjUYB8t18") {
     return 'Nhân viên';
    }
    return 'Quản trị viên'; 
  }

  return (
    <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white'>
      <div className='flex items-center gap-2 text-xs'>
        <img onClick={() => navigate('/')} className='w-36 sm:w-40 cursor-pointer' src={assets.admin_logo} alt="" />
        <p className='border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600'> {aToken ? checkTokenType(aToken) : 'Bác sĩ'}</p>
      </div>
      <button onClick={() => logout()} className='bg-primary text-white text-sm px-10 py-2 rounded-full'>Đăng xuất</button>
    </div>
  )
}

export default Navbar