import React, { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';

const NewDetails = () => {
  const { id } = useParams();
  const { news, backendUrl } = useContext(AppContext);

  const newtt = news.find((newtt) => newtt.id === parseInt(id));

  if (!newtt) {
    return <div>Tin tức không tồn tại.</div>;
  }


  return (
    <div className="service-detail-container">
      <h1 className="service-title">{newtt.title}</h1>

      <div className="service-info">
        <div className="service-image">
          <img
            src={newtt.image}
            alt={newtt.title}
          />
        </div>

        <div className="service-details">
          <p className="service-shortdes">{newtt.shortdes}</p>
          <div className="description">
            <p><strong>Mô tả:</strong></p>
            <div dangerouslySetInnerHTML={{ __html: newtt.description }} />
          </div>
        </div>
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

export default NewDetails;
