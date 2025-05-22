// File: UserForm.jsx - Form for creating and editing system users
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { PERMISSIONS, useAuth } from '../../context/AuthContext';
import { createUser, fetchUserById, updateUser } from '../../services/api';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const { hasPermission } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'teacher',
    account_status: 'active',
    profile_picture: '',
    permissions: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      const getUserData = async () => {
        try {
          setLoading(true);
          // In production, replace with actual API call
          const response = await fetchUserById(id);
          const userData = response?.data || mockUser;
          
          // Map API response to form data
          setFormData({
            username: userData.username || '',
            full_name: userData.full_name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            role: userData.role?.toLowerCase() || 'teacher',
            account_status: userData.account_status?.toLowerCase() || 'active',
            profile_picture: userData.profile_picture || '',
            permissions: userData.permissions || [],
            password: '',
            confirmPassword: ''
          });

          // Set preview image if available
          if (userData.profile_picture) {
            setPreviewImage(userData.profile_picture);
          }
          
          setLoading(false);
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('Failed to fetch user data');
          setLoading(false);
          
          // For development, use mock data
          const userData = mockUser;
          setFormData({
            username: userData.username || '',
            full_name: userData.full_name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            role: userData.role?.toLowerCase() || 'teacher',
            account_status: userData.account_status?.toLowerCase() || 'active',
            profile_picture: userData.profile_picture || '',
            permissions: userData.permissions || [],
            password: '',
            confirmPassword: ''
          });

          // Set preview image if available
          if (userData.profile_picture) {
            setPreviewImage(userData.profile_picture);
          }
        }
      };

      getUserData();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // For now, just create a preview URL
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setFormData(prev => ({
        ...prev,
        profile_picture: file // In a real app, you'd handle file upload to server
      }));
    }
  };

  const handlePermissionChange = (e) => {
    const { value, checked } = e.target;
    
    if (checked) {
      setFormData(prev => ({
        ...prev,
        permissions: [...prev.permissions, value]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(perm => perm !== value)
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    }
    
    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      errors.phone = 'Phone number should be 10-11 digits';
    }
    
    if (!isEditMode) {
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (formData.password && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      setLoading(true);
      
      // Create submission data (exclude confirmPassword)
      const submitData = { ...formData };
      delete submitData.confirmPassword;
      
      // If editing and password is empty, remove it
      if (isEditMode && !submitData.password) {
        delete submitData.password;
      }
      
      // Handle profile picture (in a real app, you'd upload the file)
      if (submitData.profile_picture instanceof File) {
        // Here you would typically upload the file and get a URL back
        // For now, we'll just pretend it's uploaded
        submitData.profile_picture = previewImage;
      }
      
      if (isEditMode) {
        await updateUser(id, submitData);
      } else {
        await createUser(submitData);
      }
      
      setLoading(false);
      navigate('/users');
    } catch (err) {
      console.error('Error saving user:', err);
      setError('Failed to save user');
      setLoading(false);
    }
  };

  // Permission groups for UI organization
  const permissionGroups = [
    {
      name: 'User Management',
      permissions: [
        { value: 'USER_VIEW', label: 'View Users' },
        { value: 'USER_CREATE', label: 'Create Users' },
        { value: 'USER_EDIT', label: 'Edit Users' },
        { value: 'USER_DELETE', label: 'Delete Users' }
      ]
    },
    {
      name: 'Student Management',
      permissions: [
        { value: 'STUDENT_VIEW', label: 'View Students' },
        { value: 'STUDENT_CREATE', label: 'Create Students' },
        { value: 'STUDENT_EDIT', label: 'Edit Students' },
        { value: 'STUDENT_DELETE', label: 'Delete Students' }
      ]
    },
    {
      name: 'Class Management',
      permissions: [
        { value: 'CLASS_VIEW', label: 'View Classes' },
        { value: 'CLASS_CREATE', label: 'Create Classes' },
        { value: 'CLASS_EDIT', label: 'Edit Classes' },
        { value: 'CLASS_DELETE', label: 'Delete Classes' }
      ]
    },
    {
      name: 'Attendance Management',
      permissions: [
        { value: 'ATTENDANCE_VIEW', label: 'View Attendance' },
        { value: 'ATTENDANCE_CREATE', label: 'Record Attendance' },
        { value: 'ATTENDANCE_EDIT', label: 'Edit Attendance' }
      ]
    },
    {
      name: 'Disciplinary Management',
      permissions: [
        { value: 'DISCIPLINARY_VIEW', label: 'View Records' },
        { value: 'DISCIPLINARY_CREATE', label: 'Create Records' },
        { value: 'DISCIPLINARY_EDIT', label: 'Edit Records' },
        { value: 'DISCIPLINARY_DELETE', label: 'Delete Records' }
      ]
    },
    {
      name: 'Dropout Risk Management',
      permissions: [
        { value: 'DROPOUT_RISK_VIEW', label: 'View Risk Analysis' },
        { value: 'DROPOUT_INTERVENTION_MANAGE', label: 'Manage Interventions' }
      ]
    },
    {
      name: 'Reports',
      permissions: [
        { value: 'REPORTS_VIEW', label: 'View Reports' },
        { value: 'REPORTS_EXPORT', label: 'Export Reports' }
      ]
    }
  ];

  // Mock data for development (updated to match the API response structure)
  const mockUser = {
    username: "admin",
    full_name: "Admin User",
    email: "admin@example.com",
    phone: "0901234567",
    role: "admin",
    profile_picture: "/profiles/admin.jpg",
    user_id: 1,
    account_status: "active",
    last_login: "2025-05-22T11:33:02",
    created_at: "2025-05-21T22:28:56",
    updated_at: "2025-05-22T18:33:01",
    permissions: ['USER_VIEW', 'USER_CREATE', 'USER_EDIT', 'USER_DELETE', 'REPORTS_VIEW']
  };

  if (loading && isEditMode) {
    return <div className="flex justify-center p-8">Loading user data...</div>;
  }
  
  if (error) {
    return <div className="bg-red-100 p-4 text-red-700 rounded-md">{error}</div>;
  }

  // Check permissions based on mode
  const requiredPermission = isEditMode ? PERMISSIONS.USER_EDIT : PERMISSIONS.USER_CREATE;
  
  if (!hasPermission(requiredPermission)) {
    return (
      <div className="bg-yellow-100 p-4 rounded-md">
        <p className="text-yellow-700">You don't have permission to {isEditMode ? 'edit' : 'create'} users.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <div className="flex items-center">
          <Link 
            to="/users" 
            className="mr-4 text-blue-500 hover:text-blue-700"
          >
            ← Back to Users
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditMode ? 'Edit User' : 'Create New User'}
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
              
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${
                    formErrors.username ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-blue-500 focus:border-blue-500`}
                />
                {formErrors.username && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.username}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${
                    formErrors.full_name ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-blue-500 focus:border-blue-500`}
                />
                {formErrors.full_name && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.full_name}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${
                    formErrors.email ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-blue-500 focus:border-blue-500`}
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${
                    formErrors.phone ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="e.g., 0901234567"
                />
                {formErrors.phone && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="profile_picture" className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Picture
                </label>
                <div className="flex items-center space-x-4">
                  {previewImage && (
                    <div className="flex-shrink-0">
                      <img 
                        src={previewImage} 
                        alt="Profile preview" 
                        className="h-20 w-20 object-cover rounded-full border border-gray-300" 
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    id="profile_picture"
                    name="profile_picture"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password {!isEditMode && <span className="text-red-500">*</span>}
                  {isEditMode && <span className="text-gray-500 text-xs">(Leave blank to keep current password)</span>}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${
                    formErrors.password ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-blue-500 focus:border-blue-500`}
                />
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password {!isEditMode && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${
                    formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-blue-500 focus:border-blue-500`}
                />
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.confirmPassword}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="teacher">Teacher</option>
                    <option value="staff">Staff</option>
                    <option value="counselor">Counselor</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="account_status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="account_status"
                    name="account_status"
                    value={formData.account_status}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Permissions */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Permissions</h2>
              <div className="overflow-y-auto max-h-96 border border-gray-200 rounded-md p-4">
                {permissionGroups.map(group => (
                  <div key={group.name} className="mb-4">
                    <h3 className="font-medium text-gray-700 mb-2">{group.name}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {group.permissions.map(perm => (
                        <div key={perm.value} className="flex items-center">
                          <input
                            type="checkbox"
                            id={perm.value}
                            name="permissions"
                            value={perm.value}
                            checked={formData.permissions.includes(perm.value)}
                            onChange={handlePermissionChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={perm.value} className="ml-2 text-sm text-gray-700">
                            {perm.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {/* Quick role templates */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Permission Templates
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      permissions: permissionGroups.flatMap(g => g.permissions.map(p => p.value))
                    }))}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-sm hover:bg-purple-200"
                  >
                    All Permissions
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      permissions: permissionGroups.flatMap(g => 
                        g.permissions
                          .filter(p => p.value.includes('VIEW') || p.value.includes('REPORTS_VIEW'))
                          .map(p => p.value)
                      )
                    }))}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
                  >
                    View Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      permissions: []
                    }))}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 bg-red-100 p-3 rounded-md text-red-700">
              {error}
            </div>
          )}
          
          <div className="flex justify-end gap-3">
            <Link 
              to="/users"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Saving...' : isEditMode ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
