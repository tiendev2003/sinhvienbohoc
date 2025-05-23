// File: ClassForm.jsx - Form for creating/editing a class
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { createClass, fetchClassById, fetchSubjects, fetchTeachers, updateClass } from '../../services/api';
import { fetchSubjectsByClass } from '../../services/class_subject_api';

const WEEKDAYS = [
  { id: 'mon', label: 'Thứ 2' },
  { id: 'tue', label: 'Thứ 3' },
  { id: 'wed', label: 'Thứ 4' },
  { id: 'thu', label: 'Thứ 5' },
  { id: 'fri', label: 'Thứ 6' },
  { id: 'sat', label: 'Thứ 7' },
  { id: 'sun', label: 'Chủ nhật' }
];

const TIME_SLOTS = [
  { id: '1', time: '07:00-09:00' },
  { id: '2', time: '09:00-11:00' },
  { id: '3', time: '13:00-15:00' },
  { id: '4', time: '15:00-17:00' }
];

const ClassForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [formData, setFormData] = useState({
    class_name: '',
    class_description: '',
    academic_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    semester: '1',
    department: '',
    start_date: '',
    end_date: '',
    schedule: '',
    teacher_id: '',
    max_students: ''
  });

  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState({});

  useEffect(() => {
    const fetchTeachersList = async () => {
      try {
        const response = await fetchTeachers();
        setTeachers(response?.data || []);
      } catch (err) {
        console.error('Error fetching teachers:', err);
        setError('Failed to fetch teachers list');
        setTeachers([
          { teacher_id: 1, user: { full_name: 'Teacher A' }, department: 'Math' },
          { teacher_id: 2, user: { full_name: 'Teacher B' }, department: 'Science' },
        ]);
      }
    };

    const fetchSubjectsList = async () => {
      try {
        const response = await fetchSubjects();
        setSubjects(response?.data || []);
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setSubjects([
          { subject_id: 1, subject_name: 'Introduction to Computer Science', subject_code: 'CS101' },
          { subject_id: 2, subject_name: 'Advanced Mathematics', subject_code: 'MATH201' },
          { subject_id: 3, subject_name: 'English Composition', subject_code: 'ENG151' },
          { subject_id: 4, subject_name: 'Physics II', subject_code: 'PHY202' },
        ]);
      }
    };

    const fetchClassData = async () => {
      if (isEditMode) {
        try {
          setLoading(true);
          const response = await fetchClassById(id);
          const classData = response?.data || {};
          setFormData({
            class_name: classData.class_name || '',
            class_description: classData.class_description || '',
            academic_year: classData.academic_year || '',
            semester: classData.semester || '1',
            department: classData.department || '',
            start_date: classData.start_date ? new Date(classData.start_date).toISOString().split('T')[0] : '',
            end_date: classData.end_date ? new Date(classData.end_date).toISOString().split('T')[0] : '',
            schedule: typeof classData.schedule === 'object' ? JSON.stringify(classData.schedule) : (classData.schedule || ''),
            teacher_id: classData.teacher_id || '',
            max_students: classData.max_students || ''
          });
          const classSubjectsResponse = await fetchSubjectsByClass(id);
          setSelectedSubjects(classSubjectsResponse?.data || []);
        } catch (err) {
          console.error('Error fetching class data:', err);
          setError('Failed to fetch class data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTeachersList();
    fetchSubjectsList();
    if (isEditMode) fetchClassData();
  }, [id, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubjectSelection = (subjectId) => {
    const isAlreadySelected = selectedSubjects.some(s => s.subject_id === parseInt(subjectId));
    if (isAlreadySelected) {
      setSelectedSubjects(selectedSubjects.filter(s => s.subject_id !== parseInt(subjectId)));
    } else {
      const subjectToAdd = subjects.find(s => s.subject_id === parseInt(subjectId));
      if (subjectToAdd) setSelectedSubjects([...selectedSubjects, subjectToAdd]);
    }
  };

  const handleScheduleChange = (day, timeSlot) => {
    setSelectedSchedule(prev => {
      const newSchedule = { ...prev };
      if (!newSchedule[day]) newSchedule[day] = [];
      const timeSlotIndex = newSchedule[day].indexOf(timeSlot);
      if (timeSlotIndex === -1) {
        newSchedule[day].push(timeSlot);
      } else {
        newSchedule[day].splice(timeSlotIndex, 1);
      }
      if (newSchedule[day].length === 0) delete newSchedule[day];
      setFormData(prev => ({ ...prev, schedule: JSON.stringify(newSchedule) }));
      return newSchedule;
    });
  };

  const handleClearSchedule = () => {
    setSelectedSchedule({});
    setFormData(prev => ({ ...prev, schedule: '{}' }));
  };

  const handleClearDaySchedule = (dayId) => {
    setSelectedSchedule(prev => {
      const newSchedule = { ...prev };
      delete newSchedule[dayId];
      setFormData(prev => ({ ...prev, schedule: JSON.stringify(newSchedule) }));
      return newSchedule;
    });
  };

  useEffect(() => {
    if (formData.schedule && typeof formData.schedule === 'string') {
      try {
        const scheduleObj = JSON.parse(formData.schedule);
        setSelectedSchedule(scheduleObj);
      } catch (e) {
        console.error('Error parsing schedule:', e);
      }
    }
  }, [formData.schedule]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (!formData.class_name || !formData.academic_year || !formData.semester) {
        setError('Vui lòng điền đầy đủ các trường bắt buộc');
        setSubmitting(false);
        return;
      }

      const formattedData = {
        ...formData,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        max_students: formData.max_students ? parseInt(formData.max_students) : null,
        teacher_id: formData.teacher_id ? parseInt(formData.teacher_id) : null,
        schedule: formData.schedule ? 
          (typeof formData.schedule === 'string' ? formData.schedule : JSON.stringify(formData.schedule)) : 
          null,
        subjects: selectedSubjects.map(s => s.subject_id)  // Thêm danh sách subject_id
      };

      if (isEditMode) {
        await updateClass(id, formattedData);
      } else {
        await createClass(formattedData);
      }
      navigate('/classes');
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Không thể lưu thông tin lớp học');
      setSubmitting(false);
      if (process.env.NODE_ENV === 'development') {
        setTimeout(() => navigate('/classes'), 1000);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  const renderScheduleGrid = () => (
    <div className="mt-6">
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={handleClearSchedule}
          className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Xóa toàn bộ lịch
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4 text-left text-sm font-semibold text-gray-600 w-28">Ngày</th>
              {TIME_SLOTS.map(slot => (
                <th key={slot.id} className="p-4 text-center text-sm font-semibold text-gray-600">
                  {slot.time}
                </th>
              ))}
              <th className="p-4 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {WEEKDAYS.map(day => (
              <tr key={day.id} className="border-t hover:bg-gray-50 transition-colors">
                <td className="p-4 text-gray-700 font-medium">{day.label}</td>
                {TIME_SLOTS.map(slot => {
                  const isSelected = selectedSchedule[day.id]?.includes(slot.time);
                  return (
                    <td
                      key={`${day.id}-${slot.id}`}
                      onClick={() => handleScheduleChange(day.id, slot.time)}
                      className={`p-4 text-center cursor-pointer transition-colors duration-200 relative group
                        ${isSelected ? 'bg-blue-100 hover:bg-blue-200' : 'hover:bg-gray-100'}`}
                    >
                      {isSelected && (
                        <div className="flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg
                              className="w-4 h-4 text-red-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                    </td>
                  );
                })}
                <td className="p-4">
                  {Object.keys(selectedSchedule).includes(day.id) && (
                    <button
                      type="button"
                      onClick={() => handleClearDaySchedule(day.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Xóa lịch ngày này"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-gray-500">
        Nhấp vào ô để chọn/bỏ chọn giờ học. Di chuột qua ô đã chọn để bỏ chọn. Nhấp vào nút X bên phải để xóa lịch ngày đó.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="flex items-center mb-8">
          <Link
            to="/classes"
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </Link>
          <h1 className="ml-6 text-3xl font-bold text-gray-800">
            {isEditMode ? 'Chỉnh sửa lớp học' : 'Tạo lớp học mới'}
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Thông tin cơ bản</h2>
                <div>
                  <label htmlFor="class_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Tên lớp học <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="class_name"
                    name="class_name"
                    value={formData.class_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="VD: Lớp 10A1"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="class_description" className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    id="class_description"
                    name="class_description"
                    value={formData.class_description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Mô tả ngắn gọn về lớp học"
                  />
                </div>
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                    Khoa/Bộ môn
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="VD: Khoa Công nghệ thông tin"
                  />
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Thông tin học tập</h2>
                <div>
                  <label htmlFor="academic_year" className="block text-sm font-medium text-gray-700 mb-2">
                    Năm học <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="academic_year"
                    name="academic_year"
                    value={formData.academic_year}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="VD: 2024-2025"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-2">
                    Học kỳ <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  >
                    <option value="1">Học kỳ 1</option>
                    <option value="2">Học kỳ 2</option>
                    <option value="summer">Học kỳ hè</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="teacher_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Giáo viên phụ trách
                  </label>
                  <select
                    id="teacher_id"
                    name="teacher_id"
                    value={formData.teacher_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Chọn giáo viên</option>
                    {teachers.map(teacher => (
                      <option key={teacher.teacher_id} value={teacher.teacher_id}>
                        {teacher.user.full_name} - {teacher.department}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Lịch học</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              {renderScheduleGrid()}
            </div>

            {/* Subject Selection */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Môn học</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map(subject => (
                  <div
                    key={subject.subject_id}
                    onClick={() => handleSubjectSelection(subject.subject_id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200
                      ${selectedSubjects.some(s => s.subject_id === subject.subject_id)
                        ? 'bg-blue-50 border-blue-500 shadow-md'
                        : 'border-gray-200 hover:bg-gray-50 hover:shadow-sm'}`}
                  >
                    <div className="font-semibold text-gray-800">{subject.subject_name}</div>
                    <div className="text-sm text-gray-500">{subject.subject_code}</div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">Nhấp vào môn học để thêm/xóa khỏi lớp học.</p>
            </div>

            {/* Class Capacity */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Sĩ số lớp học</h2>
              <div>
                <label htmlFor="max_students" className="block text-sm font-medium text-gray-700 mb-2">
                  Số học sinh tối đa
                </label>
                <input
                  type="number"
                  id="max_students"
                  name="max_students"
                  value={formData.max_students}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Nhập số học sinh tối đa"
                />
                <p className="mt-2 text-sm text-gray-500">Để trống nếu không giới hạn sĩ số.</p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Link
                to="/classes"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Hủy
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center
                  ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Đang lưu...
                  </>
                ) : (
                  isEditMode ? 'Cập nhật' : 'Tạo lớp học'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClassForm;