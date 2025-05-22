// File: DropoutInterventions.jsx - Manage interventions for at-risk students
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import DataTable from '../../components/common/DataTable';
import { PERMISSIONS, useAuth } from '../../context/AuthContext';
import {
    createIntervention,
    fetchAllInterventions,
    fetchInterventionById,
    fetchStudentById,
    updateIntervention
} from '../../services/api';

const DropoutInterventions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const studentId = searchParams.get('studentId');
  const interventionId = searchParams.get('id');
  const isEdit = searchParams.get('edit') === 'true';
  
  const [interventions, setInterventions] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(!!studentId || isEdit);
  const [formMode, setFormMode] = useState(isEdit ? 'edit' : 'add');
  const [filter, setFilter] = useState({
    status: 'all',
    type: 'all',
  });

  const [formData, setFormData] = useState({
    id: '',
    studentId: studentId || '',
    date: new Date().toISOString().split('T')[0],
    type: '',
    description: '',
    conductedBy: '',
    status: 'Scheduled',
    notes: '',
    followUpDate: ''
  });

  const { hasPermission } = useAuth();

  useEffect(() => {
    const getInterventionsData = async () => {
      try {
        setLoading(true);
        
        // Fetch all interventions
        const response = await fetchAllInterventions(filter);
        setInterventions(response?.data || mockInterventions);
        
        // If studentId is provided, fetch student info
        if (studentId) {
          const studentResponse = await fetchStudentById(studentId);
          setStudent(studentResponse?.data || mockStudents.find(s => s.id.toString() === studentId));
          setFormData(prev => ({
            ...prev,
            studentId
          }));
        }
        
        // If editing, fetch intervention details
        if (interventionId && isEdit) {
          const interventionResponse = await fetchInterventionById(interventionId);
          const interventionData = interventionResponse?.data || 
                                  mockInterventions.find(i => i.id.toString() === interventionId);
          
          if (interventionData) {
            setFormData({
              id: interventionData.id,
              studentId: interventionData.studentId,
              date: interventionData.date,
              type: interventionData.type,
              description: interventionData.description,
              conductedBy: interventionData.conductedBy,
              status: interventionData.status,
              notes: interventionData.notes || '',
              followUpDate: interventionData.followUpDate || ''
            });
            
            // Fetch student info for this intervention
            const studentResponse = await fetchStudentById(interventionData.studentId);
            setStudent(studentResponse?.data || mockStudents.find(s => s.id.toString() === interventionData.studentId));
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching interventions data:', err);
        setError('Failed to fetch interventions data');
        setLoading(false);
        
        // For development, use mock data
        setInterventions(mockInterventions);
        
        if (studentId) {
          setStudent(mockStudents.find(s => s.id.toString() === studentId));
        }
        
        if (interventionId && isEdit) {
          const interventionData = mockInterventions.find(i => i.id.toString() === interventionId);
          if (interventionData) {
            setFormData({
              id: interventionData.id,
              studentId: interventionData.studentId,
              date: interventionData.date,
              type: interventionData.type,
              description: interventionData.description,
              conductedBy: interventionData.conductedBy,
              status: interventionData.status,
              notes: interventionData.notes || '',
              followUpDate: interventionData.followUpDate || ''
            });
            setStudent(mockStudents.find(s => s.id.toString() === interventionData.studentId));
          }
        }
      }
    };

    getInterventionsData();
  }, [studentId, interventionId, isEdit, filter]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (formMode === 'edit') {
        // Update existing intervention
        await updateIntervention(formData.id, formData);
        alert('Intervention updated successfully');
      } else {
        // Create new intervention
        await createIntervention(formData);
        alert('Intervention added successfully');
      }
      
      // Reset form and reload data
      setFormData({
        id: '',
        studentId: '',
        date: new Date().toISOString().split('T')[0],
        type: '',
        description: '',
        conductedBy: '',
        status: 'Scheduled',
        notes: '',
        followUpDate: ''
      });
      
      setIsFormVisible(false);
      
      // Navigate back to student detail if came from there
      if (studentId) {
        navigate(`/dropout-risk/${studentId}`);
      } else {
        // Reload interventions
        const response = await fetchAllInterventions(filter);
        setInterventions(response?.data || mockInterventions);
      }
    } catch (err) {
      console.error('Error saving intervention:', err);
      alert('Failed to save intervention. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setFormData({
      id: '',
      studentId: studentId || '',
      date: new Date().toISOString().split('T')[0],
      type: '',
      description: '',
      conductedBy: '',
      status: 'Scheduled',
      notes: '',
      followUpDate: ''
    });
    
    // Navigate back if we came from student detail
    if (studentId && !isEdit) {
      navigate(`/dropout-risk/${studentId}`);
    }
  };

  const columns = [
    { header: 'Date', accessor: 'date' },
    { 
      header: 'Student', 
      accessor: 'studentName',
      cell: (row) => (
        <Link to={`/dropout-risk/${row.studentId}`} className="text-blue-600 hover:underline">
          {row.studentName}
        </Link>
      )
    },
    { header: 'Class', accessor: 'className' },
    { header: 'Type', accessor: 'type' },
    { header: 'Conducted By', accessor: 'conductedBy' },
    { header: 'Status', accessor: 'status',
      cell: (row) => {
        const statusColor = 
          row.status === 'Completed' ? 'bg-green-100 text-green-800' :
          row.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
          row.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800';
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${statusColor}`}>
            {row.status}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <Link 
            to={`/dropout-risk/${row.studentId}`}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
          >
            View Student
          </Link>
          {hasPermission(PERMISSIONS.DROPOUT_RISK_EDIT) && (
            <>
              <Link 
                to={`/dropout-risk/interventions?id=${row.id}&edit=true`}
                className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm"
              >
                Edit
              </Link>
              <button 
                onClick={() => alert(`Mark intervention ${row.id} as complete`)}
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                disabled={row.status === 'Completed'}
              >
                {row.status === 'Completed' ? 'Completed' : 'Mark Complete'}
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  // Mock data for development
  const mockInterventions = [
    {
      id: 1,
      studentId: 1,
      studentName: 'Jane Cooper',
      className: '10A',
      date: '2023-10-15',
      type: 'Counseling Session',
      description: 'Initial assessment of academic challenges and family situation',
      conductedBy: 'Dr. Smith (School Counselor)',
      status: 'Completed',
      notes: 'Student showed willingness to improve. Demonstrated awareness of challenges.',
      followUpDate: '2023-11-15'
    },
    {
      id: 2,
      studentId: 1,
      studentName: 'Jane Cooper',
      className: '10A',
      date: '2023-10-30',
      type: 'Parent-Teacher Conference',
      description: 'Discussion about academic progress and attendance issues',
      conductedBy: 'Ms. Johnson (Class Teacher)',
      status: 'Completed',
      notes: 'Parents committed to ensuring improved attendance.',
      followUpDate: '2023-11-30'
    },
    {
      id: 3,
      studentId: 2,
      studentName: 'Michael Brown',
      className: '9B',
      date: '2023-11-15',
      type: 'Academic Support',
      description: 'Assignment of peer tutor for math and science subjects',
      conductedBy: 'Mr. Williams (Academic Coordinator)',
      status: 'In Progress',
      notes: 'Initial session went well. Schedule set for twice weekly sessions.',
      followUpDate: '2023-12-15'
    },
    {
      id: 4,
      studentId: 3,
      studentName: 'Alex Johnson',
      className: '11C',
      date: '2023-11-20',
      type: 'Attendance Improvement Plan',
      description: 'Development of plan to improve attendance including daily check-ins',
      conductedBy: 'Ms. Clark (Attendance Officer)',
      status: 'In Progress',
      notes: 'Initial improvements seen. Continue monitoring.',
      followUpDate: '2023-12-20'
    },
    {
      id: 5,
      studentId: 1,
      studentName: 'Jane Cooper',
      className: '10A',
      date: '2023-12-01',
      type: 'Counseling Session',
      description: 'Follow-up session to discuss progress and challenges',
      conductedBy: 'Dr. Smith (School Counselor)',
      status: 'Scheduled',
      notes: '',
      followUpDate: '2023-12-30'
    }
  ];

  const mockStudents = [
    {
      id: 1,
      name: 'Jane Cooper',
      className: '10A',
      gradeLevel: 10,
      riskScore: 82
    },
    {
      id: 2,
      name: 'Michael Brown',
      className: '9B',
      gradeLevel: 9,
      riskScore: 65
    },
    {
      id: 3,
      name: 'Alex Johnson',
      className: '11C',
      gradeLevel: 11,
      riskScore: 78
    }
  ];

  if (loading) return <div className="flex justify-center p-8">Loading interventions data...</div>;
  
  if (error) return <div className="bg-red-100 p-4 text-red-700 rounded-md">{error}</div>;

  if (!hasPermission(PERMISSIONS.DROPOUT_RISK_VIEW)) {
    return (
      <div className="bg-yellow-100 p-4 rounded-md">
        <p className="text-yellow-700">You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link 
              to="/dropout-risk" 
              className="mr-4 text-blue-500 hover:text-blue-700"
            >
              ← Back to Risk Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">
              {student ? `Interventions for ${student.name}` : 'Dropout Risk Interventions'}
            </h1>
          </div>
          
          {!isFormVisible && hasPermission(PERMISSIONS.DROPOUT_RISK_EDIT) && (
            <button
              onClick={() => {
                setFormMode('add');
                setIsFormVisible(true);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Add New Intervention
            </button>
          )}
        </div>
        
        {student && (
          <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm"><span className="font-medium">Student:</span> {student.name}</p>
                <p className="text-sm"><span className="font-medium">Class:</span> {student.className}</p>
                <p className="text-sm"><span className="font-medium">Grade Level:</span> {student.gradeLevel}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Risk Score</p>
                <div className={`inline-block px-3 py-1 rounded-full ${
                  student.riskScore < 30 ? 'bg-green-100 text-green-800' :
                  student.riskScore < 70 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {student.riskScore}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isFormVisible ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {formMode === 'edit' ? 'Edit Intervention' : 'Add New Intervention'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {!student && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student*</label>
                  <select
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a student</option>
                    {mockStudents.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name} - {student.className} (Risk: {student.riskScore}%)
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date*</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Intervention Type*</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select intervention type</option>
                  <option value="Counseling Session">Counseling Session</option>
                  <option value="Parent-Teacher Conference">Parent-Teacher Conference</option>
                  <option value="Academic Support">Academic Support</option>
                  <option value="Attendance Improvement Plan">Attendance Improvement Plan</option>
                  <option value="Behavioral Intervention">Behavioral Intervention</option>
                  <option value="Peer Mentoring">Peer Mentoring</option>
                  <option value="Resource Referral">Resource Referral</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conducted By*</label>
                <input
                  type="text"
                  name="conductedBy"
                  value={formData.conductedBy}
                  onChange={handleFormChange}
                  placeholder="Name and role of person conducting intervention"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status*</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Follow-Up Date</label>
                <input
                  type="date"
                  name="followUpDate"
                  value={formData.followUpDate}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Describe the intervention plan or activities"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                placeholder="Additional notes, observations, or outcomes"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {formMode === 'edit' ? 'Update Intervention' : 'Save Intervention'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Filter Interventions</h2>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={filter.status}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  name="type"
                  value={filter.type}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="Counseling Session">Counseling Session</option>
                  <option value="Parent-Teacher Conference">Parent-Teacher Conference</option>
                  <option value="Academic Support">Academic Support</option>
                  <option value="Attendance Improvement Plan">Attendance Improvement Plan</option>
                  <option value="Behavioral Intervention">Behavioral Intervention</option>
                  <option value="Peer Mentoring">Peer Mentoring</option>
                  <option value="Resource Referral">Resource Referral</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Interventions Table */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Intervention Records</h2>
            {interventions.length > 0 ? (
              <DataTable 
                columns={columns} 
                data={interventions} 
                pagination={true} 
                itemsPerPage={10} 
              />
            ) : (
              <div className="bg-yellow-50 p-4 rounded-md">
                <p className="text-yellow-700">No interventions found matching the current filters.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DropoutInterventions;
