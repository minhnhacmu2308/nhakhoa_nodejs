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
    // const [availableSlotTimes, setAvailableSlotTimes] = useState([])
    const [slotDate, setSlotDate] = useState('');
    const [slotTime, setSlotTime] = useState('')

    const slotDateFormat = (dateSlot) => {
        const date = new Date(dateSlot)
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
        return formattedDate
    }

    const getSlotTimesByDate = (slotArr, date) => {
        console.log("date", date)
        console.log("slotArr11", slotArr)
        console.log("slotTime", slotTime)
        return slotArr
            .filter(slot => slot.slot_date === date && slot.is_booked === 0)
            .map(slot => slot.slot_time);
    };

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
        const updatedAppointments = [...appointments]
        console.log("updatedAppointments", updatedAppointments)
        console.log("updatedAppointments[index].doctor_id", updatedAppointments[index].doctor_id)
        console.log("updatedAppointments[index]", updatedAppointments[index])
        console.log("slots", slots)
        setSlotDate(updatedAppointments[index].slot_date)
        setSlotTime(updatedAppointments[index].slot_time)
        const slotDoc = slots.filter((doc) => doc.doctor_id === parseInt(updatedAppointments[index].doctor_id, 10))
        console.log("slotDoc1", slotDoc)
        const obj = {
            doctor_id: updatedAppointments[index].doctor_id,
            id: updatedAppointments[index].service_id,
            is_booked: 0,
            slot_date: updatedAppointments[index].slot_date,
            slot_time: updatedAppointments[index].slot_time
        }
        slotDoc.push(obj);
        setSlotArr(slotDoc);
        console.log("slotArr", slotArr)
        updatedAppointments[index].isEdit = !updatedAppointments[index].isEdit
        updatedAppointments.forEach((appointment, i) => {
            updatedAppointments[i].isEdit = (i === index);
        });
        setAppointments(updatedAppointments)
        // const a = getSlotTimesByDate(slotDoc, updatedAppointments[index].slot_date);
        // console.log("a", a)
        // setAvailableSlotTimes(a);
    }

    const handleCancelEditToggle = (index) => {
        const updatedAppointments = [...appointments]
        updatedAppointments[index].isEdit = !updatedAppointments[index].isEdit
        setAppointments(updatedAppointments)
    }
    const availableSlotTimes = getSlotTimesByDate(slotArr, slotDate);

    const saveEdit = async (index) => {
        const appointment = appointments[index]
        try {
            const { data } = await axios.put(
                backendUrl + `/api/user/update-appointment`,
                { appointmentId: appointment.appointment_id, /* Thêm dữ liệu cần chỉnh sửa */ },
                { headers: { token } }
            )

            if (data.success) {
                toast.success("Appointment updated successfully")
                getUserAppointments()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

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
            <p className='pb-3 mt-12 text-lg font-medium text-gray-600 border-b'>My appointments</p>
            <div className=''>
                {appointments.length === 0 ? (
                    <p className='text-center text-gray-500'>No appointments available</p>
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
                                <p className='text-[#464646] font-medium mt-1'>Address:</p>
                                <p className=''>{item.doctor_address}</p>
                                <p className='text-[#464646] font-medium mt-1'>Service:</p>
                                {item.isEdit ? (<select

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
                                    <span className='text-sm text-[#3C3C3C] font-medium'>Date & Time:</span>
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
                                                        onClick={() => setSlotDate(appt.slot_date)}
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
                                                            className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${time === item.slot_time ? 'bg-primary text-white' : 'text-[#949494] border border-[#B4B4B4]'}`}
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

                                {!item.cancelled && !item.isCompleted && (
                                    <button
                                        onClick={() => cancelAppointment(item.appointment_id)}
                                        className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'
                                        disabled={loadingAppointmentId === item.appointment_id}
                                    >
                                        {loadingAppointmentId === item.appointment_id ? "Cancelling..." : "Cancel appointment"}
                                    </button>
                                )}

                                {item.cancelled === 1 && !item.isCompleted && <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>Appointment cancelled</button>}
                                {item.cancelled === 1 || item.isCompleted === 1 ? null : <button
                                    onClick={() => item.isEdit ? handleCancelEditToggle(index) : handleEditToggle(index)}
                                    className='text-blue-500 py-2 border rounded hover:bg-blue-500 hover:text-white transition-all duration-300'
                                >
                                    {item.isEdit ? "Cancel Edit" : "Edit"}
                                </button>
                                }

                                {item.isEdit && (
                                    <button
                                        onClick={() => saveEdit(index)}
                                        className='text-green-500 py-2 border rounded hover:bg-green-500 hover:text-white transition-all duration-300'
                                    >
                                        Save
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
