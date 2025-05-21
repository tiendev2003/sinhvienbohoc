// Class stats component
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import BarChart from '../charts/BarChart';
import Card from '../ui/Card';

const ClassStats = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState('all');

  useEffect(() => {
    // Simulate fetching data from API
    const fetchStats = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await api.get(`/dashboard/class-stats?faculty=${selectedFaculty}`);
        // setStats(response.data);
        
        // Simulated data
        setTimeout(() => {
          setStats({
            attendanceByClass: {
              labels: ['CNTT1', 'CNTT2', 'CNTT3', 'CNTT4', 'CNTT5'],
              datasets: [
                {
                  label: 'Tỷ lệ điểm danh',
                  data: [92, 88, 85, 90, 87],
                  backgroundColor: '#10b981'
                }
              ]
            },
            averageGradeByClass: {
              labels: ['CNTT1', 'CNTT2', 'CNTT3', 'CNTT4', 'CNTT5'],
              datasets: [
                {
                  label: 'Điểm trung bình',
                  data: [7.5, 7.2, 6.8, 7.3, 7.0],
                  backgroundColor: '#3b82f6'
                }
              ]
            },
            dropoutRiskByClass: {
              labels: ['CNTT1', 'CNTT2', 'CNTT3', 'CNTT4', 'CNTT5'],
              datasets: [
                {
                  label: 'Tỷ lệ nguy cơ (%)',
                  data: [4, 7, 9, 5, 8],
                  backgroundColor: '#ef4444'
                }
              ]
            },
            facultyList: [
              { id: 'all', name: 'Tất cả khoa' },
              { id: 'cntt', name: 'Công nghệ thông tin' },
              { id: 'kt', name: 'Kinh tế' },
              { id: 'kth', name: 'Kỹ thuật' },
              { id: 'xh', name: 'Xã hội học' },
              { id: 'y', name: 'Y khoa' }
            ]
          });
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching class stats:', error);
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [selectedFaculty]);

  const handleFacultyChange = (e) => {
    setSelectedFaculty(e.target.value);
    setIsLoading(true);
  };

  if (isLoading) {
    return <div className="loading">Đang tải dữ liệu lớp học...</div>;
  }

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Thống kê Lớp học</h2>
        <div className="flex items-center">
          <label htmlFor="faculty-select" className="mr-2 text-sm">Khoa:</label>
          <select
            id="faculty-select"
            value={selectedFaculty}
            onChange={handleFacultyChange}
            className="border rounded p-1 text-sm"
          >
            {stats.facultyList.map(faculty => (
              <option key={faculty.id} value={faculty.id}>
                {faculty.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-md font-medium mb-2">Tỷ lệ Điểm danh theo Lớp</h3>
        <div className="h-48">
          <BarChart 
            data={stats.attendanceByClass}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100
                }
              }
            }}
          />
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-md font-medium mb-2">Điểm Trung bình theo Lớp</h3>
        <div className="h-48">
          <BarChart 
            data={stats.averageGradeByClass}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  max: 10
                }
              }
            }}
          />
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="text-md font-medium mb-2">Tỷ lệ Nguy cơ Bỏ học theo Lớp</h3>
        <div className="h-48">
          <BarChart 
            data={stats.dropoutRiskByClass}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  max: 20
                }
              }
            }}
          />
        </div>
      </div>
      
      <div className="text-right">
        <Link to="/classes" className="text-blue-600 hover:text-blue-800 text-sm">
          Xem tất cả lớp học →
        </Link>
      </div>
    </Card>
  );
};

export default ClassStats;
