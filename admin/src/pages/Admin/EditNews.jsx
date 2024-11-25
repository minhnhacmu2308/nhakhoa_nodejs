import React, { useState, useEffect, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'
import { AppContext } from '../../context/AppContext'
import { AdminContext } from '../../context/AdminContext'
import { assets } from '../../assets/assets'

const EditService = () => {
  const location = useLocation();  // Lấy dữ liệu từ state
  const service = location.state;  // Truyền dịch vụ qua state
  const navigate = useNavigate();

  const [serImg, setSerImg] = useState(null);  // Lưu ảnh dịch vụ mới
  const [title, setTitle] = useState(service.title || ''); // Tên dịch vụ
  const [sortdes, setSortdes] = useState(service.shortdes || ''); // Mô tả ngắn
  const [describe, setDescribe] = useState(service.description || ''); // Nội dung chi tiết

  const { backendUrl } = useContext(AppContext);
  const { aToken } = useContext(AdminContext);

  useEffect(() => {
    if (!service) {
      toast.error('Dữ liệu tin tức không tồn tại');
      navigate("/news-list");
    }
  }, [service, navigate]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (!serImg && !service.image) {
        return toast.error('Image Not Selected');
      }

      const formData = new FormData();
      formData.append('id', service.id); // ID dịch vụ cần chỉnh sửa
      formData.append('title', title);
      formData.append('sortdes', sortdes);
      formData.append('describe', describe);

      // Nếu có ảnh mới, thêm vào formData
      if (serImg) {
        formData.append('image', serImg);
      }

      // Gửi yêu cầu PUT đến API chỉnh sửa dịch vụ
      const { data } = await axios.put(backendUrl + '/api/admin/edit-news', formData, {
        headers: { aToken },
      });

      if (data.success) {
        toast.success(data.message);
        navigate('/news-list');  // Điều hướng trở lại danh sách dịch vụ
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
      <p className='mb-3 text-lg font-medium'>Chỉnh sửa tin tức</p>

      <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll'>
        <div className='flex items-center gap-4 mb-8 text-gray-500'>
          <label htmlFor="doc-img">
            <img
              className='w-16 bg-gray-100 rounded-full cursor-pointer'
              src={serImg ? URL.createObjectURL(serImg) : service.image || assets.upload_area}
              alt="Dịch vụ"
            />
          </label>
          <input
            onChange={(e) => setSerImg(e.target.files[0])}
            type="file"
            id="doc-img"
            hidden
          />
          <p>Chọn ảnh tin tức<br /></p>
        </div>

        <div className='flex flex-col lg:flex-row items-start gap-10 text-gray-600'>
          <div className='w-full lg:flex-1 flex flex-col gap-8'>
            <div className='flex-1 flex flex-col gap-1'>
              <p>Tiêu đề</p>
              <input
                onChange={e => setTitle(e.target.value)}
                value={title}
                className='border rounded px-3 py-2'
                type="text"
                placeholder='Tiêu đề'
                required
              />
            </div>
          </div>
        </div>

        <div>
          <p className='mt-4 mb-2'>Mô tả ngắn</p>
          <textarea
            onChange={e => setSortdes(e.target.value)}
            value={sortdes}
            className='w-full px-4 pt-2 border rounded'
            rows={5}
            placeholder='Mô tả ngắn'
          />
        </div>

        <div>
          <p className='mt-4 mb-2'>Nội dung chi tiết</p>
          <div
            contentEditable={true}
            onInput={(e) => setDescribe(e.target.innerHTML)}
            className='w-full p-4 border rounded min-h-[200px]'
            dangerouslySetInnerHTML={{ __html: describe }}
            placeholder="Nhập nội dung chi tiết"
          />
        </div>

        <button type='submit' className='bg-primary px-10 py-3 mt-4 text-white rounded-full'>
          Cập nhật tin tức
        </button>
      </div>
    </form>
  );
};

export default EditService;
