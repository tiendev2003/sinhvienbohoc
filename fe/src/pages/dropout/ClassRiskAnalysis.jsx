import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import EnhancedHighRiskStudentTable from "../../components/dropout/EnhancedHighRiskStudentTable";
import FeatureImportanceChart from "../../components/dropout/FeatureImportanceChart";
import MLRecommendations from "../../components/dropout/MLRecommendations";
import ModelInfoPanel from "../../components/dropout/ModelInfoPanel";
import RiskDistributionChart from "../../components/dropout/RiskDistributionChart";
import { dropoutRiskService } from "../../services/dropoutRiskService";

const ClassRiskAnalysis = () => {
  const { id } = useParams();
  const [classData, setClassData] = useState(null);
  const [modelData, setModelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modelDataLoading, setModelDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modelError, setModelError] = useState(null);
  const [showModelDetails, setShowModelDetails] = useState(false);
  useEffect(() => {
    const fetchClassRiskData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Sử dụng API riêng cho ML để tính toán dự đoán bằng thuật toán
        const response = await dropoutRiskService.getClassRiskAnalyticsWithML(id);
        console.log("Class Risk Data (ML):", response.data);
        setClassData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch class risk data with ML:", err);
        
        // Nếu API ML gặp lỗi, thử sử dụng API thông thường 
        try {
          console.log("Falling back to standard analytics API...");
          const fallbackResponse = await dropoutRiskService.getClassRiskAnalytics(id);
          console.log("Class Risk Data (fallback):", fallbackResponse.data);
          setClassData(fallbackResponse.data);
          setLoading(false);
        } catch (fallbackErr) {
          console.error("Failed to fetch fallback class risk data:", fallbackErr);
          setError(
            "Không thể tải dữ liệu phân tích rủi ro của lớp. Vui lòng thử lại sau."
          );
          setLoading(false);
        }
      }
    };

    fetchClassRiskData();
  }, [id]);

  // Fetch Model Performance Data
  useEffect(() => {
    const fetchModelData = async () => {
      setModelDataLoading(true);
      setModelError(null);

      try {
        const response = await dropoutRiskService.getModelMetrics();
        console.log("Model Performance Data:", response.data);
        setModelData(response.data);
        setModelDataLoading(false);
      } catch (err) {
        console.error("Failed to fetch model performance data:", err);
        setModelError(
          "Không thể tải dữ liệu hiệu suất mô hình ML. Vui lòng thử lại sau."
        );
        setModelDataLoading(false);
      }
    };

    fetchModelData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        Đang tải dữ liệu phân tích rủi ro lớp...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 p-4 rounded text-red-700 mb-4">{error}</div>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Quay lại
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            {classData.className}: Phân tích Nguy cơ Bỏ học
          </h1>
          <p className="text-gray-600">
            Mã lớp: {classData.classId} | Giáo viên: {classData.teacherName}
          </p>          
          <div className="mt-1 inline-flex flex-wrap gap-2">
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded inline-flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              Sử dụng mô hình Machine Learning cho dự đoán
            </span>
            <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded inline-flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 mr-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Phân tích dựa trên thuật toán ML trực tiếp
            </span>
            {classData.mlModelInfo && (
              <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded inline-flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 mr-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                {classData.mlModelInfo.modelType}
              </span>
            )}
          </div>
        </div>
        <Link to={`/classes/${id}`}>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Xem thông tin lớp
          </button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-sm text-gray-500">Tổng số sinh viên</p>
          <p className="text-2xl font-bold">
            {classData.summary.totalStudents}
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-sm text-gray-500">Rủi ro cao</p>
          <p className="text-2xl font-bold text-red-600">
            {classData.summary.highRisk}
          </p>
          <p className="text-xs text-gray-500">
            {Math.round(
              (classData.summary.highRisk / classData.summary.totalStudents) *
                100
            )}
            % tổng số
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-sm text-gray-500">Rủi ro trung bình</p>
          <p className="text-2xl font-bold text-yellow-600">
            {classData.summary.mediumRisk}
          </p>
          <p className="text-xs text-gray-500">
            {Math.round(
              (classData.summary.mediumRisk / classData.summary.totalStudents) *
                100
            )}
            % tổng số
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-sm text-gray-500">Rủi ro TB cả lớp</p>
          <p className="text-2xl font-bold">
            {classData.summary.avgRiskPercentage.toFixed(1)}%
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Phân bố Nguy cơ</h2>
          <div className="h-64">
            <RiskDistributionChart data={classData.riskDistribution} />
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Mức độ quan trọng của đặc trưng</h2>
          {classData.featureImportance ? (
            <FeatureImportanceChart featureImportance={classData.featureImportance} />
          ) : (
            <p className="text-gray-500 text-center p-4">Không có dữ liệu về mức độ quan trọng của đặc trưng</p>
          )}
        </div>
      </div>

      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">
          Chi tiết sinh viên có nguy cơ cao
        </h2>
        <EnhancedHighRiskStudentTable students={classData.highRiskStudents} />
      </div>

      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Khuyến nghị từ mô hình ML</h2>
        {classData.recommendations ? (
          <MLRecommendations recommendations={classData.recommendations} />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                Dựa trên phân tích dữ liệu sử dụng Machine Learning
              </p>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Phiên bản 2.0
              </span>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">
                  Theo dõi điểm danh chặt chẽ
                </h3>
                <p className="text-sm text-blue-700">
                  Điểm danh là một trong những chỉ báo sớm nhất về nguy cơ bỏ học.
                  Cần theo dõi chặt chẽ và liên hệ ngay với sinh viên có tỷ lệ vắng
                  mặt cao.
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Hỗ trợ học tập</h3>
                <p className="text-sm text-green-700">
                  Tổ chức các buổi học bổ sung hoặc kèm cặp cho các sinh viên có
                  điểm thấp, đặc biệt là các sinh viên đã được xác định có nguy cơ
                  bỏ học cao.
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-medium text-purple-800 mb-2">
                  Tư vấn tài chính
                </h3>
                <p className="text-sm text-purple-700">
                  Một số sinh viên có nguy cơ bỏ học do khó khăn tài chính. Cần tư
                  vấn về các chương trình học bổng, hỗ trợ tài chính có thể giúp họ
                  tiếp tục việc học.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Thông tin chi tiết về mô hình ML</h2>
          <button
            onClick={() => setShowModelDetails(!showModelDetails)}
            className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-sm flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={showModelDetails ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"}
              />
            </svg>
            {showModelDetails ? "Ẩn chi tiết" : "Xem chi tiết"}
          </button>
        </div>

        {showModelDetails && (
          <div className="mt-4">
            {classData.mlModelInfo ? (
              <ModelInfoPanel modelInfo={classData.mlModelInfo} />
            ) : modelDataLoading ? (
              <p className="text-sm text-gray-500">
                Đang tải thông tin mô hình...
              </p>
            ) : modelError ? (
              <p className="text-sm text-red-500">{modelError}</p>
            ) : (
              modelData && (
                <>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-700 mb-2">
                      Hiệu suất mô hình
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">
                          Random Forest
                        </h4>
                        <p className="text-sm">
                          AUC:{" "}
                          {modelData.random_forest?.cross_val_auc_mean?.toFixed(
                            3
                          ) || "N/A"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">
                          Logistic Regression
                        </h4>
                        <p className="text-sm">
                          AUC:{" "}
                          {modelData.logistic_regression?.cross_val_auc_mean?.toFixed(
                            3
                          ) || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg mt-4">
                    <h3 className="font-medium text-gray-700 mb-2">
                      Thông tin về dữ liệu huấn luyện
                    </h3>
                    <div className="text-sm">
                      <p>
                        Tổng số mẫu:{" "}
                        {modelData.data_info?.total_samples || "N/A"}
                      </p>
                      <p>
                        Rủi ro cao:{" "}
                        {modelData.data_info?.class_distribution?.[
                          "High Risk"
                        ] || 0}{" "}
                        mẫu
                      </p>
                      <p>
                        Rủi ro thấp:{" "}
                        {modelData.data_info?.class_distribution?.[
                          "Low Risk"
                        ] || 0}{" "}
                        mẫu
                      </p>
                    </div>
                  </div>
                </>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassRiskAnalysis;
