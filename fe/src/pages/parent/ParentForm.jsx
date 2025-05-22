import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { fetchStudents } from '../../services/api';

const ParentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    // User information
    username: '',
    full_name: '',
    email: '',
    phone: '',
    
    // Parent specific information
    relation_to_student: 'father', // Default value
    occupation: '',
    education_level: '',
    income: '',
    phone_secondary: '',
    address: '',
    student_id: '',
  });
  
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch available students
        const studentsResponse = await fetchStudents();
        setStudents(studentsResponse.data || []);
        
        // If in edit mode, fetch parent data
        if (isEditMode) {
          // In a real application, you would call the API:
          const parentResponse = await fetch(`/api/parents/${id}`);
          const parentData = await parentResponse.json();
          
          // Map API response to form data structure
          setFormData({
            username: parentData.user?.username || '',
            full_name: parentData.user?.full_name || '',
            email: parentData.user?.email || '',
            phone: parentData.user?.phone || '',
            relation_to_student: parentData.relation_to_student || 'father',
            occupation: parentData.occupation || '',
            education_level: parentData.education_level || '',
            income: parentData.income || '',
            phone_secondary: parentData.phone_secondary || '',
            address: parentData.address || '',
            student_id: parentData.student_id || '',
          });
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.relation_to_student) {
      newErrors.relation_to_student = 'Relation to student is required';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.student_id) {
      newErrors.student_id = 'Student is required';
    }
    
    if (!isEditMode && !formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field when user changes it
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Prepare data for API
      const apiData = {
        // User information
        user: {
          username: formData.username,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          role: 'parent',
        },
        // Parent specific information
        relation_to_student: formData.relation_to_student,
        occupation: formData.occupation,
        education_level: formData.education_level,
        income: formData.income ? parseFloat(formData.income) : null,
        phone_secondary: formData.phone_secondary || null,
        address: formData.address,
        student_id: parseInt(formData.student_id),
      };
      
      if (isEditMode) {
        // In a real application, you would call the API:
        await fetch(`/api/parents/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiData),
        });
      } else {
        // In a real application, you would call the API:
        await fetch('/api/parents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiData),
        });
      }
      
      // Navigate back to parents list
      navigate('/parents', { 
        state: { 
          message: isEditMode 
            ? 'Parent updated successfully' 
            : 'Parent created successfully' 
        } 
      });
    } catch (error) {
      console.error('Error saving parent:', error);
      setError(error.response?.data?.detail || 'Failed to save parent');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? 'Edit Parent' : 'Add New Parent'}
      </h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label htmlFor="student_id" className="form-label">Student*</label>
          <select
            id="student_id"
            name="student_id"
            className={`input-field ${errors.student_id ? 'border-red-500' : ''}`}
            value={formData.student_id}
            onChange={handleChange}
            disabled={isEditMode}
          >
            <option value="">Select a student</option>
            {students.map((student) => (
              <option key={student.student_id} value={student.student_id}>
                {student.user?.full_name} ({student.student_code})
              </option>
            ))}
          </select>
          {errors.student_id && (
            <p className="text-red-500 text-xs mt-1">{errors.student_id}</p>
          )}
        </div>
        
        <h2 className="text-lg font-semibold mt-6 mb-3">User Account Information</h2>

        {!isEditMode && (
          <div className="mb-4">
            <label htmlFor="username" className="form-label">Username*</label>
            <input
              id="username"
              name="username"
              type="text"
              className={`input-field ${errors.username ? 'border-red-500' : ''}`}
              value={formData.username}
              onChange={handleChange}
              disabled={isEditMode}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="full_name" className="form-label">Full Name*</label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              className={`input-field ${errors.full_name ? 'border-red-500' : ''}`}
              value={formData.full_name}
              onChange={handleChange}
            />
            {errors.full_name && (
              <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="relation_to_student" className="form-label">Relation to Student*</label>
            <select
              id="relation_to_student"
              name="relation_to_student"
              className={`input-field ${errors.relation_to_student ? 'border-red-500' : ''}`}
              value={formData.relation_to_student}
              onChange={handleChange}
            >
              <option value="father">Father</option>
              <option value="mother">Mother</option>
              <option value="guardian">Guardian</option>
              <option value="other">Other</option>
            </select>
            {errors.relation_to_student && (
              <p className="text-red-500 text-xs mt-1">{errors.relation_to_student}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="email" className="form-label">Email*</label>
            <input
              id="email"
              name="email"
              type="email"
              className={`input-field ${errors.email ? 'border-red-500' : ''}`}
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="phone" className="form-label">Phone*</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
              value={formData.phone}
              onChange={handleChange}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>
        </div>
        
        <h2 className="text-lg font-semibold mt-6 mb-3">Parent Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="phone_secondary" className="form-label">Secondary Phone</label>
            <input
              id="phone_secondary"
              name="phone_secondary"
              type="tel"
              className="input-field"
              value={formData.phone_secondary}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label htmlFor="occupation" className="form-label">Occupation</label>
            <input
              id="occupation"
              name="occupation"
              type="text"
              className="input-field"
              value={formData.occupation}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="education_level" className="form-label">Education Level</label>
            <select
              id="education_level"
              name="education_level"
              className="input-field"
              value={formData.education_level}
              onChange={handleChange}
            >
              <option value="">Select education level</option>
              <option value="primary">Primary School</option>
              <option value="secondary">Secondary School</option>
              <option value="high_school">High School</option>
              <option value="college">College</option>
              <option value="university">University</option>
              <option value="post_graduate">Post Graduate</option>
              <option value="none">None</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="income" className="form-label">Monthly Income (VND)</label>
            <input
              id="income"
              name="income"
              type="number"
              min="0"
              className="input-field"
              value={formData.income}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="address" className="form-label">Address*</label>
          <input
            id="address"
            name="address"
            type="text"
            className={`input-field ${errors.address ? 'border-red-500' : ''}`}
            value={formData.address}
            onChange={handleChange}
          />
          {errors.address && (
            <p className="text-red-500 text-xs mt-1">{errors.address}</p>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <button
            type="button"
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => navigate('/parents')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : (isEditMode ? 'Update Parent' : 'Create Parent')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ParentForm;
