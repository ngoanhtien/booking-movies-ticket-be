# Active Context

## Current Focus
**Đã triển khai tính năng đồng bộ thời gian thực (WebSocket) cho quá trình chọn ghế trong đặt vé. Tính năng này giúp người dùng thấy được ghế đang được chọn bởi người khác theo thời gian thực, tránh tình trạng nhiều người cùng chọn một ghế và tranh chấp khi thanh toán. Ngoài ra đã thêm thanh thông tin tổng hợp ở cuối mỗi bước đặt vé hiển thị số ghế đã chọn, đồ ăn đã chọn và tổng tiền.**

**The "Thanh toán bằng mã QR tích hợp SePay" (QR code payment with SePay integration) feature has been implemented. This feature allows users to make payments using QR codes, with a 5-minute countdown timer, clear payment information display, and automatic status updates. The implementation includes both backend APIs and frontend components for generating QR codes, displaying booking information, and handling payment flow.**

**Previously, the "Người dùng đã xem phim có thể bình luận" (Users who have watched a movie can comment/review) feature was implemented. This included backend logic for checking eligibility (paid booking, past showtime), creating reviews, and frontend integration on the `MovieDetails.tsx` page. A key bug related to querying `Showtime.startTime` (which doesn't exist directly on `Showtime`) was resolved by querying `Schedule.date` and `Schedule.timeStart` separately.**

**Two other key features have also been implemented:**
1. **"Đồng bộ trạng thái ghế và khoá pessimistic lock" (Synchronize seat status and pessimistic lock)**: Implemented pessimistic locking for seat selection using `@Lock(LockModeType.PESSIMISTIC_WRITE)` to prevent race conditions during booking.
2. **"API tìm kiếm phim đang chưa tìm chính xác" (Movie search API accuracy fix)**: Fixed movie search functionality to be more precise, focusing on movie name rather than other fields to ensure more relevant search results.

The previous focus on "Admin Panel API Integration" and "MoMo-Inspired Booking Flow Enhancement" for `MovieList.tsx` remain important ongoing tasks.

### Admin Panel API Integration (LATEST)
- **Current State**: Admin panel hiện đang sử dụng dữ liệu mẫu (mock data) thay vì kết nối với backend API thực.
- **Problem**: Sau khi đã giải quyết vấn đề xác thực và quyền truy cập cho người dùng ADMIN, cần thay thế dữ liệu mẫu bằng dữ liệu thật từ API để quản lý hiệu quả.
- **Implementation Plan**:
  1. **Kiểm tra & Cập nhật Service Layer**:
     - Xem xét tất cả service files trong `admin-interface/src/services/`
     - Thay thế các hàm trả về mock data bằng API calls thực tế
     - Đảm bảo interceptor được cấu hình đúng để đính kèm JWT token
  2. **Thứ Tự Ưu Tiên**:
     - `movieService`: quản lý phim (CRUD operations)
     - `userService`: quản lý người dùng và phân quyền
     - `showtimeService`: quản lý lịch chiếu
     - `bookingService`: quản lý đặt vé
     - `reportService`: dữ liệu báo cáo và thống kê
     - Các service phụ trợ khác
  3. **Tích Hợp React Query**:
     - Chuyển đổi từ việc gọi API trực tiếp sang sử dụng hooks `useQuery` và `useMutation`
     - Cấu hình cache, stale time và retry options phù hợp
     - Xử lý loading state và error handling nhất quán
- **Expected Outcome**: Admin panel sẽ làm việc với dữ liệu thực từ database, cho phép quản lý nội dung thông qua API và đảm bảo tính nhất quán của dữ liệu giữa admin panel và user interface.
- **Technical Considerations**:
  - Sử dụng axiosInstance đã được cấu hình với interceptor để xử lý token authentication
  - Cần xem xét lại các điểm cuối API (endpoints) để đảm bảo chúng match với API controller trong backend
  - Kiểm tra và cập nhật các TypeScript interface/types để phản ánh cấu trúc dữ liệu thực tế từ API

## Key Active Issues & Workarounds

### QR Payment Integration (Latest)
- **Feature Implementation**: Integrated QR code payment functionality with SePay and MoMo options
- **Components Added**:
  1. **Backend**:
     - `QrCodeResponse.java`: Response DTO for QR code data
     - `PaymentRequest.java`: Request DTO for payment creation
     - `PaymentService.java`: Service interface for payment operations
     - `PaymentServiceImpl.java`: Implementation with QR generation logic
     - `PaymentController.java`: REST endpoints for payment operations
     - Security configuration updates to allow payment API access
  2. **Frontend**:
     - `QrPaymentModal.tsx`: Component to display QR code with countdown timer
     - `BookingForm.tsx` updates to integrate QR payment flow
     - Type definitions and translations for QR payment feature
- **Key Features**:
  - 5-minute countdown timer for payment completion
  - Display of booking details alongside QR code
  - Warning message that tickets cannot be canceled after payment
  - Auto-redirect after payment timeout
  - Status checking for payment completion
  - Support for multiple payment providers (SePay, MoMo)
- **Implementation Challenges**:
  - Fixed multiple TypeScript errors in component integration
  - Resolved infinite render loops in React components using useCallback and useEffect
  - Created proper type definitions for all data structures
  - Ensured responsive design for payment modal on different screen sizes

### Too Many Re-renders Bug Fix
- **Problem**: Implemented QR Payment feature caused infinite render loops with error: "Too many re-renders. React limits the number of renders to prevent an infinite loop"
- **Root Causes**:
  1. `getSelectedShowtimeDetails` function was directly updating state during rendering
  2. Functions being passed to child components were recreated on every render
  3. Event handlers in seat selection were causing cascading state updates
- **Solution Implemented**:
  1. Refactored `getSelectedShowtimeDetails` to be a pure function without state updates
  2. Used `useCallback` for event handler functions and component methods
  3. Moved state updates to useEffect hooks with proper dependencies
  4. Fixed seat selection handlers to prevent double state updates
  5. Added type declarations for react-hot-toast library
  6. Improved data flow between parent and child components
- **Outcome**: Fixed all infinite render issues, ensuring stable component rendering and state management throughout the booking flow, particularly in the QR payment process.

### Pessimistic Locking for Seat Booking (Implemented)
- **Problem**: During the booking process, multiple users could try to book the same seats simultaneously, leading to race conditions and duplicate bookings.
- **Solution**: Implemented pessimistic locking with the following components:
  - Added `@Lock(LockModeType.PESSIMISTIC_WRITE)` annotation to a new method `findAllByIdsForUpdate` in `ShowtimeSeatRepository.java`.
  - Modified `BookingServiceImpl.createBooking` to use this method to lock the selected seats during the transaction.
  - Added validation to check if seats are already booked and throw a `SEAT_ALREADY_BOOKED` error if necessary.
  - Created the new error code in `ErrorCode.java` with proper HTTP status (CONFLICT).
- **Outcome**: The system now safely handles concurrent booking attempts, ensuring that seats cannot be double-booked. This provides a more reliable user experience during peak booking times.

### Movie Search API Accuracy (Refined)
- **Problem**: Initial multi-field search was too broad. Searching for a specific movie title (e.g., "Frozen") returned irrelevant results if other movies contained the search term in their description or other fields.
- **Resolution Path**:
  1. Changed the parameter name from `name` to `searchTerm` in `MovieCriteria.java` to better reflect its purpose.
  2. Simplified the search algorithm in `MovieSpecificationBuilder.java` to:
     - Only search in the movie's name field (instead of across multiple fields).
     - Split the search term into words.
     - Require all words to be present in the movie name (case-insensitive, using LIKE with wildcards).
     - Removed joins with other tables that were causing duplicate results.
  3. Updated frontend components to use `searchTerm` instead of `search` in API calls.
- **Outcome**: Search results are now much more relevant, focusing primarily on movie title matches, which aligns better with user expectations when searching for specific movies.

### Booking Redirection Issue & Movie List Button Fix (Workaround Applied)
- **Problem**: Clicking the "Book Ticket" button on the movie list page (`MovieList.tsx`) for any movie (showing or upcoming) redirected the user to the login page, even if they were already authenticated. This did not happen when booking from the movie details page. The browser's network tab showed no API calls during this faulty redirection, but backend logs revealed a 401 Unauthorized error for the `GET /api/v1/showtime/{movieId}/by-date` request, which is configured with `permitAll()` in Spring Security.
- **Investigation Path & Key Findings**:
    1.  **Frontend Behavior**: The redirection to `/login` was happening on the frontend, likely triggered by the `ProtectedRoute` component in response to an unauthenticated state or a failed API call that wasn't immediately visible in the network tab (possibly an API call within a protected route that fails silently or is handled by a global error handler that triggers logout/redirect).
    2.  **Backend Log Analysis**:
        - The `GET /api/v1/showtime/{movieId}/by-date?date=YYYY-MM-DD` endpoint was called by the frontend when attempting to navigate to the booking page (`/bookings/book-movie/{movieId}`).
        - Spring Security logs (`TRACE` level) showed the `AuthenticationFilter` processing the request. Despite the endpoint being `permitAll()`, the filter still processed the JWT token if present in the `Authorization` header.
        - A `401 Unauthorized` error was thrown by the backend for this request, with the message `An Authentication object was not found in the SecurityContext`. This is unexpected for a `permitAll()` endpoint that should ideally ignore authentication status or not fail if an invalid/expired token is passed (unless explicitly configured to do so).
        - The JWT token being sent was confirmed to be valid and not expired (token validity is 30 days).
    3.  **Hypothesis**: The `AuthenticationFilter` (or a related security component) might be incorrectly invalidating the security context or failing to establish an anonymous authentication for `permitAll()` routes when a (valid) token is present but perhaps not expected or processed correctly for such routes. It's also possible that some downstream processing in the `ShowtimeController` or `ShowtimeService` for `/showtime/{movieId}/by-date` makes an implicit security check that fails.
### User Role Upgrade to ADMIN (PREVIOUS)
- **Action**: Nâng cấp role của tài khoản người dùng `mrrdavidd1` từ USER lên ADMIN để có quyền truy cập vào admin panel.
- **Database Connection Details**:
  - Host: movie-ticket.crm2sq0ssrzj.ap-southeast-2.rds.amazonaws.com
  - Database: movie
  - Username: postgres
  - Password: Anhtien123.
- **SQL Command Used**:
  ```sql
  UPDATE users SET role_id = 1 WHERE username = 'mrrdavidd1';
  ```
- **Purpose**: Cho phép truy cập đầy đủ vào admin panel để phát triển và kiểm thử các chức năng quản lý phim và các tính năng admin khác.
- **Caution**: Đây là thao tác trên môi trường phát triển/staging. Trên môi trường production, việc nâng cấp quyền cần được thực hiện thông qua quy trình chính thức và có xác nhận.

### Authentication Fix for Login API (LATEST)
- **Problem**: Người dùng không thể đăng nhập vì API endpoint `/auth/login` bị chặn bởi bộ lọc xác thực, dẫn đến lỗi 401 "Token is not valid".
- **Root Causes**:
  1. `AuthenticationFilter` không có `/auth/login` trong danh sách `publicPaths`
  2. `SecurityConfiguration` không có cấu hình `.requestMatchers("/auth/login").permitAll()`
- **Fix Applied**:
  1. Thêm `/auth/login`, `/auth/register`, `/auth/refresh-token`, `/auth/refresh` vào danh sách `publicPaths` trong `AuthenticationFilter`
  2. Thêm các cấu hình tương ứng `.requestMatchers("/auth/login").permitAll()`, etc. trong `SecurityConfiguration`
- **Outcome**: Người dùng đã có thể đăng nhập thành công vào hệ thống, không còn lỗi 401 khi gọi API login.
- **Lesson Learned**: Phải đảm bảo tất cả các endpoints liên quan đến xác thực được đánh dấu là public trong cả `SecurityConfiguration` và `AuthenticationFilter`.

### DatePicker Fix in MovieForm (PREVIOUS)
- **Problem**: MovieForm.tsx component had TypeScript errors related to DatePicker from MUI:
  1. `TS2322: Type '{ label: string; value: Date; onChange: (date: Date | null) => Promise<void> | Promise<FormikErrors<MovieFormData>>; renderInput: (params: any) => Element; }' is not assignable to type 'IntrinsicAttributes & DatePickerProps<Date> & RefAttributes<HTMLDivElement>'`
  2. `TS7006: Parameter 'params' implicitly has an 'any' type`
  3. `TS2322: Type 'FormikErrors<Date> | undefined' is not assignable to type 'ReactNode'`
- **Investigation and Solution**:
  1. Identified that the API for MUI DatePicker component had changed between versions
  2. The `renderInput` prop is no longer supported in the current MUI v5 API
  3. Replaced the deprecated approach with the modern `slotProps` pattern
  4. Wrapped DatePicker in a LocalizationProvider with AdapterDateFns
  5. Fixed type errors by ensuring helperText receives a proper string value with `String(formik.errors.releaseDate)` conversion
- **Implementation Details**:
  1. Upgraded the DatePicker implementation in MovieForm.tsx:
     ```tsx
     <LocalizationProvider dateAdapter={AdapterDateFns}>
       <DatePicker
         label={t('movies.releaseDate')}
         value={formik.values.releaseDate}
         onChange={(date) => formik.setFieldValue('releaseDate', date || new Date())}
         slotProps={{
           textField: {
             fullWidth: true,
             margin: "normal",
             error: formik.touched.releaseDate && Boolean(formik.errors.releaseDate),
             helperText: formik.touched.releaseDate && formik.errors.releaseDate ? String(formik.errors.releaseDate) : undefined
           }
         }}
       />
     </LocalizationProvider>
     ```
- **Outcome**: All TypeScript errors were resolved, and the DatePicker component now renders and functions correctly in the MovieForm while maintaining proper form validation and error handling.

### Date Picker Implementation and Troubleshooting in MovieDetails (LATEST)
- **Problem**: Khi triển khai DatePicker từ Material UI (@mui/x-date-pickers) trong MovieDetails.tsx để cho phép người dùng chọn ngày xem lịch chiếu, xuất hiện nhiều lỗi liên quan đến thư viện date-fns, như "export X was not found in date-fns/Y" và "Cannot find module 'ajv/dist/compile/codegen'".
- **Investigation Path & Key Issues**:
  1. **Incompatible Libraries**: 
     - `@mui/x-date-pickers` với `AdapterDateFnsV3` cần date-fns phiên bản 3, trong khi project đang sử dụng phiên bản cũ hơn.
     - Việc cập nhật date-fns lên phiên bản mới dẫn đến xung đột với các thư viện khác trong dự án.
  2. **Locale Issues**: 
     - Lỗi import locale từ date-fns cho tiếng Việt (vi), có thể do cấu trúc thư mục khác nhau giữa các phiên bản date-fns.
  3. **Node Module Cache Problems**: 
     - Sau khi cập nhật dependencies, vẫn còn lỗi có thể do cache npm.
- **Solution Implemented**:
  1. **Simplification Approach**: 
     - Thay thế DatePicker phức tạp từ @mui/x-date-pickers bằng TextField input type="date" chuẩn của Material UI.
     - Loại bỏ phụ thuộc vào adapter date-fns phức tạp trong khi vẫn duy trì chức năng chọn ngày.
  2. **State Management Adjustment**:
     - Tiếp tục sử dụng useState để đặt ngày mặc định (hôm nay).
     - Cập nhật handler cho sự kiện thay đổi để sử dụng với input date chuẩn.
  3. **Data Fetching Consistency**:
     - Duy trì sử dụng ngày đã chọn trong React Query để fetch dữ liệu lịch chiếu từ API.
- **Outcome**: Component hiển thị và hoạt động ổn định với control chọn ngày đơn giản. Người dùng có thể chọn ngày để xem lịch chiếu phim mà không gặp lỗi. Giảm thiểu phụ thuộc vào các thư viện phức tạp, giúp ứng dụng ổn định hơn.

### Showtime Generation & Display Troubleshooting (Resolved)
- **Initial Problem**: Người dùng không thấy lịch chiếu trên UI, mặc dù có thông tin lịch chiếu đã được tạo ở backend.
- **Investigation Path & Key Issues Addressed**:
    1.  **API Call for Showtime Generation (`POST /api/v1/showtime/public/add-showtimes-for-active-movies`) Failures**:
        -   **Initial 401 Unauthorized**: `AuthenticationFilter.java` không nhận diện đúng public path do thiếu tiền tố `/api/v1/` trong danh sách `publicPaths`.
            -   **Fix**: Cập nhật `publicPaths` trong `AuthenticationFilter.java` để bao gồm `/api/v1/`.
        -   **Subsequent 401 (then 500 via GlobalExceptionHandler from `AuthorizationDeniedException`)**: `SecurityConfiguration.java` thiếu tiền tố `/api/v1/` cho rule `permitAll()` của endpoint này, khiến `AuthorizationFilter` từ chối.
            -   **Fix**: Cập nhật `requestMatchers` trong `SecurityConfiguration.java` để sử dụng `/api/v1/showtime/public/**`.permitAll().
        -   **Subsequent 500 (from `NoResourceFoundException`)**: `ShowtimeController.java` có mapping sai:
            -   Sử dụng `@GetMapping` thay vì `@PostMapping` cho phương thức `addShowtimesForActiveMoviesPublic`.
            -   Annotation `@RequestMapping` ở cấp class là `"/showtime"` thay vì `"/api/v1/showtime"` trong `ShowtimeController.java`.
            -   **Fix**: Sửa `@GetMapping` thành `@PostMapping` và `@RequestMapping` cấp class thành `"/api/v1/showtime"` trong `ShowtimeController.java`.
        -   **Outcome**: API tạo lịch chiếu (`POST /api/v1/showtime/public/add-showtimes-for-active-movies`) hoạt động, báo cáo "SKIPPED" vì lịch chiếu đã tồn tại từ các lần gọi trước.
    2.  **API Call for Fetching Showtimes for UI (`GET /api/v1/showtime/{movieId}/by-date`) Failures**:
        -   **Initial 403 Forbidden from UI/Postman (No Auth)**: Endpoint lấy lịch chiếu không được phép truy cập công khai.
            -   **Root Cause**: `SecurityConfiguration.java` thiếu tiền tố `/api/v1/` cho rule `permitAll()` của `"/showtime/*/by-date"`.
            -   **Fix**: Cập nhật toàn diện các `requestMatchers` cho các đường dẫn `permitAll()` trong `SecurityConfiguration.java` (bao gồm `/api/v1/showtime/*/by-date`, `/api/v1/movie/**`, `/api/v1/auth/**`, etc.) để bao gồm tiền tố `/api/v1/`, đảm bảo tính nhất quán với `AuthenticationFilter.java` và `ShowtimeController.java`.
        -   **Outcome**: API lấy lịch chiếu (`GET /api/v1/showtime/{movieId}/by-date`) hoạt động thành công với `permitAll()` và trả về dữ liệu. Lịch chiếu hiển thị trên UI.

- **Key Learnings & Patterns**:
    -   **API Path Consistency is CRITICAL**: Đảm bảo tính nhất quán tuyệt đối của đường dẫn API (bao gồm base path như `/api/v1/`) và phương thức HTTP (GET/POST) giữa:
        -   Định nghĩa trong Controller (`@RequestMapping`, `@GetMapping`, `@PostMapping`).
        -   Cấu hình public path trong `AuthenticationFilter` (`publicPaths`).
        -   Cấu hình rule `permitAll()` trong `SecurityConfiguration` (`requestMatchers`).
        -   Cách gọi API từ frontend.
    -   `NoResourceFoundException` (thường được `GlobalExceptionHandler` bắt và trả về lỗi 500) là dấu hiệu mạnh mẽ của việc Spring MVC không tìm thấy handler cho request URI và HTTP method, thường do sai sót trong annotation mapping của controller.
    -   Lỗi 403 (Forbidden) cho một endpoint đáng lẽ là public thường chỉ ra vấn đề với `requestMatchers` trong `SecurityConfiguration` không khớp với URI của request, khiến request rơi vào rule `anyRequest().authenticated()`.

### Movie Details Display & Actor Info Fix (Resolved)
- **Problem**: Sau khi sửa lỗi JSON backend, trang chi tiết phim tuy tải được nhưng gặp lỗi `actor.charAt is not a function` ở frontend, ngăn cản việc hiển thị thông tin diễn viên.
- **Investigation Path & Key Issues Addressed**:
    1.  **Frontend Type Mismatch**: Lỗi `actor.charAt` xảy ra do component `MovieDetails.tsx` xử lý `movie.actors` như một mảng các chuỗi (`string[]`), trong khi API (sau các thay đổi backend hoặc do cấu trúc gốc) có thể trả về một mảng các đối tượng diễn viên.
    2.  **TypeScript Interface Inconsistency**: Interface `Movie` trong `admin-interface/src/types/movie.ts` định nghĩa `actors` là `string[]`, không khớp với dữ liệu thực tế có thể được trả về từ service.
- **Solution Implemented**:
    1.  **Define `Actor` Interface**: Tạo interface `Actor` mới trong `admin-interface/src/types/movie.ts` (ví dụ: `{ id: number | string; name: string; profilePath?: string; character?: string }`).
    2.  **Update `Movie` Interface**: Thay đổi trường `actors` trong interface `Movie` từ `string[]` thành `Actor[]`.
    3.  **Update `MovieDetails.tsx` Component**:
        - Import interface `Actor`.
        - Trong hàm `map` lặp qua `movie.actors`, cung cấp kiểu tường minh `(actor: Actor, index: number)`.
        - Truy cập đúng thuộc tính của đối tượng `actor` (ví dụ: `actor.name`, `actor.profilePath`, `actor.character`) thay vì xử lý `actor` như một chuỗi.
- **Outcome**: Lỗi `actor.charAt is not a function` đã được khắc phục. Thông tin diễn viên hiển thị chính xác trên trang chi tiết phim.

### Showtime Generation & Display Troubleshooting (Resolved)
- **Initial Problem**: Người dùng không thấy lịch chiếu trên UI, mặc dù có thông tin lịch chiếu đã được tạo ở backend.
- **Investigation Path & Key Issues Addressed**:
    1.  **API Call for Showtime Generation (`POST /api/v1/showtime/public/add-showtimes-for-active-movies`) Failures**:
        -   **Initial 401 Unauthorized**: `AuthenticationFilter.java` không nhận diện đúng public path do thiếu tiền tố `/api/v1/` trong danh sách `publicPaths`.
            -   **Fix**: Cập nhật `publicPaths` trong `AuthenticationFilter.java` để bao gồm `/api/v1/`.
        -   **Subsequent 401 (then 500 via GlobalExceptionHandler from `AuthorizationDeniedException`)**: `SecurityConfiguration.java` thiếu tiền tố `/api/v1/` cho rule `permitAll()` của endpoint này, khiến `AuthorizationFilter` từ chối.
            -   **Fix**: Cập nhật `requestMatchers` trong `SecurityConfiguration.java` để sử dụng `/api/v1/showtime/public/**`.permitAll().
        -   **Subsequent 500 (from `NoResourceFoundException`)**: `ShowtimeController.java` có mapping sai:
            -   Sử dụng `@GetMapping` thay vì `@PostMapping` cho phương thức `addShowtimesForActiveMoviesPublic`.
            -   Annotation `@RequestMapping` ở cấp class là `"/showtime"` thay vì `"/api/v1/showtime"` trong `ShowtimeController.java`.
            -   **Fix**: Sửa `@GetMapping` thành `@PostMapping` và `@RequestMapping` cấp class thành `"/api/v1/showtime"` trong `ShowtimeController.java`.
        -   **Outcome**: API tạo lịch chiếu (`POST /api/v1/showtime/public/add-showtimes-for-active-movies`) hoạt động, báo cáo "SKIPPED" vì lịch chiếu đã tồn tại từ các lần gọi trước.
    2.  **API Call for Fetching Showtimes for UI (`GET /api/v1/showtime/{movieId}/by-date`) Failures**:
        -   **Initial 403 Forbidden from UI/Postman (No Auth)**: Endpoint lấy lịch chiếu không được phép truy cập công khai.
            -   **Root Cause**: `SecurityConfiguration.java` thiếu tiền tố `/api/v1/` cho rule `permitAll()` của `"/showtime/*/by-date"`.
            -   **Fix**: Cập nhật toàn diện các `requestMatchers` cho các đường dẫn `permitAll()` trong `SecurityConfiguration.java` (bao gồm `/api/v1/showtime/*/by-date`, `/api/v1/movie/**`, `/api/v1/auth/**`, etc.) để bao gồm tiền tố `/api/v1/`, đảm bảo tính nhất quán với `AuthenticationFilter.java` và `ShowtimeController.java`.
        -   **Outcome**: API lấy lịch chiếu (`GET /api/v1/showtime/{movieId}/by-date`) hoạt động thành công với `permitAll()` và trả về dữ liệu. Lịch chiếu hiển thị trên UI.

- **Key Learnings & Patterns**:
    -   **API Path Consistency is CRITICAL**: Đảm bảo tính nhất quán tuyệt đối của đường dẫn API (bao gồm base path như `/api/v1/`) và phương thức HTTP (GET/POST) giữa:
        -   Định nghĩa trong Controller (`@RequestMapping`, `@GetMapping`, `@PostMapping`).
        -   Cấu hình public path trong `AuthenticationFilter` (`publicPaths`).
        -   Cấu hình rule `permitAll()` trong `SecurityConfiguration` (`requestMatchers`).
        -   Cách gọi API từ frontend.
    -   `NoResourceFoundException` (thường được `GlobalExceptionHandler` bắt và trả về lỗi 500) là dấu hiệu mạnh mẽ của việc Spring MVC không tìm thấy handler cho request URI và HTTP method, thường do sai sót trong annotation mapping của controller.
    -   Lỗi 403 (Forbidden) cho một endpoint đáng lẽ là public thường chỉ ra vấn đề với `requestMatchers` trong `SecurityConfiguration` không khớp với URI của request, khiến request rơi vào rule `anyRequest().authenticated()`.

### Showtimes Not Displaying Due to `Schedule.isDeleted = null` (LATEST - Resolved)
- **Problem**: Lịch chiếu không hiển thị cho phim, mặc dù endpoint `/showtime/public/add-showtimes-for-active-movies` báo cáo đã tạo lịch chiếu thành công. API frontend (`GET /api/v1/showtime/{movieId}/by-date`) trả về `result.branches: []`.
- **Investigation Path & Key Findings**:
    1.  **Initial Checks**: Endpoint tạo lịch chiếu (`ShowtimeController.addShowtimesForActiveMoviesPublic`) xác nhận đã tạo `Showtime` với `isDeleted = false`.
    2.  **Backend Service Logic**: `ShowtimeService.getShowtimesByMovieAndDate` gọi `ShowtimeRepository.findByMovieIdAndDateOrderByBranchAndTime`. Service chỉ trả về `branches: []` nếu repository trả về danh sách `Showtime` rỗng.
    3.  **Repository Query**: Truy vấn `findByMovieIdAndDateOrderByBranchAndTime` trong `ShowtimeRepository` có điều kiện `AND st.isDeleted = false`.
    4.  **Entity Inheritance**: Cả `Showtime` và `Schedule` kế thừa `BaseEntity`, `BaseEntity` có trường `isDeleted` và `@SQLRestriction("is_deleted IS DISTINCT FROM true")`.
    5.  **Database State (via `DatabaseChecker.java`)**:
        -   Các `Showtime` mới tạo (sau khi sửa endpoint `addShowtimesForActiveMoviesPublic`) có `is_deleted = false`.
        -   Tuy nhiên, các `Schedule` liên quan đến các `Showtime` này (được tạo bởi cùng endpoint) lại có `is_deleted = null`.
    6.  **Root Cause**: Vấn đề nằm ở các `Schedule` có `is_deleted = null`. Mặc dù `@SQLRestriction("is_deleted IS DISTINCT FROM true")` trên `BaseEntity` (mà `Schedule` kế thừa) không lọc các bản ghi `Schedule` có `is_deleted = null` (vì `null` khác `true`), nhưng sự tương tác của điều này với các join trong truy vấn của Hibernate (ví dụ, khi `ShowtimeRepository` tải `Showtime` và join với `Schedule`) khiến các `Showtime` (mặc dù có `Showtime.isDeleted = false`) liên kết với các `Schedule` có `is_deleted = null` này không được trả về. Điều này dẫn đến API không có dữ liệu lịch chiếu.
    7.  **Schedule Creation Logic**:
        -   Phương thức `ShowtimeController.addShowtimesForActiveMoviesPublic` *đã* được sửa trước đó để đặt `schedule.setIsDeleted(false)` khi tạo `Schedule` mới và khi cập nhật `Schedule` hiện có nếu `isDeleted` là `null` hoặc `true`.
        -   Tuy nhiên, các `Schedule` được tạo *trước khi* bản sửa lỗi này được áp dụng cho `Schedule` (hoặc bởi các logic khác chưa được sửa) vẫn có `is_deleted = null`.
        -   Một phương thức khác, `createShowtimesForMovie8Test` (sau đó đổi tên thành `addSampleShowtimes` trong `ShowtimeController`), cũng tạo `Schedule` mà không set `isDeleted`.
- **Solution Implemented**:
    1.  **Immediate Data Fix (Database)**: Sử dụng `DatabaseChecker.java` để thực thi lệnh SQL `UPDATE schedules SET is_deleted = false WHERE is_deleted IS NULL;`. Lệnh này đã cập nhật các bản ghi `Schedule` hiện có, và lịch chiếu ngay lập tức hiển thị chính xác.
    2.  **Code Fix (Proactive)**:
        -   Xác nhận lại logic trong `ShowtimeController.addShowtimesForActiveMoviesPublic` là đúng đắn cho việc tạo và cập nhật `Schedule.isDeleted`.
        -   Cập nhật phương thức `addSampleShowtimes` (trước đây là `createShowtimesForMovie8Test`) trong `ShowtimeController.java` để thêm `schedule.setIsDeleted(false);` trước khi lưu `Schedule` mới.
- **Outcome**:
    -   Lịch chiếu phim hiện đang hiển thị chính xác trên giao diện người dùng.
    -   Nguyên nhân gốc rễ của việc `Schedule.isDeleted` là `null` đã được giải quyết cho các lần tạo lịch chiếu trong tương lai thông qua cả endpoint chính và endpoint tạo dữ liệu mẫu.
    -   Đã hiểu rõ hơn về tác động của `@SQLRestriction` kết hợp với giá trị `NULL` trong các trường boolean và cách nó ảnh hưởng đến các truy vấn phức tạp với join.

## Recent Changes (Detailed Chronologically in progress.md)
Details of specific changes and resolutions are logged chronologically in `progress.md`. This section previously contained a detailed list which has been moved to `progress.md` to keep `activeContext.md` concise and focused on current activities.

## Active Decisions
- Using JPA for entity relationships.
- Corrected `Cinema` entity relationships by removing direct links to `Room` and `Showtime` where indirection through `Branch` and `Schedule` is appropriate.
- Modified `BookingRepository.findSalesReport` to use correct entity paths for joins.
- Allowed `Cinema.address` to be nullable to permit backend startup with existing `NULL` data.
- Implementing lazy loading for entity relationships
- Using enum for booking status management
- Using Apache POI for Excel export functionality
- Implementing date range selection with Vietnamese localization
- Separating sales and attendance reports into tabs
- Using Material-UI components for consistent design
- Using Recharts for data visualization
- Temporarily bypassing authentication for UI development
- Using @tanstack/react-query for data fetching
- Implementing TypeScript 5.3.3 for better type safety
- Using mock data for development
- Using a consistent sidebar navigation structure with collapsible groups
- Implementing path prefixes for proper route nesting
- Creating placeholder components for all sidebar menu items
- Using placeholder `null` props and empty functions in `routes.tsx` for `MovieForm` as a temporary measure to satisfy TypeScript until full data flow is implemented.
- Structuring the user-facing booking process as a multi-step form (`BookingForm.tsx`) for better UX.
- Using a component-based approach for seat visualization in the booking form.
- Implementing a grid layout for food & drink items with quantity controls.
- Using helper functions to calculate subtotals and totals in the booking summary.
- Using Material-UI DataGrid for consistent data table presentation in admin components.
- Implementing view mode toggles (grid/list) for location-based data visualization.
- Providing rich mock data that closely resembles expected production data patterns.
- Điều hướng trang chủ mặc định đến trang Movie List để tạo trải nghiệm người dùng tốt hơn
- Sử dụng React Query cho việc tải dữ liệu phim với các trạng thái loading và error
- Sử dụng các tab để phân loại dữ liệu (tất cả phim, đang chiếu, sắp chiếu)
- Hierarchy-based translation structure matching component structure
- Namespace organization for translations based on feature domains
- **Review Eligibility Logic**: Decision to determine if a user can review a movie based on:
  - Existence of a paid `Bill` associated with a `Booking`.
  - The `Booking` being for a `Showtime` of the specific `Movie`.
  - The `Showtime`'s start time (`Schedule.date` and `Schedule.timeStart`) being in the past.
  - The user not having already submitted a `Review` for that `Movie`.
- **Pessimistic Locking Strategy**: Use database-level locking for seat bookings to prevent race conditions, rather than application-level synchronization, to ensure consistency even with multiple application instances.
- **Movie Search Focus**: Prioritize movie name matches over other fields (description, actors, etc.) for search results to provide more intuitive and relevant search results to users.

## Important Patterns
- JPA entity relationship mapping and `mappedBy` usage.
- JPQL query construction, especially `JOIN FETCH` for performance and correct path resolution.
- Handling Hibernate DDL auto-generation issues with existing data (e.g., `NOT NULL` constraints on columns with `NULL`s).
- **Frontend-Backend API Path Alignment**: Ensuring API paths called by the frontend (e.g., in Axios calls, considering the proxy) correctly match the `@RequestMapping` and specific method mappings (`@GetMapping`, `@PostMapping`, etc.) in backend Spring Boot controllers.
- **DTO Field Naming Consistency**: Maintaining consistent field naming (e.g., camelCase `fullName`) between frontend JSON payloads and backend DTOs is crucial for correct data binding. Mismatches (e.g., `fullName` vs `fullname`) can lead to `null` values and subsequent errors.
- **API Response Parsing**: Frontend must accurately parse the structure of backend API responses. If the backend wraps data (e.g., `{"result": {...}}`), the frontend must access it accordingly (e.g., `response.data.result`) rather than assuming a different structure (e.g., `response.data.data`).
- **Step-by-Step Debugging for Auth Flows**: Authentication issues often require meticulous checking of each step: frontend request, proxy (if any), backend controller entry, service logic, database interaction, token generation, backend response, frontend response handling, and subsequent API calls using the token.
- **Role-Based Route Protection**: Creating specialized route wrappers like `AdminProtectedRoute` that check both authentication and specific roles before rendering protected components.
- **Spring Security Role Configuration**: Adding the "ROLE_" prefix to role names for proper Spring Security integration and using hasRole() to protect endpoints.
- **Authentication Persistence**: Using axios interceptors to automatically include tokens in requests and handle 401 responses for token expiration.
- **Nested Route Structure**: Using outlet-based layouts with proper route nesting to maintain consistent UI components like headers and navigation.
- JPA entity relationships
- Status management using enums
- Consistent use of Material-UI components
- Vietnamese language support throughout
- Responsive grid layout
- Error handling and loading states
- Modular component structure
- RESTful API design
- Data aggregation patterns
- Excel export functionality
- Authentication bypass for development
- React Query patterns for data fetching
- Error handling patterns
- Loading state patterns
- Chart visualization patterns
- Responsive design patterns
- Translation patterns
- Mock data patterns
- TypeScript type definitions
- Component composition patterns
- Consistent navigation patterns with proper route nesting
- Placeholder component patterns for progressive UI development
- Handling potential type mismatches between form data (e.g., `File` for uploads) and data model types (e.g., `string` for image URLs) during data transformation.
- Using a multi-step stepper (`@mui/material/Stepper`) for complex forms like the booking process.
- Using typed form interfaces with Formik to prevent TypeScript errors.
- Using conditional rendering based on loading and data states.
- Breaking down complex UIs into smaller, focused components.
- Using helper functions to transform and process data for display.
- Handling form state across multiple steps in a multi-step form.
- Explicitly typing form values in Formik to improve TypeScript inference.
- View mode toggles (grid/list) for different data visualization contexts.
- Common dialog pattern for CRUD operations across admin components.
- Status indicators with consistent color coding (success/error/warning).
- Creating wrapper components (like `MovieFormWrapper`) to separate data fetching and UI rendering concerns.
- Using barrel files for clean and maintainable imports.
- Hiển thị nội dung có điều kiện dựa trên trạng thái dữ liệu (loading, error, empty)
- Sử dụng các tab để phân loại dữ liệu (tất cả phim, đang chiếu, sắp chiếu)
- Hierarchy-based translation structure matching component structure
- Namespace organization for translations based on feature domains

## Project Insights
- Incorrect `mappedBy` definitions in JPA entities are a common source of `AnnotationException` during Hibernate's metadata building.
- JPQL queries require precise path navigation; an incorrect path (e.g., `s.movie` when `Showtime` links to `Movie` via `Schedule`) leads to `QueryCreationException` / `UnknownPathException`.
- Hibernate's `ddl-auto` feature (especially `update`) can conflict with existing database states if new constraints (like `NOT NULL`) are added to entities for columns that currently violate those constraints in the DB.
- **Proxy Configuration is Key for Dev**: For local development with separate frontend/backend servers, a proxy (e.g., in `package.json`) is essential to avoid CORS and simplify frontend API calls.
- **Backend DTOs Must Match Frontend Payloads**: The structure and field names of backend DTOs used for request bodies must precisely match the JSON objects sent by the frontend.
- **Frontend Must Correctly Parse Backend Responses**: Assumptions about response structure (e.g., `response.data.data` vs. `response.data.result`) can break frontend logic even if the API call itself returns a 200 OK.
- Entity relationships are crucial for data integrity
- Status management improves workflow control
- Data visualization is crucial for effective reporting
- Date range selection is essential for flexible reporting
- Export functionality is important for data analysis
- Vietnamese localization improves user experience
- Responsive design ensures usability across devices
- Backend data aggregation is critical for performance
- UI development can be decoupled from backend for faster iteration
- React Query significantly improves data fetching and state management
- TypeScript version compatibility is crucial for project stability
- Proper error handling improves user experience
- Loading states are essential for user feedback
- Mock data helps in UI development without backend dependency
- Vietnamese localization needs to be consistent across all features
- Chart visualization requires careful consideration of data structure
- Responsive design is crucial for different screen sizes
- Consistent navigation patterns are important for user experience
- Placeholder components allow for progressive development
- Proper route nesting is essential for maintaining layout consistency
- Recharts animation props (`animationBegin`, `animationDuration`, `animationEasing`) are not consistently top-level props for chart components; it's often better to rely on default animations or apply them to specific chart elements if fine-grained control is needed.
- When introducing new components and their associated routes, ensuring all file dependencies (e.g., `Register.tsx` for `routes.tsx`) are correctly created and referenced is crucial to prevent build/linter errors.
- Type mismatches, especially with file inputs (e.g., `File` vs. `string` for `imageUrl`), are common when bridging form data with backend/display models and require careful handling in data submission logic.
- Multi-step forms require careful state management to ensure data consistency between steps.
- Explicitly typing form fields in Formik helps TypeScript correctly infer types and prevent errors.
- Vietnamese translations should be organized hierarchically to match the UI structure
- Providing fallback text in the t() function helps with development and ensures graceful degradation
- Translation keys should follow a consistent naming convention across similar components
- Separating translations into logical namespaces improves maintainability and organization
- Translations should be tested with actual UI rendering to catch any display or formatting issues
- Translation file structure should mirror component organization for easier maintenance
- **UI Component Simplification**: Opted for simpler standard HTML/Material UI components over more complex components when facing dependency or compatibility issues, as seen with the Date picker implementation. This approach reduces risk while maintaining core functionality.
- **API Integration Strategy**: Initially focused on getting UI components working with mock data. Now transitioning to integrating with real API endpoints as authentication and security issues have been resolved, ensuring proper data flow between frontend and backend.
- **`Showtime.startTime` vs. `Schedule.date`/`timeStart`**: Learned that `Showtime` entity does not directly store the start time as a single field. The actual start time is a combination of `Schedule.date` (LocalDate) and `Schedule.timeStart` (LocalTime). Queries needing to compare with the current time must use these two fields and pass `LocalDate.now()` and `LocalTime.now()` as parameters. This was crucial for fixing the `canUserReviewMovie` logic.

## Areas for Improvement
- Add more chart customization options
- Implement better data caching strategies
- Add more interactive features to charts
- Enhance export functionality
- Improve loading state animations
- Add more detailed error messages
- Optimize chart performance
- Enhance mock data generation
- Improve TypeScript type definitions
- Add unit tests for chart components
- Add more filtering and sorting options
- Enhance export functionality with more formats
- Add print functionality for reports
- Optimize database queries for large datasets
- Add booking validation rules
- Implement booking cancellation workflow
- Add mock data for offline UI development
- Implement proper error states for offline mode
- Complete content for placeholder pages
- Add more interactive elements to management interfaces
- Enhance form validation with more comprehensive rules
- The booking form needs real API integration to replace the current mock data.
- Add animations for smoother transitions between booking form steps.
- Implement better mobile responsiveness for the seat selection UI.
- Add more detailed validation feedback for each booking step.
- Consider implementing a seat category system with different pricing.
- Add visual indicators of selected seats count and total price on all steps.
- Implement actual payment processing integration.
- Add booking confirmation emails/notifications.
- Implement a booking history view for users.
- Fix import errors in TheaterLocations.tsx related to MenuItem components.
- Add more sophisticated filtering options to DataGrid components.
- Implement proper error handling for image upload failures.
- Add confirmation dialogs for critical actions (delete, status changes).
- Triển khai mock data cho Movie Browsing UI khi backend chưa sẵn sàng
- Thêm tính năng đánh giá và bình luận cho phim
- Tối ưu hóa hiệu suất tải trang với số lượng phim lớn
- Cải thiện UX cho việc tìm kiếm và lọc phim

## Current Considerations
- Strategy for addressing MapStruct warnings (ignore vs. map base entity fields).
- Decision on `spring.jpa.open-in-view` configuration.
- Long-term plan for `Cinema.address` nullability and data cleanup.
- API integration approach for the booking form
- How to structure API endpoints for the multi-step booking process
- Best practices for handling seat availability in real-time
- Symbolic payment implementation (no actual payment gateway for internship project)
- Performance optimization for seat map rendering with large theaters
- State management for complex forms across multiple steps
- Optimistic UI updates for better user experience
- Error recovery strategies for failed API calls
- Mobile-friendly design for seat selection
- Real-time seat availability updates
- Booking expiration handling
- Cancel/edit booking functionality
- Email confirmation integration
- PDF ticket generation
- QR code generation for tickets
- Seat pricing categories
- Food & drink inventory management
- Discount code application
- Season pass/membership integration
- Analytics for popular seats/food items
- A/B testing for booking flow optimization
- Best approach for role-based permission management
- Integration of Google Maps for theater locations
- Handling real-time room availability updates
- Promotion code validation and application workflow
- Security considerations for user profile data
- Optimizing API calls for booking history to handle large datasets
- Implementing real-time booking status updates
- Error handling strategies for API integration failures
- Ensuring consistent Vietnamese translations across all components
- Implementing proper locale detection and switching
- Maintaining translation key consistency across components

## Learnings
- Debugging Hibernate `AnnotationException` often involves carefully checking `mappedBy` values against the field names in the owning side of relationships.
- Resolving Hibernate `QueryCreationException` and `UnknownPathException` requires verifying that JPQL paths correctly reflect the defined entity relationships.
- When Hibernate's `ddl-auto = update` fails due to constraints (e.g., adding `NOT NULL` to a column with existing `NULL`s), temporarily relaxing the constraint in the entity or cleaning the data in the database are common workarounds.
- JPA entity relationship implementation
- Status management using enums
- Effective use of Recharts for data visualization
- Implementation of date range selection with localization
- Export functionality for reports using Apache POI
- Vietnamese translation integration
- Responsive design patterns
- Backend data aggregation techniques
- Excel export implementation
- UI development strategies without backend dependency
- React Query setup and configuration
- TypeScript version management
- Chart library implementation
- Error handling strategies
- Loading state patterns
- Mock data generation
- Vietnamese localization techniques
- Responsive design approaches
- Export functionality implementation
- Proper route nesting and layout structure
- Creation of placeholder components for progressive development
- Navigation patterns for complex admin interfaces
- Effective use of Material-UI `Stepper` for creating guided multi-step user flows.
- Strategies for resolving TypeScript errors related to component prop mismatches in routing definitions (e.g., using placeholder props).
- Techniques for harmonizing UI elements (e.g., sidebar, dashboard) for a consistent look and feel.
- Debugging and correcting Recharts prop usage for chart components.
- Building complex interactive UIs like seat selection maps with proper state management.
- Implementing quantity selectors for catalog items (food & drinks).
- Organizing translation keys hierarchically to match UI structure.
- Using TypeScript interfaces to model domain entities (Showtime, Seat, Food items).
- Calculating derived values from form state (subtotals, totals).
- Implementing view mode toggles for different data visualization contexts.
- Creating rich mock data that closely resembles expected production data.
- Using Material-UI DataGrid for efficient data presentation.
- Implementing comprehensive CRUD operations with consistent UI patterns.

## Next Steps
1.  **MoMo-Inspired Booking Flow Enhancements (User Interface - IMMEDIATE PRIORITY):**
    *   **Improve `MovieList.tsx` (User-Facing Movie List):**
        *   Implement clearer "Now Showing" vs. "Coming Soon" sections.
        *   Display movie ratings (e.g., 4.5/5 stars) and age restrictions (e.g., P, C13, C16, C18) - *Note: Movie entity already has rating and ageRestriction*.
        *   Enhance grid layout for better visual appeal and information density.
    *   **Enhance `MovieDetails.tsx` (User-Facing Movie Details):**
        *   Include detailed cast/crew information (director, actors).
        *   Embed a movie trailer (e.g., YouTube).
        *   Ensure a prominent "Book Ticket" button.
        *   *Movie review display and submission form are now implemented.*
    *   **Implement Standalone Cinema/Theater Selection Step:**
        *   Allow filtering by city/region.
        *   Display different prices based on cinema, day of the week, and showtime.
    *   **Upgrade Seat Selection UI:**
        *   Clearly differentiate seat types (e.g., regular, VIP, couple/sweetbox).
        *   Show varying prices per seat type directly on the seat map or legend.
        *   Improve visual cues for selected, booked, and unavailable seats.
        *   *Pessimistic locking for seat selection is now implemented on the backend.*
    *   **Develop Enhanced Food & Drink Selection:**
        *   Offer options for different sizes (e.g., Small, Medium, Large for drinks/popcorn).
        *   Provide flavor choices where applicable.
        *   Showcase popular combos with clear pricing and contents.
    *   **Refine Confirmation & Payment UI:**
        *   Provide a very clear and itemized booking summary before payment.
        *   Integrate/mock multiple payment methods (e.g., MoMo, ZaloPay, Credit Card, Bank Transfer placeholders).
    *   **Improve Booking History Page:**
        *   Display a QR code or barcode for each ticket.
        *   Add options to print or email tickets.
2.  **Admin Panel API Integration (HIGH PRIORITY):**
    * Replace mock data with real API data in movieService.ts
    * Update all admin panel components to work with real data
    * Implement loading states and error handling for API calls
    * Use React Query for improved data fetching and caching
3.  **Testing Movie Review System (NEW):**
    * Test that users with completed movie bookings for past showtimes can leave reviews
    * Verify that users cannot review movies multiple times
    * Ensure proper error handling when users are not eligible
    * Test frontend integration with actual review data
4.  **Address Root Cause of Booking Redirection (Lower Priority):**
    * Investigate the backend's handling of `permitAll()` with existing (valid) tokens for `GET /api/v1/showtime/{movieId}/by-date` to understand why it initially caused a 401 (before the path consistency fixes were applied)
    * While the current workaround (navigating to movie details first) is functional, a direct booking from the list should ideally work

## Key Recent Resolutions & Learnings
(Details of these items are logged in `progress.md`. Key patterns and learnings should be in `systemPatterns.md`.)

- **User Role Upgrade to ADMIN**: Completed. User `mrrdavidd1` upgraded to ADMIN for development access.

- **Authentication Fix for Login API**: Resolved. Login API (`/auth/login`) is now public. *Learning*: Ensure auth-related endpoints are public in both `SecurityConfiguration` and `AuthenticationFilter`.

- **DatePicker Fixes (MovieForm & MovieDetails)**: Resolved. DatePicker components in `MovieForm.tsx` (MUI v5 `slotProps`) and `MovieDetails.tsx` (simplified to `input type="date"`) are functional. Caused by MUI API changes and date-fns compatibility issues.

- **Showtime Generation & Display**: Resolved. Issues related to API path consistency (controller mappings, security filters), date/time handling (TimeZone, `LocalDateTime` vs `Date`), and frontend display logic in `ShowtimeAccordion.tsx` and `ShowtimeMatrix.tsx` have been addressed. Data is now fetched and displayed correctly.

- **Movie Content Display (Actors & JSON)**: Resolved. Issues with `actor.charAt` (due to `Actor[]` vs `string[]` mismatch) and malformed JSON from backend (circular dependencies, exception handler overwriting committed responses) were fixed. *Learnings*: Sync frontend types with API; manage JPA serialization with `@JsonManagedReference`/`@JsonBackReference` and ensure exception handlers check `response.isCommitted()`.

- **Git Workflow: Merge `feature/showtime-management` to `main` & Push to Fork**:
  - Successfully merged the `feature/showtime-management` branch into the local `main` branch.
  - Resolved merge conflicts in `CinemaResponse.java`, `MovieSpecificationBuilder.java`, and `AuthServiceImpl.java`.
  - Added `memory-bank/` directory to `.gitignore` to exclude it from version control.
  - Pushed the updated local `main` branch to the personal fork (`myfork` - `hiepau1231/booking-movies-ticket-be`).

## Next Steps

- **Admin Panel API Integration (CONTINUED PRIORITY)**:
  - Tiếp tục hoàn thiện việc tích hợp API cho các chức năng còn lại của Admin Panel.
  - Đảm bảo tất cả các form CRUD (Create, Read, Update, Delete) hoạt động chính xác với dữ liệu từ backend.
  - Kiểm tra kỹ lưỡng quyền truy cập và luồng dữ liệu cho vai trò ADMIN.

- **Create Pull Request to Upstream Repository**:
  - Create a Pull Request from the `main` branch of the personal fork (`hiepau1231/booking-movies-ticket-be`) to the `main` branch of the upstream repository (`ngoanhtien/booking-movies-ticket-be`).
  - Clearly describe the changes, including the Showtime Management feature, bug fixes, and merge conflict resolutions.
  - Coordinate with the upstream repository owner for review and merging.

- **Refine Showtime Management UI/UX**:
  - Continue working on the Cinema Selection page.
  - Address the root cause of booking redirection (lower priority).
  - Investigate and address any new findings or minor issues from recent fixes.

