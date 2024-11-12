import React, { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';

const ServiceDetails = () => {
  const { id } = useParams();
  const [feedbacks, setFeedbacks] = useState([]);
  const { services, backendUrl } = useContext(AppContext);

  const service = services.find((service) => service.id === parseInt(id));

  useEffect(() => {
    const getFeedbacks = async () => {
      try {
        const { data } = await axios.get(backendUrl + '/api/service/feedbacks', {
          params: { serviceId: id },
        });
        if (data.success) {
          setFeedbacks(data.feedbacks);
        } else {
          console.log("error");
        }
      } catch (error) {
        console.log(error);
      }
    };
    getFeedbacks();
  }, [id, backendUrl]);

  if (!service) {
    return <div>Dịch vụ không tồn tại.</div>;
  }

  const renderStars = (rate) => {
    return Array(rate)
      .fill(0)
      .map((_, i) => (
        <span key={i} className="star-icon">&#9733;</span>
      ));
  };

  return (
    <div className="service-detail-container">
      <h1 className="service-title">{service.title}</h1>

      <div className="service-info">
        <div className="service-image">
          <img
            src={service.image}
            alt={service.title}
          />
        </div>

        <div className="service-details">
          <p className="service-shortdes">{service.shortdes}</p>
          <div className="description">
            <p><strong>Mô tả:</strong></p>
            <div dangerouslySetInnerHTML={{ __html: service.description }} />
          </div>
          <div className="price">
            <p><strong>Giá: </strong>{service.price} VND</p>
          </div>
        </div>
      </div>

      <div className="feedbacks">
        <h2 className="feedback-title">Đánh giá từ khách hàng</h2>
        {feedbacks.length > 0 ? (
          feedbacks.map((feedback) => (
            <div key={feedback.id} className="feedback-item">
              <img src={feedback.image} alt={feedback.name} className="feedback-avatar" />
              <div className="feedback-content">
                <div className="feedback-header">
                  <p className="feedback-name">{feedback.name}</p>
                  <span className="feedback-date">{new Date(feedback.date).toLocaleDateString()}</span>
                </div>
                <div className="feedback-stars">{renderStars(feedback.rate)}</div>
                <p className="feedback-comment">{feedback.comment}</p>
              </div>
            </div>
          ))
        ) : (
          <p>Chưa có đánh giá nào cho dịch vụ này.</p>
        )}
      </div>

      <div className="back-button">
        <button
          onClick={() => window.history.back()}
        >
          Quay lại
        </button>
      </div>

      <style jsx>{`
        .service-detail-container {
          padding: 2rem;
          background-color: #ffffff;
          border-radius: 1rem;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          max-width: 1000px;
          margin: auto;
        }
        
        .service-title {
          text-align: center;
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1.5rem;
        }

        .service-info {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .service-image img {
          width: 100%;
          border-radius: 8px;
          max-height: 400px;
          object-fit: cover;
        }

        .service-shortdes {
          font-size: 1.125rem;
          color: #5C5C5C;
        }

        .description {
          margin-top: 1rem;
          color: #555;
        }

        .price {
          font-size: 1.25rem;
          color: #e44d4d;
          margin-top: 1.5rem;
        }

        .feedbacks {
          margin-top: 2rem;
        }

        .feedback-title {
          font-size: 1.75rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }

        .feedback-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s;
          margin-bottom: 1rem;
        }

        .feedback-item:hover {
          transform: translateY(-5px);
        }

        .feedback-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
        }

        .feedback-content {
          width: calc(100% - 60px);
        }

        .feedback-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .feedback-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: #333;
        }

        .feedback-date {
          font-size: 0.875rem;
          color: #888;
        }

        .feedback-stars {
          color: #f5c518;
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }

        .star-icon {
          font-size: 1.25rem;
        }

        .feedback-email {
          font-size: 0.875rem;
          color: #555;
        }

        .feedback-comment {
          margin-top: 0.5rem;
          color: #444;
          font-size: 1rem;
        }

        .back-button {
          margin-top: 2rem;
          text-align: center;
        }

        .back-button button {
          padding: 12px 30px;
          border-radius: 25px;
          background-color: #3498db;
          color: white;
          border: none;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .back-button button:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default ServiceDetails;
