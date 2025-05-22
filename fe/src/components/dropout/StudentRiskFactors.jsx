import { useEffect, useState } from 'react';
import { dropoutRiskService } from '../../services/dropoutRiskService';

const StudentRiskFactors = ({ studentId }) => {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRiskData = async () => {
      if (!studentId) return;
      
      setLoading(true);
      try {
        const response = await dropoutRiskService.getLatestStudentRisk(studentId);
        setRiskData(response.data);
      } catch (err) {
        console.error('Error fetching student risk data:', err);
        setError('Không thể tải dữ liệu nguy cơ bỏ học');
      } finally {
        setLoading(false);
      }
    };

    fetchRiskData();
  }, [studentId]);

  if (loading) {
    return <div className="p-4 text-center">Đang tải dữ liệu nguy cơ bỏ học...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">{error}</div>;
  }

  if (!riskData) {
    return <div className="p-4 text-center">Chưa có đánh giá nguy cơ bỏ học cho sinh viên này</div>;
  }

  // Helper function to get factor description
  const getFactorDescription = (factor) => {
    const descriptions = {
      low_gpa: 'GPA thấp hơn 6.0',
      failed_subjects: 'Có môn học không đạt',
      academic_warning: 'Đã nhận cảnh báo học tập',
      poor_attendance: 'Tỉ lệ điểm danh dưới 80%',
      disciplinary_issues: 'Có vấn đề kỷ luật',
      dropped_classes: 'Đã bỏ học ít nhất một lớp',
      financial_issues: 'Khó khăn tài chính'
    };
    return descriptions[factor] || factor;
  };

  // Helper function to get risk level class
  const getRiskLevelClass = (percentage) => {
    if (percentage >= 75) return 'bg-red-100 text-red-800';
    if (percentage >= 50) return 'bg-orange-100 text-orange-800';
    if (percentage >= 25) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  // Get active risk factors (where value is true)
  const activeRiskFactors = Object.entries(riskData.risk_factors || {})
    .filter(([_, isActive]) => isActive)
    .map(([key]) => key);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Đánh giá Nguy cơ Bỏ học</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelClass(riskData.risk_percentage)}`}>
          {riskData.risk_percentage.toFixed(1)}%
        </span>
      </div>

      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
          <div 
            className={`h-2.5 rounded-full ${
              riskData.risk_percentage >= 75 ? 'bg-red-600' : 
              riskData.risk_percentage >= 50 ? 'bg-orange-500' :
              riskData.risk_percentage >= 25 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${riskData.risk_percentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 text-right">Cập nhật: {new Date(riskData.analysis_date).toLocaleDateString('vi-VN')}</p>
      </div>

      {activeRiskFactors.length > 0 ? (
        <div>
          <h4 className="font-medium mb-2 text-sm">Yếu tố rủi ro:</h4>
          <ul className="space-y-1 text-sm">
            {activeRiskFactors.map(factor => (
              <li key={factor} className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                {getFactorDescription(factor)}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-gray-600">Không phát hiện yếu tố rủi ro</p>
      )}
    </div>
  );
};

export default StudentRiskFactors;
