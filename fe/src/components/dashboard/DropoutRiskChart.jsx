import { useState } from 'react';
import ChartComponent from '../common/ChartComponent';

const DropoutRiskChart = ({ data = null }) => {
  const [chartType, setChartType] = useState('bar');
  
  // Use provided data or default to sample data
  const chartData = data || {
    lowRisk: 780,
    mediumRisk: 290,
    highRisk: 180,
  };
  
  const formattedData = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
    datasets: [
      {
        label: 'Number of Students',
        data: [chartData.lowRisk, chartData.mediumRisk, chartData.highRisk],
        backgroundColor: [
          'rgba(46, 204, 113, 0.6)',
          'rgba(243, 156, 18, 0.6)',
          'rgba(231, 76, 60, 0.6)',
        ],
        borderColor: [
          'rgba(46, 204, 113, 1)',
          'rgba(243, 156, 18, 1)',
          'rgba(231, 76, 60, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const options = {
    plugins: {
      title: {
        display: true,
        text: 'Dropout Risk Distribution',
        font: {
          size: 16,
        },
      },
      legend: {
        position: 'bottom',
      },
    },
    scales: (chartType === 'pie') ? undefined : {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Students',
        },
      },
    },
  };
  
  const handleChartTypeChange = (newType) => {
    setChartType(newType);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Dropout Risk Distribution</h2>
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 text-sm rounded ${
              chartType === 'bar' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
            onClick={() => handleChartTypeChange('bar')}
          >
            Bar
          </button>
          <button
            className={`px-3 py-1 text-sm rounded ${
              chartType === 'pie' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
            onClick={() => handleChartTypeChange('pie')}
          >
            Pie
          </button>
        </div>
      </div>
      
      <ChartComponent type={chartType} data={formattedData} options={options} height={300} />
      
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center p-2 rounded bg-green-100">
          <p className="text-sm text-gray-500">Low Risk</p>
          <p className="text-xl font-semibold text-green-700">{chartData.lowRisk}</p>
          <p className="text-xs text-gray-500">
            {Math.round((chartData.lowRisk / (chartData.lowRisk + chartData.mediumRisk + chartData.highRisk)) * 100)}%
          </p>
        </div>
        <div className="text-center p-2 rounded bg-yellow-100">
          <p className="text-sm text-gray-500">Medium Risk</p>
          <p className="text-xl font-semibold text-yellow-700">{chartData.mediumRisk}</p>
          <p className="text-xs text-gray-500">
            {Math.round((chartData.mediumRisk / (chartData.lowRisk + chartData.mediumRisk + chartData.highRisk)) * 100)}%
          </p>
        </div>
        <div className="text-center p-2 rounded bg-red-100">
          <p className="text-sm text-gray-500">High Risk</p>
          <p className="text-xl font-semibold text-red-700">{chartData.highRisk}</p>
          <p className="text-xs text-gray-500">
            {Math.round((chartData.highRisk / (chartData.lowRisk + chartData.mediumRisk + chartData.highRisk)) * 100)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default DropoutRiskChart;
