// File: SubjectDetail.jsx - View details of a specific subject
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import ChartComponent from '../../components/common/ChartComponent';
import { fetchSubjectById } from '../../services/api';

const SubjectDetail = () => {
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const getSubjectDetails = async () => {
      try {
        setLoading(true);
        // In production, replace with actual API call
        const response = await fetchSubjectById(id);
        setSubject(response?.data || mockSubject);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching subject details:', err);
        setError('Failed to fetch subject details');
        setLoading(false);
        // For development, use mock data if API fails
        setSubject(mockSubject);
      }
    };

    getSubjectDetails();
  }, [id]);

  // Performance data for charts
  const performanceData = {
    labels: ['A', 'B', 'C', 'D', 'F'],
    datasets: [
      {
        label: 'Grade Distribution',
        data: [25, 35, 20, 15, 5],
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(255, 159, 64, 0.5)',
          'rgba(255, 99, 132, 0.5)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const attendanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Average Score',
        data: [78, 81, 74, 85, 79],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }
    ]
  };

  // Mock data for development
  const mockSubject = {
    id: 1,
    name: 'Mathematics',
    code: 'MATH101',
    creditHours: 4,
    gradeLevel: 10,
    department: 'Science',
    description: 'This course covers fundamental mathematical concepts including algebra, trigonometry, and pre-calculus.',
    objectives: 'Develop problem-solving skills and mathematical reasoning. Prepare students for advanced mathematics courses.',
    isActive: true,
    teacherCount: 5,
    studentCount: 150,
    averageScore: 78,
    passingRate: 85,
  };

  if (loading) return <div className="flex justify-center p-8">Loading subject details...</div>;
  
  if (error) return <div className="bg-red-100 p-4 text-red-700 rounded-md">{error}</div>;

  if (!subject) return <div className="bg-yellow-100 p-4 text-yellow-700 rounded-md">Subject not found</div>;

 return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link
          to="/subjects"
          className="mr-4 text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back to Subjects
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{subject.subject_name}</h1>
      </div>

      {/* Subject Information Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Subject Information</h2>
            <div className="space-y-3">
              <p>
                <span className="font-medium text-gray-700">Subject Name:</span>{' '}
                {subject.subject_name}
              </p>
              <p>
                <span className="font-medium text-gray-700">Subject Code:</span>{' '}
                {subject.subject_code}
              </p>
              <p>
                <span className="font-medium text-gray-700">Department:</span>{' '}
                {subject.department}
              </p>
              <p>
                <span className="font-medium text-gray-700">Credits:</span> {subject.credits}
              </p>
              <p>
                <span className="font-medium text-gray-700">Theory Credits:</span>{' '}
                {subject.credits_theory}
              </p>
              <p>
                <span className="font-medium text-gray-700">Practice Credits:</span>{' '}
                {subject.credits_practice}
              </p>
              <p>
                <span className="font-medium text-gray-700">Prerequisites:</span>{' '}
                {subject.prerequisite_subjects || 'None'}
              </p>
              <p>
                <span className="font-medium text-gray-700">Syllabus:</span>{' '}
                <a
                  href={subject.syllabus_link}
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Syllabus
                </a>
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Subject Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Teachers Assigned</p>
                <p className="text-2xl font-bold text-blue-600">4</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Students Enrolled</p>
                <p className="text-2xl font-bold text-green-600">120</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-purple-600">85/100</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Passing Rate</p>
                <p className="text-2xl font-bold text-orange-600">90%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex border-b border-gray-200 mb-4">
          {['overview', 'performance', 'curriculum'].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div>
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Description</h3>
                <p className="text-gray-600">{subject.subject_description}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Learning Objectives</h3>
                <p className="text-gray-600">
                  Understand basic programming concepts, develop problem-solving skills, and learn
                  to write efficient code in a high-level programming language.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Prerequisites</h3>
                <p className="text-gray-600">{subject.prerequisite_subjects || 'None'}</p>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Grade Distribution</h3>
                <ChartComponent
                  type="pie"
                  data={performanceData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                      title: {
                        display: true,
                        text: 'Student Grade Distribution',
                      },
                    },
                  }}
                  height={250}
                />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Monthly Performance</h3>
                <ChartComponent
                  type="bar"
                  data={attendanceData}
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                      },
                    },
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: true,
                        text: 'Monthly Average Scores',
                      },
                    },
                  }}
                  height={250}
                />
              </div>
            </div>
          )}

          {activeTab === 'curriculum' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Curriculum Units</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li>
                    <span className="font-medium">Unit 1:</span> Introduction to Programming
                    Concepts
                  </li>
                  <li>
                    <span className="font-medium">Unit 2:</span> Variables and Data Types
                  </li>
                  <li>
                    <span className="font-medium">Unit 3:</span> Control Structures
                  </li>
                  <li>
                    <span className="font-medium">Unit 4:</span> Functions and Modular Programming
                  </li>
                  <li>
                    <span className="font-medium">Unit 5:</span> Data Structures Basics
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Assessment Structure</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li>
                    <span className="font-medium">Assignments:</span> 40%
                  </li>
                  <li>
                    <span className="font-medium">Quizzes:</span> 20%
                  </li>
                  <li>
                    <span className="font-medium">Projects:</span> 20%
                  </li>
                  <li>
                    <span className="font-medium">Final Exam:</span> 20%
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default SubjectDetail;
