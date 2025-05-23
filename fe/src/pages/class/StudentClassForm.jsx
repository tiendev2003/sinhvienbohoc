// File: StudentClassForm.jsx - Form to add students to a class
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import DataTable from '../../components/common/DataTable';
import { addStudentsToClass, fetchAvailableStudents } from '../../services/api';

const StudentClassForm = () => {
  const { id: classId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    const getAvailableStudents = async () => {
      try {
        setLoading(true);
        const response = await fetchAvailableStudents(classId);
        setAvailableStudents(response?.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching available students:', err);
        setError('Failed to fetch available students');
        setLoading(false);
      }
    };

    getAvailableStudents();
  }, [classId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedStudents.length === 0) {
      setError('Please select at least one student');
      return;
    }

    try {
      await addStudentsToClass(classId, selectedStudents);
      navigate(`/classes/${classId}`);
    } catch (err) {
      console.error('Error adding students:', err);
      setError('Failed to add students to class');
    }
  };

  const columns = [
    {
      header: 'Select',
      accessor: 'select',
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedStudents.includes(row.student_id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedStudents([...selectedStudents, row.student_id]);
            } else {
              setSelectedStudents(selectedStudents.filter(id => id !== row.student_id));
            }
          }}
          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
      )
    },
    { header: 'Student ID', accessor: 'student_id' },
    { header: 'Name', accessor: row => row.user?.full_name },
    { header: 'Student Code', accessor: 'student_code' },
    { header: 'Email', accessor: row => row.user?.email },
  ];

  if (loading) return <div className="flex justify-center p-8">Loading available students...</div>;
  
  if (error) return <div className="bg-red-100 p-4 text-red-700 rounded-md">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Add Students to Class</h1>
          <p className="text-gray-600">Select students to add to this class</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                Selected: {selectedStudents.length} students
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/classes/${classId}`)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Add Selected Students
                </button>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={availableStudents}
              pagination={true}
              itemsPerPage={10}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentClassForm;
