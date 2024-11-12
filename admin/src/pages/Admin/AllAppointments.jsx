import React, { useEffect } from 'react';
import { assets } from '../../assets/assets';
import { useContext } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';

const AllAppointments = () => {
  const { aToken, appointments, cancelAppointment, getAllAppointments, completeAppointment } = useContext(AdminContext);
  const {calculateAge, currency } = useContext(AppContext);

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken]);

  const slotDateFormat = (dateSlot) => {
    const date = new Date(dateSlot)
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
    return formattedDate
}

  return (
    <div className='w-full max-w-6xl m-5'>
      <p className='mb-3 text-lg font-medium'>Danh sách lịch hẹn</p>

      <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll'>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 border-b">#</th>
                <th className="px-6 py-3 border-b text-left">Bệnh nhân</th>
                <th className="px-6 py-3 border-b text-left">Ngày & Giờ</th>
                <th className="px-6 py-3 border-b text-left">Bác sĩ</th>
                <th className="px-6 py-3 border-b text-left">Dịch vụ</th>
                <th className="px-6 py-3 border-b text-left">Giá tiền</th>
                {/* <th className="px-6 py-3 border-b text-left">Payment</th> */}
                <th className="px-6 py-3 border-b text-left">Tình trạng</th>
                <th className="px-6 py-3 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((item, index) => (
                <tr className="hover:bg-gray-50" key={index}>
                  <td className="px-6 py-3 border-b text-center">{index + 1}</td>
                  <td className="px-6 py-3 border-b text-left">
                    <div className="flex items-center gap-2">
                      <p>{item.patname}</p>
                    </div>
                  </td>
                  <td className="px-6 py-3 border-b text-left">
                    {slotDateFormat(item.slot_date).slice(0, 10).split('-').reverse().join('-')} {item.slot_time}
                  </td>
                  <td className="px-6 py-3 border-b text-left">
                    <div className="flex items-center gap-2">
                      <p>{item.docname}</p>
                    </div>
                  </td>
                  <td className="px-6 py-3 border-b text-left">
                    <div className="flex items-center gap-2">
                      <p>{item.title}</p>
                    </div>
                  </td>
                  <td className="px-6 py-3 border-b text-left">{item.amount}</td>
                  {/* <td className="px-6 py-3 border-b text-left">
                    {item.payment === 0 ? 'Chưa thanh toán' : 'Đã thanh toán'}
                  </td> */}
                  <td className="px-6 py-3 border-b text-left">
                    {item.isCompleted === 0 ? 'Chưa hoàn thành' : 'Đã hoàn thành'}
                  </td>
                  <td className="px-6 py-3 border-b text-center">
                    {item.cancelled ? (
                      <p className="text-red-400 text-xs font-medium">Hủy</p>
                    ) : item.isCompleted ? (
                      <p className="text-green-500 text-xs font-medium">Hoàn thành</p>
                    ) : (
                      <div className="flex justify-center items-center">
                        <img
                          onClick={() => cancelAppointment(item.id)}
                          className="w-6 h-6 cursor-pointer mx-1"
                          src={assets.cancel_icon}
                          alt="Cancel"
                        />
                        <img
                          onClick={() => completeAppointment(item.id)}
                          className="w-6 h-6 cursor-pointer mx-1"
                          src={assets.complete_icon} // Thay đổi thành icon hoàn thành của bạn
                          alt="Complete"
                        />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
};

export default AllAppointments;
