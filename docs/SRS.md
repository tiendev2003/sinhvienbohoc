# Đặc tả Yêu cầu Phần mềm (SRS)
# Hệ thống Quản lý và Dự báo Sinh viên Có Nguy cơ Bỏ học

## 1. Giới thiệu

### 1.1. Mục đích
Tài liệu này mô tả đặc tả yêu cầu cho Hệ thống Quản lý và Dự báo Sinh viên Có Nguy cơ Bỏ học. Tài liệu nhằm cung cấp thông tin chi tiết về các chức năng, yêu cầu phi chức năng, ràng buộc, và đặc điểm của hệ thống.

### 1.2. Phạm vi
Hệ thống sẽ cung cấp nền tảng để quản lý thông tin sinh viên, theo dõi kết quả học tập, phân tích và dự báo nguy cơ bỏ học của sinh viên. Hệ thống sẽ hỗ trợ nhiều vai trò người dùng khác nhau bao gồm quản trị viên, giáo viên, nhân viên tư vấn, và sinh viên.

### 1.3. Định nghĩa và từ viết tắt
- **SRS**: Software Requirements Specification (Đặc tả Yêu cầu Phần mềm)
- **GPA**: Grade Point Average (Điểm Trung bình)
- **ML**: Machine Learning (Học máy)
- **UI**: User Interface (Giao diện Người dùng)

### 1.4. Tổng quan
Phần tiếp theo của tài liệu sẽ mô tả tổng quan về hệ thống, bao gồm các chức năng, đặc điểm, và ràng buộc. Tiếp theo là các yêu cầu cụ thể, bao gồm yêu cầu chức năng và phi chức năng. Cuối cùng là các mô hình, biểu đồ, và tài liệu bổ sung.

## 2. Tổng quan Hệ thống

### 2.1. Mô tả Hệ thống
Hệ thống Quản lý và Dự báo Sinh viên Có Nguy cơ Bỏ học là một nền tảng phần mềm được thiết kế để giúp các tổ chức giáo dục xác định và hỗ trợ sinh viên có nguy cơ bỏ học. Hệ thống sử dụng phân tích dữ liệu và học máy để dự đoán khả năng bỏ học dựa trên nhiều yếu tố như điểm số, tỷ lệ điểm danh, hoàn cảnh kinh tế và các vấn đề kỷ luật.

### 2.2. Chức năng Sản phẩm
- Quản lý thông tin người dùng (sinh viên, giáo viên, nhân viên tư vấn, quản trị viên)
- Quản lý thông tin lớp học và môn học
- Ghi nhận và theo dõi điểm số
- Theo dõi điểm danh và tham gia lớp học
- Quản lý thông tin về vi phạm kỷ luật
- Phân tích và dự báo nguy cơ bỏ học
- Báo cáo và thống kê
- Hệ thống thông báo và cảnh báo

### 2.3. Người dùng và Đặc điểm
1. **Quản trị viên**:
   - Quản lý toàn bộ hệ thống
   - Phân quyền cho người dùng
   - Truy cập tất cả các chức năng và báo cáo

2. **Giáo viên**:
   - Quản lý lớp học và môn học
   - Nhập điểm và theo dõi điểm danh
   - Xem báo cáo về tình hình học tập của sinh viên
   - Nhận thông báo về sinh viên có nguy cơ bỏ học

3. **Nhân viên Tư vấn**:
   - Xem thông tin và báo cáo về sinh viên
   - Theo dõi sinh viên có nguy cơ bỏ học
   - Ghi nhận các buổi tư vấn và kết quả

4. **Sinh viên**:
   - Xem thông tin cá nhân và kết quả học tập
   - Đăng ký lớp học
   - Nhận thông báo và cảnh báo

5. **Phụ huynh**:
   - Xem thông tin và kết quả học tập của con
   - Nhận thông báo và cảnh báo

### 2.4. Môi trường Hoạt động
- Ứng dụng web hoạt động trên các trình duyệt hiện đại
- Ứng dụng di động (tùy chọn) cho iOS và Android
- Máy chủ đặt tại cơ sở giáo dục hoặc trên đám mây

## 3. Yêu cầu Chức năng

### 3.1. Quản lý Người dùng

#### 3.1.1. Đăng ký và Đăng nhập
- Hệ thống sẽ cho phép người dùng đăng ký tài khoản mới
- Hệ thống sẽ xác thực người dùng thông qua tên đăng nhập và mật khẩu
- Hệ thống sẽ hỗ trợ khôi phục mật khẩu qua email

#### 3.1.2. Quản lý Hồ sơ
- Người dùng có thể xem và chỉnh sửa thông tin cá nhân
- Quản trị viên có thể tạo và quản lý tài khoản cho tất cả người dùng
- Hệ thống lưu trữ thông tin chi tiết về sinh viên bao gồm thông tin học tập và hoàn cảnh gia đình

#### 3.1.3. Phân quyền
- Hệ thống phân quyền dựa trên vai trò (admin, teacher, student, counselor, parent)
- Quản trị viên có thể chỉ định vai trò cho người dùng

### 3.2. Quản lý Lớp học và Môn học

#### 3.2.1. Quản lý Lớp học
- Tạo và chỉnh sửa thông tin lớp học
- Chỉ định giáo viên chủ nhiệm
- Quản lý danh sách sinh viên trong lớp
- Theo dõi lịch học và tiến độ

#### 3.2.2. Quản lý Môn học
- Tạo và chỉnh sửa thông tin môn học
- Quản lý điểm số và đánh giá
- Thiết lập các môn tiên quyết
- Quản lý đề cương môn học

### 3.3. Theo dõi Học tập

#### 3.3.1. Quản lý Điểm số
- Nhập và chỉnh sửa điểm số (bài tập, giữa kỳ, cuối kỳ)
- Tính toán GPA tự động
- Hiển thị bảng điểm cho sinh viên và giáo viên

#### 3.3.2. Điểm danh
- Ghi nhận sự tham gia của sinh viên
- Tính toán tỷ lệ điểm danh
- Cảnh báo khi sinh viên vắng mặt liên tục

### 3.4. Dự báo Nguy cơ Bỏ học

#### 3.4.1. Thu thập Dữ liệu
- Thu thập dữ liệu từ nhiều nguồn (điểm số, điểm danh, vi phạm kỷ luật, hoàn cảnh kinh tế)
- Lưu trữ và xử lý dữ liệu

#### 3.4.2. Phân tích và Dự báo
- Sử dụng thuật toán học máy để phân tích dữ liệu
- Dự báo nguy cơ bỏ học
- Xác định các yếu tố nguy cơ

#### 3.4.3. Cảnh báo và Thông báo
- Tạo cảnh báo cho sinh viên có nguy cơ cao
- Thông báo cho giáo viên và nhân viên tư vấn
- Theo dõi và cập nhật tình trạng

### 3.5. Báo cáo và Thống kê

#### 3.5.1. Báo cáo Sinh viên
- Báo cáo chi tiết về từng sinh viên
- Lịch sử học tập và kết quả
- Các cảnh báo và vấn đề

#### 3.5.2. Báo cáo Lớp học
- Tổng quan về kết quả lớp học
- So sánh hiệu suất giữa các lớp
- Thống kê về tỷ lệ đậu/rớt

#### 3.5.3. Báo cáo Phân tích
- Phân tích xu hướng và mẫu
- Hiệu quả của các biện pháp can thiệp
- Dự báo dài hạn

## 4. Yêu cầu Phi Chức năng

### 4.1. Yêu cầu về Hiệu suất
- Hệ thống phải hỗ trợ ít nhất 1000 người dùng đồng thời
- Thời gian phản hồi cho các truy vấn cơ bản phải dưới 2 giây
- Thời gian phản hồi cho các phân tích phức tạp có thể lên đến 10 giây

### 4.2. Yêu cầu về Bảo mật
- Dữ liệu người dùng phải được mã hóa khi lưu trữ và truyền tải
- Áp dụng các biện pháp bảo mật tiêu chuẩn công nghiệp
- Tuân thủ các quy định về bảo vệ dữ liệu cá nhân
- Kiểm tra và ghi nhật ký tất cả các hoạt động quan trọng

### 4.3. Yêu cầu về Khả năng Sử dụng
- Giao diện người dùng trực quan và dễ học
- Hỗ trợ nhiều ngôn ngữ (tiếng Việt và tiếng Anh)
- Thiết kế đáp ứng cho nhiều kích thước màn hình
- Hỗ trợ người dùng khuyết tật

### 4.4. Yêu cầu về Tính Sẵn sàng
- Hệ thống phải hoạt động 24/7 với thời gian ngừng hoạt động tối thiểu
- Phương án sao lưu và khôi phục dữ liệu
- Kế hoạch khắc phục thảm họa

### 4.5. Yêu cầu về Khả năng Mở rộng
- Khả năng mở rộng để hỗ trợ tăng số lượng người dùng
- Kiến trúc mô-đun để dễ dàng thêm chức năng mới
- API để tích hợp với các hệ thống khác

## 5. Mô hình Dữ liệu

### 5.1. Sơ đồ Cơ sở Dữ liệu
Hệ thống sử dụng cơ sở dữ liệu quan hệ với các bảng chính sau:

- users: Lưu thông tin người dùng
- students: Lưu thông tin chi tiết về sinh viên
- classes: Quản lý thông tin lớp học
- subjects: Quản lý thông tin môn học
- class_students: Liên kết giữa lớp học và sinh viên
- grades: Lưu trữ điểm số
- disciplinary_records: Ghi nhận vi phạm kỷ luật
- dropout_risks: Lưu trữ phân tích nguy cơ bỏ học

### 5.2. Mối quan hệ Thực thể
[Ở đây sẽ có sơ đồ ERD]

## 6. Giao diện Người dùng

### 6.1. Bảng điều khiển (Dashboard)
- Tổng quan về dữ liệu và thông tin
- Biểu đồ và đồ thị thống kê
- Thông báo và cảnh báo mới nhất

### 6.2. Quản lý Sinh viên
- Danh sách sinh viên với bộ lọc và tìm kiếm
- Xem chi tiết hồ sơ sinh viên
- Chỉnh sửa thông tin sinh viên

### 6.3. Quản lý Lớp học
- Danh sách lớp học
- Quản lý sinh viên trong lớp
- Nhập điểm và điểm danh

### 6.4. Phân tích Nguy cơ
- Bảng điều khiển phân tích
- Báo cáo chi tiết về từng sinh viên
- Công cụ mô phỏng và dự báo

## 7. Kế hoạch Triển khai

### 7.1. Phương pháp Phát triển
- Phát triển theo phương pháp Agile
- Sprint 2 tuần với các buổi họp thường xuyên
- Phát hành định kỳ với các tính năng mới

### 7.2. Lịch trình
- Giai đoạn 1: Phát triển cơ sở dữ liệu và các chức năng cơ bản (2 tháng)
- Giai đoạn 2: Phát triển giao diện người dùng và chức năng nâng cao (3 tháng)
- Giai đoạn 3: Phát triển hệ thống phân tích và dự báo (2 tháng)
- Giai đoạn 4: Kiểm thử và tinh chỉnh (1 tháng)

### 7.3. Đào tạo và Hỗ trợ
- Tài liệu hướng dẫn người dùng
- Video đào tạo
- Hỗ trợ trực tuyến và trợ giúp trong ứng dụng

## 8. Phụ lục

### 8.1. Thuật ngữ
[Danh sách các thuật ngữ và định nghĩa]

### 8.2. Tài liệu Tham khảo
[Danh sách các tài liệu tham khảo và tiêu chuẩn]

### 8.3. Lịch sử Phiên bản
- Phiên bản 1.0: Tài liệu ban đầu
