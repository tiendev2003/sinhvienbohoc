import { useEffect, useState } from 'react';
import BarChart from '../../components/charts/BarChart';
import PieChart from '../../components/charts/PieChart';
import RiskPredictionChart from '../../components/charts/RiskPredictionChart';
import RiskAssessmentTable from '../../components/tables/RiskAssessmentTable';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const RiskAnalytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [riskData, setRiskData] = useState(null);
  const [timeframe, setTimeframe] = useState('semester'); // 'semester', 'year', 'all'
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Simulate fetching data from API
    const fetchRiskData = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await api.get(`/admin/risk-analytics?timeframe=${timeframe}`);
        // setRiskData(response.data);
        
        // Simulated data
        setTimeout(() => {
          setRiskData({
            summary: {
              totalStudents: 1245,
              lowRisk: 1053,
              mediumRisk: 135,
              highRisk: 57,
            },
            riskFactors: [
              { factor: 'Tỷ lệ vắng mặt', weight: 30 },
              { factor: 'Điểm thấp', weight: 25 },
              { factor: 'Vi phạm kỷ luật', weight: 15 },
              { factor: 'Hoàn cảnh kinh tế', weight: 20 },
              { factor: 'Khác', weight: 10 }
            ],
            facultyDistribution: [
              { faculty: 'Công nghệ thông tin', highRisk: 8, mediumRisk: 22, lowRisk: 170 },
              { faculty: 'Kinh tế', highRisk: 15, mediumRisk: 34, lowRisk: 251 },
              { faculty: 'Kỹ thuật', highRisk: 12, mediumRisk: 28, lowRisk: 208 },
              { faculty: 'Xã hội học', highRisk: 7, mediumRisk: 19, lowRisk: 145 },
              { faculty: 'Y khoa', highRisk: 5, mediumRisk: 12, lowRisk: 132 },
              { faculty: 'Khác', highRisk: 10, mediumRisk: 20, lowRisk: 147 }
            ],
            predictedTrend: [
              { month: 'Tháng 1', rate: 4.2 },
              { month: 'Tháng 2', rate: 4.5 },
              { month: 'Tháng 3', rate: 4.8 },
              { month: 'Tháng 4', rate: 5.2 },
              { month: 'Tháng 5', rate: 4.9 },
              { month: 'Tháng 6', rate: 4.7 },
              { month: 'Tháng 7', rate: 4.3 },
              { month: 'Tháng 8', rate: 4.1 },
              { month: 'Tháng 9', rate: 4.6 },
              { month: 'Tháng 10', rate: 4.8 },
              { month: 'Tháng 11', rate: 5.1 },
              { month: 'Tháng 12', rate: 5.3 }
            ],
            highRiskStudents: [
              { id: 1, name: 'Nguyễn Văn A', studentId: 'SV001', riskScore: 85, mainFactors: 'Vắng mặt, Điểm thấp' },
              { id: 2, name: 'Trần Thị B', studentId: 'SV042', riskScore: 78, mainFactors: 'Điểm thấp, Hoàn cảnh kinh tế' },
              { id: 3, name: 'Lê Văn C', studentId: 'SV107', riskScore: 92, mainFactors: 'Vắng mặt, Vi phạm kỷ luật' },
              { id: 4, name: 'Phạm Thị D', studentId: 'SV253', riskScore: 81, mainFactors: 'Điểm thấp, Vắng mặt' },
              { id: 5, name: 'Hoàng Văn E', studentId: 'SV312', riskScore: 75, mainFactors: 'Hoàn cảnh kinh tế, Điểm thấp' }
            ]
          });
          setIsLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error fetching risk analytics data:', error);
        setIsLoading(false);
      }
    };

    fetchRiskData();
  }, [timeframe]);

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
    setIsLoading(true);
  };

  if (isLoading) {
    return <div className="loading">Đang tải dữ liệu phân tích rủi ro...</div>;
  }

  return (
    <div className="risk-analytics p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Phân tích Nguy cơ Bỏ học</h1>
        <div className="flex space-x-2">
          <Button 
            type="button" 
            variant={timeframe === 'semester' ? 'primary' : 'secondary'}
            onClick={() => handleTimeframeChange('semester')}
          >
            Học kỳ hiện tại
          </Button>
          <Button 
            type="button" 
            variant={timeframe === 'year' ? 'primary' : 'secondary'}
            onClick={() => handleTimeframeChange('year')}
          >
            Năm học
          </Button>
          <Button 
            type="button" 
            variant={timeframe === 'all' ? 'primary' : 'secondary'}
            onClick={() => handleTimeframeChange('all')}
          >
            Tất cả
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="stat-card">
            <h3 className="text-lg font-semibold">Tổng số sinh viên</h3>
            <p className="text-3xl font-bold">{riskData.summary.totalStudents}</p>
          </div>
        </Card>
        
        <Card>
          <div className="stat-card">
            <h3 className="text-lg font-semibold">Rủi ro thấp</h3>
            <p className="text-3xl font-bold text-green-600">
              {riskData.summary.lowRisk}
              <span className="text-sm font-normal ml-2">
                ({((riskData.summary.lowRisk / riskData.summary.totalStudents) * 100).toFixed(1)}%)
              </span>
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="stat-card">
            <h3 className="text-lg font-semibold">Rủi ro trung bình</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {riskData.summary.mediumRisk}
              <span className="text-sm font-normal ml-2">
                ({((riskData.summary.mediumRisk / riskData.summary.totalStudents) * 100).toFixed(1)}%)
              </span>
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="stat-card">
            <h3 className="text-lg font-semibold">Rủi ro cao</h3>
            <p className="text-3xl font-bold text-red-600">
              {riskData.summary.highRisk}
              <span className="text-sm font-normal ml-2">
                ({((riskData.summary.highRisk / riskData.summary.totalStudents) * 100).toFixed(1)}%)
              </span>
            </p>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Xu hướng Dự báo Bỏ học</h3>
          <RiskPredictionChart data={riskData.predictedTrend} />
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Phân bố Nguy cơ theo Khoa</h3>
          <BarChart 
            data={{
              labels: riskData.facultyDistribution.map(item => item.faculty),
              datasets: [
                {
                  label: 'Rủi ro cao',
                  backgroundColor: '#ef4444',
                  data: riskData.facultyDistribution.map(item => item.highRisk)
                },
                {
                  label: 'Rủi ro trung bình',
                  backgroundColor: '#f59e0b',
                  data: riskData.facultyDistribution.map(item => item.mediumRisk)
                },
                {
                  label: 'Rủi ro thấp',
                  backgroundColor: '#10b981',
                  data: riskData.facultyDistribution.map(item => item.lowRisk)
                }
              ]
            }}
          />
        </Card>
      </div>

      {/* Risk Factors Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Các Yếu tố Nguy cơ</h3>
          <PieChart 
            data={{
              labels: riskData.riskFactors.map(factor => factor.factor),
              datasets: [{
                data: riskData.riskFactors.map(factor => factor.weight),
                backgroundColor: [
                  '#ef4444', // red
                  '#f59e0b', // amber
                  '#3b82f6', // blue
                  '#10b981', // green
                  '#8b5cf6'  // purple
                ]
              }]
            }}
          />
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Sinh viên Nguy cơ Cao</h3>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MSSV</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm rủi ro</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yếu tố chính</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {riskData.highRiskStudents.slice(0, 5).map((student) => (
                  <tr key={student.id}>
                    <td className="px-4 py-2 whitespace-nowrap">{student.studentId}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{student.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.riskScore >= 90 ? 'bg-red-100 text-red-800' : 
                        student.riskScore >= 80 ? 'bg-orange-100 text-orange-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {student.riskScore}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{student.mainFactors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-right">
            <Button type="button" variant="secondary" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? 'Ẩn chi tiết' : 'Xem thêm'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Detailed Risk Assessment Table */}
      {showDetails && (
        <Card className="p-4 mb-8">
          <h3 className="text-lg font-semibold mb-4">Đánh giá Chi tiết Rủi ro</h3>
          <RiskAssessmentTable />
        </Card>
      )}
    </div>
  );
};

export default RiskAnalytics;
