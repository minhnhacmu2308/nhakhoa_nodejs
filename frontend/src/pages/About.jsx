import React from 'react'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div>

      <div className='text-center text-2xl pt-10 text-[#707070]'>
        <p>VỀ CHÚNG TÔI</p>
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-12'>
        <img className='w-full md:max-w-[360px]' src="https://trunganhtamdental.com/wp-content/uploads/2023/07/doi-ngu-bac-si-1-4.jpg" alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600'>
          <p>Chào mừng bạn đến với Nha Khoa, đối tác đáng tin cậy của bạn trong việc quản lý nhu cầu chăm sóc sức khỏe của bạn một cách thuận tiện và hiệu quả. Tại Nha Khoa, chúng tôi hiểu những thách thức mà các cá nhân gặp phải khi đặt lịch hẹn với bác sĩ và quản lý hồ sơ sức khỏe của họ.</p>
          <p>Nha Khoa cam kết mang đến sự xuất sắc trong công nghệ chăm sóc sức khỏe. Chúng tôi không ngừng nỗ lực nâng cao nền tảng của mình, tích hợp những tiến bộ mới nhất để cải thiện trải nghiệm người dùng và cung cấp dịch vụ vượt trội. Cho dù bạn đang đặt cuộc hẹn đầu tiên hay quản lý dịch vụ chăm sóc liên tục, Nha Khoa luôn sẵn sàng hỗ trợ bạn từng bước.</p>
          <b className='text-gray-800'>Tầm nhìn của chúng tôi</b>
          <p>Tầm nhìn của chúng tôi tại Nha Khoa là tạo ra trải nghiệm chăm sóc sức khỏe liền mạch cho mọi người dùng. Chúng tôi mong muốn thu hẹp khoảng cách giữa bệnh nhân và nhà cung cấp dịch vụ chăm sóc sức khỏe, giúp bạn dễ dàng tiếp cận dịch vụ chăm sóc mình cần hơn khi cần.</p>
        </div>
      </div>

      <div className='text-xl my-4'>
        <p>TẠI SAO CHỌN CHÚNG TÔI</p>
      </div>

      <div className='flex flex-col md:flex-row mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>HIỆU QUẢ:
</b>
          <p>          Lên lịch cuộc hẹn hợp lý phù hợp với lối sống bận rộn của bạn.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>SỰ TIỆN LỢI:



 </b>
          <p>Truy cập vào mạng lưới các chuyên gia chăm sóc sức khỏe đáng tin cậy trong khu vực của bạn.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>CÁ NHÂN HÓA:</b>
          <p >Các đề xuất và lời nhắc phù hợp để giúp bạn luôn cập nhật về sức khỏe của mình.:</p>
        </div>
      </div>

    </div>
  )
}

export default About
