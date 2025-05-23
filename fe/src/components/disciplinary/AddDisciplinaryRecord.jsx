// File: AddDisciplinaryRecord.jsx - Component for adding disciplinary records
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { createDisciplinaryRecord, fetchClassById, fetchStudentById } from '../../services/api';

const AddDisciplinaryRecord = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const studentId = queryParams.get('studentId');
  const classId = queryParams.get('classId');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [student, setStudent] = useState(null);
  const [classData, setClassData] = useState(null);  const [formData, setFormData] = useState({
    violation_description: '',
    violation_date: new Date().toISOString().split('T')[0],
    severity_level: 'minor',
    class_id: classId || null,
    punishment: '',
    status: 'pending'
  });
  const [submitting, setSubmitting] = useState(false);useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch student data if studentId is provided
        if (studentId) {
          const studentResponse = await fetchStudentById(studentId);
          if (studentResponse?.data) {
            setStudent(studentResponse.data);
          } else {
            setError('Failed to fetch student details');
          }
        } else {
          setError('Student ID is required');
        }
        
        // Fetch class data if classId is provided
        if (classId) {
          const classResponse = await fetchClassById(classId);
          if (classResponse?.data) {
            setClassData(classResponse.data);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch required data');
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, classId]);  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      
      // Use the createDisciplinaryRecord API function
      await createDisciplinaryRecord({
        student_id: parseInt(studentId),
        class_id: classId ? parseInt(classId) : null,
        ...formData
      });

      // Navigate back to student's class or profile
      if (classId) {
        navigate(`/classes/${classId}`);
      } else {
        navigate(-1);
      }
    } catch (err) {
      console.error('Error submitting disciplinary record:', err);
      setError('Failed to submit disciplinary record');
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <div className="flex justify-center p-8">Loading student details...</div>;
  
  if (error) return <div className="bg-red-100 p-4 text-red-700 rounded-md">{error}</div>;

  if (!student) return <div className="bg-yellow-100 p-4 text-yellow-700 rounded-md">Student not found</div>;

  return (
    <div className="container mx-auto p-4">      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Add Disciplinary Record</h1>
          <p className="text-gray-600">
            Student: {student.user?.full_name} ({student.student_code})
          </p>
          {classData && (
            <p className="text-gray-600">
              Class: {classData.class_name}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Violation Description
              <textarea
                name="violation_description"
                value={formData.violation_description}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows="4"
              />
            </label>
          </div>          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Violation Date
                <input
                  type="date"
                  name="violation_date"
                  value={formData.violation_date}
                  onChange={handleChange}
                  required
                  className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </label>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Severity Level
                <select
                  name="severity_level"
                  value={formData.severity_level}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="minor">Minor</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Punishment
                <input
                  type="text"
                  name="punishment"
                  value={formData.punishment}
                  onChange={handleChange}
                  placeholder="E.g., Warning, Detention, etc."
                  className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </label>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Status
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                  <option value="appealed">Appealed</option>
                </select>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Submit Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDisciplinaryRecord;
