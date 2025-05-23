import {
  AcademicCapIcon,
  CheckCircleIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import ChartComponent from '../../components/common/ChartComponent';
import { useAuth } from '../../context/AuthContext';
import { dropoutRiskMLService } from '../../services/dropoutRiskMLService';

const MLDropoutRiskDashboard = () => {
  const [modelPerformance, setModelPerformance] = useState(null);
  const [featureImportance, setFeatureImportance] = useState(null);
  const [allPredictions, setAllPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchModelPerformance();
    fetchFeatureImportance();
    fetchAllPredictions();
  }, []);
  const fetchModelPerformance = async () => {
    try {
      const response = await dropoutRiskMLService.getModelPerformance();
      setModelPerformance(response.data);
    } catch (err) {
      console.error('Error fetching model performance:', err);
      if (err.response?.status !== 404) {
        setError('Không thể tải thông tin hiệu suất mô hình');
      }
    }
  };
  const fetchFeatureImportance = async () => {
    try {
      const response = await dropoutRiskMLService.getFeatureImportance();
      setFeatureImportance(response.data);
    } catch (err) {
      console.error('Error fetching feature importance:', err);
      if (err.response?.status !== 404) {
        setError('Không thể tải thông tin tầm quan trọng đặc trưng');
      }
    }
  };
  const fetchAllPredictions = async () => {
    try {
      const response = await dropoutRiskMLService.predictAllStudents();
      setAllPredictions(response.data);
    } catch (err) {
      console.error('Error fetching predictions:', err);
      if (err.response?.status !== 404) {
        setError('Không thể tải dự đoán cho tất cả sinh viên');
      }
    } finally {
      setLoading(false);
    }
  };
  const trainModels = async () => {
    if (!user || user.role !== 'admin') {
      setError('Chỉ admin mới có thể huấn luyện mô hình');
      return;
    }

    setIsTraining(true);
    setError(null);
    try {
      const response = await dropoutRiskMLService.trainModels();
      alert('Mô hình đã được huấn luyện thành công!');
      // Refresh data
      await fetchModelPerformance();
      await fetchFeatureImportance();
      await fetchAllPredictions();
    } catch (err) {
      console.error('Error training models:', err);
      setError('Lỗi khi huấn luyện mô hình: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsTraining(false);
    }
  };
  const predictStudent = async (studentId) => {
    try {
      const response = await dropoutRiskMLService.predictStudent(studentId);
      setSelectedStudent(response.data);
    } catch (err) {
      console.error('Error predicting student:', err);
      setError('Lỗi khi dự đoán: ' + (err.response?.data?.detail || err.message));
    }
  };

  // Prepare chart data for feature importance
  const prepareFeatureImportanceChart = () => {
    if (!featureImportance?.random_forest_importance) return null;

    const topFeatures = featureImportance.random_forest_importance.slice(0, 10);
    
    return {
      labels: topFeatures.map(f => f.description),
      datasets: [{
        label: 'Mức độ quan trọng',
        data: topFeatures.map(f => f.importance),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    };
  };

  // Prepare chart data for risk distribution
  const prepareRiskDistributionChart = () => {
    if (!allPredictions || allPredictions.length === 0) return null;

    const highRisk = allPredictions.filter(p => p.risk_percentage >= 70).length;
    const mediumRisk = allPredictions.filter(p => p.risk_percentage >= 40 && p.risk_percentage < 70).length;
    const lowRisk = allPredictions.filter(p => p.risk_percentage < 40).length;

    return {
      labels: ['Nguy cơ cao (≥70%)', 'Nguy cơ trung bình (40-69%)', 'Nguy cơ thấp (<40%)'],
      datasets: [{
        label: 'Số lượng sinh viên',
        data: [highRisk, mediumRisk, lowRisk],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 205, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }]
    };
  };

  const getRiskLevelColor = (percentage) => {
    if (percentage >= 70) return 'text-red-600 bg-red-100';
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getRiskLevelText = (percentage) => {
    if (percentage >= 70) return 'Rất cao';
    if (percentage >= 40) return 'Trung bình';
    return 'Thấp';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CpuChipIcon className="h-8 w-8 text-indigo-600" />
              Phân tích ML - Nguy cơ bỏ học
            </h1>
            <p className="text-gray-600 mt-1">
              Sử dụng Random Forest và Logistic Regression để dự đoán nguy cơ bỏ học
            </p>
          </div>
          {user?.role === 'admin' && (
            <button
              onClick={trainModels}
              disabled={isTraining}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isTraining ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang huấn luyện...
                </>
              ) : (
                <>
                  <AcademicCapIcon className="h-5 w-5" />
                  Huấn luyện lại mô hình
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
 

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance Chart */}
        {featureImportance && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tầm quan trọng các đặc trưng
            </h3>
            <ChartComponent
              type="bar"
              data={prepareFeatureImportanceChart()}
              options={{
                responsive: true,
                indexAxis: 'y',
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  x: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        )}

        {/* Risk Distribution Chart */}
        {allPredictions.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Phân bố nguy cơ bỏ học
            </h3>
            <ChartComponent
              type="doughnut"
              data={prepareRiskDistributionChart()}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        )}
      </div>

      {/* High Risk Students */}
      {allPredictions.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sinh viên có nguy cơ cao
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sinh viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nguy cơ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Random Forest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Logistic Regression
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Yếu tố rủi ro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allPredictions
                  .filter(p => p.risk_percentage >= 40)
                  .sort((a, b) => b.risk_percentage - a.risk_percentage)
                  .slice(0, 20)
                  .map((prediction) => (
                    <tr key={prediction.student_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Sinh viên #{prediction.student_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(prediction.risk_percentage)}`}>
                          {prediction.risk_percentage.toFixed(1)}% ({getRiskLevelText(prediction.risk_percentage)})
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {prediction.prediction_details?.random_forest?.probability?.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {prediction.prediction_details?.logistic_regression?.probability?.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Object.entries(prediction.risk_factors || {})
                          .filter(([_, isRisk]) => isRisk)
                          .length} yếu tố
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => predictStudent(prediction.student_id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Chi tiết dự đoán - Sinh viên #{selectedStudent.student_id}
                </h3>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Prediction Results */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Kết quả dự đoán</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span>Ensemble:</span>
                      <span className={`font-semibold ${getRiskLevelColor(selectedStudent.risk_percentage)}`}>
                        {selectedStudent.risk_percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Random Forest:</span>
                      <span>{selectedStudent.prediction_details?.random_forest?.probability?.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Logistic Regression:</span>
                      <span>{selectedStudent.prediction_details?.logistic_regression?.probability?.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {/* Risk Factors */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Yếu tố rủi ro</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedStudent.risk_factors || {}).map(([factor, isRisk]) => (
                      <div key={factor} className="flex items-center gap-2">
                        {isRisk ? (
                          <XCircleIcon className="h-5 w-5 text-red-500" />
                        ) : (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        )}
                        <span className={isRisk ? 'text-red-700' : 'text-green-700'}>
                          {factor.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {selectedStudent.recommendations && selectedStudent.recommendations.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Đề xuất hành động</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {selectedStudent.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MLDropoutRiskDashboard;
