// File: StudentList.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import DataTable from '../../components/common/DataTable';
import { PERMISSIONS, useAuth } from '../../context/AuthContext';
import { fetchStudents } from '../../services/api';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    entry_year: '',
    academic_status: '',
    sortBy: 'full_name',
  });
  const { hasPermission } = useAuth();

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const response = await fetchStudents({
          search: searchTerm,
          ...filters,
        });
        setStudents(response?.data || mockStudents);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to fetch students');
        setLoading(false);
        setStudents(mockStudents); // Fallback to mock data
      }
    };

    fetchStudentData();
  }, [searchTerm, filters]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      case 'expelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Define columns for data table
  const columns = [
    { header: 'Student Code', accessor: 'student_code' },
    { header: 'Name', accessor: (row) => row.user?.full_name || '-' },
    { header: 'Entry Year', accessor: 'entry_year' },
    { header: 'Attendance Rate', accessor: (row) => `${row.attendance_rate}%` || '-' },
    {
      header: 'Academic Status',
      accessor: 'academic_status',
      cell: (row) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
            row.academic_status
          )}`}
        >
          {row.academic_status
            ? row.academic_status.charAt(0).toUpperCase() + row.academic_status.slice(1)
            : '-'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <Link
            to={`/students/${row.student_id}`}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View
          </Link>
          {hasPermission(PERMISSIONS.STUDENT_EDIT) && (
            <Link
              to={`/students/edit/${row.student_id}`}
              className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              Edit
            </Link>
          )}
        </div>
      ),
    },
  ];

  // Mock data for development
  const mockStudents = [
    {
      student_code: 'SV100000',
      date_of_birth: '2023-12-31',
      gender: 'other',
      hometown: 'East Melissaborough',
      current_address: '7271 Osborn Road Apt. 269\nEast Danielbury, IL 15136-9995',
      family_income_level: 'high',
      family_background:
        'Accusantium architecto saepe necessitatibus praesentium. Harum porro eum quos assumenda dolorem asperiores dolorum.',
      scholarship_status: 'full',
      scholarship_amount: 3489942.99,
      health_condition: null,
      mental_health_status: null,
      entry_year: 2022,
      expected_graduation_year: 2026,
      student_id: 1,
      user: {
        username: 'student1',
        full_name: 'Nathan Miller',
        email: 'student1@example.com',
        phone: '(814)328-0538x07146',
        role: 'student',
        profile_picture: null,
        user_id: 22,
        account_status: 'active',
        last_login: '2025-05-22T04:32:57',
        created_at: '2025-05-21T22:28:56',
        updated_at: '2025-05-22T11:32:57',
      },
      attendance_rate: 99.52,
      previous_academic_warning: 1,
      academic_status: 'suspended',
    },
    {
      student_code: 'SV100001',
      date_of_birth: '2023-01-15',
      gender: 'female',
      hometown: 'Westville',
      current_address: '123 Main St, Westville, CA 90210',
      family_income_level: 'medium',
      family_background: 'Stable family with both parents employed.',
      scholarship_status: 'partial',
      scholarship_amount: 1500000,
      health_condition: 'Good',
      mental_health_status: 'Stable',
      entry_year: 2021,
      expected_graduation_year: 2025,
      student_id: 2,
      user: {
        username: 'student2',
        full_name: 'Emma Wilson',
        email: 'student2@example.com',
        phone: '(555)123-4567',
        role: 'student',
        profile_picture: null,
        user_id: 23,
        account_status: 'active',
        last_login: '2025-05-21T10:15:30',
        created_at: '2025-05-20T08:00:00',
        updated_at: '2025-05-21T10:15:30',
      },
      attendance_rate: 95.0,
      previous_academic_warning: 0,
      academic_status: 'active',
    },
  ];

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-600 text-lg">Loading students...</div>
      </div>
    );

  if (error)
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
      </div>
    );

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Students</h1>
        {hasPermission(PERMISSIONS.STUDENT_CREATE) && (
          <Link
            to="/students/new"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Add New Student
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search students by name or code..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div>
            <select
              name="entry_year"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={filters.entry_year}
              onChange={handleFilterChange}
            >
              <option value="">All Entry Years</option>
              <option value="2021">2021</option>
              <option value="2022">2022</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
            </select>
          </div>
          <div>
            <select
              name="academic_status"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={filters.academic_status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="expelled">Expelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <DataTable columns={columns} data={students} pagination={true} itemsPerPage={10} />
      </div>
    </div>
  );
};

export default StudentList;