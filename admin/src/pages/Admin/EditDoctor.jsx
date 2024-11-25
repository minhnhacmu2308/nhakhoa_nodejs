import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { AdminContext } from '../../context/AdminContext';

const EditDoctor = () => {
    const { state } = useLocation();
    const doctor = state?.doctor;
    if (!doctor) {
        return <div>Không tìm thấy bác sĩ</div>; // Nếu không có bác sĩ, hiển thị thông báo lỗi
    }

    const { aToken, getAllServices, services } = useContext(AdminContext); // Lấy dịch vụ từ AdminContext
    const [docImg, setDocImg] = useState(doctor?.image || null);
    const [name, setName] = useState(doctor?.name || '');
    const [email, setEmail] = useState(doctor?.email || '');
    const [password, setPassword] = useState('');
    const [experience, setExperience] = useState(doctor?.experience || '1 Năm');
    const [about, setAbout] = useState(doctor?.about || '');
    const [speciality, setSpeciality] = useState(doctor?.speciality || 'Chuyên khoa trẻ em');
    const [degree, setDegree] = useState(doctor?.degree || '');
    const [address1, setAddress1] = useState(doctor?.address || '');
    const [selectedServices, setSelectedServices] = useState(doctor?.services.split(', ') || []); // Chuyển từ chuỗi dịch vụ thành mảng
    const [loading, setLoading] = useState(false); // State cho loading

    const { backendUrl } = useContext(AppContext);
    const navigate = useNavigate();

    // Gọi API lấy tất cả dịch vụ
    useEffect(() => {
        if (aToken) {
            getAllServices(); // API call để lấy dịch vụ
        }
    }, [aToken]);

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        if (!docImg) {
            return toast.error('Chưa chọn ảnh bác sĩ');
        }

        // Kiểm tra thông tin bắt buộc
        if (!name || !email || !degree || !address1) {
            return toast.error('Vui lòng điền đầy đủ thông tin');
        }

        try {
            setLoading(true); // Bắt đầu loading khi gửi form
            const formData = new FormData();
            formData.append('image', docImg);
            formData.append('name', name);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('experience', experience);
            formData.append('about', about);
            formData.append('speciality', speciality);
            formData.append('degree', degree);
            formData.append('address', address1);

            // Thêm các dịch vụ vào formData
            selectedServices.forEach(serviceId => {
                formData.append('services[]', serviceId); // Truyền dịch vụ dưới dạng mảng
            });

            const { data } = await axios.post(`${backendUrl}/api/admin/edit-doctor/${doctor.id}`, formData, { headers: { aToken: localStorage.getItem('aToken') } });
            if (data.success) {
                toast.success(data.message);
                navigate('/doctor-list'); // Điều hướng về trang danh sách bác sĩ
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
            console.log(error);
        } finally {
            setLoading(false); // Kết thúc loading khi gửi xong
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className='m-5 w-full'>
            <p className='mb-3 text-lg font-medium'>Chỉnh sửa bác sĩ</p>
            <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll'>
                <div className='flex items-center gap-4 mb-8 text-gray-500'>
                    <label htmlFor="doc-img">
                        <img className='w-16 bg-gray-100 rounded-full cursor-pointer' src={docImg ? docImg : assets.upload_area} alt="" />
                    </label>
                    <input onChange={(e) => setDocImg(e.target.files[0])} type="file" name="" id="doc-img" hidden />
                    <p>Chọn ảnh bác sĩ</p>
                </div>
                <div className='flex flex-col lg:flex-row items-start gap-10 text-gray-600'>
                    <div className='w-full lg:flex-1 flex flex-col gap-4'>
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Họ tên</p>
                            <input onChange={e => setName(e.target.value)} value={name} className='border rounded px-3 py-2' type="text" placeholder='' required />
                        </div>
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Email</p>
                            <input onChange={e => setEmail(e.target.value)} value={email} className='border rounded px-3 py-2' type="email" placeholder='Email' required />
                        </div>
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Mật khẩu</p>
                            <input onChange={e => setPassword(e.target.value)} value={password} className='border rounded px-3 py-2' type="password" placeholder='' />
                        </div>
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Kinh nghiệm</p>
                            <select onChange={e => setExperience(e.target.value)} value={experience} className='border rounded px-2 py-2'>
                                <option value="1 Năm">1 Năm</option>
                                <option value="2 Năm">2 Năm</option>
                                <option value="3 Năm">3 Năm</option>
                                <option value="4 Năm">4 Năm</option>
                                <option value="5 Năm">5 Năm</option>
                                <option value="6 Năm">6 Năm</option>
                                <option value="8 Năm">8 Năm</option>
                                <option value="9 Năm">9 Năm</option>
                                <option value="10 Năm">10 Năm</option>
                            </select>
                        </div>
                    </div>
                    <div className='w-full lg:flex-1 flex flex-col gap-4'>
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Chuyên khoa</p>
                            <select onChange={e => setSpeciality(e.target.value)} value={speciality} className='border rounded px-2 py-2'>
                                <option value="Chuyên khoa trẻ em">Chuyên khoa trẻ em</option>
                                <option value="Chuyên khoa người lớn">Chuyên khoa người lớn</option>
                            </select>
                        </div>
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Trình độ</p>
                            <input onChange={e => setDegree(e.target.value)} value={degree} className='border rounded px-3 py-2' type="text" placeholder='' required />
                        </div>
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Địa chỉ</p>
                            <input onChange={e => setAddress1(e.target.value)} value={address1} className='border rounded px-3 py-2' type="text" placeholder='' required />
                        </div>
                        <div className='flex-1 flex flex-col gap-1'>
                        <p>Giữ phím Ctrl để có thể chọn nhiều dịch vụ</p>
                        <select
                            multiple
                            value={selectedServices}
                            onChange={e => setSelectedServices(Array.from(e.target.selectedOptions, option => option.value))}
                            className='border rounded px-2 py-2'>
                            {services?.map(service => (
                                <option 
                                    key={service.id} 
                                    value={service.id}
                                    selected={selectedServices.includes(service.id.toString())} // Kiểm tra và đánh dấu dịch vụ đã chọn
                                >
                                    {service.title}
                                </option>
                            ))}
                        </select>
                            
                        </div>
                    </div>
                </div>

                {/* Phần chọn dịch vụ */}
                <div>
                <p>Giới thiệu về bác sĩ</p>
                <textarea onChange={e => setAbout(e.target.value)} value={about} className='w-full px-4 pt-2 border rounded' rows={5}></textarea>
                </div>

                <div className='flex justify-center mt-5'>
                    <button disabled={loading} className='px-5 py-3 bg-blue-500 text-white rounded-lg'>
                        {loading ? 'Đang cập nhật...' : 'Cập nhật bác sĩ'}
                    </button>
                </div>
            </div>
        </form>
    );
}

export default EditDoctor;
