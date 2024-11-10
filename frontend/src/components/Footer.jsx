import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='md:mx-10'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10  mt-40 text-sm'>

        <div>
          <img className='mb-5 w-40' src={assets.logo} alt="" />
          <p className='w-full md:w-2/3 text-gray-600 leading-6'>Phòng khám nha khoa của chúng tôi cam kết mang đến trải nghiệm chăm sóc sức khỏe răng miệng tốt nhất cho khách hàng. Với đội ngũ bác sĩ chuyên nghiệp, tận tâm và trang thiết bị hiện đại, chúng tôi cung cấp các dịch vụ chất lượng cao từ thăm khám, tư vấn đến điều trị chuyên sâu. Chúng tôi luôn đặt sức khỏe và sự hài lòng của khách hàng lên hàng đầu, giúp bạn tự tin với nụ cười rạng rỡ.</p>
        </div>

        <div>
          <p className='text-xl font-medium mb-5'>Nha Khoa</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li>Trang chủ</li>
            <li>Về chúng tôi</li>
            <li>Dịch vụ</li>
            <li>Tin tức</li>
          </ul>
        </div>

        <div>
          <p className='text-xl font-medium mb-5'>Liên hệ</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li>0123456789</li>
            <li>nhakhoa@gmail.com</li>
          </ul>
        </div>

      </div>

      <div>
        <hr />
        <p className='py-5 text-sm text-center'>Copyright 2024 @ Nha Khoa.com - All Right Reserved.</p>
      </div>

    </div>
  )
}

export default Footer
