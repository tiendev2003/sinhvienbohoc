// Dropout risk overview component
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import PieChart from '../charts/PieChart';
import RiskPredictionChart from '../charts/RiskPredictionChart';
import Card from '../ui/Card';

const DropoutRiskOverview = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Simulate fetching data from API
    const fetchStats = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await api.get('/dashboard/dropout-risk-overview');
        // setStats(response.data);
        
        // Simulated data
        setTimeout(() => {
          setStats({
            riskDistribution: {
              labels: ['Rủi ro thấp', 'Rủi ro trung bình', 'Rủi ro cao'],
              datasets: [
                {
                  data: [70, 20, 10],
                  backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                  borderColor: ['#10b981', '#f59e0b', '#ef4444']
                }
              ]
            },
            riskFactors: {
              labels: ['Điểm danh', 'Điểm số', 'Kỷ luật', 'Kinh tế', 'Khác'],
              datasets: [
                {
                  data: [40, 25, 15, 15, 5],
                  backgroundColor: ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6']
                }
              ]
            },
            riskTrend: [
              { month: 'T1', rate: 8.5 },
              { month: 'T2', rate: 9.2 },
              { month: 'T3', rate: 10.1 },
              { month: 'T4', rate: 9.8 },
              { month: 'T5', rate: 9.5 },
              { month: 'T6', rate: 9.0 },
              { month: 'T7', rate: 8.7 },
              { month: 'T8', rate: 8.5 },
              { month: 'T9', rate: 9.3 },
              { month: 'T10', rate: 9.8 },
              { month: 'T11', rate: 10.2 },
              { month: 'T12', rate: 10.5 }
            ],
            highRiskStudents: [
              { id: 1, name: 'Nguyễn Văn A', studentId: 'SV1001', riskScore: 85, mainFactors: 'Điểm danh, Điểm số' },
              { id: 2, name: 'Trần Thị B', studentId: 'SV1025', riskScore: 82, mainFactors: 'Điểm số, Kinh tế' },
              { id: 3, name: 'Lê Văn C', studentId: 'SV1058', riskScore: 90, mainFactors: 'Điểm danh, Kỷ luật' },
              { id: 4, name: 'Phạm Thị D', studentId: 'SV1132', riskScore: 78, mainFactors: 'Kinh tế, Điểm số' },
              { id: 5, name: 'Hoàng Văn E', studentId: 'SV1187', riskScore: 75, mainFactors: 'Điểm danh, Điểm số' }
            ]
          });
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dropout risk overview:', error);
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="loading">Đang tải dữ liệu nguy cơ bỏ học...</div>;
  }

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Tổng quan Nguy cơ Bỏ học</h2>
        <Link to="/dropout-risk" className="text-blue-600 hover:text-blue-800 text-sm">
          Xem chi tiết →
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-md font-medium mb-2">Phân bố Nguy cơ</h3>
          <div className="h-48 flex items-center justify-center">
            <PieChart 
              data={stats.riskDistribution}
              options={{
                responsive: true,
                maintainAspectRatio: false
              }}
            />
          </div>
        </div>
        
        <div>
          <h3 className="text-md font-medium mb-2">Các Yếu tố Nguy cơ</h3>
          <div className="h-48 flex items-center justify-center">
            <PieChart 
              data={stats.riskFactors}
              options={{
                responsive: true,
                maintainAspectRatio: false
              }}
            />
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-md font-medium mb-2">Xu hướng Nguy cơ Bỏ học</h3>
        <div className="h-48">
          <RiskPredictionChart data={stats.riskTrend} />
        </div>
      </div>
      
      <div>
        <h3 className="text-md font-medium mb-2">Sinh viên Nguy cơ Cao</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MSSV</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm rủi ro</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yếu tố chính</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.highRiskStudents.map((student) => (
                <tr key={student.id}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">{student.studentId}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    <Link to={`/students/${student.id}`} className="text-blue-600 hover:text-blue-800">
                      {student.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      student.riskScore >= 85 ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {student.riskScore}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">{student.mainFactors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};

export default DropoutRiskOverview;
