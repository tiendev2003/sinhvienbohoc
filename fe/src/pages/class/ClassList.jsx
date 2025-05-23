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
    { header: 'Students Count', accessor: row => row.students_list?.length || 0 },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <Link 
            to={`/classes/${row.class_id}`}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            View
          </Link>
          {hasPermission(PERMISSIONS.CLASS_EDIT) && (
            <>
              <Link 
                to={`/classes/edit/${row.class_id}`}
                className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
              >
                Edit
              </Link>
              <Link
                to={`/classes/${row.class_id}/students/add`}
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Add Students
              </Link>
            </>
          )}
        </div>
      )
    }
  ];
  // Mock data for development
  const mockClasses = [
    { 
      class_id: 1, 
      class_name: 'HIST101-2024-1',
      class_description: 'Introduction to World History',
      academic_year: '2024-2025',
      semester: '1',
      department: 'History',
      start_date: '2024-09-05',
      end_date: '2025-01-15',
      schedule: {
        dayOfWeek: 'Monday',
        startTime: '08:00',
        endTime: '10:00',
        room: 'H101'  
      },
      teacher_id: 1,
      max_students: 40,
      teacher: {
        teacher_id: 1,
        teacher_code: 'TCH001',
        department: 'History',
        position: 'Senior Lecturer',
        user: {
          user_id: 101,
          username: 'jsmith', 
          full_name: 'John Smith',
          email: 'john.smith@university.edu',
          role: 'teacher'
        }
      },
      subjects: [
        {
          subject_id: 1,
          subject_code: 'HIST101',
          subject_name: 'Introduction to World History',
          credits: 3,
          department: 'History'
        }
      ],
      students_list: [
        {
          student_id: 1,
          student_code: 'STU001',
          enrollment_date: '2024-09-05',
          status: 'enrolled',
          user: {
            user_id: 201,
            full_name: 'Alice Brown',
            email: 'alice.b@university.edu'
          }
        },
        {
          student_id: 2,
          student_code: 'STU002', 
          enrollment_date: '2024-09-05',
          status: 'enrolled',
          user: {
            user_id: 202,
            full_name: 'Bob Wilson',
            email: 'bob.w@university.edu'
          }
        }
      ]
    },
    { 
      class_id: 2,
      class_name: 'MATH203-2024-2',
      class_description: 'Advanced Calculus',
      academic_year: '2024-2025',
      semester: '2',
      department: 'Mathematics',
      start_date: '2025-02-01',
      end_date: '2025-06-15',
      schedule: {
        dayOfWeek: 'Tuesday',
        startTime: '10:00',
        endTime: '12:00',
        room: 'M203'
      },
      teacher_id: 2,
      max_students: 35,
      current_students: 32,
      teacher: {
        teacher_id: 2,
        teacher_code: 'TCH002',
        department: 'Mathematics',
        position: 'Professor',
        user: {
          user_id: 102,
          username: 'mjohnson',
          full_name: 'Mary Johnson',
          email: 'mary.johnson@university.edu',
          role: 'teacher'
        }
      },
      subjects: [
        {
          subject_id: 2,
          subject_code: 'MATH203',
          subject_name: 'Advanced Calculus',
          credits: 4,
          department: 'Mathematics'
        }
      ],
      students_list: [
        {
          student_id: 3,
          student_code: 'STU003',
          enrollment_date: '2025-02-01',
          status: 'enrolled',
          user: {
            user_id: 203,
            full_name: 'Charlie Davis',
            email: 'charlie.d@university.edu'
          }
        }
      ]
    },
    {
      class_id: 3, 
      class_name: 'COMP110-2024-1',
      class_description: 'Introduction to Programming',
      academic_year: '2024-2025',
      semester: '1',
      department: 'Computer Science',
      start_date: '2024-09-05',
      end_date: '2025-01-15',
      schedule: {
        dayOfWeek: 'Wednesday',
        startTime: '13:00',
        endTime: '15:00',
        room: 'CS110'
      },
      teacher_id: 3,
      max_students: 30,
      current_students: 28,
      teacher: {
        teacher_id: 3,
        teacher_code: 'TCH003',
        department: 'Computer Science',
        position: 'Assistant Professor',
        user: {
          user_id: 103,
          username: 'rdavis',
          full_name: 'Robert Davis',
          email: 'robert.davis@university.edu',
          role: 'teacher'
        }
      },
      subjects: [
        {
          subject_id: 3,
          subject_code: 'COMP110',
          subject_name: 'Introduction to Programming',
          credits: 4,
          department: 'Computer Science'
        }
      ],
      students_list: [
        {
          student_id: 4,
          student_code: 'STU004',
          enrollment_date: '2024-09-05',
          status: 'enrolled',
          user: {
            user_id: 204,
            full_name: 'Diana Evans',
            email: 'diana.e@university.edu'
          }
        },
        {
          student_id: 5,
          student_code: 'STU005',
          enrollment_date: '2024-09-05',
          status: 'enrolled',
          user: {
            user_id: 205,
            full_name: 'Edward Clark',
            email: 'edward.c@university.edu'
          }
        }
      ]
    }
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
