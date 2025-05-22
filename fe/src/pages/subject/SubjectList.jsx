// File: SubjectList.jsx - List of all subjects
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import DataTable from '../../components/common/DataTable';
import { fetchSubjects } from '../../services/api';

const SubjectList = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getSubjects = async () => {
      try {
        setLoading(true);
        // In production, replace with actual API call
        const response = await fetchSubjects();
        setSubjects(response?.data || mockSubjects);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setError('Failed to fetch subjects');
        setLoading(false);
        // For development, use mock data if API fails
        setSubjects(mockSubjects);
      }
    };

    getSubjects();
  }, []);

  // Define columns for data table
  const columns = [
    { header: 'Subject ID', accessor: 'subject_id' },
    { header: 'Subject Name', accessor: 'subject_name' },
    { header: 'Subject Code', accessor: 'subject_code' },
    { header: 'Credits', accessor: 'credits' },
    { header: 'Department', accessor: 'department' },
    {
      header: 'Syllabus',
      accessor: 'syllabus_link',
      cell: (row) => (
        row.syllabus_link ? (
          <a 
            href={row.syllabus_link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View Syllabus
          </a>
        ) : (
          <span className="text-gray-400">No syllabus</span>
        )
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <Link 
            to={`/subjects/${row.subject_id}`}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            View
          </Link>
          <Link 
            to={`/subjects/edit/${row.subject_id}`}
            className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
          >
            Edit
          </Link>
        </div>
      )
    }
  ];

  // Mock data for development
  const mockSubjects = [
    { 
      subject_id: 1, 
      subject_name: 'Mathematics', 
      subject_code: 'MATH101',
      credits: 4,
      department: 'Science',
      syllabus_link: 'http://example.com/syllabus/math101',
      isActive: true
    },
    { 
      subject_id: 2, 
      subject_name: 'Physics', 
      subject_code: 'PHYS101',
      credits: 4,
      department: 'Science',
      syllabus_link: 'http://example.com/syllabus/phys101',
      isActive: true
    },
    { 
      subject_id: 3, 
      subject_name: 'Literature', 
      subject_code: 'LIT101',
      credits: 3,
      department: 'Humanities',
      syllabus_link: null,
      isActive: true
    },
    { 
      subject_id: 4, 
      subject_name: 'Computer Science', 
      subject_code: 'CS101',
      credits: 3,
      department: 'Technology',
      syllabus_link: 'http://example.com/syllabus/cs101',
      isActive: true
    },
    { 
      subject_id: 5, 
      subject_name: 'History', 
      subject_code: 'HIST101',
      credits: 3,
      department: 'Humanities',
      syllabus_link: null,
      isActive: false
    },
  ];

  if (loading) return <div className="flex justify-center p-8">Loading subjects...</div>;
  
  if (error) return <div className="bg-red-100 p-4 text-red-700 rounded-md">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Subjects</h1>
        <Link 
          to="/subjects/new" 
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Add New Subject
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <DataTable 
          columns={columns} 
          data={subjects} 
          pagination={true} 
          itemsPerPage={10} 
        />
      </div>
    </div>
  );
};

export default SubjectList;
