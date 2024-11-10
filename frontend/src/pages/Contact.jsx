import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div>

      <div className='text-center text-2xl pt-10 text-[#707070]'>
        <p>CÁC THÔNG TIN LIÊN HỆ</p>
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 text-sm'>
        <img className='w-full md:max-w-[360px]' src="https://kiennghiepgroup.com/wp-content/uploads/2024/06/bac-si-nha-khoa-lam-nhung-cong-viec-gi-kien-nghiep-group.png" alt="" />
        <div className='flex flex-col justify-center items-start gap-6'>
          <p className=' font-semibold text-lg text-gray-600'>PHÒNG KHÁM CỦA CHÚNG TÔI</p>
          <p className=' text-gray-500'>Địa chỉ <br /> Việt Nam</p>
          <p className=' text-gray-500'>Hotline: (415) 555-0132 <br /> Email: nhakhoa@gmail.com</p>
        </div>
      </div>

    </div>
  )
}

export default Contact
