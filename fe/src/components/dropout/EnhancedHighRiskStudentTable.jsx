import React, { useState } from "react";
import { Link } from "react-router";

// Component nâng cao để hiển thị chi tiết hơn về sinh viên có nguy cơ cao
const EnhancedHighRiskStudentTable = ({ students }) => {
  // State để lưu ID sinh viên đang được xem chi tiết
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  // Hàm chuyển đổi hiển thị chi tiết
  const toggleDetails = (studentId) => {
    if (expandedStudentId === studentId) {
      setExpandedStudentId(null); // Đóng nếu đã mở
    } else {
      setExpandedStudentId(studentId); // Mở nếu chưa mở
    }
  };

  if (!students || students.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Không có sinh viên nào có nguy cơ cao</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              MSSV
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Họ tên
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Điểm rủi ro
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Đánh giá ML
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Chi tiết
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.map((student) => (
            <React.Fragment key={student.id}>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  {student.studentId}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  <Link
                    to={`/students/${student.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {student.name}
                  </Link>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className="w-16 bg-gray-200 rounded-full h-2.5 mr-2"
                      title={`${student.riskScore}% nguy cơ`}
                    >
                      <div
                        className={`h-2.5 rounded-full ${
                          student.riskScore >= 85
                            ? "bg-red-600"
                            : student.riskScore >= 75
                            ? "bg-red-500"
                            : "bg-orange-400"
                        }`}
                        style={{ width: `${student.riskScore}%` }}
                      ></div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        student.riskScore >= 85
                          ? "bg-red-100 text-red-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {student.riskScore}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  <span
                    title="Độ tin cậy của mô hình ML"
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {(student.modelConfidence * 100).toFixed(1)}% tin cậy
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  <button
                    onClick={() => toggleDetails(student.id)}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      expandedStudentId === student.id
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    } hover:bg-blue-200 transition-colors duration-200`}
                  >
                    {expandedStudentId === student.id ? "Ẩn bớt" : "Xem thêm"}
                  </button>
                </td>
              </tr>
              {expandedStudentId === student.id && (
                <tr>
                  <td colSpan="5" className="px-4 py-2">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium mb-2 text-gray-700">
                        Phân tích chi tiết
                      </h4>

                      <div className="mb-3">
                        <h5 className="text-xs font-medium mb-1 text-gray-600">
                          Yếu tố rủi ro chính
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {student.mainFactors.split(", ").map((factor, idx) => (
                            <span
                              key={idx}
                              className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                factor.includes("Điểm số thấp") ||
                                factor.includes("Môn học F")
                                  ? "bg-red-100 text-red-800"
                                  : factor.includes("Điểm danh kém")
                                  ? "bg-yellow-100 text-yellow-800"
                                  : factor.includes("Kỷ luật")
                                  ? "bg-purple-100 text-purple-800"
                                  : factor.includes("Kinh tế")
                                  ? "bg-green-100 text-green-800"
                                  : factor.includes("Hiệu suất giảm") ||
                                    factor.includes("Xu hướng")
                                  ? "bg-blue-100 text-blue-800"
                                  : factor.includes("Bỏ lớp")
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {factor}
                            </span>
                          ))}
                        </div>
                      </div>

                      {student.detailedAnalysis && (
                        <>
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <h5 className="text-xs font-medium mb-1 text-gray-600">
                                Phân tích các thuật toán
                              </h5>
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span>Random Forest:</span>
                                  <span className="font-medium">
                                    {(
                                      student.detailedAnalysis.rf_probability * 100
                                    ).toFixed(1)}
                                    %
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span>Logistic Regression:</span>
                                  <span className="font-medium">
                                    {(
                                      student.detailedAnalysis.lr_probability * 100
                                    ).toFixed(1)}
                                    %
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs font-medium text-blue-600">
                                  <span>Kết hợp (trọng số):</span>
                                  <span>{student.riskScore}%</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h5 className="text-xs font-medium mb-1 text-gray-600">
                                Hành động đề xuất
                              </h5>
                              <div className="text-xs space-y-1">
                                {student.riskScore >= 85 ? (
                                  <div className="bg-red-50 p-1.5 rounded text-red-700">
                                    <span className="font-medium">Gấp:</span> Cần can thiệp ngay
                                  </div>
                                ) : (
                                  <div className="bg-orange-50 p-1.5 rounded text-orange-700">
                                    <span className="font-medium">Sớm:</span> Cần theo dõi và hỗ trợ
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {student.detailedAnalysis.key_features && (
                            <div className="mt-2">
                              <h5 className="text-xs font-medium mb-1 text-gray-600">
                                Đặc trưng quan trọng
                              </h5>
                              <div className="grid grid-cols-1 gap-1">
                                {student.detailedAnalysis.key_features
                                  .slice(0, 3)
                                  .map((feature, idx) => (
                                    <div
                                      key={idx}
                                      className="flex justify-between items-center text-xs"
                                    >
                                      <span>{feature.name.replace(/_/g, " ")}</span>
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`px-1.5 py-0.5 rounded ${
                                            feature.interpretation === "negative"
                                              ? "bg-red-50 text-red-700"
                                              : feature.interpretation === "neutral"
                                              ? "bg-gray-50 text-gray-700"
                                              : "bg-green-50 text-green-700"
                                          }`}
                                        >
                                          {feature.value}
                                        </span>
                                        <span className="text-blue-600 font-medium">
                                          {(feature.importance * 100).toFixed(0)}%
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EnhancedHighRiskStudentTable;
