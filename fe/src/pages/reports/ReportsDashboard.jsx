// File: ReportsDashboard.jsx - Central hub for all reports and analytics
import {
  AcademicCapIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Link } from 'react-router';
import { PERMISSIONS, useAuth } from '../../context/AuthContext';

const ReportsDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { hasPermission } = useAuth();
  
  // Report options with description, icon, and permission requirements
  const reportOptions = [
    {
      id: 'academic',
      title: 'Academic Performance Reports',
      description: 'View and analyze academic performance metrics across students, classes, and subjects',
      icon: <AcademicCapIcon className="w-10 h-10 text-blue-500" />,
      link: '/reports/academic',
      permission: PERMISSIONS.REPORTS_VIEW,
      metrics: [
        { label: 'Average GPA', value: '3.2' },
        { label: 'Pass Rate', value: '85%' }
      ]
    },
    {
      id: 'attendance',
      title: 'Attendance Analytics',
      description: 'Analyze attendance patterns and identify trends across students, classes, and time periods',
      icon: <ClipboardDocumentCheckIcon className="w-10 h-10 text-green-500" />,
      link: '/reports/attendance',
      permission: PERMISSIONS.REPORTS_VIEW,
      metrics: [
        { label: 'Attendance Rate', value: '90.5%' },
        { label: 'Chronic Absence', value: '4.5%' }
      ]
    },
    {
      id: 'dropout',
      title: 'Dropout Risk Analytics',
      description: 'Monitor dropout risk factors and intervention effectiveness across the institution',
      icon: <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />,
      link: '/dropout/risk-dashboard',
      permission: PERMISSIONS.DROPOUT_RISK_VIEW,
      metrics: [
        { label: 'At-Risk Students', value: '8.2%' },
        { label: 'Intervention Success', value: '76%' }
      ]
    },
    {
      id: 'trends',
      title: 'Trend Analysis',
      description: 'Visualize long-term trends and correlations between different data sets',
      icon: <ChartBarIcon className="w-10 h-10 text-purple-500" />,
      link: '/reports/trends',
      permission: PERMISSIONS.REPORTS_VIEW,
      metrics: [
        { label: 'Data Points', value: '15K+' },
        { label: 'Accuracy', value: '94%' }
      ]
    }
  ];

  // Check if the user has permission to view the reports dashboard
  if (!hasPermission(PERMISSIONS.REPORTS_VIEW)) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-100 p-4 rounded-md">
          <p className="text-yellow-700">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2">
          Access all reports and analytics tools to monitor student performance, attendance, and dropout risk
        </p>
      </div>

      {/* Report Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {reportOptions.map(option => (
          hasPermission(option.permission) && (
            <div 
              key={option.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex p-6">
                <div className="mr-6 flex-shrink-0">
                  {option.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">{option.title}</h2>
                  <p className="text-gray-600 mb-4">{option.description}</p>
                  
                  <div className="flex justify-between mb-4">
                    {option.metrics.map((metric, idx) => (
                      <div key={idx} className="bg-gray-50 px-3 py-2 rounded">
                        <p className="text-sm text-gray-500">{metric.label}</p>
                        <p className="text-lg font-semibold text-gray-800">{metric.value}</p>
                      </div>
                    ))}
                  </div>
                  
                  <Link 
                    to={option.link}
                    className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    View Reports
                  </Link>
                </div>
              </div>
            </div>
          )
        ))}
      </div>

      {/* Quick Access Links */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {hasPermission(PERMISSIONS.CLASSES_VIEW) && (
            <Link 
              to="/classes"
              className="flex items-center px-4 py-3 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            >
              <span className="mr-2 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  <path d="M10 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2h-6a2 2 0 01-2-2V6z" />
                </svg>
              </span>
              Class Reports
            </Link>
          )}
          
          {hasPermission(PERMISSIONS.STUDENTS_VIEW) && (
            <Link 
              to="/students"
              className="flex items-center px-4 py-3 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
            >
              <span className="mr-2 text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </span>
              Student Directory
            </Link>
          )}
          
          {hasPermission(PERMISSIONS.DISCIPLINARY_VIEW) && (
            <Link 
              to="/disciplinary"
              className="flex items-center px-4 py-3 bg-yellow-50 rounded-md hover:bg-yellow-100 transition-colors"
            >
              <span className="mr-2 text-yellow-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                </svg>
              </span>
              Disciplinary Records
            </Link>
          )}
          
          {hasPermission(PERMISSIONS.ATTENDANCE_VIEW) && (
            <Link 
              to="/attendance"
              className="flex items-center px-4 py-3 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
            >
              <span className="mr-2 text-indigo-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </span>
              Attendance Tracking
            </Link>
          )}
          
          {hasPermission(PERMISSIONS.GRADES_VIEW) && (
            <Link 
              to="/grades"
              className="flex items-center px-4 py-3 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
            >
              <span className="mr-2 text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </span>
              Grade Tracking
            </Link>
          )}
          
          {hasPermission(PERMISSIONS.DASHBOARD_VIEW) && (
            <Link 
              to="/dashboard"
              className="flex items-center px-4 py-3 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors"
            >
              <span className="mr-2 text-purple-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
              </span>
              Main Dashboard
            </Link>
          )}
        </div>
      </div>

      {/* Additional Resources */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Additional Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-md p-4">
            <h3 className="font-medium text-gray-800 mb-2">Report Generation Guide</h3>
            <p className="text-gray-600 text-sm mb-3">Learn how to customize reports and export data for further analysis</p>
            <button className="text-blue-500 text-sm hover:underline">View Documentation</button>
          </div>
          
          <div className="border border-gray-200 rounded-md p-4">
            <h3 className="font-medium text-gray-800 mb-2">Data Interpretation Handbook</h3>
            <p className="text-gray-600 text-sm mb-3">Guide to understanding report metrics and making data-driven decisions</p>
            <button className="text-blue-500 text-sm hover:underline">Download PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;
