import React, { useContext, useState,useEffect } from 'react'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const AddDoctor = () => {

    const [docImg, setDocImg] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [experience, setExperience] = useState('1 Năm')
    const [about, setAbout] = useState('')
    const [speciality, setSpeciality] = useState('Chuyên khoa trẻ em')
    const [degree, setDegree] = useState('')
    const [address1, setAddress1] = useState('')
    const [address2, setAddress2] = useState('')
    const [selectedServices, setSelectedServices] = useState([]);


    const { backendUrl } = useContext(AppContext)
    const {services,aToken, getAllServices } = useContext(AdminContext)


    // Gọi API lấy tất cả dịch vụ
    useEffect(() => {
        if (aToken) {
            getAllServices()
        }
    }, [aToken]);


    const onSubmitHandler = async (event) => {
        event.preventDefault();
    
        try {
            if (!docImg) {
                return toast.error('Image Not Selected');
            }
    
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
                formData.append('services[]', serviceId);  // Truyền dịch vụ dưới dạng mảng
            });
    
            // console log formdata            
            formData.forEach((value, key) => {
                console.log(`${key}: ${value}`);
            });
    
            const { data } = await axios.post(backendUrl + '/api/admin/add-doctor', formData, { headers: { aToken } });
            if (data.success) {
                toast.success(data.message);
                // Reset form
                setDocImg(false);
                setName('');
                setPassword('');
                setEmail('');
                setAddress1('');
                setAddress2('');
                setDegree('');
                setAbout('');
                setSelectedServices([]);  // Reset selected services
            } else {
                toast.error(data.message);
            }
    
        } catch (error) {
            toast.error(error.message);
            console.log(error);
        }
    };
    

    return (
        <form onSubmit={onSubmitHandler} className='m-5 w-full'>

            <p className='mb-3 text-lg font-medium'>Thêm bác sĩ</p>

            <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll'>
                <div className='flex items-center gap-4 mb-8 text-gray-500'>
                    <label htmlFor="doc-img">
                        <img className='w-16 bg-gray-100 rounded-full cursor-pointer' src={docImg ? URL.createObjectURL(docImg) : assets.upload_area} alt="" />
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
                            <input onChange={e => setPassword(e.target.value)} value={password} className='border rounded px-3 py-2' type="password" placeholder='' required />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Kinh nghiệm</p>
                            <select onChange={e => setExperience(e.target.value)} value={experience} className='border rounded px-2 py-2' >
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
                            {services.map(service => (
                                <option key={service.id} value={service.id}>
                                    {service.title}
                                </option>
                            ))}
                        </select>
                    </div>


                    </div>

                </div>
                                
                <div>
                    <p className='mt-4 mb-2'>Thông tin chung về bác sĩ</p>
                    <textarea onChange={e => setAbout(e.target.value)} value={about} className='w-full px-4 pt-2 border rounded' rows={5} placeholder=''></textarea>
                </div>

                <button type='submit' className='bg-primary px-10 py-3 mt-4 text-white rounded-full'>Thêm</button>

            </div>


        </form>
    )
}

export default AddDoctor