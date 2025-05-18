# Active Context

## Current Focus (Cập nhật ngày 19/05/2024)
**Đã phát hiện và khắc phục lỗi đặt vé:**
1.  **Vấn đề chính - Frontend sử dụng `fetch()` thay vì `axiosInstance`:**
    *   **Nguyên nhân gốc rễ:** Trong file `bookingService.ts`, các phương thức `createBooking` và `simulatePayment` sử dụng `fetch()` trực tiếp với URL tương đối (ví dụ: '/api/v1/payment/sepay-webhook') thay vì `axiosInstance`.
    *   **Hậu quả:** Khi sử dụng `fetch()` với URL tương đối, requests được gửi đến frontend server (localhost:3000) thay vì backend server, dẫn đến UI hiển thị thành công nhưng không có dữ liệu nào được lưu vào database.
    *   **Giải pháp:** Thay thế tất cả các lệnh `fetch()` bằng `axiosInstance.post()`, vì `axiosInstance` đã được cấu hình đúng với baseURL và headers để giao tiếp với backend API.
    *   **Trạng thái:** ✅ Đã hoàn thành việc chỉnh sửa `bookingService.ts`, thay đổi tất cả các lệnh `fetch()` thành `axiosInstance.post()` và cải thiện xử lý lỗi.

2. **Lịch sử đặt vé không hiển thị:**
    *   **Vấn đề:** Người dùng không thấy lịch sử đặt vé do endpoint không chính xác.
    *   **Nguyên nhân:** Phát hiện ra rằng endpoint đúng là `/user/bookings` (không có tiền tố `/api/v1/`) dựa trên controller đã định nghĩa trong backend (`UserController`). Frontend đang gọi sai endpoint `/api/v1/user/bookings`.
    *   **Giải pháp:** Đã cập nhật phương thức `getUserBookings` để sử dụng endpoint chính xác `/user/bookings` và cải thiện xử lý lỗi.
    *   **Trạng thái:** ✅ Đã hoàn thành việc cập nhật phương thức `getUserBookings`.

## Recent Changes (Cập nhật ngày 19/05/2024)
*   **Đã khắc phục lỗi đặt vé:**
    *   Đã thay thế các lệnh `fetch()` trong `createBooking` và `simulatePayment` bằng `axiosInstance.post()`.
    *   Đã cải thiện xử lý lỗi trong các phương thức API bằng cách thêm try/catch và log chi tiết.
    *   Đã cập nhật phương thức `getUserBookings` để sử dụng endpoint chính xác `/user/bookings` (không có tiền tố `/api/v1/`).
    *   Đã giữ nguyên tất cả logging chi tiết để tiếp tục theo dõi quá trình xử lý.
    *   Đã đảm bảo các requests đều đến đúng backend API endpoints.
*   **Phát hiện nguyên nhân gốc rễ của lỗi đặt vé:**
    *   Xác định rằng vấn đề đến từ việc sử dụng `fetch()` thay vì `axiosInstance` trong `bookingService.ts`.
    *   Sử dụng `fetch()` với URL tương đối khiến requests được gửi đến frontend server thay vì backend server.
    *   Đã tạo file sao lưu `bookingService.ts.bak` trước khi chỉnh sửa.

## Key Active Issues & Workarounds (Cập nhật ngày 19/05/2024)
*   **Ghế bị reset/có thể đặt lại (CRITICAL):**
    *   **Triệu chứng:** Người dùng đặt vé thành công, nhưng sau đó có thể đặt lại chính những ghế đó, hoặc ghế tự reset về "trống".
    *   **Nguyên nhân đã xác định:** Frontend không gửi requests đến backend do sử dụng `fetch()` với URL tương đối thay vì `axiosInstance`.
    *   **Giải pháp đã triển khai:** ✅ Đã chỉnh sửa `bookingService.ts` để sử dụng `axiosInstance.post()` thay cho `fetch()`.
*   **Lịch sử đặt vé không hiển thị (CRITICAL):**
    *   **Triệu chứng:** Người dùng không thấy lịch sử đặt vé.
    *   **Nguyên nhân đã xác định:** API endpoint không chính xác. Frontend cố gắng gọi `/api/v1/user/bookings` nhưng backend phục vụ endpoint là `/user/bookings`.
    *   **Giải pháp đã triển khai:** ✅ Đã cập nhật phương thức `getUserBookings` để sử dụng endpoint chính xác `/user/bookings`.
    *   **Bước tiếp theo:** Kiểm tra xem lịch sử đặt vé có hiển thị chính xác không.

## Next Steps (Cập nhật ngày 19/05/2024)
1.  **Kiểm thử toàn diện luồng đặt vé (HIGHEST PRIORITY):**
    *   ✅ Đã xác định và sửa nguyên nhân của vấn đề booking
    *   Kiểm tra quá trình đặt vé từ đầu đến cuối
    *   Xác nhận dữ liệu ghế được lưu đúng và trạng thái được duy trì
    *   Kiểm tra lịch sử đặt vé hiển thị chính xác

2.  **Admin Panel API Integration (HIGH PRIORITY):**
    *   Replace mock data with real API calls, starting with movieService.ts
    *   Implement React Query for improved data fetching
    *   Add proper loading states and error handling

3.  **MoMo-Inspired Booking Flow Enhancements (MEDIUM PRIORITY):**
    *   Improve MovieList.tsx with better section visualization
    *   Enhance MovieDetails.tsx with more complete information
    *   Upgrade seat selection UI with seat types and pricing
    *   Improve food & drink selection experience

## Important Patterns & Learnings (Cập nhật ngày 19/05/2024)
*   **Tầm quan trọng của `axiosInstance` trong frontend:** Việc sử dụng `axiosInstance` với cấu hình đúng là cực kỳ quan trọng để đảm bảo requests được gửi đến đúng backend server. Sử dụng `fetch()` trực tiếp với URL tương đối sẽ gửi requests đến frontend server thay vì backend server.
*   **Nhất quán trong xử lý API:** Đảm bảo tất cả các method tương tác với API đều sử dụng cùng một cách tiếp cận (axiosInstance) để tránh các vấn đề không nhất quán.
*   **Vai trò của proxy trong development:** Hiểu rõ cách thức hoạt động của proxy configuration trong `package.json` và lưu ý rằng proxy chỉ hoạt động khi sử dụng các thư viện như axios đã được cấu hình đúng.
*   **API Prefix không nhất quán:** Phát hiện ra rằng không phải tất cả các API endpoints đều sử dụng tiền tố `/api/v1/`. Một số endpoints, đặc biệt trong `UserController`, sử dụng đường dẫn không có tiền tố này. Cần kiểm tra kỹ API endpoints trong backend controllers trước khi sử dụng.
*   **Xử lý lỗi toàn diện:** Triển khai xử lý lỗi chi tiết với các block try/catch để nắm bắt và ghi log đầy đủ thông tin về lỗi.

## Previous Context (Trước ngày 19/05/2024)
*   **Vấn đề về đặt vé và reset ghế (Cập nhật ngày 18/05/2024):**
    * Người dùng báo cáo ghế bị reset/đặt lại sau khi đặt vé thành công.
    * Đã thêm log chi tiết vào phương thức `createBooking` để theo dõi từng bước.
    * Đã điều chỉnh các controller và service để bảo vệ trạng thái ghế `BOOKED` tốt hơn.
    * Đã điều chỉnh `cleanupExpiredReservations()` để đảm bảo chỉ giải phóng ghế `TEMPORARILY_RESERVED`.
*   **WebSocket Integration**: Đã triển khai tính năng đồng bộ thời gian thực (WebSocket) cho quá trình chọn ghế trong đặt vé. Tính năng này giúp người dùng thấy được ghế đang được chọn bởi người khác theo thời gian thực, tránh tình trạng nhiều người cùng chọn một ghế và tranh chấp khi thanh toán.
*   **QR Payment**: Implemented QR code payment with SePay integration, featuring a 5-minute countdown timer, clear payment information display, and automatic status updates. Includes both backend APIs and frontend components for generating QR codes and handling payment flow.

