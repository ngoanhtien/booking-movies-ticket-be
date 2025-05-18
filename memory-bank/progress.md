# Progress Tracking

## What Works
- Project initialization with React and TypeScript
- Material-UI theme configuration with responsive design
- Basic routing structure with role-based access control
- **Seat Management and Booking Flow**:
  - Seat layout stabilization using seededRandom and localStorage persistence
  - WebSocket integration for real-time seat selection synchronization
  - Booking flow with multi-step process and summary bar
  - QR Payment integration with SePay/MoMo and countdown timer
  - Direct navigation from MovieDetails showtime click to SeatSelectionPage
  - ✅ Booking system fully functional with data correctly saved to the database (fixed May 19, 2024)
  - ✅ Booking history correctly displayed using the proper `/user/bookings` endpoint (fixed May 19, 2024)
- **User Experience**:
  - Authentication & Registration flows with JWT
  - Movie browsing with filtering and search capabilities
  - User profile management including avatar upload
  - Responsive design for mobile and desktop
  - Dark mode support with MUI theming
  - Multi-language support (English and Vietnamese)
- **Admin Features**:
  - Movie management (CRUD operations)
  - User management with role-based permissions
  - Schedule and showtime management
  - Statistics and reporting (daily/weekly/monthly)
- **Backend APIs**:
  - RESTful API design across all services
  - Swagger documentation for API endpoints
  - Spring Boot microservices architecture
  - Robust input validation and error handling
  - JWT-based authentication & authorization
  - Database integration with PostgreSQL

## What's Left to Build
1. Frontend Features
   - **Booking Flow Fix** ✅ **RESOLVED**
     - ~~Fix issue with seat booking not being saved to database~~ (Fixed May 19, 2024)
   - **API Integration for Admin Panel**
     - Replace mock data with real API data in admin services
     - Implement proper error handling and loading states
     - Use React Query for improved data fetching
   - **MoMo-Inspired Booking Flow Enhancements**
     - Enhance MovieList.tsx with improved "Now Showing" vs. "Coming Soon" sections
     - Upgrade MovieDetails.tsx with cast/crew info and embedded trailers
     - Implement standalone Cinema/Theater selection step
     - Improve seat selection UI with seat types and pricing
     - Enhance food & drink selection with size options
     - Refine confirmation & payment UI
     - Improve booking history page with QR code/barcode for tickets

## Current Status (Cập nhật ngày 19/05/2024)
- ✅ Booking system critical issues have been identified and fixed (May 19, 2024)
  - Frontend was using `fetch()` instead of `axiosInstance` for API calls
  - Requests were being sent to frontend server instead of backend server
  - Solution: replaced `fetch()` with `axiosInstance.post()` in `bookingService.ts`
  - Fixed booking history endpoint by adding correct `/api/v1/` prefix
- Admin interface basic structure is complete with mock data
- Authentication & authorization functioning correctly
- Movie browsing UI implemented with search and filtering
- Booking system core implemented with WebSocket for real-time updates
- User review system implemented for watched movies
- QR Payment integration completed with countdown timer and status checking
- Direct navigation from MovieDetails showtime click to SeatSelectionPage successfully implemented

## Known Issues (Cập nhật ngày 19/05/2024)
- ~~**Ghế bị reset/có thể đặt lại (CRITICAL):**~~ [RESOLVED]
  - ~~**Vấn đề:** Người dùng đặt vé thành công, nhưng sau đó có thể đặt lại chính những ghế đó, hoặc ghế tự reset về "trống".~~
  - ~~**Nguyên nhân tiềm ẩn:** Vấn đề với tính bền vững của giao dịch lưu vào database trong `BookingServiceImpl.createBooking()`.~~
  - **Đã giải quyết:** Vấn đề được xác định là do frontend sử dụng `fetch()` với URL tương đối thay vì `axiosInstance`, khiến requests không được gửi đến backend server.
- ~~**Lịch sử đặt vé không hiển thị:**~~ [RESOLVED]
  - ~~**Vấn đề:** Người dùng không thấy lịch sử đặt vé sau khi hoàn tất. Log backend cho thấy `NoResourceFoundException` cho endpoint `/api/v1/user/bookings`.~~
  - **Đã giải quyết:** Endpoint trong frontend sử dụng đường dẫn không chính xác (`/user/bookings` thay vì `/api/v1/user/bookings`).
- Need to implement proper loading states for API calls in admin panel
- Improve responsive design for smaller screens in MovieDetails page
- Add more comprehensive test coverage
- Address backend warnings (MapStruct, open-in-view)

## Next Steps (Cập nhật ngày 19/05/2024)
1. **Kiểm thử toàn diện luồng đặt vé (HIGH PRIORITY)**:
   - ✅ Đã xác định và sửa nguyên nhân của vấn đề booking
   - ✅ Đã sửa lỗi lịch sử đặt vé không hiển thị
   - Kiểm tra quá trình đặt vé từ đầu đến cuối
   - Xác nhận dữ liệu ghế được lưu đúng và trạng thái được duy trì

2. **Admin Panel API Integration (HIGH PRIORITY)**:
   - Replace mock data with real API calls, starting with movieService.ts
   - Implement React Query for improved data fetching
   - Add proper loading states and error handling

3. **MoMo-Inspired Booking Flow Enhancements (MEDIUM PRIORITY)**:
   - Improve MovieList.tsx with better section visualization
   - Enhance MovieDetails.tsx with more complete information
   - Upgrade seat selection UI with seat types and pricing
   - Improve food & drink selection experience

## Evolution of Project Decisions (Cập nhật ngày 19/05/2024)
- **API Communication Strategy**: Identified the importance of using configured `axiosInstance` instead of direct `fetch()` calls to ensure proper communication with the backend server. This was a critical lesson in understanding how the proxy configuration works in development environments.
- **Frontend-Backend Communication**: Learned that when using relative URLs with `fetch()`, requests go to the frontend server (localhost:3000) instead of the backend server, but `axiosInstance` correctly routes requests to the backend server due to its configuration.
- **API Endpoint Consistency**: Recognized the importance of consistent API endpoint naming with `/api/v1/` prefix for all backend communication.
- **Error Handling Enhancement**: Implemented more robust error handling with detailed logging to better diagnose issues.
- **Debugging Focus Shift:** Từ việc tập trung vào WebSocket và cache, đã chuyển hướng sang điều tra sâu về logic lưu trữ database và quản lý transaction trong `BookingServiceImpl` do tính chất nghiêm trọng và dai dẳng của lỗi reset ghế.
- **JSON Serialization Strategy**: Moved from broad @JsonIgnore to fine-grained @JsonManagedReference/@JsonBackReference for specific relationships
- **UI Component Simplification**: Opted for simpler standard components when facing dependency issues (e.g., Date picker)
- **Concurrency Control**: Implemented database-level pessimistic locking for seat booking instead of application-level validation

## Technical Debt
- Implement comprehensive logging strategy for both frontend and backend
- Implement data caching strategies
- Address backend warnings (MapStruct, open-in-view)
- Review and enforce data constraints (e.g., Cinema.address)
- Add more comprehensive test coverage
- Enhance error handling across all components

## Backend Logic Refinements
- **SeatSocketController**: Tinh chỉnh logic trong `SeatSocketController` (xử lý `cleanupExpiredReservations`, `releaseSeat`) và `ShowtimeController` (xử lý `addShowtimes...`) để bảo vệ trạng thái ghế `BOOKED` tốt hơn.
- **Entity Relationships**: Cải thiện mối quan hệ entity giữa `Booking`, `Bill`, `ShowtimeSeat`.
- **BookingServiceImpl**: Thêm logging rất chi tiết vào `BookingServiceImpl.createBooking` để phục vụ gỡ lỗi.
- **Frontend-Backend Communication**: Sửa chữa vấn đề giao tiếp giữa frontend và backend bằng cách sử dụng `axiosInstance` thay vì `fetch()` trực tiếp cho API calls.