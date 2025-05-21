# Hệ thống Quản lý và Dự báo Sinh viên Có Nguy cơ Bỏ học - Frontend

Đây là phần Frontend của Hệ thống Quản lý và Dự báo Sinh viên Có Nguy cơ Bỏ học, được xây dựng bằng React và Vite.

## Tính năng

- Quản lý thông tin người dùng (sinh viên, giáo viên, nhân viên tư vấn, quản trị viên)
- Quản lý thông tin lớp học và môn học
- Ghi nhận và theo dõi điểm số
- Theo dõi điểm danh và tham gia lớp học
- Quản lý thông tin về vi phạm kỷ luật
- Phân tích và dự báo nguy cơ bỏ học
- Báo cáo và thống kê
- Hệ thống thông báo và cảnh báo

## Cách cài đặt

1. Cài đặt Node.js (phiên bản 14.x trở lên)
2. Clone repository này
3. Chạy file `install_packages.bat` để cài đặt các thư viện cần thiết hoặc chạy lệnh sau:

```bash
npm install
```

## Cách chạy ứng dụng

1. Di chuyển vào thư mục frontend:

```bash
cd d:\trancongtien\python\sinhvienbohoc\fe
```

2. Chạy ứng dụng ở môi trường phát triển:

```bash
npm run dev
```

Ứng dụng sẽ chạy trên http://localhost:5173/

## Cấu trúc thư mục

- `src/assets/`: Chứa tài nguyên tĩnh như hình ảnh, biểu tượng
- `src/components/`: Chứa các thành phần UI tái sử dụng
- `src/context/`: Chứa các Context Providers
- `src/hooks/`: Chứa custom hooks
- `src/layouts/`: Chứa các layout cho các vai trò người dùng khác nhau
- `src/pages/`: Chứa các trang chính của ứng dụng
- `src/routes/`: Chứa cấu hình routing
- `src/services/`: Chứa các service để gọi API
- `src/store/`: Chứa state management (nếu sử dụng Redux hoặc Zustand)
- `src/utils/`: Chứa các hàm tiện ích

## Công nghệ sử dụng

- React 19
- Vite
- React Router v7
- Axios
- Chart.js (Data visualization)
 
