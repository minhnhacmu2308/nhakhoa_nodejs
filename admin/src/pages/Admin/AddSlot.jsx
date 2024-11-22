import React, { useContext, useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const AddSlot = () => {
    const [slotDate, setSlotDate] = useState('') // Trạng thái cho Slot Date
    const [doctorId, setDoctorId] = useState('') // Trạng thái cho Doctor ID
    const [slotTime, setSlotTime] = useState('') // Trạng thái cho Slot Time
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const { backendUrl } = useContext(AppContext)
    const { aToken, doctors, getAllDoctors } = useContext(AdminContext)

    useEffect(() => {
        if (aToken) {
            getAllDoctors()
        }
    }, [aToken])

    // Xử lý thay đổi tệp khi người dùng chọn tệp
    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    // Xử lý gửi yêu cầu tải tệp lên
    const handleFileUpload = async (event) => {
        event.preventDefault();

        if (!file) {
            toast.error('Vui lòng chọn tập tin để tải lên');
            return;
        }

        setLoading(true); // Hiển thị trạng thái đang tải lên

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(backendUrl + '/api/admin/add-slot-excel', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'aToken': aToken
                },
            });
            toast.success(response.data.message);
            setFile(null);
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi trong quá trình tải tập tin lên');
        } finally {
            setLoading(false); // Tắt trạng thái đang tải lên
        }
    };

    // Tải template Excel từ API
    const handleDownloadTemplate = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/admin/download-excel', {
                headers: { aToken },
                responseType: 'blob' // Định dạng dữ liệu trả về là file
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'template.xlsx'); // Tên file tải xuống
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Template đã được tải xuống');
        } catch (error) {
            console.error(error);
            toast.error('Không thể tải xuống template');
        }
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        try {
            const { data } = await axios.post(backendUrl + '/api/admin/add-slot', { slotDate, doctorId, slotTime }, { headers: { aToken } });
            if (data.success) {
                toast.success(data.message);
                setSlotDate('');
                setDoctorId('');
                setSlotTime('');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
            console.log(error);
        }
    };

    return (
        <div className='m-5 w-full'>
            <form onSubmit={onSubmitHandler} className='w-full'>
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
                                    type="date"
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
                                    type="time"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button type='submit' className='bg-primary px-10 py-3 mt-4 text-white rounded-full'>Thêm</button>
                </div>
            </form>

            <div className='mt-10'>
                <h2 className='mb-3 text-lg font-medium'>Thêm ca bằng excel file</h2>
                {/* Nút tải xuống template */}
                <button
                    onClick={handleDownloadTemplate}
                    className='bg-blue-500 px-10 py-3 mt-4 mb-4 text-white rounded-full'
                >
                    Tải file mẫu
                </button>
                <form onSubmit={handleFileUpload} className='bg-white px-8 py-8 border rounded w-full max-w-4xl'>
                    <div className='flex flex-col gap-4'>
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                            className='border rounded px-3 py-2'
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-10 py-3 mt-4 text-white rounded-full ${loading ? 'bg-gray-400' : 'bg-primary'}`}
                        >
                            {loading ? 'Đang tải...' : 'Tải lên'}
                        </button>
                    </div>
                </form>

                
            </div>
        </div>
    );
}

export default AddSlot;
