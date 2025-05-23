
// Component để hiển thị biểu đồ Feature Importance từ mô hình ML
const FeatureImportanceChart = ({ featureImportance }) => {
  if (!featureImportance || featureImportance.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        Không có dữ liệu về mức độ quan trọng của các đặc trưng
      </div>
    );
  }

  // Sắp xếp theo độ quan trọng giảm dần
  const sortedFeatures = [...featureImportance].sort(
    (a, b) => b.importance - a.importance
  );

  // Chỉ hiển thị top 8 features quan trọng nhất
  const topFeatures = sortedFeatures.slice(0, 8);

  // Ánh xạ tên các đặc trưng từ tiếng Anh sang tiếng Việt
  const featureTranslations = {
    attendance_rate: "Tỷ lệ điểm danh",
    gpa: "Điểm trung bình",
    financial_aid_status: "Trạng thái hỗ trợ tài chính",
    disciplinary_incidents: "Sự cố kỷ luật", 
    failed_courses: "Số môn không đạt",
    class_participation: "Tham gia lớp học",
    academic_warning: "Cảnh báo học thuật",
    previous_semester_gpa: "GPA kỳ trước",
    dropped_courses: "Số môn đã rút",
    attendance_trend: "Xu hướng điểm danh",
    gpa_trend: "Xu hướng điểm số",
    social_engagement: "Gắn kết xã hội",
    health_issues: "Vấn đề sức khỏe"
  };

  return (
    <div className="py-2">
      <div className="space-y-3">
        {topFeatures.map((feature, index) => {
          // Tìm tên hiển thị cho đặc trưng, ưu tiên sử dụng tên được cung cấp hoặc tên đã dịch
          const displayName =
            feature.displayName ||
            featureTranslations[feature.feature] ||
            feature.feature.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
          
          // Tính toán phần trăm để hiển thị thanh tiến trình
          const percentage = Math.round(feature.importance * 100);
          
          // Xác định màu sắc dựa trên tầm quan trọng (màu đậm hơn cho đặc trưng quan trọng hơn)
          const getBarColor = (importance) => {
            if (importance >= 0.25) return "bg-blue-600";
            if (importance >= 0.15) return "bg-blue-500";
            if (importance >= 0.10) return "bg-blue-400";
            if (importance >= 0.05) return "bg-blue-300";
            return "bg-blue-200";
          };

          return (
            <div key={index} className="flex items-center gap-2">
              <div className="w-1/3 text-sm font-medium truncate" title={displayName}>
                {displayName}
              </div>
              <div className="w-2/3 flex items-center gap-2">
                <div className="flex-grow bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full ${getBarColor(feature.importance)}`}
                    style={{ width: `${Math.max(percentage, 3)}%` }}
                  ></div>
                </div>
                <div className="w-12 text-right text-xs font-medium">
                  {percentage}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeatureImportanceChart;
