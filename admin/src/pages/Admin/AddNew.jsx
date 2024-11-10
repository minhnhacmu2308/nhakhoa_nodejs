import React, { useContext, useState } from 'react';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';


const AddNew = () => {
    const [serImg, setserImg] = useState(false);
    const [title, settitle] = useState('');
    const [sortdes, setsortdes] = useState('');
    const [describe, setdescribe] = useState('');

    const { backendUrl } = useContext(AppContext);
    const { aToken } = useContext(AdminContext);

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        try {
            if (!serImg) {
                return toast.error('Image Not Selected');
            }

            const formData = new FormData();
            formData.append('image', serImg);
            formData.append('title', title);
            formData.append('sortdes', sortdes);
            formData.append('describe', describe);

            const { data } = await axios.post(backendUrl + '/api/admin/add-news', formData, { headers: { aToken } });
            if (data.success) {
                toast.success(data.message);
                setserImg(false);
                settitle('');
                setsortdes('');
                setdescribe('');
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
            <p className='mb-3 text-lg font-medium'>Thêm tin tức</p>

            <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll'>
                <div className='flex items-center gap-4 mb-8 text-gray-500'>
                    <label htmlFor="doc-img">
                        <img className='w-16 bg-gray-100 rounded-full cursor-pointer' src={serImg ? URL.createObjectURL(serImg) : assets.upload_area} alt="" />
                    </label>
                    <input onChange={(e) => setserImg(e.target.files[0])} type="file" id="doc-img" hidden />
                    <p>Chọn ảnh tin tức<br /></p>
                </div>

                <div className='flex flex-col lg:flex-row items-start gap-10 text-gray-600'>
                    <div className='w-full lg:flex-1 flex flex-col gap-8'>
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Tiêu đề</p>
                            <input onChange={e => settitle(e.target.value)} value={title} className='border rounded px-3 py-2' type="text" placeholder='Tiêu đề' required />
                        </div>
                    </div>
                </div>

                <div>
                    <p className='mt-4 mb-2'>Mô tả ngắn</p>
                    <textarea onChange={e => setsortdes(e.target.value)} value={sortdes} className='w-full px-4 pt-2 border rounded' rows={5} placeholder='Mô tả ngắn'></textarea>
                </div>

                <div>
                    <p className='mt-4 mb-2'>Nội dung chi tiết</p>
                    <div
                        contentEditable={true}
                        onInput={(e) => setdescribe(e.target.innerHTML)} 
                        className='w-full p-4 border rounded min-h-[200px]'
                        dangerouslySetInnerHTML={{ __html: describe }} 
                        placeholder="Nhập nội dung chi tiết"
                    />
                </div>

                <button type='submit' className='bg-primary px-10 py-3 mt-4 text-white rounded-full'>Thêm tin tức</button>
            </div>
        </form>
    );
};

export default AddNew;
