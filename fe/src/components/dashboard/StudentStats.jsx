// Student stats component
import { useEffect, useState } from 'react';
import LineChart from '../charts/LineChart';
import Card from '../ui/Card';

const StudentStats = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Simulate fetching data from API
    const fetchStats = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await api.get('/dashboard/student-stats');
        // setStats(response.data);
        
        // Simulated data
        setTimeout(() => {
          setStats({
            enrollmentTrend: {
              labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
              datasets: [
                {
                  label: 'Sinh viên đăng ký',
                  data: [120, 135, 142, 150, 149, 148, 152, 155, 160, 165, 172, 178],
                  borderColor: '#3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)'
                },
                {
                  label: 'Sinh viên bỏ học',
                  data: [5, 7, 6, 8, 7, 6, 8, 7, 9, 8, 10, 9],
                  borderColor: '#ef4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)'
                }
              ]
            },
            genderDistribution: {
              male: 58,
              female: 42
            },
            performanceDistribution: {
              excellent: 15,
              good: 30,
              average: 40,
              belowAverage: 10,
              poor: 5
            }
          });
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching student stats:', error);
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="loading">Đang tải dữ liệu sinh viên...</div>;
  }

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">Thống kê Sinh viên</h2>
      
      <div className="mb-6">
        <h3 className="text-md font-medium mb-2">Xu hướng Nhập học & Bỏ học</h3>
        <div className="h-64">
          <LineChart
            data={{
              labels: stats.enrollmentTrend.labels,
              datasets: stats.enrollmentTrend.datasets
            }}
            options={{
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-md font-medium mb-2">Phân bố Giới tính</h3>
          <div className="flex items-center">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Nam</span>
                <span className="text-sm font-medium">{stats.genderDistribution.male}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-500 h-2.5 rounded-full" 
                  style={{ width: `${stats.genderDistribution.male}%` }}
                ></div>
              </div>
            </div>
            <div className="mx-4">vs</div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Nữ</span>
                <span className="text-sm font-medium">{stats.genderDistribution.female}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-pink-500 h-2.5 rounded-full" 
                  style={{ width: `${stats.genderDistribution.female}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-md font-medium mb-2">Phân bố Học lực</h3>
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Xuất sắc</span>
                <span className="text-sm font-medium">{stats.performanceDistribution.excellent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${stats.performanceDistribution.excellent}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Giỏi</span>
                <span className="text-sm font-medium">{stats.performanceDistribution.good}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${stats.performanceDistribution.good}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Khá</span>
                <span className="text-sm font-medium">{stats.performanceDistribution.average}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${stats.performanceDistribution.average}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Trung bình</span>
                <span className="text-sm font-medium">{stats.performanceDistribution.belowAverage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full" 
                  style={{ width: `${stats.performanceDistribution.belowAverage}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Yếu</span>
                <span className="text-sm font-medium">{stats.performanceDistribution.poor}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${stats.performanceDistribution.poor}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StudentStats;
