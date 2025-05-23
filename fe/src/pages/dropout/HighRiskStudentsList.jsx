import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { dropoutRiskService } from "../../services/dropoutRiskService";

const HighRiskStudentsList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    minRisk: 75,
    classId: "",
    searchQuery: "",
  });
  const { hasRole } = useAuth();
  useEffect(() => {
    const fetchHighRiskStudents = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await dropoutRiskService.getAllRisks({
          min_risk: filters.minRisk,
          class_id: filters.classId || undefined,
        });

        console.log("API response:", response);

        // Process the data for display
        let processedData = [];

        if (response.data && Array.isArray(response.data)) {
          processedData = response.data
            .map((risk) => {
              // Validate student data exists
              if (!risk.student) {
                console.warn("Risk record missing student data:", risk);
                return null;
              }

              const student = risk.student;
              const user = student.user || {};

              return {
                id: risk.risk_id,
                student_id: student.student_code || "N/A",
                name: user.full_name || "Unknown",
                class_name: student.class ? student.class.class_name : "N/A",
                risk_percentage: risk.risk_percentage || 0,
                risk_factors: risk.risk_factors || {},
                analysis_date: risk.analysis_date || new Date().toISOString(),
                attendance_rate: student.attendance_rate,
                academic_status: student.academic_status,
                entry_year: student.entry_year,
                expected_graduation_year: student.expected_graduation_year,
              };
            })
            .filter(Boolean); // Remove any null entries
        } else {
          console.error("Unexpected API response format:", response);
          setError(
            "Dữ liệu trả về không đúng định dạng. Vui lòng thử lại sau."
          );
        }

        // Apply search filter if exists
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          processedData = processedData.filter(
            (student) =>
              student.name.toLowerCase().includes(query) ||
              student.student_id.toLowerCase().includes(query) ||
              (student.class_name &&
                student.class_name.toLowerCase().includes(query))
          );
        }

        setStudents(processedData);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch high risk students:", err);
        setError(
          "Không thể tải danh sách sinh viên có nguy cơ cao. Vui lòng thử lại sau."
        );
        setLoading(false);
      }
    };

    fetchHighRiskStudents();
  }, [filters]);

  const handleSearchChange = (e) => {
    setFilters({
      ...filters,
      searchQuery: e.target.value,
    });
  };

  const handleClassFilterChange = (e) => {
    setFilters({
      ...filters,
      classId: e.target.value,
    });
  };

  const handleMinRiskChange = (e) => {
    setFilters({
      ...filters,
      minRisk: Number(e.target.value),
    });
  };

  // Helper function to get main risk factors as text
  const getMainRiskFactors = (riskFactors) => {
    if (!riskFactors) return "N/A";

    const factorLabels = {
      academic_performance: "Điểm số",
      attendance: "Điểm danh",
      disciplinary_records: "Kỷ luật",
      family_income: "Kinh tế",
      previous_warnings: "Cảnh báo học tập",
    };

    // Create a list of factors with their values for sorting
    const factorEntries = Object.entries(riskFactors)
      .filter(([key]) => factorLabels[key]) // Only include known factors
      .map(([key, value]) => {
        // For non-numeric values like "high", "medium", "low"
        if (typeof value === "string") {
          return { key, label: factorLabels[key], value: value };
        }
        // For numeric values, we'll convert to a "concern level"
        // Different logic based on the factor type
        if (key === "attendance") {
          // Lower attendance is worse (convert to inverse percentage)
          return {
            key,
            label: factorLabels[key],
            value: 100 - value,
            display: `${value.toFixed(1)}%`,
          };
        } else if (key === "academic_performance") {
          // Lower GPA is worse (inverse on a 10-point scale)
          return {
            key,
            label: factorLabels[key],
            value: 10 - value,
            display: value.toFixed(2),
          };
        } else {
          // For other numeric factors, higher is worse
          return {
            key,
            label: factorLabels[key],
            value: value,
            display: value,
          };
        }
      });

    // Sort by concern level (highest first)
    factorEntries.sort((a, b) => b.value - a.value);

    // Take top 3 factors
    const mainFactors = factorEntries.slice(0, 3).map((factor) => {
      if (factor.display) {
        return `${factor.label}: ${factor.display}`;
      }
      return factor.label;
    });

    return mainFactors.join(", ") || "Không có";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sinh viên Có Nguy cơ Bỏ học Cao</h1>
        <Link to="/dropout-risk">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Quay lại Tổng quan
          </button>
        </Link>
      </div>

      <div className="p-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={handleSearchChange}
              placeholder="Tên, MSSV "
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mức độ rủi ro tối thiểu
            </label>
            <select
              value={filters.minRisk}
              onChange={handleMinRiskChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="75">Cao (≥ 75%)</option>
              <option value="50">Trung bình cao (≥ 50%)</option>
              <option value="25">Trung bình (≥ 25%)</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Đang tải dữ liệu sinh viên...</div>
        ) : error ? (
          <div className="bg-red-100 p-4 rounded text-red-700">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MSSV
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Họ tên
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mức rủi ro
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Yếu tố chính
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày phân tích
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.length > 0 ? (
                  students.map((student) => (
                    <tr key={student.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {student.student_id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/dropout-risk/${student.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {student.name}
                        </Link>
                      </td>
                     
                      <td className="px-4 py-3 whitespace-nowrap">
                        {" "}
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            student.risk_percentage >= 85
                              ? "bg-red-100 text-red-800"
                              : student.risk_percentage >= 75
                              ? "bg-orange-100 text-orange-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {typeof student.risk_percentage === "number"
                            ? student.risk_percentage.toFixed(1)
                            : Number(student.risk_percentage).toFixed(1)}
                          %
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {getMainRiskFactors(student.risk_factors)}
                      </td>{" "}
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {student.analysis_date
                          ? new Date(student.analysis_date).toLocaleDateString(
                              "vi-VN",
                              {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <Link to={`/dropout-risk/${student.id}`}>
                            <button className="text-blue-600 hover:text-blue-800">
                              Chi tiết
                            </button>
                          </Link>
                          {hasRole("teacher") ||
                          hasRole("counselor") ||
                          hasRole("admin") ? (
                            <Link
                              to={`/dropout-risk/interventions?studentId=${student.id}`}
                            >
                              <button className="text-green-600 hover:text-green-800">
                                Can thiệp
                              </button>
                            </Link>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Không tìm thấy sinh viên nào phù hợp với tiêu chí tìm kiếm
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {hasRole("teacher") || hasRole("counselor") || hasRole("admin") ? (
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            Dự báo cho Sinh viên Cụ thể
          </h2>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Nhập mã số sinh viên để dự báo nguy cơ bỏ học cho một sinh viên cụ
              thể.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                MSSV
              </label>
              <input
                type="text"
                placeholder="Nhập mã số sinh viên..."
                className="w-full p-2 border border-gray-300 rounded"
                id="studentIdForPrediction"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={async () => {
                  const studentId = document.getElementById(
                    "studentIdForPrediction"
                  ).value;
                  if (studentId) {
                    try {
                      setLoading(true);
                      const response = await dropoutRiskService.predictRisk(
                        studentId
                      );
                      if (response && response.data) {
                        alert(
                          `Đã dự báo thành công cho sinh viên ${studentId}. Nguy cơ bỏ học: ${response.data.risk_percentage.toFixed(
                            1
                          )}%`
                        );

                        // Refresh the list
                        const risksResponse =
                          await dropoutRiskService.getAllRisks({
                            min_risk: filters.minRisk,
                            class_id: filters.classId || undefined,
                          });

                        // Process the data again...
                        if (
                          risksResponse.data &&
                          Array.isArray(risksResponse.data)
                        ) {
                          const newProcessedData = risksResponse.data
                            .map((risk) => {
                              if (!risk.student) return null;

                              const student = risk.student;
                              const user = student.user || {};

                              return {
                                id: risk.risk_id,
                                student_id: student.student_code || "N/A",
                                name: user.full_name || "Unknown",
                                class_name: student.class
                                  ? student.class.class_name
                                  : "N/A",
                                risk_percentage: risk.risk_percentage || 0,
                                risk_factors: risk.risk_factors || {},
                                analysis_date:
                                  risk.analysis_date ||
                                  new Date().toISOString(),
                                attendance_rate: student.attendance_rate,
                                academic_status: student.academic_status,
                                entry_year: student.entry_year,
                                expected_graduation_year:
                                  student.expected_graduation_year,
                              };
                            })
                            .filter(Boolean);

                          setStudents(newProcessedData);
                        }
                      }
                    } catch (err) {
                      console.error("Error predicting risk:", err);
                      alert(
                        "Không thể dự báo. Vui lòng kiểm tra mã số sinh viên và thử lại."
                      );
                    } finally {
                      setLoading(false);
                    }
                  } else {
                    alert("Vui lòng nhập mã số sinh viên.");
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Dự báo
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default HighRiskStudentsList;
