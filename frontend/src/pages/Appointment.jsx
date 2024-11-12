import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import axios from 'axios'
import { toast } from 'react-toastify'

const Appointment = () => {

    const { docId } = useParams()
    const { doctors, currencySymbol, backendUrl, token, getDoctosData, slots, services } = useContext(AppContext)
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

    const [docInfo, setDocInfo] = useState(false)
    const [docSlots, setDocSlots] = useState([])
    const [slotDocs, setSlotDocs] = useState([])
    const [slotDate, setSlotDate] = useState('');
    const [serviceId, setServiceId] = useState();
    const [slotIndex, setSlotIndex] = useState(0)
    const [slotTime, setSlotTime] = useState('')
    const [isLoading, setIsLoading] = useState(false); // New state for loading

    const navigate = useNavigate()

    const fetchDocInfo = async () => {
        const docInfo = doctors.find((doc) => doc.id === parseInt(docId, 10))
        setDocInfo(docInfo)
        const slotDoc = slots.filter((doc) => doc.doctor_id === parseInt(docId, 10))
        setSlotDocs(slotDoc);
    }

    const getSlotTimesByDate = (date) => {
        console.log("check")
        return slotDocs
            .filter(slot => slot.slot_date === date && slot.is_booked === 0)
            .map(slot => slot.slot_time);
    };

    const availableSlotTimes = getSlotTimesByDate(slotDate);
    console.log(slotDate)

    const bookAppointment = async () => {
        if (!token) {
            toast.warning('Đăng nhập để đặt lịch');
            return navigate('/login');
        }

        if (!docId || !slotDate || !slotTime || !serviceId) {
            toast.warning('Cần nhập đầy đủ thông tin');
            return;
        }

        setIsLoading(true); // Start loading

        try {
            const { data } = await axios.post(
                backendUrl + '/api/user/book-appointment',
                { docId, slotDate, slotTime, serviceId },
                { headers: { token } }
            );

            if (data.success) {
                toast.success(data.message);
                getDoctosData();
                navigate('/my-appointments');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setIsLoading(false); // End loading
        }
    }

    useEffect(() => {
        if (doctors.length > 0) {
            fetchDocInfo()
        }
    }, [doctors, docId])


    // useEffect(() => {
    //     // if (docInfo) {
    //     //     getAvailableSolts()
    //     // }
    // }, [docInfo])

    return docInfo ? (
        <div>

            {/* ---------- Doctor Details ----------- */}
            <div className='flex flex-col sm:flex-row gap-4'>
                <div>
                    <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
                </div>

                <div className='flex-1 border border-[#ADADAD] rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>

                    {/* ----- Doc Info : name, degree, experience ----- */}

                    <p className='flex items-center gap-2 text-3xl font-medium text-gray-700'>{docInfo.name} <img className='w-5' src={assets.verified_icon} alt="" /></p>
                    <div className='flex items-center gap-2 mt-1 text-gray-600'>
                        <p>{docInfo.degree} - {docInfo.speciality}</p>
                        <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
                    </div>

                    {/* ----- Doc About ----- */}
                    <div>
                        <p className='flex items-center gap-1 text-sm font-medium text-[#262626] mt-3'>Thông tin bác sĩ <img className='w-3' src={assets.info_icon} alt="" /></p>
                        <p className='text-sm text-gray-600 max-w-[700px] mt-1'>{docInfo.about}</p>
                    </div>

                    {/* 
                    <p className='text-gray-600 font-medium mt-4'>Appointment fee: <span className='text-gray-800'>{currencySymbol}{docInfo.fees}</span> </p> */}
                </div>
            </div>

            {/* Booking slots */}
            <div className='sm:ml-72 sm:pl-4 mt-8 font-medium text-[#565656]'>
                <div className='flex-1 flex flex-col gap-1 w-60'>
                    <p>Dịch vụ</p>
                    <select
                        onChange={e => setServiceId(e.target.value)} value={serviceId}
                        className='border rounded px-2 py-2 w-full'
                        required
                    >
                        <option value="" >Chọn dịch vụ</option>
                        {services.map(item => {
                            const formattedVNDService = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price);
                            return (
                                <option key={item.id} value={item.id}>{item.title} - {formattedVNDService}</option>
                            )
                        })}
                    </select>
                </div>
                <p className="mt-8" >Thời gian</p>
                <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
                    {slotDocs.length && [...new Map(slotDocs.filter(x => x.is_booked == 0).map(item => [new Date(item.slot_date).toDateString(), item])).values()].map((item, index) => {
                        // Convert item.slot_date to the abbreviated day of the week
                        const date = new Date(item.slot_date);
                        const daysOfWeek = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
                        const dayOfWeek = daysOfWeek[date.getDay()];

                        // Format the date as dd-mm-yy
                        const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

                        return (
                            <div
                                onClick={() => setSlotDate(item.slot_date)}
                                key={index}
                                className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotDate === item.slot_date ? 'bg-primary text-white' : 'border border-[#DDDDDD]'}`}
                            >
                                <p>{dayOfWeek}</p> {/* Display abbreviated day of the week */}
                                <p>{formattedDate}</p> {/* Display the formatted date */}
                            </div>
                        );
                    })}
                    {slotDocs.filter(x => x.is_booked == 0).length == 0 ? <p className="text-sm font-light text-[#949494]">Đã hết slot</p> : null}
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

                {/* Hiển thị nút nếu còn slot, nếu không thì ẩn */}
                {availableSlotTimes.length > 0 && (
                    <button onClick={bookAppointment} className='bg-primary text-white text-sm font-light px-20 py-3 rounded-full my-6'>
                        {isLoading ? "Booking..." : "Book an appointment"}
                    </button>
                )}

            </div>

            {/* Listing Releated Doctors */}
            <RelatedDoctors speciality={docInfo.speciality} docId={docId} />
        </div>
    ) : null
}

export default Appointment