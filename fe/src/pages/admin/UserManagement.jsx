import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';

// Define validation schema for the user form
const userSchema = yup.object({
  name: yup.string().required('Họ tên là bắt buộc'),
  email: yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
  role: yup.string().required('Vai trò là bắt buộc'),
  password: yup.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .when('isEditing', {
      is: false,
      then: (schema) => schema.required('Mật khẩu là bắt buộc'),
      otherwise: (schema) => schema.optional()
    }),
  isEditing: yup.boolean()
});

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [alert, setAlert] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: {
      isEditing: false
    }
  });

  useEffect(() => {
    // Simulate fetching data from API
    const fetchUsers = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await api.get('/admin/users');
        // setUsers(response.data);
        
        // Simulated data
        setTimeout(() => {
          setUsers([
            { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', role: 'admin', status: 'active' },
            { id: 2, name: 'Trần Thị B', email: 'tranthib@example.com', role: 'teacher', status: 'active' },
            { id: 3, name: 'Lê Văn C', email: 'levanc@example.com', role: 'student', status: 'inactive' },
            { id: 4, name: 'Phạm Thị D', email: 'phamthid@example.com', role: 'counselor', status: 'active' },
            { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@example.com', role: 'parent', status: 'active' },
          ]);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching users:', error);
        setAlert({ type: 'error', message: 'Không thể tải danh sách người dùng' });
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Họ tên', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Vai trò', accessor: 'role' },
    { header: 'Trạng thái', accessor: 'status' },
    {
      header: 'Hành động',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="primary"
            onClick={() => handleEdit(row)}
          >
            Sửa
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => handleDelete(row.id)}
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  const handleEdit = (user) => {
    setSelectedUser(user);
    setModalMode('edit');
    
    // Set form values for editing
    setValue('name', user.name);
    setValue('email', user.email);
    setValue('role', user.role);
    setValue('isEditing', true);
    
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        // In a real app, this would be an API call
        // await api.delete(`/admin/users/${userId}`);
        
        // Update local state
        setUsers(users.filter(user => user.id !== userId));
        setAlert({ type: 'success', message: 'Xóa người dùng thành công' });
        
        // Clear alert after 3 seconds
        setTimeout(() => setAlert(null), 3000);
      } catch (error) {
        console.error('Error deleting user:', error);
        setAlert({ type: 'error', message: 'Không thể xóa người dùng' });
      }
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedUser(null);
    reset({
      name: '',
      email: '',
      role: 'student',
      password: '',
      isEditing: false
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      if (modalMode === 'add') {
        // In a real app, this would be an API call
        // const response = await api.post('/admin/users', data);
        // Add the new user to the list
        const newUser = {
          id: users.length + 1,
          name: data.name,
          email: data.email,
          role: data.role,
          status: 'active'
        };
        setUsers([...users, newUser]);
        setAlert({ type: 'success', message: 'Thêm người dùng mới thành công' });
      } else {
        // In a real app, this would be an API call
        // await api.put(`/admin/users/${selectedUser.id}`, data);
        
        // Update the user in the list
        setUsers(users.map(user => 
          user.id === selectedUser.id 
            ? { ...user, name: data.name, email: data.email, role: data.role }
            : user
        ));
        setAlert({ type: 'success', message: 'Cập nhật người dùng thành công' });
      }

      // Close modal and reset form
      closeModal();
      
      // Clear alert after 3 seconds
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error('Error saving user:', error);
      setAlert({ 
        type: 'error', 
        message: modalMode === 'add' 
          ? 'Không thể thêm người dùng mới' 
          : 'Không thể cập nhật người dùng' 
      });
    }
  };

  if (isLoading) {
    return <div className="loading">Đang tải dữ liệu người dùng...</div>;
  }

  return (
    <div className="user-management p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Người dùng</h1>
        <Button type="button" variant="success" onClick={openAddModal}>
          Thêm Người dùng
        </Button>
      </div>

      {alert && (
        <Alert type={alert.type} message={alert.message} className="mb-4" />
      )}

      <Table
        columns={columns}
        data={users}
        className="mb-4"
      />

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={modalMode === 'add' ? 'Thêm Người dùng mới' : 'Sửa thông tin Người dùng'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Họ tên"
            id="name"
            type="text"
            {...register('name')}
            error={errors.name?.message}
          />

          <Input
            label="Email"
            id="email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />

          <div className="form-group">
            <label htmlFor="role" className="block mb-1">Vai trò</label>
            <select
              id="role"
              className="w-full p-2 border rounded"
              {...register('role')}
            >
              <option value="admin">Quản trị viên</option>
              <option value="teacher">Giáo viên</option>
              <option value="student">Sinh viên</option>
              <option value="counselor">Nhân viên tư vấn</option>
              <option value="parent">Phụ huynh</option>
            </select>
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
          </div>

          {modalMode === 'add' && (
            <Input
              label="Mật khẩu"
              id="password"
              type="password"
              {...register('password')}
              error={errors.password?.message}
            />
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              {modalMode === 'add' ? 'Thêm' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;
