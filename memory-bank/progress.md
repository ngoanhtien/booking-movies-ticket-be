# Progress Tracking

## What Works
- Project initialization with React and TypeScript
- Material-UI theme configuration
- Basic routing structure
- **WebSocket Integration for Seat Selection (LATEST)**:
  - Triển khai đồng bộ hóa trạng thái ghế theo thời gian thực sử dụng WebSocket
  - Hiển thị ghế đang được người dùng khác chọn với màu khác và hiệu ứng nhấp nháy
  - Ngăn chặn việc người dùng chọn ghế đang được người khác chọn
  - Thông báo và tự động cập nhật khi có người khác đặt ghế mà người dùng đang chọn
  - Hiển thị trạng thái kết nối WebSocket để người dùng biết có đang đồng bộ hay không
- **Booking Flow Enhancement (LATEST)**:
  - Thêm thanh thông tin tổng hợp ở dưới mỗi bước trong quá trình đặt vé
  - Hiển thị số ghế đã chọn, danh sách mã ghế và tổng tiền ghế
  - Hiển thị số lượng đồ ăn đã chọn, danh sách món và tổng tiền đồ ăn
  - Hiển thị tổng tiền phải thanh toán tại mỗi bước đặt vé
- **User Role Upgrade to ADMIN**:
  - Xác định được thông tin kết nối database trong file application.yml
  - Nâng cấp tài khoản người dùng mrrdavidd1 từ USER lên ADMIN thông qua SQL query
  - Cấp quyền truy cập vào admin panel cho phát triển các chức năng quản lý
- **Authentication Fix for Login API**:
  - Cập nhật SecurityConfiguration.java và AuthenticationFilter.java để thêm /auth/login vào publicPaths
  - Sửa lỗi 401 "Token is not valid" khi đăng nhập
  - Cho phép người dùng đăng nhập và truy cập admin panel
- **DatePicker Component Fixes**:
  - Updated DatePicker implementation in MovieForm.tsx to use current MUI v5 API
  - Replaced deprecated renderInput prop with modern slotProps pattern
  - Fixed TypeScript errors related to DatePicker parameter types
  - Added proper type conversion for form validation error messages
  - Wrapped DatePicker in LocalizationProvider with AdapterDateFns
  - Ensured proper form validation and error display
- **API Circular Reference Resolution**: Resolved API circular reference issues in `movieService.ts` by implementing a multi-level extraction strategy with fallbacks and targeted data cloning to prevent serialization loops.
- **Movie API Integration**: Integrated movie API: Updated `movie.ts` interface for field name variations, implemented robust response normalization in `movieService.ts`, and fixed data handling in `MovieDetails.tsx` and `MovieForm.tsx` for consistent display.
- **CORS Configuration for Frontend-Backend Communication**: Implemented backend CORS configuration (`WebConfig.java`) to allow full communication from the frontend, setting up necessary origins, methods, and headers.
- **React Query Integration and TypeScript Fixes**: Integrated React Query (`@tanstack/react-query` v5) using object-based syntax and resolved related TypeScript issues in components like `CinemaSelection.tsx`, including data structure typing and event handlers.
- **User Authentication & Registration (Frontend & Backend)**: Established end-to-end user authentication and registration: Implemented frontend forms (`Login.tsx`, `Register.tsx`), backend APIs (`/auth/login`, `/auth/register`) with JWT, DTO mapping, validation, and role-based redirection after login via `/user/me`.
- **Security and Access Control**: Implemented security and access control: Added frontend `AdminProtectedRoute`, backend Spring Security role permissions (e.g., `hasRole("ADMIN")`), Axios interceptors for token handling, and ensured authentication persistence with logout functionality.
- **Authentication Persistence Enhancements**: Enhanced authentication persistence: Rewritten Axios interceptors for proper token refresh and request retries, initialized Redux auth state from localStorage, and improved error handling for network vs. auth issues to prevent session loss on page refresh.
- **Authentication in Booking Flow**: Stabilized authentication in booking flow: Added token validation in `BookingForm.tsx`, improved 401 error handling with user feedback, and refined session expiration detection and redirection logic.
- **Vietnamese Language Support**: Implemented comprehensive Vietnamese language support using i18next, including UI text, form validation messages, and organized translation files with logical namespaces for all key user-facing and admin components.
- Admin Panel UI Development
  - Authentication bypass for UI preview
  - Direct access to admin panel without backend
  - Component layout and structure
  - Navigation implementation
  - Proper route structure with Layout wrapper
  - Consistent sidebar navigation with collapsible groups
  - Path prefixes for proper route nesting
  - Placeholder components for all menu items
  - Enhanced key admin placeholder components (`RoomManagement`, `PromotionsManagement`, `TheaterLocations`) with rich mock data, full UI features (DataGrid, form validation, status indicators), and specific functionalities like seat layout editing, varied promotion types, and map integration.
  - Showtime Management Interface
  - User Management Interface
  - Booking System Core
  - User-Facing Booking System
  - Booking Management Interface
  - Reports and Analytics Interface
  - Cinema Management features implemented with:
  - Branch Management features implemented with:
  - Invoice (Bill) Management features implemented with:
  - Partially functional placeholder components:
  - Admin Panel UI Enhancements:
  - Theater Management Module (Admin Panel):
  - Linter Error Fixes:
  - **Showtime Generation Endpoint Functional (`/showtime/public/add-showtimes-for-active-movies`) (LATEST)**:
  - Minor UI Fixes:
  - **Movie List Display & Booking Flow Stability (LATEST FIXES)**:
  - **Showtime Generation and Display Fully Functional (LATEST)**:
  - **Showtime Display in Booking Form Fully Functional (LATEST)**:
  - **TypeScript Interface Errors Fixed (LATEST)**:
  - **Date Picker Implementation and Simplification (LATEST)**:
  - **Pessimistic Locking for Seat Booking (LATEST)**:
    - Implemented database-level pessimistic locking for seat selection
    - Added `@Lock(LockModeType.PESSIMISTIC_WRITE)` to repository method
    - Created validation to properly handle race conditions during booking
    - Added proper error handling with specific error code for already booked seats
  - **Movie Search API Accuracy Enhancement (LATEST)**:
    - Refactored search functionality to focus on movie name for more relevant results
    - Updated parameter naming from `name` to `searchTerm` for better API clarity
    - Fixed frontend components to use the new parameter
    - Improved search algorithm to match all search words in movie title
  - **User Movie Review System (LATEST)**:
    - Implemented review eligibility logic based on past bookings
    - Fixed database query to correctly check past showtimes
    - Added API endpoints for submitting and retrieving reviews
    - Integrated review functionality into the MovieDetails.tsx page
    - Handled proper error cases for ineligible users and duplicate reviews
  - **QR Payment Integration (LATEST)**:
    - Added backend API for generating QR codes with SePay/MoMo integration
    - Created frontend QR payment modal component with countdown timer
    - Implemented payment status checking mechanism
    - Designed responsive UI displaying booking details with QR code
    - Added translations for all payment-related content
    - Fixed "Too many re-renders" issues in React components
    - Created proper type definitions for all data structures
    - Implemented automatic redirection after payment timeout

## What's Left to Build
1. Frontend Features
   Admin Interface (Priority)
   - [x] Admin authentication UI (Login & Register forms fully functional)
   - [x] Proper authentication flow (JWT, proxy, API calls, response handling, /user/me functional)
   - [x] Role-based access control for admin pages
   - [x] Authentication persistence across page refreshes 
   - [x] Logout functionality in user interface
   - [x] Dashboard layout
   - [x] Movie management interface
     - [x] Movie list view
     - [x] Add/Edit movie form
     - [x] Image upload
     - [x] Status management
     - [x] Vietnamese translations
   - [ ] **API Integration for Admin Panel**
     - [ ] Replace mock data with real API data in movieService.ts
     - [ ] Replace mock data with real API data in userService.ts
     - [ ] Replace mock data with real API data in showtimeService.ts
     - [ ] Replace mock data with real API data in bookingService.ts
     - [ ] Replace mock data with real API data in reportService.ts
     - [ ] Ensure proper error handling and loading states
     - [ ] Update TypeScript interfaces to match API responses
     - [ ] Implement React Query for improved data fetching
   - [x] Showtime management interface
     - [x] Showtime list view
     - [x] Add/Edit showtime form
     - [x] Movie-showtime relationship
     - [x] Schedule management
     - [x] Vietnamese translations
   - [x] Movie schedule calendar implementation
     - [x] FullCalendar integration with time zone support
     - [x] Interactive schedule creation and editing
     - [x] Cinema, movie, and room filtering
     - [x] Vietnamese translations
   - [x] User management interface
     - [x] User list view
     - [x] User details
     - [x] User status management
     - [x] Vietnamese translations
     - [x] User avatar upload
     - [x] User search and filtering
     - [x] User role management
     - [x] User export functionality
     - [x] Bulk user actions
   - [x] Booking management interface
     - [x] Booking list view
     - [x] Booking details
     - [x] Booking status management
     - [x] Vietnamese translations
     - [x] Export functionality
     - [x] Search and filtering
     - [x] API integration
     - [x] Real-time seat synchronization with WebSocket
   - [x] Reports and analytics
     - [x] Sales reports
     - [x] Attendance reports
     - [x] Vietnamese translations
     - [x] Data aggregation
     - [x] Excel export
     - [x] Caching implementation
     - [x] More visualization options
   - [x] Mock data for UI preview
   - [ ] Error handling for offline mode
   - [ ] Loading states for data-dependent components
   - [x] Cinema (Theater) management module
   - [x] Branch management module
   - [x] Invoice (Bill) management module
   - [x] Theater management module
   - [x] Theater locations module (placeholder enhanced with functional UI)
   - [x] Room management module (placeholder enhanced with functional UI)
     - [x] Seat layout visualization and interactive editor
     - [x] Integration with room-specific schedule calendar
     - [x] UI Polish (padding, column distribution, title styling)
   - [-] User roles management module (removed from navigation)
   - [x] Promotions management module (placeholder enhanced with functional UI)
   - [x] Discount management module (UI implemented with mock data, validation, and CRUD operations)
   - [x] Notification management module (UI implemented with mock data, validation, and CRUD operations)
   - [-] Movie schedules module (removed from navigation)
   - [ ] Complete content for remaining placeholder modules
   - [x] Refine `MovieForm` routes with actual data fetching/state management (replaced placeholder props with MovieFormWrapper).

   User Interface
   - [x] User authentication (UI and API calls for Login & Register are now fully functional and tested)
     - [x] Complete Vietnamese translations for Login/Register forms
     - [x] Proper error handling and success messaging
     - [x] Form validation with Vietnamese messages
   - [x] Movie browsing
     - [x] Implement MovieList component with movie grid display
     - [ ] **Enhance `MovieList.tsx` for MoMo-like UX (CURRENT TASK)**
        - [ ] Implement clearer "Now Showing" vs. "Coming Soon" sections.
        - [ ] Display movie ratings (e.g., 4.5/5 stars) and age restrictions (e.g., P, C13, C16, C18).
        - [ ] Enhance grid layout for better visual appeal and information density.
     - [x] Create MovieDetails component for detailed movie view
     - [ ] **Enhance `MovieDetails.tsx` for MoMo-like UX**
        - [ ] Include detailed cast/crew information (director, actors).
        - [ ] Embed a movie trailer (e.g., YouTube).
        - [ ] Ensure a prominent "Book Ticket" button.
     - [x] Add filtering and searching capabilities
     - [x] Implement tabbed browsing (All movies, Now showing, Coming soon)
     - [x] Add responsive design for all screen sizes
     - [x] Connect service layer with API endpoints
     - [x] Add loading states, error handling, and empty states
     - [x] Add Vietnamese translations for all UI elements
     - [x] Update routes to include movie browsing as the homepage
     - [x] Add movie review and rating functionality
   - [x] Ticket booking flow (UI and API integration complete)
     - [x] Implement Showtime Selection step with API integration
     - [x] Implement Seat Selection step with interactive map
     - [x] Real-time seat synchronization with WebSocket
     - [x] Booking summary bar at each step showing selections and total price
     - [x] Implement Food & Drinks step with quantity controls
     - [x] Implement Confirm & Pay step with payment options
     - [x] Add QR payment functionality with SePay/MoMo integration
   - [x] User profile
     - [x] Personal information display and editing
     - [x] Avatar upload and preview
     - [x] Password change functionality
     - [x] Vietnamese translations
     - [x] Responsive layout with tabs
     - [x] Form validation with Vietnamese messages
   - [x] Booking history
     - [x] List of bookings with filtering (All/Upcoming/Past)
     - [x] Detailed view of bookings
     - [ ] **Improve Booking History Page (MoMo-inspired)**
        - [ ] Display QR code/barcode for each ticket.
        - [ ] Add options to print or email tickets.
     - [x] Support for various booking statuses
     - [x] Vietnamese translations
     - [x] Loading states and error handling
     - [x] Empty state with call-to-action
   - [x] Payment interface (symbolic implementation only)
   - [x] Vietnamese translations for the booking form
   - [x] Vietnamese translations for Login/Register UI

## Current Status
- Admin interface basic structure is complete
- **Authentication & Authorization issues resolved**:
  - Login API endpoint (/auth/login) fixed to allow public access
  - SecurityConfiguration.java and AuthenticationFilter.java updated with correct public paths
  - User mrrdavidd1 upgraded to ADMIN role for testing admin features
- **Frontend-Backend Communication successfully established**:
    - CORS configuration implemented in WebConfig.java allows frontend to make API calls to the backend
    - WebConfig bean properly configured with all required origins, methods, headers, and credentials
    - Proxy configuration in package.json provides smooth local development experience
- **Authentication and Registration flows are now fully functional and tested end-to-end.**
    - Issues related to frontend proxy, backend DTO mapping, API response parsing, and missing/me endpoint have been resolved.
    - Login redirection is now role-based (admin to admin dashboard, user to homepage).
- **Security and Access Control are properly implemented**
    - Frontend uses AdminProtectedRoute to check user role before allowing admin access
    - Backend Spring Security configuration enforces role-based permissions with hasRole("ADMIN")
    - Authentication persists properly across page refreshes with proper token handling
    - All user pages have a UserLayout with header containing logout functionality
    - Axios interceptors handle token management and 401 responses automatically
- Authentication UI is implemented with Vietnamese text
- Authentication flow is properly implemented with JWT tokens
- Protected routes are in place
- Token refresh mechanism is implemented
- **Backend is now operational after addressing entity relationship errors and database schema conflicts.**
  - Resolved `AnnotationException` in `Cinema` entity related to `Room` and `Showtime` relationships.
  - Fixed `QueryCreationException` in `BookingRepository.findSalesReport` by correcting JPQL join paths.
  - Addressed DDL `ERROR: column "address" of relation "cinemas" contains null values` by making `Cinema.address` nullable.
- Dashboard with mock data is ready with Vietnamese labels
- Movie Browsing UI implemented with:
  - Grid layout for movie cards with responsive design
  - Movie details page with poster, description, and trailer
  - Tabs for showing different movie categories (All, Now Showing, Coming Soon)
  - Search and genre filtering functionality
  - Pagination for movie results
  - Complete Vietnamese translations
  - Loading states and error handling
  - Integration with booking flow
  - Default home page routing
- Admin panel navigation system fixed with:
  - Path prefixes (/admin) added to all sidebar navigation links
  - Routes.tsx restructured to wrap all admin routes in Layout component
  - Placeholder components created for all sidebar menu items
  - Proper route nesting implemented for consistent layout
  - Collapsible sidebar groups with expanding/collapsing functionality
- Movie Management features implemented with:
  - DataGrid for movie listing with Vietnamese headers
  - Form validation using Formik and Yup with Vietnamese messages
  - Image upload with preview
  - Status management with Vietnamese indicators
- Showtime Management features implemented with:
  - DataGrid for showtime listing with Vietnamese headers
  - Form validation using Formik and Yup with Vietnamese messages
  - Movie-cinema-room relationship management
  - Date and time selection with Vietnamese format
  - Price management with Vietnamese currency
  - Status management with Vietnamese indicators
- User Management features implemented with:
  - DataGrid for user listing with Vietnamese headers
  - Form validation using Formik and Yup with Vietnamese messages
  - Membership level management with Vietnamese labels
  - Status management with Vietnamese indicators
  - Avatar upload with preview functionality
  - Search and filtering capabilities
  - Role management
  - Export functionality
  - Bulk actions
- Booking System Core implemented with:
  - Booking entity with relationships
  - BookingStatus enum for status management
  - Repository with sales report functionality
  - Entity relationships (User, Showtime, ShowtimeSeat)
  - Payment tracking fields
  - Status management
- User-Facing Booking System implemented with:
  - Multi-step booking form using Material-UI Stepper
  - Showtime selection step with time, room, and available seat info
  - Interactive seat map with status indicators (available, booked, selected, unavailable)
  - Food & drinks selection with item cards and quantity controls
  - Booking summary with detailed cost breakdown
  - Payment method selection
  - Form validation using Formik and Yup
  - Step-by-step navigation with validation checks
  - TypeScript interfaces for form data and domain entities
  - Helper functions for derived values (subtotals, totals)
  - API integration for all booking steps replacing mock data
  - Symbolic payment process implementation
  - Booking success UI with detailed booking information
  - Error handling and loading states for API calls
- User Profile and Account Management implemented with:
  - Personal information display and editing
  - Password change functionality
  - Avatar upload with preview
  - Responsive layout with tabs for different sections
  - Proper form validation and error handling
  - Vietnamese translations for all UI elements
- Booking History implemented with:
  - List view of all user bookings
  - Filtering options (All/Upcoming/Past)
  - Detailed view dialog with comprehensive booking information
  - Visual status indicators with appropriate coloring
  - Print and email functionality
  - Responsive design for all screen sizes
- Placeholder Admin Components enhanced:
  - RoomManagement.tsx implemented with:
    - Mock data for different room types (2D, 3D, IMAX, VIP)
    - DataGrid for room listing with Vietnamese headers
    - Add/Edit dialog with form validation
    - Status management with visual indicators
    - Capacity and features management
  - PromotionsManagement.tsx implemented with:
    - Rich mock data for various promotion types
    - Support for percentage and fixed amount discounts
    - Target selection (all/movie/food/combo)
    - Date range selection with Vietnamese localization
    - Comprehensive form validation
  - TheaterLocations.tsx implemented with:
    - Theater location mock data
    - Dual view modes (grid view and list view)
    - Google Maps integration for location visualization
    - Search functionality for locations
    - Detailed location management
  - All enhanced components maintain consistency with:
    - Existing UI patterns and Material-UI components
    - Vietnamese translations
    - Form validation using Formik and Yup
    - Visual status indicators
    - Appropriate error handling
- Remaining placeholder components have basic structure and Vietnamese headers but require further enhancement
- Add more detailed validation feedback for each booking step.
- Consider implementing a seat category system with different pricing.
- Add visual indicators of selected seats count and total price on all steps.
- Implement symbolic payment processing (no actual payment gateway integration).
- Add booking confirmation emails/notifications.
- Implement a booking history view for users.
- Vietnamese localization has been significantly enhanced:
  - All user-facing components now have complete Vietnamese translations
  - Translation file is organized with logical namespaces matching component structure
  - Form validation messages are translated
  - Error messages and success notifications are translated
  - Navigation elements, footer, and common UI components are translated
  - TypeScript errors in components using translations have been fixed
- **MoMo Cinema booking flow analysis completed.**
- **Memory Bank updated to reflect new plans for booking flow enhancements.**
- **Movie Search API Accuracy fixed:**
  - Simplified search algorithm to focus on movie name only
  - Split search term into words and require all to be present in movie name
  - Removed joins that were causing duplicate results
  - Changed parameter name from `name` to `searchTerm` for better API clarity
- **Pessimistic locking for seat booking implemented:**
  - Added `@Lock(LockModeType.PESSIMISTIC_WRITE)` annotation to seat repository
  - Modified booking service to use locking during seat selection
  - Added validation to prevent duplicate bookings
- **User review system for watched movies implemented:**
  - Added logic to verify if a user has watched a movie before allowing reviews
  - Implemented endpoints for checking eligibility and submitting reviews
  - Created frontend components for movie reviews in MovieDetails.tsx
  - Fixed database query issues related to `Showtime.startTime` vs `Schedule.date`/`timeStart`

## Known Issues (And Resolutions)
- **RESOLVED**: Malformed JSON / Concatenated JSON from backend API (`/movie`, `/movie/detail/{id}`).
    - *Cause*: Circular dependencies in JPA entity serialization and improper exception handling.
    - *Fix*: Applied `@JsonIgnore` / `@JsonManagedReference` / `@JsonBackReference` to entities. Modified exception handlers to check `response.isCommitted()`.
- **RESOLVED**: `actor.charAt is not a function` error in `MovieDetails.tsx`.
    - *Cause*: Frontend expecting `actors` to be `string[]` while it could be `Actor[]` (array of objects).
    - *Fix*: Defined `Actor` interface, updated `Movie` interface, and refactored `MovieDetails.tsx` to handle `Actor` objects correctly.
- **RESOLVED**: Date picker library compatibility issues in `MovieDetails.tsx`.
    - *Cause*: @mui/x-date-pickers with AdapterDateFnsV3 required date-fns v3, causing compatibility issues with other dependencies.
    - *Fix*: Replaced complex DatePicker component with standard TextField input type="date", removing dependency on date-fns adapters.

## Evolution of Project Decisions
- **JSON Serialization Strategy**: Initially used `@JsonIgnore` broadly. Transitioned to a more fine-grained approach with `@JsonManagedReference` and `@JsonBackReference` for specific complex relationships (e.g., Bill-Promotion, User-Bill, User-Review) to ensure data needed by the frontend is available while still preventing cycles. This became necessary as more parts of the data model were exercised by API calls (like fetching movie details which might include reviews with user data).
- **Frontend Type Definitions**: Reinforced the importance of keeping frontend TypeScript types (`types/movie.ts`) strictly in sync with the actual structure of API responses, especially after backend changes or when dealing with nested objects.
- **UI Component Simplification**: Opted for simpler standard HTML/Material UI components over more complex components when facing dependency or compatibility issues, as seen with the Date picker implementation. This approach reduces risk while maintaining core functionality.
- **API Integration Strategy**: Initially focused on getting UI components working with mock data. Now transitioning to integrating with real API endpoints as authentication and security issues have been resolved, ensuring proper data flow between frontend and backend.
- **Concurrency Control Approach**: Initially relied on application-level validation for seat booking. Now implemented database-level pessimistic locking to prevent race conditions more effectively, especially in a multi-user environment where multiple users might try to book the same seats simultaneously.
- **Search Functionality Refinement**: Started with a broad, multi-field search approach but found it produced confusing results. Simplified to focus on movie name matches for more intuitive and relevant search results, aligning better with user expectations.
- **Entity Time Representation**: Discovered the importance of understanding how time is represented across different entities. For `Showtime`, learned that the actual start time is stored as separate `date` (LocalDate) and `timeStart` (LocalTime) fields in the related `Schedule` entity rather than as a single datetime field.

## Next Steps
1. **API Integration for Admin Panel (NEW TOP PRIORITY)**:
   * Replace mock data with real API data in movieService.ts first
   * Update all admin panel components to work with real data
   * Implement loading states and error handling for API calls
   * Use React Query for improved data fetching and caching
2.  **MoMo-Inspired Booking Flow Enhancements (User Interface - HIGH PRIORITY):**
    *   **Improve `MovieList.tsx` (User-Facing Movie List) - CURRENT TASK:**
        *   Implement clearer "Now Showing" vs. "Coming Soon" sections.
        *   Display movie ratings (e.g., 4.5/5 stars) and age restrictions (e.g., P, C13, C16, C18).
        *   Enhance grid layout for better visual appeal and information density.
    *   **Enhance `MovieDetails.tsx` (User-Facing Movie Details):**
        *   Include detailed cast/crew information (director, actors).
        *   Embed a movie trailer (e.g., YouTube).
        *   Ensure a prominent "Book Ticket" button.
    *   **Implement Standalone Cinema/Theater Selection Step:**
        *   Allow filtering by city/region.
        *   Display different prices based on cinema, day of the week, and showtime.
    *   **Upgrade Seat Selection UI:**
        *   Clearly differentiate seat types (e.g., regular, VIP, couple/sweetbox).
        *   Show varying prices per seat type directly on the seat map or legend.
        *   Improve visual cues for selected, booked, and unavailable seats.
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
2. **Thorough Testing & Validation (POST DATE PICKER SIMPLIFICATION)**:
    *   Test the date selection functionality in MovieDetails to ensure it works correctly with the simplified implementation.
    *   Verify that showtimes are properly displayed for selected dates.
    *   Ensure the end-to-end booking flow works correctly with the selected date.
    *   Test edge cases with date selection (e.g., past dates, future dates).
3. **Backend Warning Resolution**:
    *   Address MapStruct "Unmapped target properties" warnings in various mappers.
    *   Evaluate and explicitly configure `spring.jpa.open-in-view`.
4. **Data Integrity for `Cinema.address`**:
    *   Review `NULL` values in `cinemas.address` and decide on a data update strategy or confirm if optionality is permanent.

## Technical Debt
- Implement data caching
- Optimize database queries
- Add more test coverage
- **Address remaining backend warnings (MapStruct, open-in-view).**
- **Review and potentially enforce `NOT NULL` constraint on `Cinema.address` after data cleanup.**
- Improve error handling
- Enhance documentation
- Complete booking system implementation
- Add symbolic payment integration (no actual payment gateway)
- Implement real-time updates
- Add mock data for UI development
- Enhance offline mode error handling

## Notes
- Core booking system structure is in place
- **Backend is now stable and starting correctly.**
- Focus on completing booking workflow
- Plan payment integration
- Consider performance optimization
- Plan for real-time updates
- Monitor system performance
- Admin panel UI development decoupled from backend
- Authentication flow is properly implemented with JWT tokens
- Protected routes are in place
- Token refresh mechanism is implemented
- **Component simplification strategy successful for date picker, consider for other complex UI elements with dependency issues.**

## Update (11/29/2023)

### Issues Fixed:

1. **API Connection Issues Between Frontend and Backend:**
   - Resolved CORS issues by using relative paths instead of absolute URLs.
   - Modified `API_URL`, `API_BASE_URL`, and `baseURL` in axiosInstance to empty strings to leverage proxy functionality.

2. **API Response Data Handling Issues:**
   - Fixed "Cannot read properties of undefined (reading 'length')" error in MovieList component.
   - Improved handling of various API response formats through normalizeResponse() function.
   - Added robust array type checking in UI before accessing properties.
   - Ensured data returned to the frontend is normalized regardless of the backend JSON structure.

### Lessons Learned:

1. **Defensive Data Handling:** Always check data structures and provide default values to avoid runtime errors.
2. **Data Normalization:** Create an adapter layer between API and UI to ensure consistent data.
3. **Appropriate Logging:** Add API data logging for easier debugging.
4. **Effective CORS Handling:** Using client-side proxy is a simple and effective solution.

4. **Effective CORS Handling:** Using client-side proxy is a simple and effective solution.

**Date**: `2024-07-30`
**Activity**: Admin Panel Debugging & Fix
- **Problem**: Clicking buttons (e.g., "Add Movie") on the admin dashboard `/admin/dashboard` caused a full page reload and redirect to `/movies`, despite correct initial authentication and sidebar navigation working.
- **Diagnosis**: The issue was traced to the use of the `href` attribute on Material UI `Button` components in `Dashboard.tsx`. In the context of React Router, `href` causes standard browser navigation, bypassing client-side routing.
- **Fix**: Refactored the buttons in `Dashboard.tsx` to use `useNavigate()` hook and `onClick` handlers instead of `href`.
- **Outcome**: Admin dashboard buttons now correctly navigate within the SPA without unwanted redirects. Core admin navigation is now stable. 

### Key Technical Decisions & Learnings (Consolidated)
- **Error Handling & Logging**: Consistent use of `AppException` with `ErrorCode` for backend errors. Centralized logging via Slf4j. Frontend error display via `toast` notifications and form error messages.
- **API Design**: Adherence to RESTful principles where possible. Clear DTOs for requests and responses. Versioning not yet formally implemented but considered for future.
- **State Management (Frontend)**: Primarily React Query for server state, Zustand for global client state. Context API for highly localized state where appropriate.

### Git Workflow & Version Control
- **Feature Branch Merged to Main**: Successfully merged the `feature/showtime-management` branch into the local `main` branch after resolving merge conflicts in `CinemaResponse.java`, `MovieSpecificationBuilder.java`, and `AuthServiceImpl.java`.
- **`.gitignore` Update**: Added `memory-bank/` directory to `.gitignore` to exclude it from version control.
- **Pushed to Personal Fork**: The updated local `main` branch (including the merge and subsequent commits) has been pushed to the personal fork `myfork` (repository `hiepau1231/booking-movies-ticket-be`). The next step is to create a Pull Request to the upstream repository `ngoanhtien/booking-movies-ticket-be`.

## What's Left To Build / Key Areas for Improvement
- **API Integration for Admin Panel**: Replace mock data with real API data in movieService.ts first
- **MoMo-Inspired Booking Flow Enhancements**: Improve `MovieList.tsx` (User-Facing Movie List)
- **Thorough Testing & Validation**: Test the date selection functionality in MovieDetails
- **Backend Warning Resolution**: Address MapStruct "Unmapped target properties" warnings in various mappers
- **Data Integrity for `Cinema.address`**: Review `NULL` values in `cinemas.address` and decide on a data update strategy or confirm if optionality is permanent

## Notes
- Core booking system structure is in place
- **Backend is now stable and starting correctly.**
- Focus on completing booking workflow
- Plan payment integration
- Consider performance optimization
- Plan for real-time updates
- Monitor system performance
- Admin panel UI development decoupled from backend
- Authentication flow is properly implemented with JWT tokens
- Protected routes are in place
- Token refresh mechanism is implemented
- **Component simplification strategy successful for date picker, consider for other complex UI elements with dependency issues.**

## Update (11/29/2023)

### Issues Fixed:

1. **API Connection Issues Between Frontend and Backend:**
   - Resolved CORS issues by using relative paths instead of absolute URLs.
   - Modified `API_URL`, `API_BASE_URL`, and `baseURL` in axiosInstance to empty strings to leverage proxy functionality.

2. **API Response Data Handling Issues:**
   - Fixed "Cannot read properties of undefined (reading 'length')" error in MovieList component.
   - Improved handling of various API response formats through normalizeResponse() function.
   - Added robust array type checking in UI before accessing properties.
   - Ensured data returned to the frontend is normalized regardless of the backend JSON structure.

### Lessons Learned:

1. **Defensive Data Handling:** Always check data structures and provide default values to avoid runtime errors.
2. **Data Normalization:** Create an adapter layer between API and UI to ensure consistent data.
3. **Appropriate Logging:** Add API data logging for easier debugging.
4. **Effective CORS Handling:** Using client-side proxy is a simple and effective solution.

4. **Effective CORS Handling:** Using client-side proxy is a simple and effective solution.

**Date**: `2024-07-30`
**Activity**: Admin Panel Debugging & Fix
- **Problem**: Clicking buttons (e.g., "Add Movie") on the admin dashboard `/admin/dashboard` caused a full page reload and redirect to `/movies`, despite correct initial authentication and sidebar navigation working.
- **Diagnosis**: The issue was traced to the use of the `href` attribute on Material UI `Button` components in `Dashboard.tsx`. In the context of React Router, `href` causes standard browser navigation, bypassing client-side routing.
- **Fix**: Refactored the buttons in `Dashboard.tsx` to use `useNavigate()` hook and `onClick` handlers instead of `href`.
- **Outcome**: Admin dashboard buttons now correctly navigate within the SPA without unwanted redirects. Core admin navigation is now stable. 