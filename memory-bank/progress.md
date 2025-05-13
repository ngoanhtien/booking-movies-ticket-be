# Progress Tracking

## What Works
- Project initialization with React and TypeScript
- Material-UI theme configuration
- Basic routing structure
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
- **API Circular Reference Resolution**:
  - Successfully implemented multiple-level extraction strategy in movieService.ts
  - Added standard, direct, deep search, and regex extraction methods as fallbacks
  - Disabled Axios automatic JSON parsing with `transformResponse` to handle raw API responses
  - Implemented cloning with targeted removal of circular references
  - Added comprehensive error handling and fallback mechanisms
  - Created type-safe extraction with detailed console logging
  - Successfully displaying movies from API (Dune and others)
  - Problem with circular references in the API response resolved
- **Movie API Integration**:
  - Updated movie data interface to handle multiple field naming conventions
  - Implemented robust response normalization in movieService.ts
  - Added recursive search functions to extract movie data from complex nested API responses
  - Fixed template literal errors and missing closing tags in MovieDetails.tsx
  - Added proper handling for string/array director field
  - Updated MovieForm.tsx to convert between API and UI status values (SHOWING/ACTIVE)
  - Created data normalization pattern for consistent handling of API data
  - Implemented fallback logic for missing fields with sensible defaults
  - Added comprehensive logging for API response troubleshooting
  - Fixed TypeScript errors related to potentially undefined values
- **CORS Configuration for Frontend-Backend Communication**:
    - Created WebConfig.java with fully configured CorsConfigurationSource bean
    - Set up allowed origins for development and production environments
    - Configured comprehensive allowed methods, headers, and exposed headers
    - Enabled credentials and set appropriate max age for preflight requests
    - Applied configuration to all endpoints ensuring full backend access from frontend
- **React Query Integration and TypeScript Fixes**:
    - Updated useQuery implementation to use the object-based syntax required by @tanstack/react-query v5
    - Fixed type issues with movie data structure in CinemaSelection.tsx
    - Implemented proper error and loading states
    - Added appropriate type definitions for API responses
    - Used proper type assertions to handle complex data structures
    - Corrected event handler types for Material-UI components like SelectChangeEvent
- **User Authentication & Registration (Frontend & Backend)**:
    - Frontend forms for Login and Register (`Login.tsx`, `Register.tsx`).
    - Backend API endpoints for `/auth/login` and `/auth/register`.
    - JWT generation and token-based authentication flow.
    - Frontend correctly calls backend via proxy (`package.json`).
    - Backend DTOs (`RegisterRequest`) correctly map frontend payloads (e.g., `fullName`, `email`).
    - Backend validation for existing username and email during registration.
    - Frontend correctly parses API responses (e.g., `response.data.result` for tokens).
    - Endpoint `GET /user/me` implemented in backend to fetch current user details after login.
    - Successful login now correctly redirects based on user role (admin to `/admin/dashboard`, user to `/`).
- **Security and Access Control**:
    - Frontend role-based route protection with `AdminProtectedRoute` component
    - Backend API security with Spring Security role-based permissions
    - Modified `DomainUserDetailsService` to add "ROLE_" prefix to roles for Spring Security
    - Restricted admin routes and API endpoints to users with ADMIN role
    - Added axios interceptors for automatic token handling on all requests
    - Authentication persistence across page refreshes
    - UserLayout with integrated logout functionality in header
    - Proper cleanup of authentication tokens on logout
    - Debug logging for authentication flow troubleshooting
- **Authentication Persistence Enhancements**:
    - Fixed lost authentication state after page refresh that was forcing users to re-login
    - Rewritten axios interceptors in App.tsx with proper token refresh logic to handle 401 errors correctly
    - Optimized AuthCheck component to prevent redundant API calls when already authenticated
    - Enhanced Redux authSlice to initialize authentication state directly from localStorage
    - Implemented differentiated error handling for network issues vs. authentication errors
    - Added proper TypeScript typing for axios interceptors and fixed TS2339 error with handlers property
    - Improved token naming consistency between login response and localStorage
    - Added fallback handling for different API response structures (result vs. data)
    - Implemented request retry prevention with proper _retry flag to avoid infinite loops
    - Added comprehensive logging for all authentication-related operations
    - Enabled token refresh to automatically retry the original failed request after refresh
- **Authentication in Booking Flow**:
    - Enhanced BookingForm.tsx with token validation checks before initiating booking
    - Implemented specific handling for 401 (Unauthorized) errors with user-friendly messages
    - Added redirect to login with delay to allow users to read error messages
    - Updated Login.tsx to detect and display when a session has expired
    - Fixed TypeScript type errors with refreshToken and axios interceptors
    - Improved user experience with clear feedback when authentication fails
    - Added smooth transitions when redirecting due to authentication issues
    - Implemented proper error handling for refresh token failures
- Vietnamese Language Support
  - Translation configuration with i18next
  - Vietnamese translation file
  - Vietnamese UI text
  - Comprehensive translations for booking form UI
  - Complete translations for enhanced placeholder components
  - Organized translation structure with logical namespaces (auth, profile, booking, etc.)
  - Form validation messages in Vietnamese
  - Consistent translation keys across similar components
  - Complete translations for user-facing components:
    - Register and Login pages
    - UserHeader with profile dropdown menu
    - UserProfile with personal information and password sections
    - BookingHistory with filtering tabs and details
    - Footer with all informational sections
- Admin Panel UI Development
  - Authentication bypass for UI preview
  - Direct access to admin panel without backend
  - Component layout and structure
  - Navigation implementation
  - Proper route structure with Layout wrapper
  - Consistent sidebar navigation with collapsible groups
  - Path prefixes for proper route nesting
  - Placeholder components for all menu items
  - Enhanced placeholder components with rich mock data and full UI:
    - RoomManagement.tsx with DataGrid, form validation, status indicators, support for different room types (2D, 3D, IMAX, VIP), interactive seat layout editor, and improved table/title UI aesthetics (padding, column distribution).
    - PromotionsManagement.tsx with rich promotion data, different discount types (percentage/fixed), various targets (all/movie/food/combo), and date range selection
    - TheaterLocations.tsx with location data, dual view modes (grid/list), Google Maps integration, and search functionality
- Showtime Management Interface
  - Showtime list view with DataGrid
  - Add/Edit showtime form
  - Movie-cinema-room relationship
  - Date and time selection
  - Price management
  - Status management
  - Vietnamese translations
- User Management Interface
  - User list view with DataGrid
  - Add/Edit user form
  - Membership level management
  - Status management
  - Form validation
  - Vietnamese translations
  - Avatar upload
  - Search and filtering functionality
- Booking System Core
  - Booking entity implementation
  - BookingStatus enum
  - Entity relationships
  - Repository implementation
  - Sales report functionality
  - Status management
  - Payment tracking
- User-Facing Booking System
  - Multi-step booking form with Material-UI Stepper
  - Showtime selection UI with radio buttons for available showtimes
  - Interactive seat map with visual seat status indicators
  - Food & drink selection with quantity controls
  - Booking summary with payment options
  - Form validation for each step
  - Mock data with simulated API delays
  - State management between steps
  - Responsive design considerations
  - Vietnamese translations for all UI elements
- Booking Management Interface
  - Booking list view with DataGrid
  - Booking details view
  - Status management with confirmation
  - Export functionality
  - Search and filtering
  - Vietnamese translations
  - Loading states and error handling
  - API integration
- Reports and Analytics Interface
  - Sales reports with charts and data tables
  - Attendance reports with visualizations
  - Date range selection with Vietnamese localization
  - Export functionality for both report types
  - Interactive charts using Recharts
  - Loading states and error handling
  - Vietnamese translations
  - Responsive layout
  - Backend data aggregation
  - Excel export with Apache POI
- Cinema Management features implemented with:
  - DataGrid for cinema listing with Vietnamese headers
  - Form validation using Formik and Yup with Vietnamese messages
  - Image upload with preview
  - Status management with Vietnamese indicators
  - Add/edit/delete UI
  - Routing and sidebar link
  - Vietnamese translations
- Branch Management features implemented with:
  - DataGrid for branch listing with Vietnamese headers
  - Form validation using Formik and Yup with Vietnamese messages
  - Cinema selection dropdown
  - Add/edit/delete UI
  - Routing and sidebar link
  - Vietnamese translations
- Invoice (Bill) Management features implemented with:
  - DataGrid for invoice listing with Vietnamese headers
  - Form validation using Formik and Yup with Vietnamese messages
  - User and booking selection dropdowns
  - Add/edit/delete UI
  - Routing and sidebar link
  - Vietnamese translations
- Partially functional placeholder components:
  - RolesManagement.tsx (basic structure)
  - MovieSchedules.tsx (basic structure)
  - DiscountManagement.tsx (basic structure)
  - NotificationManagement.tsx (basic structure)
- Admin Panel UI Enhancements:
    - Sidebar in `Layout.tsx` harmonized with dashboard design (styling, hover effects).
    - Dashboard charts (`BarChart`, `PieChart`, `LineChart` in `Dashboard.tsx`) visually enhanced (gradients, styling, tooltips, `ChartContainer` improvements).
- Theater Management Module (Admin Panel):
    - `TheaterManagement.tsx` page implemented with DataGrid, add/edit/delete dialogs (mocked), Formik/Yup validation, image upload placeholder.
    - `theater.ts` type definitions (`Theater`, `TheaterFormData`) created.
    - Styling consistent with modern dashboard design.
    - Resolved `imageUrl` TypeScript errors in form submission logic.
- Linter Error Fixes:
    - Corrected Recharts prop usage in `Dashboard.tsx` (removed invalid animation props from top-level chart components).
    - Added placeholder `Register.tsx` component at `admin-interface/src/pages/auth/Register.tsx` to resolve import error in `routes.tsx`.
    - Addressed `MovieForm` prop type errors in `routes.tsx` by passing `null` for `movie` and empty functions for callbacks (temporary measure).
    - Fixed TypeScript errors in form validation by properly handling field error checks.
    - Fixed TypeScript errors in UserHeader component related to property access.
    - **Showtime Generation Endpoint Functional (`/showtime/public/add-showtimes-for-active-movies`) (LATEST)**:
        - Successfully debugged and fixed the endpoint for generating showtimes for movies with "SHOWING" status.
        - **AuthenticationFilter Fix**: Modified `AuthenticationFilter.java` using `AntPathMatcher` to correctly allow public access to `/showtime/public/**` even when a JWT token is present, resolving initial 401 errors.
        - **ShowtimeController Fixes & Debugging**:
            - Changed movie status query from a hardcoded "ACTIVE" string to `StatusMovie.SHOWING` enum.
            - Resolved `NoResourceFoundException` (initially reported as "Uncategorized error") by:
                - Adding a `/public/ping` test endpoint to confirm controller reachability.
                - Systematically uncommenting logic in `addShowtimesForActiveMoviesPublic` method, which helped isolate the issue to the status query and confirm overall method mapping and logic flow.
        - **Outcome**: Endpoint now successfully creates `Schedule`, `Showtime`, and `ShowtimeSeat` entities, unblocking the movie booking flow.
        - **Learnings**: Reinforced the importance of `AntPathMatcher` for wildcard public paths with JWT, checking detailed server logs, step-by-step code isolation for debugging, and using Enums for status queries.
- Minor UI Fixes:
    - Login Page: Removed unnecessary "auth.noAccount" text.
    - `Register.tsx`: Simplified by removing a `Typography` wrapper.
    - Translation Files: Added "logout" key for consistency.
- **Movie List Display & Booking Flow Stability (LATEST FIXES)**:
    - **Backend Fixes (JSON & Circular References)**:
        - Resolved JSON serialization issues caused by circular dependencies in JPA entities.
            - Strategically applied `@JsonIgnore` to back-references in entities like `Movie`, `Category`, `Schedule`, `Review`, `Actor` (initial approach for movie list).
            - Applied `@JsonManagedReference` and `@JsonBackReference` to resolve circular dependencies involving `Bill`, `Promotion`, `User`, `Review` (secondary fix for broader stability, e.g., in movie details if reviews are deeply nested).
        - Corrected the "concatenated JSON" / "double JSON" error by modifying `GlobalExceptionHandler` and `ExceptionHandlingFilter` to check `HttpServletResponse.isCommitted()` before attempting to write an error response body.
    - **Frontend Fixes (Movie Details & Actor Display)**:
        - Defined `Actor` interface in `types/movie.ts`.
        - Updated `Movie` interface to use `actors: Actor[]`.
        - Modified `MovieDetails.tsx` to import `Actor`, use type assertion `(actor: Actor)` in map function, and correctly access actor properties (`actor.name`, `actor.profilePath`, `actor.character`).
    - **Outcome**:
        - `movieService.ts` now successfully parses API responses for both movie list and movie details.
        - The movie list displays correctly in `MovieList.tsx`.
        - Movie details, including actor information, display correctly in `MovieDetails.tsx`.
        - The issue of being redirected to login when navigating to movie-related pages or attempting to book tickets has been resolved.
        - Overall stability of movie browsing and detail view significantly improved.

- **Showtime Generation and Display Fully Functional (LATEST)**:
    - **Issue Addressed**: Users unable to see showtimes on UI, despite backend indicating showtimes were generated/existed. This was due to a cascade of issues related to API path consistency and security configurations.
    - **Backend API Path and Security Fixes**:
        - **`AuthenticationFilter.java`**: Updated `publicPaths` to include the `/api/v1/` prefix for all relevant public endpoints (e.g., `/api/v1/showtime/public/**`, `/api/v1/auth/login`, etc.) to ensure correct identification of public paths and prevent premature token validation errors (401).
        - **`SecurityConfiguration.java`**: Updated `requestMatchers` for `permitAll()` rules to include the `/api/v1/` prefix for all corresponding public endpoints (e.g., `/api/v1/showtime/public/**`, `/api/v1/showtime/*/by-date`, `/api/v1/movie/**`, `/api/v1/auth/**`, etc.). This resolved 403 errors caused by `AuthorizationFilter` when `permitAll()` paths didn't match the actual request URI.
        - **`ShowtimeController.java`**:
            - Changed class-level `@RequestMapping` from `"/showtime"` to `"/api/v1/showtime"` to align with the `/api/v1/` convention.
            - Changed method-level mapping for `addShowtimesForActiveMoviesPublic` from `@GetMapping` to `@PostMapping` to match the intended HTTP method.
            - These changes resolved `NoResourceFoundException` (which appeared as a 500 error) for the `POST /api/v1/showtime/public/add-showtimes-for-active-movies` endpoint.
    - **Outcome**:
        - The endpoint `POST /api/v1/showtime/public/add-showtimes-for-active-movies` is now correctly mapped, secured, and callable. It successfully executes its logic (and reports "SKIPPED" if showtimes already exist).
        - The endpoint `GET /api/v1/showtime/{movieId}/by-date` is now correctly configured as `permitAll()` and returns showtime data successfully when called without authentication (e.g., from Postman or UI).
        - Showtimes are now correctly displayed on the user interface.
    - **Key Learnings**: Reinforced the critical importance of API path and HTTP method consistency across controller mappings, security filter configurations (`AuthenticationFilter`, `SecurityConfiguration`), and frontend API calls. Identified common error patterns (401, 403, `NoResourceFoundException`) related to security and mapping misconfigurations.

- **Showtime Display in Booking Form Fully Functional (LATEST)**:
    - **Issue Addressed**: Lịch chiếu không hiển thị trên UI (`BookingForm.tsx`) mặc dù API backend trả về dữ liệu.
    - **Frontend Fixes (`BookingForm.tsx`)**:
        -   **Type Alignment**: Chuyển từ việc sử dụng kiểu `Showtime[]` (từ `bookingService.ts`) sang sử dụng các kiểu chi tiết hơn từ `types/showtime.ts` (`MovieShowtimesResponse`, `BranchWithShowtimes`, `ShowtimeDetail`).
        -   **State Management**:
            -   Sử dụng state `showtimeBranches: BranchWithShowtimes[]` để lưu trữ dữ liệu lịch chiếu theo cấu trúc lồng nhau (cụm rạp -> danh sách suất chiếu).
            -   Thêm state `currentMovieInfo` để lưu `movieId` và `movieName` từ response API.
        -   **Data Fetching Logic (`fetchShowtimesData`)**:
            -   Cập nhật để xử lý đúng `MovieShowtimesResponse` (lấy từ `response.data.result` của `bookingService.getShowtimesByMovie`).
            -   Gán `apiResponse.branches` cho `showtimeBranches` và thông tin phim cho `currentMovieInfo`.
        -   **Helper Functions (`getSelectedShowtimeDetails`)**:
            -   Điều chỉnh để làm việc với cấu trúc `showtimeBranches` và `ShowtimeDetail`, lấy thông tin phim từ `currentMovieInfo`.
        -   **UI Rendering**:
            -   Cập nhật logic render để lặp qua `showtimeBranches`, sau đó lặp qua `branch.showtimes` để hiển thị thông tin chi tiết của từng suất chiếu (`scheduleTime`, `roomName`, `roomType`).
            -   Sử dụng ID kết hợp (`scheduleId`-`roomId`) cho việc chọn suất chiếu.
            -   **Handling Missing Data**: Tạm thời xử lý việc thiếu `price` và `availableSeats` trong `ShowtimeDetail` bằng giá trị mặc định hoặc thông tin thay thế.
    - **Outcome**: Lịch chiếu phim hiển thị chính xác và có thể chọn được trong `BookingForm.tsx`, cho phép người dùng tiếp tục quá trình đặt vé.

- **TypeScript Interface Errors Fixed (LATEST)**:
    - **Issue Addressed**: Project had multiple TypeScript errors due to mismatches between interface definitions and actual usage in the code, particularly with showtime-related interfaces.
    - **Root Issues**:
        - `BranchWithShowtimes` interface lacked properties `address`, `hotline`, and `imageUrl` that are used in `MovieDetails.tsx`.
        - `ShowtimeDetail` interface was missing `scheduleDate` property used for URL construction in booking flow.
        - Some services methods were missing proper type declarations for `ApiResponse<T>`.
        - Variables of type `unknown` (like error handling) were being accessed without proper type checking.
    - **Solution Implemented**:
        - **Enhanced `types/showtime.ts`**:
            - Added missing properties to `BranchWithShowtimes` interface (`address?: string`, `hotline?: string`, `imageUrl?: string`).
            - Added `scheduleDate?: string` and `scheduleEndTime?: string` to `ShowtimeDetail` interface.
            - Enhanced `MovieShowtimesResponse` with additional optional properties like `imageUrl`, `duration`, etc.
            - Centralized `ApiResponse<T>` interface definition in this file for consistent imports elsewhere.
        - **Updated Service Methods**:
            - Applied proper type checking for errors with type assertion `const err = error as any` before accessing properties.
            - Updated return type declarations to use the interfaces from `types/showtime.ts`.
        - **Fixed Import Declarations**:
            - In `BookingForm.tsx`, added import of `ApiResponse` from `types/showtime.ts` and removed local definition.
    - **Outcome**: All TypeScript errors have been resolved, enabling successful compilation. Consistent interface usage across components improves code quality and prevents runtime errors from missing properties.

- **Date Picker Implementation and Simplification (LATEST)**:
    - **Issue Addressed**: Implementation of DatePicker from Material UI in MovieDetails.tsx led to numerous dependency and compatibility errors with date-fns library.
    - **Root Issues**:
        - Incompatibility between @mui/x-date-pickers (with AdapterDateFnsV3) and existing date-fns version
        - Vietnamese locale import issues in date-fns
        - Persistent module errors even after updating packages and clearing cache
    - **Solution Implemented**:
        - Replaced complex DatePicker component from @mui/x-date-pickers with standard TextField input of type "date"
        - Maintained useState implementation for setting default date (today)
        - Updated change handlers to work with standard date input
        - Preserved usage of selected date in React Query for fetching showtime data
    - **Outcome**: Simplified solution that maintains the date selection functionality while eliminating dependency issues. Users can now select dates to view showtimes without encountering errors, and the application is more stable with fewer complex dependencies.

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
   - [x] Ticket booking flow (Initial UI with mock data complete, API integration for core booking done)
     - [ ] **Implement Standalone Cinema/Theater Selection step**
        - [ ] Allow filtering by city/region.
        - [ ] Display different prices based on cinema, day of the week, and showtime.
     - [x] Implement Showtime Selection step in `BookingForm.tsx` (UI with mock data, API integrated).
     - [x] Implement Seat Selection step in `BookingForm.tsx` (interactive map with mock data, API integrated).
     - [ ] **Upgrade Seat Selection UI**
        - [ ] Clearly differentiate seat types (e.g., regular, VIP, couple/sweetbox).
        - [ ] Show varying prices per seat type directly on the seat map or legend.
        - [ ] Improve visual cues for selected, booked, and unavailable seats.
     - [x] Implement Food & Drinks step in `BookingForm.tsx` (UI with mock data, API integrated).
     - [ ] **Develop Enhanced Food & Drink Selection**
        - [ ] Offer options for different sizes (e.g., Small, Medium, Large for drinks/popcorn).
        - [ ] Provide flavor choices where applicable.
        - [ ] Showcase popular combos with clear pricing and contents.
     - [x] Implement Confirm & Pay step in `BookingForm.tsx` (summary, payment placeholder, API integrated).
     - [ ] **Refine Confirmation & Payment UI**
        - [ ] Provide a very clear and itemized booking summary before payment.
        - [ ] Integrate/mock multiple payment methods (e.g., MoMo, ZaloPay, Credit Card, Bank Transfer placeholders).
     - [x] Integrate API calls for all booking steps.
     - [x] Implement symbolic payment process (no actual payment gateway integration).
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