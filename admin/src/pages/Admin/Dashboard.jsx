import React, { useContext, useEffect } from 'react';
import { assets } from '../../assets/assets';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';
import { Bar } from 'react-chartjs-2';  // Import Bar chart component from Chart.js
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

// Registering the necessary components for Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const Dashboard = () => {

  const { aToken, getDashData, cancelAppointment, dashData, getMonthly, statisical } = useContext(AdminContext);
  const { slotDateFormat } = useContext(AppContext);

  useEffect(() => {
    if (aToken) {
      getDashData();
      getMonthly();
    }
  }, [aToken]);

  // Create an array for months as 'Tháng 1', 'Tháng 2', ..., 'Tháng 12'
  const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  // Initialize all months' data as 0
  let revenueData = new Array(12).fill(0);

  // Fill in the revenue data for the months that have data
  statisical.forEach(item => {
    const monthIndex = parseInt(item.month.split('-')[1], 10) - 1; // Get the month index from 'YYYY-MM'
    revenueData[monthIndex] = item.total_revenue;
  });

  const chartData = {
    labels: months, // Use the month labels 'Tháng 1', 'Tháng 2', ..., 'Tháng 12'
    datasets: [
      {
        label: 'Doanh thu (VND)', // Label for the chart
        data: revenueData, // Revenue data for each month
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Color for bars
        borderColor: 'rgba(75, 192, 192, 1)', // Border color for bars
        borderWidth: 1,
      },
    ],
  };

  return dashData && (
    <div className='m-5'>

      <div className='flex flex-wrap gap-3'>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.doctor_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.doctors}</p>
            <p className='text-gray-400'>Bác sĩ</p>
          </div>
        </div>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.appointments_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.appointments}</p>
            <p className='text-gray-400'>Lịch hẹn</p>
          </div>
        </div>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.patients_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.patients}</p>
            <p className='text-gray-400'>Bệnh nhân</p>
          </div>
        </div>
      </div>

      <div className='bg-white p-4 mt-6 rounded'>
        <h2 className='text-lg font-semibold text-gray-600 mb-4'>Biểu đồ doanh thu theo tháng</h2>
        <Bar 
          data={chartData} // Passing the chart data to Bar component
          options={{
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Doanh thu hàng tháng',
              },
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Tháng',
                },
                ticks: {
                  callback: (value, index) => {
                    return ['1', '2', '3', '4', '5','6','7','8','9','10','11','12'][index]; // Nhãn cụ thể
                  },
                  stepSize: 1, // Khoảng cách giữa các nhãn
                },
              },
              y: {
                title: {
                  display: true,
                  text: 'Doanh thu (VND)',
                },
                beginAtZero: true,
              },
            },
          }}
        />
      </div>

    </div>
  );
}

export default Dashboard;
