import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyAppointments = () => {
    const { backendUrl, token, services, slots, getSlotsData } = useContext(AppContext)
    const navigate = useNavigate()
    const [appointments, setAppointments] = useState([])
    const [slotArr, setSlotArr] = useState([])
    const [loadingAppointmentId, setLoadingAppointmentId] = useState(null)
    const [loadingEditAppointmentId, setLoadingEditAppointmentId] = useState(null)
    const [slotDate, setSlotDate] = useState('');
    const [slotTime, setSlotTime] = useState('');
    const [serviceId, setServiceId] = useState();
    const [doctorId, setDoctorId] = useState();
    const [appointmentId, setAppointmentId] = useState();


    const slotDateFormat = (dateSlot) => {
        const date = new Date(dateSlot)
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
        return formattedDate
    }

    const getSlotTimesByDate = (slotArr, date) => {
        return slotArr
            .filter(slot => slot.slot_date === date && slot.is_booked === 0)
            .map(slot => slot.slot_time);
    };

    const setSlotDateAsyn = (data) => {
        setSlotDate(data)
        setSlotTime('')
    }

    const getUserAppointments = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
            const updatedAppointments = data.appointments.reverse().map((appointment) => ({
                ...appointment,
                isEdit: false // Thêm isEdit ban đầu là false
            }))
            console.log("isEdit", updatedAppointments)
            setAppointments(updatedAppointments)
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const editAppointment = async (index) => {
        setLoadingEditAppointmentId(appointmentId);
        if (!token) {
            toast.warning('Login to book appointment');
            return navigate('/login');
        }

        if (!doctorId || !slotDate || !slotTime || !serviceId) {
            toast.warning('Please select all required options before booking an appointment');
            return;
        }

        try {
            const { data } = await axios.post(
                backendUrl + '/api/user/edit-appointment',
                { doctorId, slotDate, slotTime, serviceId, appointmentId },
                { headers: { token } }
            );
            if (data.success) {
                toast.success("Appointment updated successfully")
                getUserAppointments();
                getSlotsData();
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setLoadingEditAppointmentId(null);
        }
    }

    const cancelAppointment = async (appointmentId) => {
        try {
            setLoadingAppointmentId(appointmentId)
            const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment', { appointmentId }, { headers: { token } })

            if (data.success) {
                toast.success(data.message)
                getUserAppointments()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setLoadingAppointmentId(null)
        }
    }

    const handleEditToggle = (index) => {
        console.log("indexx", index)
        console.log("appointments", appointments)
        const updatedAppointments = [...appointments]
        console.log("updatedAppointments", updatedAppointments)
        setSlotDate(updatedAppointments[index].slot_date)
        setSlotTime(updatedAppointments[index].slot_time)
        setServiceId(updatedAppointments[index].service_id)
        setDoctorId(updatedAppointments[index].doctor_id)
        setAppointmentId(updatedAppointments[index].appointment_id)
        const slotDoc = slots.filter((doc) => doc.doctor_id === parseInt(updatedAppointments[index].doctor_id, 10))
        const obj = {
            doctor_id: updatedAppointments[index].doctor_id,
            id: updatedAppointments[index].service_id,
            is_booked: 0,
            slot_date: updatedAppointments[index].slot_date,
            slot_time: updatedAppointments[index].slot_time
        }
        slotDoc.push(obj);
        setSlotArr(slotDoc);
        updatedAppointments[index].isEdit = !updatedAppointments[index].isEdit
        updatedAppointments.forEach((appointment, i) => {
            updatedAppointments[i].isEdit = (i === index);
        });
        setAppointments(updatedAppointments)
    }

    const handleCancelEditToggle = (index) => {
        const updatedAppointments = [...appointments]
        updatedAppointments[index].isEdit = !updatedAppointments[index].isEdit
        setAppointments(updatedAppointments)
    }
    const availableSlotTimes = getSlotTimesByDate(slotArr, slotDate);

    useEffect(() => {
        if (token) {
            getSlotsData();
        }
    }, [token])

    useEffect(() => {
        if (token) {
            getUserAppointments()
        }
    }, [token])

    return (
        <div>
            <p className='pb-3 mt-12 text-lg font-medium text-gray-600 border-b'>Lịch sử cuộc hẹn</p>
            <div className=''>
                {appointments.length === 0 ? (
                    <p className='text-center text-gray-500'>Không có dữ liệu</p>
                ) : appointments.map((item, index) => {
                    const formattedVND = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.amount);
                    return (
                        <div key={index} className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border-b'>
                            <div>
                                <img className='w-36 bg-[#EAEFFF]' src={item.image} alt="" />
                            </div>
                            <div className='flex-1 text-sm text-[#5E5E5E]'>
                                <p className='text-[#262626] text-base font-semibold'>{item.doctor_name}</p>
                                <p>{item.speciality}</p>
                                <p className='text-[#464646] font-medium mt-1'>Địa chỉ:</p>
                                <p className=''>{item.doctor_address}</p>
                                <p className='text-[#464646] font-medium mt-1'>Dịch vụ:</p>
                                {item.isEdit ? (<select
                                    onChange={e => setServiceId(e.target.value)} value={serviceId}
                                    className='border rounded px-2 py-2 w-full'
                                    required
                                >
                                    <option value={item.service_id} >{item.service_name} - {formattedVND}</option>
                                    {services.map(item => {
                                        const formattedVNDService = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price);
                                        return (
                                            <option key={item.id} value={item.id}>{item.title} - {formattedVNDService}</option>
                                        )
                                    })}
                                </select>) : (<p className=''>{item.service_name} - {formattedVND}</p>)
                                }

                                <p className='mt-1'>
                                    <span className='text-sm text-[#3C3C3C] font-medium'>Thời gian:</span>
                                    {item.isEdit ? (
                                        <>   <div className='flex gap-3 items-center w-full overflow-x-scroll mt-2'>
                                            {slotArr.length !== 0 && [...new Map(slotArr.filter(x => x.is_booked === 0).map(appt => [new Date(appt.slot_date).toDateString(), appt])).values()].map((appt, index) => {
                                                const date = new Date(appt.slot_date);
                                                const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                                                const dayOfWeek = daysOfWeek[date.getDay()];
                                                const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

                                                return (
                                                    <div
                                                        key={index}
                                                        onClick={() => setSlotDateAsyn(appt.slot_date)}
                                                        className={`text-center py-1 px-3 rounded-full cursor-pointer ${slotDate === appt.slot_date ? 'bg-primary text-white' : 'border border-[#DDDDDD]'}`}
                                                    >
                                                        <p>{dayOfWeek}</p>
                                                        <p>{formattedDate}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                            <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
                                                {availableSlotTimes.length > 0 &&
                                                    availableSlotTimes.map((time, index) => (
                                                        <p
                                                            onClick={() => setSlotTime(time)}
                                                            key={index}
                                                            className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${time === slotTime ? 'bg-primary text-white' : 'text-[#949494] border border-[#B4B4B4]'}`}
                                                        >
                                                            {time.toLowerCase()}
                                                        </p>
                                                    ))}
                                            </div>
                                        </>

                                    ) : (
                                        `${slotDateFormat(item.slot_date)} | ${item.slot_time}`
                                    )}
                                </p>

                            </div>
                            <div className='flex flex-col gap-2 justify-end text-sm text-center'>
                                {item.isCompleted === 1 && <button className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500'>Completed</button>}

                                {!item.cancelled && !item.isCompleted && new Date(item.slot_date) >= new Date() && (
                                    <button
                                        onClick={() => cancelAppointment(item.appointment_id)}
                                        className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'
                                        disabled={loadingAppointmentId === item.appointment_id}
                                    >
                                        {loadingAppointmentId === item.appointment_id ? "Cancelling..." : "Cancel appointment"}
                                    </button>
                                )}

                                {item.cancelled === 1 && !item.isCompleted && <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>Appointment cancelled</button>}
                                {item.cancelled === 1 || item.isCompleted === 1 ? null :
                                    new Date(item.slot_date) >= new Date() ?
                                        <button
                                            onClick={() => item.isEdit ? handleCancelEditToggle(index) : handleEditToggle(index)}
                                            className='text-blue-500 py-2 border rounded hover:bg-blue-500 hover:text-white transition-all duration-300'
                                        >
                                            {item.isEdit ? "Cancel Edit" : "Edit"}
                                        </button> : null
                                }

                                {item.isEdit && (
                                    <button
                                        onClick={() => editAppointment(index)}
                                        className='text-green-500 py-2 border rounded hover:bg-green-500 hover:text-white transition-all duration-300'
                                        disabled={loadingEditAppointmentId === item.appointment_id}
                                    >
                                        {loadingEditAppointmentId === item.appointment_id ? "Saving..." : "Save"}
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default MyAppointments
