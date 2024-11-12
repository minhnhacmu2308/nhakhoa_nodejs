import React, { useContext, useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const AddSlot = () => {
    const [slotDate, setSlotDate] = useState('') // Trạng thái cho Slot Date
    const [doctorId, setDoctorId] = useState('') // Trạng thái cho Doctor ID
    const [slotTime, setSlotTime] = useState('') // Trạng thái cho Slot Time

    const { backendUrl } = useContext(AppContext)
    const { aToken, doctors, getAllDoctors } = useContext(AdminContext)

    useEffect(() => {
        if (aToken) {
            getAllDoctors()
        }
    }, [aToken])

    const onSubmitHandler = async (event) => {
        event.preventDefault()

        try {
            // const formData = new FormData();
            // formData.append('slotDate', slotDate) // Thêm Slot Date
            // formData.append('doctorId', doctorId) // Thêm Doctor ID
            // formData.append('slotTime', slotTime) // Thêm Slot Time

            // // In ra formdata            
            // formData.forEach((value, key) => {
            //     console.log(`${key}: ${value}`);
            // });
            // console.log("formData", formData)

            const { data } = await axios.post(backendUrl + '/api/admin/add-slot', { slotDate, doctorId, slotTime }, { headers: { aToken } })
            console.log("dsds", data)
            if (data.success) {
                toast.success(data.message)
                setSlotDate('') // Reset Slot Date
                setDoctorId('') // Reset Doctor ID
                setSlotTime('') // Reset Slot Time
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className='m-5 w-full'>
            <p className='mb-3 text-lg font-medium'>Thêm ca</p>
            <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll'>
                <div className='flex flex-col lg:flex-row items-start gap-10 text-gray-600'>
                    <div className='w-full lg:flex-1 flex flex-col gap-4'>
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Ngày</p>
                            <input
                                onChange={e => setSlotDate(e.target.value)}
                                value={slotDate}
                                className='border rounded px-3 py-2'
                                type="date" // Sử dụng type="date" cho input ngày
                                required
                            />
                        </div>
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Bác sĩ</p>
                            <select
                                onChange={e => setDoctorId(e.target.value)}
                                value={doctorId}
                                className='border rounded px-2 py-2'
                                required
                            >
                                <option value="" disabled>Chọn bác sĩ</option>
                                {doctors.map(doctor => (
                                    <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className='w-full lg:flex-1 flex flex-col gap-4'>
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Giờ</p>
                            <input
                                onChange={e => setSlotTime(e.target.value)}
                                value={slotTime}
                                className='border rounded px-3 py-2'
                                type="time" // Sử dụng type="time" cho input giờ
                                required
                            />
                        </div>
                    </div>
                </div>

                <button type='submit' className='bg-primary px-10 py-3 mt-4 text-white rounded-full'>Thêm</button>
            </div>
        </form>
    )
}

export default AddSlot
