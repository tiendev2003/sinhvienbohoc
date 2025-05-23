// File: AttendanceList.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import DataTable from '../../components/common/DataTable';
import { fetchAttendanceByFilters, fetchClasses } from '../../services/api';
import { formatDate } from '../../utils/formatters';

const AttendanceList = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState([]);
  const [filter, setFilter] = useState({
    class_id: '',
    date: '',
    status: '',
  });
  useEffect(() => {
  const getAttendanceRecords = async () => {
    try {
      setLoading(true);
      // Create a clean filter object without empty values
      const cleanFilter = Object.fromEntries(
        Object.entries({ 
          class_id: filter.class_id, 
          date: filter.date, 
          status: filter.status 
        }).filter(([_, value]) => value !== '')
      );
      
      const response = await fetchAttendanceByFilters(cleanFilter);
      setAttendanceRecords(response?.data || mockAttendanceRecords);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching attendance records:', err);
      setError('Failed to fetch attendance records');
      setLoading(false);
      setAttendanceRecords(mockAttendanceRecords); // Fallback to mock data
    }
  };

    getAttendanceRecords();
  }, [filter]);

  // Fetch classes for dropdown filter
  useEffect(() => {
    const getClasses = async () => {
      try {
        const response = await fetchClasses();
        setClasses(response?.data || []);
      } catch (err) {
        console.error('Error fetching classes:', err);
        // If API fails, fallback to empty array
        setClasses([]);
      }
    };

    getClasses();
  }, []);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prevFilter) => ({
      ...prevFilter,
      [name]: value,
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilter({
      class_id: '',
      date: '',
      status: '',
    });
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  // Define columns for data table
  const columns = [
    { header: 'Attendance ID', accessor: 'attendance_id' },
    {
      header: 'Student',
      accessor: (row) => row.student_name || `Student ${row.student_id}`,
    },
    {
      header: 'Student ID',
      accessor: 'student_id',
    },
    {
      header: 'Class',
      accessor: (row) => row.class_name || `Class ${row.class_id}`,
    },
    {
      header: 'Date',
      accessor: (row) => formatDate(row.date) || '-',
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
            row.status
          )}`}
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
    {
      header: 'Minutes Late',
      accessor: (row) => row.minutes_late || '0',
    },
    {
      header: 'Notes',
      accessor: (row) => row.notes || '-',
    },
  ];
  // Mock data for development
  const mockAttendanceRecords = [
    {
      attendance_id: 3671,
      student_id: 6,
      student_name: "Nguyen Van A",
      class_id: 9,
      class_name: "CS2023A",
      date: '2025-08-14',
      status: 'present',
      minutes_late: 0,
      notes: null,
    },
    {
      attendance_id: 3672,
      student_id: 7,
      student_name: "Tran Thi B",
      class_id: 9,
      class_name: "CS2023A",
      date: '2025-08-14',
      status: 'absent',
      minutes_late: 0,
      notes: 'Called in sick',
    },
    {
      attendance_id: 3673,
      student_id: 8,
      student_name: "Le Van C",
      class_id: 9,
      class_name: "CS2023A",
      date: '2025-08-14',
      status: 'late',
      minutes_late: 15,
      notes: 'Arrived 15 minutes late',
    },
    {
      attendance_id: 3674,
      student_id: 9,
      student_name: "Pham Thi D",
      class_id: 10,
      class_name: "CS2023B",
      date: '2025-08-15',
      status: 'present',
      minutes_late: 0,
      notes: null,
    },
    {
      attendance_id: 3675,
      student_id: 10,
      student_name: "Hoang Van E",
      class_id: 10,
      class_name: "CS2023B",
      date: '2025-08-15',
      status: 'present',    minutes_late: 0,
      notes: null,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Attendance Records</h1>
        <Link
          to="/attendance/new"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Take Attendance
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="class_id" className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <select
              id="class_id"
              name="class_id"
              value={filter.class_id}
              onChange={handleFilterChange}              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.class_id} value={cls.class_id}>
                  {cls.class_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={filter.date}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={filter.status}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <DataTable
          columns={columns}
          data={attendanceRecords}
          pagination={true}
          itemsPerPage={10}
        />
      </div>

      <div className="mt-6 flex justify-end">
        <Link
          to="/attendance/report"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Attendance Reports
        </Link>
      </div>
    </div>
  );
};

export default AttendanceList;