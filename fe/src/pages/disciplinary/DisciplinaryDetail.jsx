// File: DisciplinaryDetail.jsx - Hiển thị chi tiết về một bản ghi kỷ luật
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { PERMISSIONS, useAuth } from '../../context/AuthContext';
import { deleteDisciplinaryRecord, fetchDisciplinaryById } from '../../services/api';

const DisciplinaryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { hasPermission } = useAuth();

  useEffect(() => {
    const getRecordDetails = async () => {
      try {
        setLoading(true);
        const response = await fetchDisciplinaryById(id);
        setRecord(response?.data || mockDisciplinaryRecord);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching disciplinary record:', err);
        setError('Failed to fetch disciplinary record');
        setLoading(false);
        // For development, use mock data if API fails
        setRecord(mockDisciplinaryRecord);
      }
    };

    getRecordDetails();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi này không?')) {
      try {
        await deleteDisciplinaryRecord(id);
        navigate('/disciplinary');
      } catch (err) {
        console.error('Error deleting record:', err);
        setError('Failed to delete record');
      }
    }
  };

  // Mock data for development
  const mockDisciplinaryRecord = {
    record_id: 1,
    student_id: 43,
    violation_description: "Disrupting class",
    violation_date: "2023-12-31",
    severity_level: "moderate",
    consequences: "Write a letter of apology and after-school detention",
    resolution_status: "resolved",
    resolution_notes: "Student completed detention and submitted apology letter",
    resolution_date: "2024-01-05",
    created_by: "Administrator",
    created_at: "2023-12-31",
    student: {
      student_code: "SV100042",
      date_of_birth: "2005-07-15",
      gender: "male",
      hometown: "Kevinmouth",
      current_address: "904 Jenkins Junction, South Dawnberg",
      family_income_level: "medium",
      family_background: "Stable family environment with supportive parents",
      scholarship_status: "none",
      scholarship_amount: null,
      health_condition: null,
      mental_health_status: null,
      entry_year: 2020,
      expected_graduation_year: 2023,
      student_id: 43,
      class_name: "11B",
      user: {
        username: "student43",
        full_name: "Susan Mendoza",
        email: "student43@example.com",
        phone: "024-138-7433x116",
        role: "student",
        profile_picture: null,
        user_id: 64,
        account_status: "active",
        last_login: null,
        created_at: "2023-09-01",
        updated_at: "2023-09-01"
      },
      attendance_rate: 87.05,
      previous_academic_warning: 0,
      academic_status: "good"
    }
  };
  
  if (loading) return <div className="flex justify-center p-8">Loading disciplinary record...</div>;
  
  if (error) return <div className="bg-red-100 p-4 text-red-700 rounded-md">{error}</div>;

  if (!record) return <div className="bg-yellow-100 p-4 text-yellow-700 rounded-md">Record not found</div>;

  const getSeverityText = (level) => {
    switch(level) {
      case 'minor': return 'Nhẹ';
      case 'moderate': return 'Trung bình';
      case 'severe': return 'Nghiêm trọng';
      default: return level;
    }
  };

  const getSeverityColor = (level) => {
    switch(level) {
      case 'minor': return 'bg-yellow-100 text-yellow-800';
      case 'moderate': return 'bg-orange-100 text-orange-800';
      case 'severe': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'open': return 'Đang xử lý';
      case 'resolved': return 'Đã giải quyết';
      case 'pending': return 'Đang chờ xử lý';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link 
            to="/disciplinary" 
            className="mr-4 text-blue-500 hover:text-blue-700"
          >
            ← Quay lại
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Chi Tiết Vi Phạm Kỷ Luật</h1>
        </div>
        
        {hasPermission(PERMISSIONS.DISCIPLINARY_EDIT) && (
          <div className="flex gap-2">
            <Link 
              to={`/disciplinary/edit/${record.record_id}`}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              Chỉnh Sửa
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Xóa
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Thông Tin Vi Phạm</h2>
            <div className="space-y-3">
              <p className="flex items-center">
                <span className="font-medium w-40">Mã Vi Phạm:</span> 
                <span>{record.record_id}</span>
              </p>
              <p className="flex items-center">
                <span className="font-medium w-40">Ngày Vi Phạm:</span> 
                <span>{record.violation_date}</span>
              </p>
              <p className="flex items-center">
                <span className="font-medium w-40">Mức Độ:</span> 
                <span className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(record.severity_level)}`}>
                  {getSeverityText(record.severity_level)}
                </span>
              </p>
              <p className="flex items-center">
                <span className="font-medium w-40">Trạng Thái:</span> 
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(record.resolution_status)}`}>
                  {getStatusText(record.resolution_status)}
                </span>
              </p>
              <p className="flex items-start">
                <span className="font-medium w-40">Mô Tả Vi Phạm:</span> 
                <span className="flex-1">{record.violation_description}</span>
              </p>
              <p className="flex items-start">
                <span className="font-medium w-40">Hậu Quả:</span> 
                <span className="flex-1">{record.consequences || "Không có"}</span>
              </p>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Thông Tin Học Sinh</h2>
            <div className="space-y-3">
              <p className="flex items-center">
                <span className="font-medium w-40">Tên Học Sinh:</span> 
                <Link to={`/students/${record.student_id}`} className="text-blue-600 hover:underline">
                  {record.student?.user?.full_name || "Không có thông tin"}
                </Link>
              </p>
              <p className="flex items-center">
                <span className="font-medium w-40">Mã Học Sinh:</span> 
                <span>{record.student?.student_code || "Không có thông tin"}</span>
              </p>
              <p className="flex items-center">
                <span className="font-medium w-40">Lớp:</span> 
                <span>{record.student?.class_name || "Không có thông tin"}</span>
              </p>
              <p className="flex items-center">
                <span className="font-medium w-40">Email:</span> 
                <span>{record.student?.user?.email || "Không có thông tin"}</span>
              </p>
              <p className="flex items-center">
                <span className="font-medium w-40">Số điện thoại:</span> 
                <span>{record.student?.user?.phone || "Không có thông tin"}</span>
              </p>
              <p className="flex items-center">
                <span className="font-medium w-40">Tỷ lệ tham dự:</span> 
                <span>{record.student?.attendance_rate ? `${record.student.attendance_rate}%` : "Không có thông tin"}</span>
              </p>
            </div>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">Thông Tin Xử Lý</h2>
            <div className="space-y-3">
              <p className="flex items-center">
                <span className="font-medium w-40">Người Lập:</span> 
                <span>{record.created_by || "Không có thông tin"}</span>
              </p>
              <p className="flex items-center">
                <span className="font-medium w-40">Ngày Lập:</span> 
                <span>{record.created_at || "Không có thông tin"}</span>
              </p>
              {record.resolution_status === 'resolved' && (
                <>
                  <p className="flex items-center">
                    <span className="font-medium w-40">Ngày Giải Quyết:</span> 
                    <span>{record.resolution_date || "Không có thông tin"}</span>
                  </p>
                  <p className="flex items-start">
                    <span className="font-medium w-40">Ghi Chú Giải Quyết:</span> 
                    <span className="flex-1">{record.resolution_notes || "Không có ghi chú"}</span>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisciplinaryDetail;
