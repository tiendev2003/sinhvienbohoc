// File: ClassList.jsx - List of all classes
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import DataTable from '../../components/common/DataTable';
import { PERMISSIONS, useAuth } from '../../context/AuthContext';
import { fetchClasses } from '../../services/api';

const ClassList = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { hasPermission } = useAuth();

  useEffect(() => {
    const getClasses = async () => {
      try {
        setLoading(true);
        // In production, replace with actual API call
        const response = await fetchClasses();
        setClasses(response.data || mockClasses);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError('Failed to fetch classes');
        setLoading(false);
        // For development, use mock data if API fails
        setClasses(mockClasses);
      }
    };

    getClasses();
  }, []);
  // Define columns for data table
  const columns = [
    { header: 'Class ID', accessor: 'class_id' },
    { header: 'Class Name', accessor: 'class_name' },
    { header: 'Academic Year', accessor: 'academic_year' },
    { header: 'Semester', accessor: 'semester' },
    { header: 'Department', accessor: 'department' },
    { header: 'Teacher', accessor: row => row.teacher?.user?.full_name || 'Not Assigned' },
    { header: 'Students Count', accessor: 'current_students' },    {
      header: 'Actions',
      accessor: 'actions',      cell: (row) => (
        <div className="flex space-x-2">
          <Link 
            to={`/classes/${row.class_id}`}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            View
          </Link>
          {hasPermission(PERMISSIONS.CLASS_EDIT) && (
            <Link 
              to={`/classes/edit/${row.class_id}`}
              className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              Edit
            </Link>
          )}
        </div>
      )
    }
  ];
  // Mock data for development
  const mockClasses = [
    { 
      class_id: 1, 
      class_name: 'HIST101 - 2024-2025 - 1', 
      academic_year: '2024-2025',
      semester: '1',
      department: 'History',
      current_students: 35,
      teacher: {
        teacher_id: 1,
        user: {
          full_name: 'John Smith'
        }
      }
    },
    { 
      class_id: 2, 
      class_name: 'MATH203 - 2024-2025 - 2', 
      academic_year: '2024-2025',
      semester: '2',
      department: 'Mathematics',
      current_students: 32,
      teacher: {
        teacher_id: 2,
        user: {
          full_name: 'Mary Johnson'
        }
      }
    },
    { 
      class_id: 3, 
      class_name: 'COMP110 - 2024-2025 - 1', 
      academic_year: '2024-2025',
      semester: '1',
      department: 'Computer Science',
      current_students: 28,
      teacher: {
        teacher_id: 3,
        user: {
          full_name: 'Robert Davis'
        }
      }
    },
  ];

  if (loading) return <div className="flex justify-center p-8">Loading classes...</div>;
  
  if (error) return <div className="bg-red-100 p-4 text-red-700 rounded-md">{error}</div>;
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Classes</h1>
        {hasPermission(PERMISSIONS.CLASS_CREATE) && (
          <Link 
            to="/classes/new" 
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Add New Class
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <DataTable 
          columns={columns} 
          data={classes} 
          pagination={true} 
          itemsPerPage={10} 
        />
      </div>
    </div>
  );
};

export default ClassList;
