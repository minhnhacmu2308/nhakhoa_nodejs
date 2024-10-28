import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const MyProfile = () => {

    const [isEdit, setIsEdit] = useState(false)
    const [isChangePassword, setIsChangePassword] = useState(false)
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')

    const [image, setImage] = useState(false)

    const { token, backendUrl, userData, setUserData, loadUserProfileData } = useContext(AppContext)

    useEffect(() => {
        console.log("userData", userData);
    }, [])

    // Function to update user profile data using API
    const updateUserProfileData = async () => {
        try {
            const formData = new FormData();

            formData.append('name', userData.name)
            formData.append('phone', userData.phone)
            formData.append('address', userData.address)
            formData.append('gender', userData.gender)
            formData.append('dob', userData.dob)

            image && formData.append('image', image)

            const { data } = await axios.post(backendUrl + '/api/user/update-profile', formData, { headers: { token } })

            if (data.success) {
                toast.success(data.message)
                await loadUserProfileData()
                setIsEdit(false)
                setImage(false)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Function to update user password using API
    const updatePasswordHandler = async () => {
        if (newPassword !== confirmNewPassword) {
            toast.error('New passwords do not match');
            return;
        }

        try {
            const { data } = await axios.post(backendUrl + '/api/user/update-password', { oldPassword, newPassword }, { headers: { token } })

            if (data.success) {
                toast.success(data.message)
                setIsChangePassword(false)
                setNewPassword('')
                setConfirmNewPassword('')
                setOldPassword('')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    return userData ? (
        <div className='max-w-lg flex flex-col gap-2 text-sm pt-5'>

            {/* Hiển thị phần thông tin người dùng nếu không phải đang thay đổi mật khẩu */}
            {!isChangePassword && (
                <>
                    {isEdit
                        ? <label htmlFor='image'>
                            <div className='inline-block relative cursor-pointer'>
                                <img className='w-36 rounded opacity-75' src={image ? URL.createObjectURL(image) : userData.image} alt="" />
                                <img className='w-10 absolute bottom-12 right-12' src={image ? '' : assets.upload_icon} alt="" />
                            </div>
                            <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden />
                        </label>
                        : <img className='w-36 rounded' src={userData.image} alt="" />
                    }

                    {isEdit
                        ? <input className='bg-gray-50 text-3xl font-medium max-w-60' type="text" onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))} value={userData.name} />
                        : <p className='font-medium text-3xl text-[#262626] mt-4'>{userData.name}</p>
                    }

                    <hr className='bg-[#ADADAD] h-[1px] border-none' />

                    <div>
                        <p className='text-gray-600 underline mt-3'>CONTACT INFORMATION</p>
                        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-[#363636]'>
                            <p className='font-medium'>Email id:</p>
                            <p className='text-blue-500'>{userData.email}</p>
                            <p className='font-medium'>Phone:</p>

                            {isEdit
                                ? <input className='bg-gray-50 max-w-52' type="text" onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))} value={userData.phone} />
                                : <p className='text-blue-500'>{userData.phone}</p>
                            }

                            <p className='font-medium'>Address:</p>

                            {isEdit
                                ? <input className='bg-gray-50' type="text" onChange={(e) => setUserData(prev => ({ ...prev, address: e.target.value }))} value={userData.address} />
                                : <p className='text-gray-500'>{userData.address}</p>
                            }
                        </div>
                    </div>
                    <div>
                        <p className='text-[#797979] underline mt-3'>BASIC INFORMATION</p>
                        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-gray-600'>
                            <p className='font-medium'>Gender:</p>

                            {isEdit
                                ? <select className='max-w-20 bg-gray-50' onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))} value={userData.gender} >
                                    <option value="Not Selected">Not Selected</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                                : <p className='text-gray-500'>{userData.gender}</p>
                            }

                            <p className='font-medium'>Birthday:</p>

                            {isEdit
                                ? <input className='max-w-28 bg-gray-50' type='date' onChange={(e) => setUserData(prev => ({ ...prev, dob: e.target.value }))} value={userData.dob} />
                                : <p className='text-gray-500'>{userData.dob}</p>
                            }
                        </div>
                    </div>
                </>
            )}

            {/* Hiển thị form đổi mật khẩu khi bấm nút Change Password */}
            {isChangePassword && (
                <div>
                    <p className='text-[#797979] underline mt-3'>CHANGE PASSWORD</p>
                    <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-gray-600'>
                        <p className='font-medium'>Old Password:</p>
                        <input className='bg-gray-50 max-w-52' type="password" onChange={(e) => setOldPassword(e.target.value)} value={oldPassword} />

                        <p className='font-medium'>New Password:</p>
                        <input className='bg-gray-50 max-w-52' type="password" onChange={(e) => setNewPassword(e.target.value)} value={newPassword} />

                        <p className='font-medium'>Confirm New Password:</p>
                        <input className='bg-gray-50 max-w-52' type="password" onChange={(e) => setConfirmNewPassword(e.target.value)} value={confirmNewPassword} />
                    </div>
                    <div className='flex items-center gap-4 mt-10'>
                        <button onClick={updatePasswordHandler} className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all'>
                            Update Password
                        </button>
                        <button onClick={() => setIsChangePassword(false)} className='border border-gray-400 px-8 py-2 rounded-full hover:bg-gray-400 hover:text-white transition-all'>
                            Back to Profile
                        </button>
                    </div>
                </div>
            )}

            {/* Nút chuyển đổi sang chế độ đổi mật khẩu */}
            {!isChangePassword && (
                <div className='mt-10'>
                    {isEdit
                        ? <button onClick={updateUserProfileData} className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all'>Save information</button>
                        : <button onClick={() => setIsEdit(true)} className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all'>Edit</button>
                    }

                    <button onClick={() => setIsChangePassword(true)} className='border border-primary px-8 py-2 mt-3 rounded-full hover:bg-primary hover:text-white transition-all'>Change Password</button>
                </div>
            )}
        </div>
    ) : null;
}

export default MyProfile
