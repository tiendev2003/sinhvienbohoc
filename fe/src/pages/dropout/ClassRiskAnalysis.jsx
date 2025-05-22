import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import HighRiskStudentsTable from '../../components/dropout/HighRiskStudentsTable';
import RiskDistributionChart from '../../components/dropout/RiskDistributionChart';
import { dropoutRiskService } from '../../services/dropoutRiskService';

const ClassRiskAnalysis = () => {
  const { id } = useParams();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchClassRiskData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await dropoutRiskService.getClassRiskAnalytics(id);
        setClassData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch class risk data:', err);
        setError('Không thể tải dữ liệu phân tích rủi ro của lớp. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchClassRiskData();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center">Đang tải dữ liệu phân tích rủi ro lớp...</div>;
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
          <h1 className="text-2xl font-bold">{classData.className}: Phân tích Nguy cơ Bỏ học</h1>
          <p className="text-gray-600">Mã lớp: {classData.classCode} | Giáo viên: {classData.teacherName}</p>
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
          <p className="text-2xl font-bold">{classData.summary.totalStudents}</p>
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-sm text-gray-500">Rủi ro cao</p>
          <p className="text-2xl font-bold text-red-600">{classData.summary.highRisk}</p>
          <p className="text-xs text-gray-500">
            {Math.round((classData.summary.highRisk / classData.summary.totalStudents) * 100)}% tổng số
          </p>
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-sm text-gray-500">Rủi ro trung bình</p>
          <p className="text-2xl font-bold text-yellow-600">{classData.summary.mediumRisk}</p>
          <p className="text-xs text-gray-500">
            {Math.round((classData.summary.mediumRisk / classData.summary.totalStudents) * 100)}% tổng số
          </p>
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-sm text-gray-500">Rủi ro TB cả lớp</p>
          <p className="text-2xl font-bold">{classData.summary.avgRiskPercentage.toFixed(1)}%</p>
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
          <h2 className="text-lg font-semibold mb-4">Sinh viên Có Nguy cơ Cao</h2>
          <HighRiskStudentsTable students={classData.highRiskStudents} />
        </div>
      </div>

      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Khuyến nghị</h2>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Theo dõi điểm danh chặt chẽ</h3>
            <p className="text-sm text-blue-700">
              Điểm danh là một trong những chỉ báo sớm nhất về nguy cơ bỏ học. Cần theo dõi chặt chẽ và 
              liên hệ ngay với sinh viên có tỷ lệ vắng mặt cao.
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">Hỗ trợ học tập</h3>
            <p className="text-sm text-green-700">
              Tổ chức các buổi học bổ sung hoặc kèm cặp cho các sinh viên có điểm thấp, đặc biệt 
              là các sinh viên đã được xác định có nguy cơ bỏ học cao.
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-medium text-purple-800 mb-2">Tư vấn tài chính</h3>
            <p className="text-sm text-purple-700">
              Một số sinh viên có nguy cơ bỏ học do khó khăn tài chính. Cần tư vấn về các chương trình 
              học bổng, hỗ trợ tài chính có thể giúp họ tiếp tục việc học.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassRiskAnalysis;
