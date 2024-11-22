import React, { useEffect, useState } from 'react';
import { assets } from '../../assets/assets';
import { useContext } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';

const AllAppointments = () => {
  const { aToken, appointments, cancelAppointment, getAllAppointments, completeAppointment,confirmAppointment } = useContext(AdminContext);
  const { calculateAge, currency } = useContext(AppContext);
  
  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [dateQuery, setDateQuery] = useState('');
  const [amountQuery, setAmountQuery] = useState('');
  const [statusQuery, setStatusQuery] = useState('');
  const [filteredAppointments, setFilteredAppointments] = useState(appointments);

  // Hàm lọc lịch hẹn theo các trường tìm kiếm
  const filterAppointments = () => {
    let filtered = appointments;

    if (searchQuery) {
      filtered = filtered.filter((appointment) =>
        appointment.patname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.docname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (dateQuery) {
      filtered = filtered.filter((appointment) => {
        const formattedDate = new Date(appointment.slot_date).toLocaleDateString('en-GB'); // Định dạng ngày theo kiểu dd-mm-yyyy
        return formattedDate.includes(dateQuery); // Kiểm tra nếu ngày chứa từ khóa
      });
    }

    if (amountQuery) {
      filtered = filtered.filter((appointment) =>
        appointment.amount.toString().includes(amountQuery) // Kiểm tra nếu số tiền chứa từ khóa
      );
    }

    if (statusQuery) {
      const statusFilter = statusQuery.toLowerCase();
      filtered = filtered.filter((appointment) => {
        const isCompleted = appointment.isCompleted === 1 ? 'hoàn thành' : 'chưa hoàn thành';
        return isCompleted.includes(statusFilter);
      });
    }
  
  setFilteredAppointments(filtered);
  };  
  useEffect(() => {
    filterAppointments(); // Lọc lại khi danh sách appointments hoặc các query tìm kiếm thay đổi
  }, [appointments, searchQuery, dateQuery, amountQuery, statusQuery]);


  const slotDateFormat = (dateSlot) => {
    const date = new Date(dateSlot)
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
    return formattedDate
  }

  return (
    <div className='w-full max-w-6xl m-5'>
      <p className='mb-3 text-lg font-medium'>Danh sách lịch hẹn</p>

      {/* Thêm các trường tìm kiếm */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm bệnh nhân, bác sĩ, dịch vụ..."
          className="w-full px-4 py-2 border rounded"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tìm kiếm theo ngày */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo ngày (dd-mm-yyyy)"
          className="w-full px-4 py-2 border rounded"
          value={dateQuery}
          onChange={(e) => setDateQuery(e.target.value)}
        />
      </div>

      {/* Tìm kiếm theo số tiền */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo số tiền"
          className="w-full px-4 py-2 border rounded"
          value={amountQuery}
          onChange={(e) => setAmountQuery(e.target.value)}
        />
      </div>

      {/* Tìm kiếm theo trạng thái */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo trạng thái (hoàn thành/chưa hoàn thành)"
          className="w-full px-4 py-2 border rounded"
          value={statusQuery}
          onChange={(e) => setStatusQuery(e.target.value)}
        />
      </div>

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
                <th className="px-6 py-3 border-b text-left">Tình trạng</th>
                <th className="px-6 py-3 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((item, index) => (
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
                  <td className="px-6 py-3 border-b text-left">
                    {item.isConfirm === 0 ? 'Chưa xác nhận' : item.isCompleted === 0 ? 'Chưa hoàn thành' : 'Đã hoàn thành'}
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
                        {item.isConfirm === 0 ? <img
                          onClick={() => confirmAppointment(item.id)}
                          className="w-6 h-6 cursor-pointer mx-1"
                          src={assets.complete_icon} // Thay đổi thành icon hoàn thành của bạn
                          alt="confirm"
                        /> : <img
                          onClick={() => completeAppointment(item.id)}
                          className="w-6 h-6 cursor-pointer mx-1"
                          src={assets.complete_icon}
                          alt="Complete"
                        />}


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
