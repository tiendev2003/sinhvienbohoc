import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentClasses } from '../../services/api';

const MyClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const { authUser } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchMyClasses = async () => {
      try {
        setLoading(true);
        const response = await getStudentClasses(authUser.userId);
        setClasses(response.data);
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoading(false);
      }
    };

    if (authUser?.userId) {
      fetchMyClasses();
    }
  }, [authUser]);

  const getSemesterStyle = (semester) => {
    switch (semester) {
      case '1':
        return 'bg-blue-100 text-blue-800';
      case '2':
        return 'bg-green-100 text-green-800';
      case 'summer':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSemesterText = (semester) => {
    switch (semester) {
      case '1':
        return 'Học kỳ 1';
      case '2':
        return 'Học kỳ 2';
      case 'summer':
        return 'Học kỳ hè';
      default:
        return semester;
    }
  };

  const totalPages = Math.ceil(classes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClasses = classes.slice(startIndex, endIndex);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Danh sách lớp của tôi</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên lớp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Năm học</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Học kỳ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khoa/Bộ môn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giảng viên</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentClasses.map((classItem) => (
                  <tr key={classItem.class_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{classItem.class_name}</td>
                    <td className="px-6 py-4">{classItem.class_description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{classItem.academic_year}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSemesterStyle(classItem.semester)}`}>
                        {getSemesterText(classItem.semester)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{classItem.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{classItem.teacher?.user?.full_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="flex-1 flex justify-between items-center">
                <p className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{startIndex + 1}</span> đến{' '}
                  <span className="font-medium">{Math.min(endIndex, classes.length)}</span> trong{' '}
                  <span className="font-medium">{classes.length}</span> lớp học
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border'
                    }`}
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border'
                    }`}
                  >
                    Sau
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyClasses;
