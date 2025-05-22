import { Link } from 'react-router';

const ClassRiskTable = ({ classData }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lớp</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng SV</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rủi ro cao</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rủi ro TB</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rủi ro thấp</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Rủi ro TB</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {classData.map((classItem) => (
            <tr key={classItem.id}>
              <td className="px-4 py-2 whitespace-nowrap text-sm">
                <Link to={`/classes/${classItem.id}`} className="text-blue-600 hover:text-blue-800">
                  {classItem.className}
                </Link>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">{classItem.totalStudents}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                  {classItem.highRisk}
                </span>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                  {classItem.mediumRisk}
                </span>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  {classItem.lowRisk}
                </span>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        classItem.avgRisk > 20 ? 'bg-red-600' : 
                        classItem.avgRisk > 10 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, classItem.avgRisk * 2)}%` }}
                    ></div>
                  </div>
                  <span className="ml-2">{classItem.avgRisk.toFixed(1)}%</span>
                </div>
              </td>
            </tr>
          ))}
          {classData.length === 0 && (
            <tr>
              <td colSpan="6" className="px-4 py-2 text-center text-sm text-gray-500">
                Không có dữ liệu lớp học
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ClassRiskTable;
