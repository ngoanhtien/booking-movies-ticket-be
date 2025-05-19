# Movie Ticket Booking System

Một hệ thống đặt vé xem phim hiện đại, được xây dựng với Spring Boot (backend) và React (frontend), giúp khách hàng đặt vé xem phim và quản lý rạp chiếu phim một cách hiệu quả.

## Tổng quan hệ thống

### Backend (API)
- **Công nghệ**: Spring Boot 3.4.4, Spring Security, Spring Data JPA
- **Ngôn ngữ**: Java 17
- **Cơ sở dữ liệu**: PostgreSQL
- **API**: RESTful API
- **Xác thực**: JWT (JSON Web Token)
- **WebSocket**: Hỗ trợ đồng bộ hóa theo thời gian thực
- **Tích hợp thanh toán**: QR Code (SePay/MoMo)

### Frontend (Admin Interface)
- **Công nghệ**: React 18, TypeScript, Material-UI 5
- **State Management**: React Query, Context API
- **Routing**: React Router v6
- **Form Handling**: Formik, Yup
- **Internationalization**: i18next
- **Build Tool**: Create React App
- **Visualization**: Recharts

## Mục tiêu dự án

Mục tiêu chính của dự án là xây dựng một hệ thống đặt vé xem phim toàn diện với hai giao diện riêng biệt:

1. **Giao diện người dùng**: Giúp khách hàng dễ dàng tìm kiếm phim, xem thông tin chi tiết, đặt vé và thanh toán trực tuyến.

2. **Giao diện quản trị**: Cung cấp công cụ quản lý toàn diện cho các rạp chiếu phim, bao gồm quản lý phim, lịch chiếu, rạp chiếu, đặt vé và báo cáo thống kê.

## Tính năng chính

### Dành cho khách hàng
- Xem danh sách phim hiện tại và sắp chiếu
- Xem thông tin chi tiết phim (bao gồm lịch chiếu)
- Đặt vé xem phim trực tuyến
- Chọn ghế ngồi và thanh toán
- Quản lý lịch sử đặt vé
- Đánh giá phim
- Đồng bộ hóa ghế theo thời gian thực (WebSocket)
- Thanh toán qua QR code (SePay/MoMo)

### Dành cho quản trị viên
- Quản lý phim (thêm, sửa, xóa)
- Quản lý lịch chiếu
- Quản lý rạp chiếu và phòng chiếu
- Quản lý đặt vé
- Quản lý người dùng
- Thống kê doanh thu
- Quản lý khuyến mãi
- Quản lý thông báo
- Xuất báo cáo sang Excel

## Quy trình đặt vé

Hệ thống cung cấp quy trình đặt vé trực quan và dễ sử dụng:

1. **Chọn phim**: Người dùng tìm kiếm và chọn phim muốn xem
2. **Chọn lịch chiếu**: Chọn rạp, ngày và giờ chiếu phù hợp
3. **Chọn ghế ngồi**: Hiển thị sơ đồ phòng chiếu và chọn ghế (đồng bộ theo thời gian thực)
4. **Chọn đồ ăn (tùy chọn)**: Thêm đồ ăn, nước uống vào đơn hàng
5. **Xem tóm tắt đơn hàng**: Xác nhận thông tin đặt vé
6. **Thanh toán**: Chọn phương thức thanh toán (QR code) và hoàn tất giao dịch
7. **Nhận vé điện tử**: Vé được gửi qua email hoặc hiển thị trong tài khoản

## Tính năng nổi bật

### Đồng bộ hóa ghế theo thời gian thực
- Hiển thị ghế đang được người dùng khác chọn với màu khác và hiệu ứng nhấp nháy
- Ngăn chặn việc người dùng chọn ghế đang được người khác chọn
- Thông báo và tự động cập nhật khi có người khác đặt ghế mà người dùng đang chọn
- Hiển thị trạng thái kết nối WebSocket để người dùng biết có đang đồng bộ hay không

### Thanh toán QR Code
- Tích hợp với SePay/MoMo
- Hiển thị mã QR kèm theo thông tin đặt vé
- Bộ đếm thời gian để theo dõi thời gian thanh toán còn lại
- Kiểm tra trạng thái thanh toán tự động
- Chuyển hướng tự động sau khi thanh toán thành công

### Hệ thống đánh giá phim
- Người dùng chỉ có thể đánh giá phim sau khi đã xem
- Kiểm tra lịch sử đặt vé để xác định tư cách đánh giá
- Hiển thị đánh giá của người dùng khác
- Tính toán điểm đánh giá trung bình

## Cấu trúc dự án

```
booking-movies-ticket-be/
│
├── admin-interface/       # Frontend React
│   ├── src/               # Mã nguồn React
│   │   ├── components/    # Các component tái sử dụng
│   │   ├── pages/         # Các trang của ứng dụng
│   │   │   ├── admin/     # Giao diện quản trị
│   │   │   └── user/      # Giao diện người dùng
│   │   ├── services/      # Gọi API
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Tiện ích
│   │   ├── context/       # React Context
│   │   ├── types/         # Định nghĩa TypeScript
│   │   └── ...
│   ├── public/            # Tài nguyên tĩnh
│   └── package.json       # Dependencies và scripts
│
└── src/                   # Backend Spring Boot
    ├── main/
    │   ├── java/          # Mã nguồn Java
    │   │   └── com/booking/movieticket/
    │   │       ├── controller/   # REST Controllers
    │   │       ├── service/      # Business Logic
    │   │       ├── repository/   # Data Access
    │   │       ├── entity/       # JPA Entities
    │   │       ├── dto/          # Data Transfer Objects
    │   │       ├── security/     # Security Configuration
    │   │       ├── exception/    # Exception Handling
    │   │       ├── config/       # Application Configuration
    │   │       ├── util/         # Utilities
    │   │       ├── mapper/       # DTO-Entity Mappers
    │   │       └── ...
    │   └── resources/     # Tài nguyên và cấu hình
    │       ├── application.yml    # Cấu hình chính
    │       ├── data.sql           # Dữ liệu mẫu
    │       └── mailtemplate/      # Mẫu email
    └── test/              # Unit tests
```

## Yêu cầu hệ thống

### Backend
- Java Development Kit (JDK) 17 trở lên
- PostgreSQL 12 trở lên
- Gradle

### Frontend
- Node.js 16 trở lên
- npm hoặc yarn

## Hướng dẫn cài đặt và chạy

### Cài đặt PostgreSQL
1. Tải và cài đặt PostgreSQL từ trang chủ: https://www.postgresql.org/download/
2. Tạo một database mới
3. Cập nhật thông tin kết nối database trong file `src/main/resources/application.yml`

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/tên_database_của_bạn
    username: postgres
    password: mật_khẩu_của_bạn
    driver-class-name: org.postgresql.Driver
```

### Chạy Backend (Spring Boot)
1. Đảm bảo JDK 17 được cài đặt và cấu hình đúng
2. Mở terminal và điều hướng đến thư mục gốc của dự án
3. Chạy lệnh để build và khởi động ứng dụng:

```bash
# Trên Linux/macOS
./gradlew bootRun

# Trên Windows
gradlew.bat bootRun
```

4. Ứng dụng sẽ tự động tạo các bảng trong database khi khởi động lần đầu tiên (nhờ `spring.jpa.hibernate.ddl-auto: update`)
5. Để khởi tạo dữ liệu mẫu, bạn có thể sử dụng file `src/main/resources/data.sql` bằng cách thay đổi cấu hình trong `application.yml`:

```yaml
spring:
  sql:
    init:
      mode: always  # Thay đổi từ never thành always
```

Backend sẽ chạy tại địa chỉ: http://localhost:8080

### Chạy Frontend (React)
1. Đảm bảo Node.js và npm được cài đặt
2. Mở terminal và điều hướng đến thư mục admin-interface
```bash
cd admin-interface 
```
3. Cài đặt các dependencies:
```bash
npm install --legacy-peer-deps
```
4. Khởi động ứng dụng React:
```bash
npm start
```

Frontend sẽ chạy tại địa chỉ: http://localhost:3000

### Tạo dữ liệu giả lập

Để tạo lịch chiếu giả lập cho các phim hiện tại, bạn có thể sử dụng API sau:

```bash
# Tạo lịch chiếu cho các phim đang hoạt động
curl -X POST http://localhost:8080/api/v1/showtime/public/add-showtimes-for-active-movies
```
Invoke-WebRequest -Method POST -Uri "http://localhost:8080/api/v1/showtime/public/add-showtimes-for-active-movies"

## API Documentation

- Các API endpoints của hệ thống được cung cấp tại đường dẫn: `/api/v1/**`
- Mọi API đều cần xác thực (trừ các API công khai như đăng nhập, đăng ký)
- Xác thực sử dụng JWT (JSON Web Token)

### Các API chính:
- Authentication: `/api/v1/auth/**`
  - POST `/api/v1/auth/login` - Đăng nhập
  - POST `/api/v1/auth/register` - Đăng ký
  - GET `/api/v1/auth/refresh` - Làm mới token
- Movies: `/api/v1/movies/**`
  - GET `/api/v1/movies` - Danh sách phim
  - GET `/api/v1/movies/{id}` - Chi tiết phim
  - POST `/api/v1/movies` - Thêm phim mới
  - PUT `/api/v1/movies/{id}` - Cập nhật phim
- Showtimes: `/api/v1/showtime/**`
  - GET `/api/v1/showtime/movie/{movieId}/by-date` - Lịch chiếu theo phim và ngày
  - POST `/api/v1/showtime` - Thêm lịch chiếu mới
  - POST `/api/v1/showtime/public/add-showtimes-for-active-movies` - Tạo lịch chiếu tự động
- Bookings: `/api/v1/bookings/**`
  - POST `/api/v1/bookings` - Tạo đặt vé mới
  - GET `/api/v1/bookings/user` - Danh sách đặt vé của người dùng
- Users: `/api/v1/users/**`
  - GET `/api/v1/users/me` - Thông tin người dùng hiện tại
- Reviews: `/api/v1/reviews/**`
  - POST `/api/v1/reviews` - Đánh giá phim
  - GET `/api/v1/reviews/movie/{movieId}` - Danh sách đánh giá của phim

## Tài khoản mặc định

Sau khi khởi tạo dữ liệu mẫu, bạn có thể sử dụng các tài khoản sau:

### Admin
- **Username**: admin@example.com
- **Password**: Admin@123

### User
- **Username**: user@example.com
- **Password**: User@123

## Phân quyền hệ thống

Hệ thống sử dụng Spring Security với JWT để quản lý phân quyền. Có 2 vai trò chính:

1. **ROLE_USER**:
   - Truy cập giao diện người dùng
   - Xem danh sách phim và lịch chiếu
   - Đặt vé xem phim
   - Quản lý thông tin cá nhân
   - Đánh giá phim (sau khi đã xem)

2. **ROLE_ADMIN**:
   - Tất cả quyền của ROLE_USER
   - Truy cập giao diện quản trị
   - Quản lý phim, lịch chiếu, rạp chiếu
   - Quản lý người dùng
   - Xem báo cáo và thống kê
   - Quản lý khuyến mãi và thông báo

## Tính năng bảo mật

1. **JWT Authentication**:
   - Token-based authentication với access token và refresh token
   - Access token có thời hạn 24 giờ
   - Refresh token có thời hạn dài hơn (30 ngày)
   - Lưu trữ token trong localStorage

2. **Bảo mật đặt ghế**:
   - Sử dụng WebSocket để đồng bộ trạng thái ghế theo thời gian thực
   - Pessimistic locking để ngăn chặn đặt trùng ghế
   - Kiểm tra xác thực token trước khi thực hiện các thao tác nhạy cảm

3. **Bảo mật thanh toán**:
   - Tích hợp với SePay/MoMo để xử lý thanh toán an toàn
   - QR code có thời hạn sử dụng (timeout)
   - Kiểm tra trạng thái thanh toán trước khi xác nhận đặt vé

## Tính năng và thư viện nổi bật

### Backend
- **Spring Security**: Xác thực và phân quyền
- **JWT**: Xác thực token-based
- **Spring Data JPA**: ORM và truy cập dữ liệu
- **WebSocket**: Đồng bộ hóa trạng thái ghế theo thời gian thực
- **Lombok**: Giảm mã boilerplate
- **MapStruct**: Chuyển đổi giữa DTO và Entity
- **Validation**: Kiểm tra dữ liệu đầu vào
- **Apache POI**: Xuất báo cáo Excel

### Frontend
- **Material UI**: Component library
- **React Query**: Quản lý và cache API
- **Formik & Yup**: Xử lý form và validation
- **i18next**: Đa ngôn ngữ (Tiếng Việt)
- **React Router**: Điều hướng
- **TypeScript**: Type safety
- **Recharts**: Biểu đồ và thống kê
- **WebSocket (SockJS & STOMP)**: Đồng bộ hóa ghế theo thời gian thực

## Lịch sử phát triển

Dự án đã trải qua nhiều giai đoạn phát triển:

1. **Khởi tạo dự án**:
   - Cấu hình Spring Boot backend và React frontend
   - Thiết lập cơ sở dữ liệu PostgreSQL
   - Cấu hình authentication với JWT

2. **Phát triển giao diện quản trị**:
   - Xây dựng dashboard
   - Phát triển các module quản lý (phim, lịch chiếu, người dùng, v.v.)
   - Tích hợp biểu đồ và báo cáo

3. **Phát triển giao diện người dùng**:
   - Xây dựng trang danh sách phim
   - Xây dựng trang chi tiết phim
   - Phát triển quy trình đặt vé

4. **Tích hợp WebSocket**:
   - Triển khai đồng bộ hóa ghế theo thời gian thực
   - Xử lý các trường hợp đặc biệt (mất kết nối, đặt trùng)

5. **Tích hợp thanh toán**:
   - Triển khai thanh toán QR code với SePay/MoMo
   - Xử lý các trạng thái thanh toán

6. **Đa ngôn ngữ và tối ưu hóa**:
   - Thêm hỗ trợ tiếng Việt
   - Tối ưu hiệu suất
   - Cải thiện trải nghiệm người dùng

## Thông tin triển khai

Khi triển khai vào môi trường production, hãy đảm bảo thực hiện các bước sau:

1. Cấu hình HTTPS cho cả backend và frontend
2. Cập nhật các thông tin nhạy cảm (mật khẩu DB, key JWT, v.v.) vào biến môi trường
3. Cấu hình CORS chính xác
4. Tối ưu cơ sở dữ liệu và cấu hình connection pooling
5. Build frontend với `npm run build` và triển khai các file tĩnh

## Những điểm cần lưu ý

1. JWT secret key được cấu hình trong `application.yml` nên được thay đổi trong môi trường sản xuất
2. Mật khẩu và thông tin database trong file `application.yml` nên được cập nhật phù hợp
3. Frontend proxy được cấu hình trong `package.json` để gọi API tới backend tại `http://localhost:8080`
4. Cài đặt email SMTP trong `application.yml` cần được cập nhật để sử dụng chức năng gửi email
5. Để tránh lỗi WebSocket khi triển khai, đảm bảo cấu hình endpoint trong `WebSocketConfig.java` phù hợp

## Liên hệ hỗ trợ

Nếu có bất kỳ câu hỏi hoặc gặp vấn đề trong quá trình cài đặt và sử dụng, vui lòng liên hệ:

- Email: support@movieticketbooking.com
- Điện thoại: (XX) XXXX-XXXX 