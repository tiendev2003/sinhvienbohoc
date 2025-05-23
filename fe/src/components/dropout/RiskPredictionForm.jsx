import { useState } from 'react';
import { dropoutRiskService } from '../../services/dropoutRiskService';

const RiskPredictionForm = ({ studentId, onPredictionComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);

  const  handlePredict = async () => {
    setLoading(true);
    setError(null);
    setPredictionResult(null);
    
    try {
      const response = await dropoutRiskService.predictRisk(studentId);
      // Handle ML response format
      const predictionData = response.data?.prediction || response.data;
      setPredictionResult(predictionData);
      if (onPredictionComplete) {
        onPredictionComplete(predictionData);
      }
    } catch (err) {
      console.error('Prediction error:', err);
      setError(err.response?.data?.detail || 'Không thể dự báo nguy cơ bỏ học. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const  handleRecalculate = async () => {
    setLoading(true);
    setError(null);
    setPredictionResult(null);
    
    try {
      const response = await dropoutRiskService.recalculateRisk(studentId);
      // Handle ML response format
      const predictionData = response.data?.prediction || response.data;
      setPredictionResult(predictionData);
      if (onPredictionComplete) {
        onPredictionComplete(predictionData);
      }
    } catch (err) {
      console.error('Recalculation error:', err);
      setError(err.response?.data?.detail || 'Không thể tính toán lại nguy cơ bỏ học. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelLabel = (percentage) => {
    if (percentage >= 75) return { label: 'Cao', color: 'red' };
    if (percentage >= 50) return { label: 'Trung bình cao', color: 'orange' };
    if (percentage >= 25) return { label: 'Trung bình', color: 'yellow' };
    return { label: 'Thấp', color: 'green' };
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Công cụ Dự báo Nguy cơ Bỏ học</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-4">
          Dự báo nguy cơ bỏ học dựa trên dữ liệu học tập, điểm danh, kỷ luật và các yếu tố khác của sinh viên.
        </p>

        <div className="flex space-x-2">
          <button
            onClick={handlePredict}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Đang dự báo...' : 'Dự báo mới'}
          </button>
          
          <button
            onClick={handleRecalculate}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? 'Đang tính toán...' : 'Tính toán lại'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded mb-4">
          {error}
        </div>
      )}

      {predictionResult && (
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold text-lg mb-3">Kết quả Dự báo</h4>
          
          <div className="mb-4">
            <p className="font-medium">Tỷ lệ nguy cơ bỏ học:</p>
            <div className="flex items-center mt-2">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full ${
                    predictionResult.risk_percentage >= 75 ? 'bg-red-600' : 
                    predictionResult.risk_percentage >= 50 ? 'bg-orange-500' :
                    predictionResult.risk_percentage >= 25 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${predictionResult.risk_percentage}%` }}
                ></div>
              </div>
              <span className="ml-2 font-bold">{predictionResult.risk_percentage.toFixed(1)}%</span>
            </div>
            <p className="text-sm mt-1">
              Mức độ: <span className={`font-medium text-${getRiskLevelLabel(predictionResult.risk_percentage).color}-600`}>
                {getRiskLevelLabel(predictionResult.risk_percentage).label}
              </span>
            </p>
          </div>

          <div>
            <p className="font-medium mb-2">Các yếu tố rủi ro:</p>
            <ul className="list-disc pl-5 space-y-1">
              {predictionResult.risk_factors && Object.entries(predictionResult.risk_factors).map(([factor, isRisk]) => {
                if (!isRisk) return null;
                
                const factorLabels = {
                  low_gpa: 'Điểm trung bình học tập thấp',
                  failed_subjects: 'Có môn học không đạt',
                  academic_warning: 'Đã có cảnh báo học tập trước đây',
                  poor_attendance: 'Tỷ lệ điểm danh thấp',
                  disciplinary_issues: 'Có vi phạm kỷ luật',
                  dropped_classes: 'Đã từng bỏ lớp',
                  financial_issues: 'Khó khăn về tài chính'
                };
                
                return (
                  <li key={factor} className="text-sm">
                    {factorLabels[factor] || factor}
                  </li>
                );
              })}
            </ul>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            Ngày phân tích: {new Date(predictionResult.analysis_date).toLocaleDateString('vi-VN')}
          </p>
        </div>
      )}
    </div>
  );
};

export default RiskPredictionForm;
