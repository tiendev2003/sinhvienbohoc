import { Link } from 'react-router';

const HighRiskStudentsTable = ({ students }) => {
  return (
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
          {students.map((student) => (
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
              <td className="px-4 py-2">
                {student.mainFactors.split(', ').map((factor, index) => (
                  <span key={index} className={`inline-block mr-1 mb-1 px-2 py-1 text-xs font-medium rounded-full ${
                    factor.includes('Điểm số thấp') || factor.includes('Môn học F') ? 'bg-red-100 text-red-800' :
                    factor.includes('Điểm danh kém') ? 'bg-yellow-100 text-yellow-800' :
                    factor.includes('Kỷ luật') ? 'bg-purple-100 text-purple-800' :
                    factor.includes('Kinh tế') ? 'bg-green-100 text-green-800' :
                    factor.includes('Hiệu suất giảm') || factor.includes('Xu hướng') ? 'bg-blue-100 text-blue-800' :
                    factor.includes('Bỏ lớp') ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {factor}
                  </span>
                ))}
              </td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr>
              <td colSpan="4" className="px-4 py-2 text-center text-sm text-gray-500">
                Không có sinh viên nào có nguy cơ cao
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HighRiskStudentsTable;
