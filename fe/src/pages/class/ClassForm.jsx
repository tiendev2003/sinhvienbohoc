// File: ClassForm.jsx - Form for creating/editing a class
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { createClass, fetchClassById, fetchTeachers, updateClass } from '../../services/api';

const ClassForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    gradeLevel: '',
    academicYear: '',
    roomNumber: '',
    teacherId: '',
    description: '',
    schedule: ''
  });
  
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeachersList = async () => {
      try {
        // In production, replace with actual API call
        const response = await fetchTeachers();
        setTeachers(response?.data || mockTeachers);
      } catch (err) {
        console.error('Error fetching teachers:', err);
        setError('Failed to fetch teachers list');
        // For development, use mock data if API fails
        setTeachers(mockTeachers);
      }
    };

    const fetchClassData = async () => {
      if (isEditMode) {
        try {
          setLoading(true);
          // In production, replace with actual API call
          const response = await fetchClassById(id);
          const classData = response?.data || mockClass;
          setFormData({
            name: classData.name || '',
            gradeLevel: classData.gradeLevel || '',
            academicYear: classData.academicYear || '',
            roomNumber: classData.roomNumber || '',
            teacherId: classData.teacherId || '',
            description: classData.description || '',
            schedule: classData.schedule || ''
          });
          setLoading(false);
        } catch (err) {
          console.error('Error fetching class data:', err);
          setError('Failed to fetch class data');
          setLoading(false);
          // For development, use mock data if API fails
          setFormData({
            name: mockClass.name || '',
            gradeLevel: mockClass.gradeLevel || '',
            academicYear: mockClass.academicYear || '',
            roomNumber: mockClass.roomNumber || '',
            teacherId: mockClass.teacherId || '',
            description: mockClass.description || '',
            schedule: mockClass.schedule || ''
          });
        }
      }
    };

    fetchTeachersList();
    if (isEditMode) {
      fetchClassData();
    }
  }, [id, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (isEditMode) {
        // In production, replace with actual API call
        await updateClass(id, formData);
      } else {
        // In production, replace with actual API call
        await createClass(formData);
      }
      
      // Navigate back to classes list after successful submission
      navigate('/classes');
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to save class data');
      setSubmitting(false);
      
      // For development, simulate success
      if (process.env.NODE_ENV === 'development') {
        setTimeout(() => {
          navigate('/classes');
        }, 1000);
      }
    }
  };

  // Mock data for development
  const mockTeachers = [
    { id: 1, name: 'John Smith' },
    { id: 2, name: 'Mary Johnson' },
    { id: 3, name: 'Robert Davis' },
    { id: 4, name: 'Linda Wilson' },
    { id: 5, name: 'Michael Brown' }
  ];

  const mockClass = {
    id: 1,
    name: '10A1',
    gradeLevel: 10,
    academicYear: '2024-2025',
    roomNumber: '101',
    teacherId: 1,
    description: 'Advanced class for science-focused students',
    schedule: 'Monday to Friday, 8:00 AM - 3:00 PM'
  };

  if (loading) return <div className="flex justify-center p-8">Loading class data...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Link 
          to="/classes" 
          className="mr-4 text-blue-500 hover:text-blue-700"
        >
          ← Back to Classes
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Edit Class' : 'Create New Class'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                Class Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="gradeLevel" className="block text-gray-700 font-medium mb-2">
                Grade Level*
              </label>
              <input
                type="number"
                id="gradeLevel"
                name="gradeLevel"
                value={formData.gradeLevel}
                onChange={handleInputChange}
                min="1"
                max="12"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="academicYear" className="block text-gray-700 font-medium mb-2">
                Academic Year*
              </label>
              <input
                type="text"
                id="academicYear"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleInputChange}
                placeholder="e.g., 2024-2025"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="roomNumber" className="block text-gray-700 font-medium mb-2">
                Room Number
              </label>
              <input
                type="text"
                id="roomNumber"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="teacherId" className="block text-gray-700 font-medium mb-2">
                Class Teacher*
              </label>
              <select
                id="teacherId"
                name="teacherId"
                value={formData.teacherId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a teacher</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="schedule" className="block text-gray-700 font-medium mb-2">
                Schedule
              </label>
              <input
                type="text"
                id="schedule"
                name="schedule"
                value={formData.schedule}
                onChange={handleInputChange}
                placeholder="e.g., Monday to Friday, 8:00 AM - 3:00 PM"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4 md:col-span-2">
              <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Link
              to="/classes"
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 mr-2"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : (isEditMode ? 'Update Class' : 'Create Class')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassForm;
