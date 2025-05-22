// File: UserList.jsx - List of system users with management capabilities
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import DataTable from '../../components/common/DataTable';
import { PERMISSIONS, useAuth } from '../../context/AuthContext';
import { deleteUser, fetchUsers } from '../../services/api';

const UserList = () => {  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    skip: 0,
    limit: 100,
    role: null,  // null will fetch all roles, or specify a role like 'admin', 'teacher', etc.
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { hasPermission } = useAuth();
  useEffect(() => {
    const getUsers = async () => {
      try {
        setLoading(true);
        // Convert 'all' to null for the API
        const apiParams = {
          ...filters,
          role: filters.role === 'all' ? null : filters.role
        };
        
        const response = await fetchUsers(apiParams);
        
        // Process the response
        let filteredUsers = response?.data || [];
        
        // Handle empty responses or errors by using mock data
        if (!filteredUsers || filteredUsers.length === 0) {
          filteredUsers = mockUsers;
        }
        
        // Apply client-side filtering (search and status)
        if (searchQuery || statusFilter !== 'all') {
          filteredUsers = filteredUsers.filter(user => {
            // Search filter
            const matchesSearch = !searchQuery || 
              user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              user.email?.toLowerCase().includes(searchQuery.toLowerCase());
                // Status filter
            const matchesStatus = statusFilter === 'all' || 
              user.account_status === statusFilter;
              
            return matchesSearch && matchesStatus;
          });
        }
        
        setUsers(filteredUsers);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users');
        setLoading(false);
        // For development, use mock data
        setUsers(mockUsers);
      }
    };    getUsers();
  }, [filters, searchQuery, statusFilter]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    // Handle status filter separately from API params
    if (name === 'status') {
      setStatusFilter(value);
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value === 'all' ? null : value
      }));
    }
  };
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteUser(userId);
      setUsers(prev => prev.filter(user => user.user_id !== userId));
      setLoading(false);
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
      setLoading(false);
    }
  };
  const columns = [
    { header: 'ID', accessor: 'user_id' },
    { header: 'Name', accessor: 'full_name' },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Role', 
      accessor: 'role',
      cell: (row) => {
        const roleColor = 
          row.role === 'admin' ? 'bg-purple-100 text-purple-800' :
          row.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
          row.role === 'counselor' ? 'bg-green-100 text-green-800' :
          row.role === 'student' ? 'bg-yellow-100 text-yellow-800' :
          row.role === 'parent' ? 'bg-pink-100 text-pink-800' :
          'bg-gray-100 text-gray-800';
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${roleColor}`}>
            {row.role}
          </span>
        );
      }
    },
    { 
      header: 'Status', 
      accessor: 'account_status',
      cell: (row) => {
        const statusColor = 
          row.account_status === 'active' ? 'bg-green-100 text-green-800' :
          row.account_status === 'inactive' ? 'bg-red-100 text-red-800' :
          row.account_status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800';
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${statusColor}`}>
            {row.account_status}
          </span>
        );
      }
    },
    { 
      header: 'Last Login', 
      accessor: 'last_login',
      cell: (row) => {
        return row.last_login ? new Date(row.last_login).toLocaleString() : 'Never';
      }
    },    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <Link 
            to={`/users/edit/${row.user_id}`}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
          >
            Edit
          </Link>
          {hasPermission(PERMISSIONS.USER_DELETE) && (
            <button
              onClick={() => handleDelete(row.user_id)}
              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
            >
              Delete
            </button>
          )}
        </div>
      )
    }
  ];
  // Mock data for development (matches backend schema)
  const mockUsers = [
    {
      user_id: 1,
      username: 'admin',
      full_name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      account_status: 'active',
      last_login: '2023-11-10T10:23:00',
      created_at: '2023-01-01T00:00:00',
      updated_at: '2023-01-01T00:00:00'
    },
    {
      user_id: 2,
      username: 'teacher1',
      full_name: 'Teacher One',
      email: 'teacher1@example.com',
      role: 'teacher',
      account_status: 'active',
      last_login: '2023-11-09T14:45:00',
      created_at: '2023-01-01T00:00:00',
      updated_at: '2023-01-01T00:00:00'
    },
    {
      user_id: 3,
      username: 'staff',
      full_name: 'Staff Member',
      email: 'staff@example.com',
      role: 'counselor',
      account_status: 'inactive',
      last_login: '2023-10-25T09:15:00',
      created_at: '2023-01-01T00:00:00',
      updated_at: '2023-01-01T00:00:00'
    },
    {
      user_id: 4,
      username: 'teacher2',
      full_name: 'Another Teacher',
      email: 'teacher2@example.com',
      role: 'teacher',
      account_status: 'active',
      last_login: '2023-11-10T08:30:00',
      created_at: '2023-01-01T00:00:00',
      updated_at: '2023-01-01T00:00:00'
    },
    {
      user_id: 5,
      username: 'depthead',
      full_name: 'Department Head',
      email: 'head@example.com',
      role: 'admin',
      account_status: 'active',
      last_login: '2023-11-10T11:10:00',
      created_at: '2023-01-01T00:00:00',
      updated_at: '2023-01-01T00:00:00'
    }
  ];

  if (loading && !users.length) {
    return <div className="flex justify-center p-8">Loading users...</div>;
  }
  
  if (error && !users.length) {
    return <div className="bg-red-100 p-4 text-red-700 rounded-md">{error}</div>;
  }

  if (!hasPermission(PERMISSIONS.USER_VIEW)) {
    return (
      <div className="bg-yellow-100 p-4 rounded-md">
        <p className="text-yellow-700">You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <p className="text-gray-600 mt-2">
          Manage system users, roles, and permissions
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                className="w-full md:w-auto p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <div>              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={statusFilter}
                onChange={handleFilterChange}
                className="w-full md:w-auto p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          <div className="flex-grow max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {hasPermission(PERMISSIONS.USER_CREATE) && (
            <div className="self-end">
              <Link 
                to="/users/new" 
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add New User
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <DataTable 
          columns={columns} 
          data={users} 
          pagination={true} 
          itemsPerPage={10} 
        />
      </div>
    </div>
  );
};

export default UserList;
