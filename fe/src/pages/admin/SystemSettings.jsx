import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';

// Define validation schema for system settings form
const settingsSchema = yup.object({
  siteName: yup.string().required('Tên hệ thống là bắt buộc'),
  contactEmail: yup.string().email('Email không hợp lệ').required('Email liên hệ là bắt buộc'),
  academicYear: yup.string().required('Năm học hiện tại là bắt buộc'),
  semester: yup.string().required('Học kỳ hiện tại là bắt buộc'),
  riskThresholdHigh: yup.number()
    .min(0, 'Ngưỡng phải lớn hơn hoặc bằng 0')
    .max(100, 'Ngưỡng phải nhỏ hơn hoặc bằng 100')
    .required('Ngưỡng nguy cơ cao là bắt buộc'),
  riskThresholdMedium: yup.number()
    .min(0, 'Ngưỡng phải lớn hơn hoặc bằng 0')
    .max(100, 'Ngưỡng phải nhỏ hơn hoặc bằng 100')
    .required('Ngưỡng nguy cơ trung bình là bắt buộc'),
  attendanceWeight: yup.number()
    .min(0, 'Trọng số phải lớn hơn hoặc bằng 0')
    .max(100, 'Trọng số phải nhỏ hơn hoặc bằng 100')
    .required('Trọng số điểm danh là bắt buộc'),
  gradesWeight: yup.number()
    .min(0, 'Trọng số phải lớn hơn hoặc bằng 0')
    .max(100, 'Trọng số phải nhỏ hơn hoặc bằng 100')
    .required('Trọng số điểm số là bắt buộc'),
  disciplinaryWeight: yup.number()
    .min(0, 'Trọng số phải lớn hơn hoặc bằng 0')
    .max(100, 'Trọng số phải nhỏ hơn hoặc bằng 100')
    .required('Trọng số kỷ luật là bắt buộc'),
  economicWeight: yup.number()
    .min(0, 'Trọng số phải lớn hơn hoặc bằng 0')
    .max(100, 'Trọng số phải nhỏ hơn hoặc bằng 100')
    .required('Trọng số hoàn cảnh kinh tế là bắt buộc'),
  enableNotifications: yup.boolean()
});

const SystemSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [activeTab, setActiveTab] = useState('general'); // 'general', 'risk', 'notifications'

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(settingsSchema)
  });

  useEffect(() => {
    // Simulate fetching data from API
    const fetchSettings = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await api.get('/admin/settings');
        // reset(response.data);
        
        // Simulated data
        setTimeout(() => {
          reset({
            siteName: 'Hệ thống Quản lý và Dự báo Sinh viên Có Nguy cơ Bỏ học',
            contactEmail: 'admin@truonghoc.edu.vn',
            academicYear: '2024-2025',
            semester: 'HK2',
            riskThresholdHigh: 75,
            riskThresholdMedium: 50,
            attendanceWeight: 30,
            gradesWeight: 25,
            disciplinaryWeight: 15,
            economicWeight: 20,
            enableNotifications: true
          });
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching system settings:', error);
        setAlert({ type: 'error', message: 'Không thể tải cài đặt hệ thống' });
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [reset]);

  const onSubmit = async (data) => {
    try {
      // In a real app, this would be an API call
      // await api.put('/admin/settings', data);
      
      // Simulate API call
      console.log('Saving settings:', data);
      
      // Show success message
      setAlert({ type: 'success', message: 'Cài đặt hệ thống đã được lưu thành công' });
      
      // Clear alert after 3 seconds
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error('Error saving system settings:', error);
      setAlert({ type: 'error', message: 'Không thể lưu cài đặt hệ thống' });
    }
  };

  const calculateTotalWeight = (data) => {
    const total = parseFloat(data.attendanceWeight) + 
                  parseFloat(data.gradesWeight) + 
                  parseFloat(data.disciplinaryWeight) + 
                  parseFloat(data.economicWeight);
    return total;
  };

  if (isLoading) {
    return <div className="loading">Đang tải cài đặt hệ thống...</div>;
  }

  return (
    <div className="system-settings p-4">
      <h1 className="text-2xl font-bold mb-6">Cài đặt Hệ thống</h1>

      {alert && (
        <Alert type={alert.type} message={alert.message} className="mb-4" />
      )}

      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'general' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('general')}
          >
            Cài đặt chung
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'risk' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('risk')}
          >
            Cài đặt phân tích rủi ro
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'notifications' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('notifications')}
          >
            Thông báo
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {activeTab === 'general' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Cài đặt chung</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Tên hệ thống"
                id="siteName"
                type="text"
                {...register('siteName')}
                error={errors.siteName?.message}
              />

              <Input
                label="Email liên hệ"
                id="contactEmail"
                type="email"
                {...register('contactEmail')}
                error={errors.contactEmail?.message}
              />

              <Input
                label="Năm học hiện tại"
                id="academicYear"
                type="text"
                {...register('academicYear')}
                error={errors.academicYear?.message}
              />

              <div className="form-group">
                <label htmlFor="semester" className="block mb-1">Học kỳ hiện tại</label>
                <select
                  id="semester"
                  className="w-full p-2 border rounded"
                  {...register('semester')}
                >
                  <option value="HK1">Học kỳ 1</option>
                  <option value="HK2">Học kỳ 2</option>
                  <option value="HK3">Học kỳ 3</option>
                </select>
                {errors.semester && <p className="text-red-500 text-sm mt-1">{errors.semester.message}</p>}
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'risk' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Cài đặt phân tích rủi ro</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Ngưỡng nguy cơ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Ngưỡng nguy cơ cao (%)"
                  id="riskThresholdHigh"
                  type="number"
                  {...register('riskThresholdHigh')}
                  error={errors.riskThresholdHigh?.message}
                />

                <Input
                  label="Ngưỡng nguy cơ trung bình (%)"
                  id="riskThresholdMedium"
                  type="number"
                  {...register('riskThresholdMedium')}
                  error={errors.riskThresholdMedium?.message}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Trọng số các yếu tố (tổng = 100%)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Trọng số điểm danh (%)"
                  id="attendanceWeight"
                  type="number"
                  {...register('attendanceWeight')}
                  error={errors.attendanceWeight?.message}
                />

                <Input
                  label="Trọng số điểm số (%)"
                  id="gradesWeight"
                  type="number"
                  {...register('gradesWeight')}
                  error={errors.gradesWeight?.message}
                />

                <Input
                  label="Trọng số kỷ luật (%)"
                  id="disciplinaryWeight"
                  type="number"
                  {...register('disciplinaryWeight')}
                  error={errors.disciplinaryWeight?.message}
                />

                <Input
                  label="Trọng số hoàn cảnh kinh tế (%)"
                  id="economicWeight"
                  type="number"
                  {...register('economicWeight')}
                  error={errors.economicWeight?.message}
                />
              </div>
              
              <div className="mt-4">
                <p className="font-medium">
                  Tổng trọng số: 
                  <span className={`ml-2 ${calculateTotalWeight({
                    attendanceWeight: errors.attendanceWeight ? 0 : watch('attendanceWeight', 0),
                    gradesWeight: errors.gradesWeight ? 0 : watch('gradesWeight', 0),
                    disciplinaryWeight: errors.disciplinaryWeight ? 0 : watch('disciplinaryWeight', 0),
                    economicWeight: errors.economicWeight ? 0 : watch('economicWeight', 0)
                  }) === 100 ? 'text-green-600' : 'text-red-600'}`}>
                    {/* In a real app, we would use watch() from react-hook-form to dynamically update this */}
                    90%
                  </span>
                </p>
                {calculateTotalWeight({
                  attendanceWeight: 30,
                  gradesWeight: 25,
                  disciplinaryWeight: 15,
                  economicWeight: 20
                }) !== 100 && (
                  <p className="text-red-500 text-sm mt-1">Tổng trọng số phải bằng 100%</p>
                )}
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'notifications' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Cài đặt thông báo</h2>
            
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableNotifications"
                  className="w-4 h-4 mr-2"
                  {...register('enableNotifications')}
                />
                <label htmlFor="enableNotifications" className="font-medium">
                  Bật thông báo tự động
                </label>
              </div>
              <p className="text-gray-500 text-sm mt-1">
                Bật để gửi thông báo tự động cho sinh viên, giáo viên và nhân viên tư vấn khi phát hiện nguy cơ bỏ học.
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Các loại thông báo</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input type="checkbox" id="notifyHighRisk" checked disabled className="w-4 h-4 mr-2" />
                  <label htmlFor="notifyHighRisk" className="font-medium">
                    Thông báo nguy cơ cao
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input type="checkbox" id="notifyMediumRisk" checked disabled className="w-4 h-4 mr-2" />
                  <label htmlFor="notifyMediumRisk" className="font-medium">
                    Thông báo nguy cơ trung bình
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input type="checkbox" id="notifyAttendance" checked disabled className="w-4 h-4 mr-2" />
                  <label htmlFor="notifyAttendance" className="font-medium">
                    Thông báo vắng mặt liên tục
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input type="checkbox" id="notifyGrades" checked disabled className="w-4 h-4 mr-2" />
                  <label htmlFor="notifyGrades" className="font-medium">
                    Thông báo điểm thấp
                  </label>
                </div>
              </div>
              
              <p className="text-gray-500 text-sm mt-4">
                Lưu ý: Các loại thông báo chi tiết sẽ được mở rộng trong phiên bản sắp tới.
              </p>
            </div>
          </Card>
        )}

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="secondary" onClick={() => reset()}>
            Khôi phục mặc định
          </Button>
          <Button type="submit" variant="primary">
            Lưu cài đặt
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SystemSettings;
