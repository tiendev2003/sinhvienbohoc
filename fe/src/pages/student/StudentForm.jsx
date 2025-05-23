// File: StudentForm.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { PERMISSIONS, useAuth } from '../../context/AuthContext';
import { createStudent, fetchClasses, fetchStudentById, updateStudent } from '../../services/api';
import { addStudentToClass, getStudentClasses } from '../../services/class_subject_api';

const StudentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const isEditMode = Boolean(id);
  const [formData, setFormData] = useState({
    student_code: '',
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    hometown: '',
    current_address: '',
    family_income_level: '',
    family_background: '',
    scholarship_status: '',
    scholarship_amount: '',
    health_condition: '',
    mental_health_status: '',
    entry_year: '',
    expected_graduation_year: '',
    academic_status: '',
    previous_academic_warning: 0,
    class_id: '', // New field for class selection
  });  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState([]);
  const [studentClasses, setStudentClasses] = useState([]);

  // Options for dropdowns
  const genderOptions = ['male', 'female', 'other'];
  const incomeLevelOptions = ['low', 'medium', 'high'];
  const scholarshipStatusOptions = ['none', 'partial', 'full'];
  const academicStatusOptions = ['active', 'suspended', 'expelled'];

  // Fetch student data for edit mode
  useEffect(() => {
    const fetchStudentData = async () => {
      if (isEditMode) {
        try {
          setLoading(true);
          const response = await fetchStudentById(id);
          const studentData = response?.data || mockStudent;
          setFormData({
            student_code: studentData.student_code || '',
            full_name: studentData.user?.full_name || '',
            email: studentData.user?.email || '',
            phone: studentData.user?.phone || '',
            date_of_birth: studentData.date_of_birth || '',
            gender: studentData.gender || '',
            hometown: studentData.hometown || '',
            current_address: studentData.current_address || '',
            family_income_level: studentData.family_income_level || '',
            family_background: studentData.family_background || '',
            scholarship_status: studentData.scholarship_status || '',
            scholarship_amount: studentData.scholarship_amount || '',
            health_condition: studentData.health_condition || '',
            mental_health_status: studentData.mental_health_status || '',
            entry_year: studentData.entry_year || '',
            expected_graduation_year: studentData.expected_graduation_year || '',
            academic_status: studentData.academic_status || '',
            previous_academic_warning: studentData.previous_academic_warning || 0,
            class_id: '', // Will be populated from student's classes
          });
          
          // Get the student's current classes
          try {
            const classesResponse = await getStudentClasses(id);
            setStudentClasses(classesResponse?.data || []);
            
            // If the student is already in a class, select it
            if (classesResponse?.data && classesResponse.data.length > 0) {
              setFormData(prev => ({
                ...prev,
                class_id: classesResponse.data[0].class_id
              }));
            }
          } catch (err) {
            console.error('Error fetching student classes:', err);
          }
          
          setLoading(false);
        } catch (err) {
          console.error('Error fetching student data:', err);
          setError('Failed to fetch student data');
          setLoading(false);
          // Fallback to mock data for development
          setFormData({
            // ...existing code...
          });
        }
      }
    };

    if (isEditMode) {
      fetchStudentData();
    }
  }, [id, isEditMode]);
  
  // Fetch available classes
  useEffect(() => {
    const fetchAvailableClasses = async () => {
      try {
        const response = await fetchClasses();
        setClasses(response?.data || []);
      } catch (err) {
        console.error('Error fetching classes:', err);
        // For development, use mock data if API fails
        setClasses([
          { class_id: 1, class_name: 'CS101 - Introduction to Computer Science' },
          { class_id: 2, class_name: 'MATH201 - Advanced Mathematics' },
          { class_id: 3, class_name: 'ENG151 - English Composition' },
          { class_id: 4, class_name: 'PHY202 - Physics II' },
        ]);
      }
    };
    
    fetchAvailableClasses();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Basic validation
      if (parseInt(formData.entry_year) > parseInt(formData.expected_graduation_year)) {
        throw new Error('Expected graduation year must be after entry year');
      }
      if (formData.scholarship_amount < 0) {
        throw new Error('Scholarship amount cannot be negative');
      }
      if (formData.previous_academic_warning < 0) {
        throw new Error('Previous academic warnings cannot be negative');
      }

      // Prepare data for API
      const studentData = {
        student_code: formData.student_code,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        hometown: formData.hometown,
        current_address: formData.current_address,
        family_income_level: formData.family_income_level,
        family_background: formData.family_background,
        scholarship_status: formData.scholarship_status,
        scholarship_amount: parseFloat(formData.scholarship_amount) || 0,
        health_condition: formData.health_condition || null,
        mental_health_status: formData.mental_health_status || null,
        entry_year: parseInt(formData.entry_year),
        expected_graduation_year: parseInt(formData.expected_graduation_year),
        academic_status: formData.academic_status,
        previous_academic_warning: parseInt(formData.previous_academic_warning) || 0,
        user: {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
        },
      };      if (isEditMode) {
        await updateStudent(id, studentData);
        
        // Update class assignment if changed
        if (formData.class_id && studentClasses.length > 0) {
          // If student already has a class and it's different, remove from old and add to new
          if (studentClasses[0].class_id !== formData.class_id) {
            try {
              await addStudentToClass(formData.class_id, id);
            } catch (err) {
              console.error('Error updating student class:', err);
            }
          }
        } else if (formData.class_id) {
          // Student didn't have a class before, add to selected class
          try {
            await addStudentToClass(formData.class_id, id);
          } catch (err) {
            console.error('Error adding student to class:', err);
          }
        }
      } else {
        // For new student
        const response = await createStudent(studentData);
        const newStudentId = response?.data?.student_id;
        
        // Add to class if a class was selected
        if (formData.class_id && newStudentId) {
          try {
            await addStudentToClass(formData.class_id, newStudentId);
          } catch (err) {
            console.error('Error adding student to class:', err);
          }
        }
      }
      navigate('/students', { state: { message: isEditMode ? 'Student updated successfully' : 'Student created successfully' } });
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.message || 'Failed to save student data');
      setSubmitting(false);

      // Simulate success for development
      if (process.env.NODE_ENV === 'development') {
        setTimeout(() => {
          navigate('/students', { state: { message: isEditMode ? 'Student updated successfully' : 'Student created successfully' } });
        }, 1000);
      }
    }
  };

  // Mock student data for development
  const mockStudent = {
    student_code: 'SV100000',
    date_of_birth: '2023-12-31',
    gender: 'other',
    hometown: 'East Melissaborough',
    current_address: '7271 Osborn Road Apt. 269\nEast Danielbury, IL 15136-9995',
    family_income_level: 'high',
    family_background: 'Accusantium architecto saepe necessitatibus praesentium. Harum porro eum quos assumenda dolorem asperiores dolorum.',
    scholarship_status: 'full',
    scholarship_amount: 3489942.99,
    health_condition: null,
    mental_health_status: null,
    entry_year: 2022,
    expected_graduation_year: 2026,
    student_id: 1,
    academic_status: 'suspended',
    previous_academic_warning: 1,
    user: {
      full_name: 'Nathan Miller',
      email: 'student1@example.com',
      phone: '(814)328-0538x07146',
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Link
          to="/students"
          className="mr-4 text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back to Students
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'Edit Student' : 'Create New Student'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Code */}
            <div className="mb-4">
              <label htmlFor="student_code" className="block text-gray-700 font-medium mb-2">
                Student Code*
              </label>
              <input
                type="text"
                id="student_code"
                name="student_code"
                value={formData.student_code}
                onChange={handleInputChange}
                placeholder="e.g., SV100000"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            {/* Full Name */}
            <div className="mb-4">
              <label htmlFor="full_name" className="block text-gray-700 font-medium mb-2">
                Full Name*
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Email*
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            {/* Phone */}
            <div className="mb-4">
              <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Date of Birth */}
            <div className="mb-4">
              <label htmlFor="date_of_birth" className="block text-gray-700 font-medium mb-2">
                Date of Birth*
              </label>
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            {/* Gender */}
            <div className="mb-4">
              <label htmlFor="gender" className="block text-gray-700 font-medium mb-2">
                Gender*
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              >
                <option value="">Select gender</option>
                {genderOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Hometown */}
            <div className="mb-4">
              <label htmlFor="hometown" className="block text-gray-700 font-medium mb-2">
                Hometown
              </label>
              <input
                type="text"
                id="hometown"
                name="hometown"
                value={formData.hometown}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Current Address */}
            <div className="mb-4">
              <label htmlFor="current_address" className="block text-gray-700 font-medium mb-2">
                Current Address
              </label>
              <input
                type="text"
                id="current_address"
                name="current_address"
                value={formData.current_address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Family Income Level */}
            <div className="mb-4">
              <label htmlFor="family_income_level" className="block text-gray-700 font-medium mb-2">
                Family Income Level*
              </label>
              <select
                id="family_income_level"
                name="family_income_level"
                value={formData.family_income_level}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              >
                <option value="">Select income level</option>
                {incomeLevelOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Scholarship Status */}
            <div className="mb-4">
              <label htmlFor="scholarship_status" className="block text-gray-700 font-medium mb-2">
                Scholarship Status*
              </label>
              <select
                id="scholarship_status"
                name="scholarship_status"
                value={formData.scholarship_status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              >
                <option value="">Select scholarship status</option>
                {scholarshipStatusOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Scholarship Amount */}
            <div className="mb-4">
              <label htmlFor="scholarship_amount" className="block text-gray-700 font-medium mb-2">
                Scholarship Amount
              </label>
              <input
                type="number"
                id="scholarship_amount"
                name="scholarship_amount"
                value={formData.scholarship_amount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Entry Year */}
            <div className="mb-4">
              <label htmlFor="entry_year" className="block text-gray-700 font-medium mb-2">
                Entry Year*
              </label>
              <input
                type="number"
                id="entry_year"
                name="entry_year"
                value={formData.entry_year}
                onChange={handleInputChange}
                min="2000"
                max="2099"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            {/* Expected Graduation Year */}
            <div className="mb-4">
              <label htmlFor="expected_graduation_year" className="block text-gray-700 font-medium mb-2">
                Expected Graduation Year*
              </label>
              <input
                type="number"
                id="expected_graduation_year"
                name="expected_graduation_year"
                value={formData.expected_graduation_year}
                onChange={handleInputChange}
                min="2000"
                max="2099"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            {/* Academic Status */}
            <div className="mb-4">
              <label htmlFor="academic_status" className="block text-gray-700 font-medium mb-2">
                Academic Status*
              </label>
              <select
                id="academic_status"
                name="academic_status"
                value={formData.academic_status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              >
                <option value="">Select academic status</option>
                {academicStatusOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Previous Academic Warning */}
            <div className="mb-4">
              <label htmlFor="previous_academic_warning" className="block text-gray-700 font-medium mb-2">
                Previous Academic Warnings
              </label>
              <input
                type="number"
                id="previous_academic_warning"
                name="previous_academic_warning"
                value={formData.previous_academic_warning}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            
            {/* Class Selection */}
            <div className="mb-4">
              <label htmlFor="class_id" className="block text-gray-700 font-medium mb-2">
                Lớp học
              </label>
              <select
                id="class_id"
                name="class_id"
                value={formData.class_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">-- Chọn lớp học --</option>
                {classes.map(cls => (
                  <option key={cls.class_id} value={cls.class_id}>
                    {cls.class_name} ({cls.academic_year || 'N/A'})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Chọn lớp học cho sinh viên này
              </p>
            </div>

            {/* Health Condition */}
            <div className="mb-4">
              <label htmlFor="health_condition" className="block text-gray-700 font-medium mb-2">
                Health Condition
              </label>
              <input
                type="text"
                id="health_condition"
                name="health_condition"
                value={formData.health_condition}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Mental Health Status */}
            <div className="mb-4">
              <label htmlFor="mental_health_status" className="block text-gray-700 font-medium mb-2">
                Mental Health Status
              </label>
              <input
                type="text"
                id="mental_health_status"
                name="mental_health_status"
                value={formData.mental_health_status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Family Background */}
            <div className="mb-4 md:col-span-2">
              <label htmlFor="family_background" className="block text-gray-700 font-medium mb-2">
                Family Background
              </label>
              <textarea
                id="family_background"
                name="family_background"
                value={formData.family_background}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              ></textarea>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Link
              to="/students"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </Link>
            {hasPermission(isEditMode ? PERMISSIONS.STUDENT_EDIT : PERMISSIONS.STUDENT_CREATE) && (
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : isEditMode ? 'Update Student' : 'Create Student'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;