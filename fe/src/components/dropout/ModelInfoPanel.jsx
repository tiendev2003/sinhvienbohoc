
// Component để hiển thị thông tin về mô hình ML
const ModelInfoPanel = ({ modelInfo }) => {
  if (!modelInfo) {
    return (
      <div className="text-center p-4 text-gray-500">
        Không có thông tin về mô hình
      </div>
    );
  }

  // Tính toán hiệu suất trung bình của mô hình kết hợp
  const calculateAveragePerformance = () => {
    if (!modelInfo.metrics) return "N/A";
    
    const rfAccuracy = modelInfo.metrics.accuracyRF || 0;
    const lrAccuracy = modelInfo.metrics.accuracyLR || 0;
    
    if (rfAccuracy === 0 && lrAccuracy === 0) return "N/A";
    
    // Tính trung bình có trọng số (60% RF, 40% LR)
    const weightedAvg = rfAccuracy * 0.6 + lrAccuracy * 0.4;
    return (weightedAvg * 100).toFixed(1) + "%";
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gray-50">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Thông tin mô hình dự đoán
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Chi tiết về mô hình Machine Learning được sử dụng
        </p>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Loại mô hình</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {modelInfo.modelType || "N/A"}
            </dd>
          </div>
          
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Thuật toán</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {modelInfo.algorithms?.join(", ") || "N/A"}
            </dd>
          </div>
          
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Ngày huấn luyện</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {modelInfo.lastTraining || "N/A"}
            </dd>
          </div>
          
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Độ chính xác</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="w-40">Random Forest:</span>
                  <span className="font-medium">
                    {modelInfo.metrics?.accuracyRF 
                      ? (modelInfo.metrics.accuracyRF * 100).toFixed(1) + "%" 
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-40">Logistic Regression:</span>
                  <span className="font-medium">
                    {modelInfo.metrics?.accuracyLR 
                      ? (modelInfo.metrics.accuracyLR * 100).toFixed(1) + "%" 
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center text-blue-600">
                  <span className="w-40">Mô hình kết hợp:</span>
                  <span className="font-medium">{calculateAveragePerformance()}</span>
                </div>
              </div>
            </dd>
          </div>
          
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Cỡ mẫu huấn luyện</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {modelInfo.metrics?.sampleSize || "N/A"} sinh viên
            </dd>
          </div>
          
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Cập nhật cuối</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {modelInfo.metrics?.lastUpdate 
                ? new Date(modelInfo.metrics.lastUpdate).toLocaleString("vi-VN") 
                : "N/A"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default ModelInfoPanel;
