# Active Context

## Current Focus
- **Enhance User-Facing Booking Flow to mirror MoMo Cinema's UX (Primary Focus):**
    - Implement enhancements to `MovieList.tsx` as the immediate next step.
    - Systematically improve the entire booking flow: `MovieDetails.tsx`, cinema/location selection, seat selection UI, food/drink selection, payment interface, and booking history display.
- Verify frontend functionality (Ongoing, especially after backend fixes).
- Address warnings from backend startup (MapStruct unmapped properties, Hibernate open-in-view).
- Continue with frontend testing, data integration, and UI polish.

## Recent Changes
- **MoMo Cinema Booking Flow Analysis & Planning (Key Recent Activity):**
    - **Minor UI Fixes Implemented:**
        - Removed "auth.noAccount" text from the login page.
        - Simplified `Register.tsx` by removing unnecessary `Typography` wrapper.
        - Added "logout" key to the translation file for consistency.
    - **MoMo Cinema Booking Flow Analysis Conducted:**
        - Key steps identified: Homepage (listings, posters, ratings, age restrictions), Movie Detail (cast/crew, trailer), Cinema Selection (by location), Showtime Selection (date/time, pricing), Seat Selection (visual types), Food/Beverage (combos), Confirmation/Payment, Order Completion (QR/barcode).
    - **Comparison with Current System & Identified Improvements:**
        - `MovieList.tsx`: Needs better categorization, ratings, age restrictions.
        - `MovieDetails.tsx`: Requires more comprehensive info (cast, director, trailer).
        - New separate cinema/location selection step needed.
        - Seat selection UI: Needs to show different seat types and pricing.
        - Food/drink selection: Requires size options and combos.
        - Payment interface and booking history display need improvements.
    - **Memory Bank Update:** Files were updated to reflect these new plans (this current update log reflects that process).
- **Security Access Control Implementation**:
  - **Issue Identification**:
    - Discovered that users with role USER could access admin pages (/admin/dashboard)
    - Found that role-based access control was not properly implemented in both frontend and backend
  - **Frontend Fixes**:
    - Created `AdminProtectedRoute` component that checks user role is 'ADMIN' before allowing access to admin routes
    - Updated routes.tsx to use AdminProtectedRoute for all admin-specific paths
    - Removed mock data in authSlice.ts that was bypassing proper authentication
    - Enhanced authentication persistence by adding axios interceptors in App.tsx to handle token expiration
    - Improved AuthCheck.tsx to properly fetch user details when token exists in localStorage
    - Added detailed logging for authentication debugging
  - **Backend Fixes**:
    - Updated `SecurityConfiguration.java` to apply role-based access control to admin endpoints
    - Modified `DomainUserDetailsService.java` to add "ROLE_" prefix to role names for Spring Security compatibility
    - Secured API endpoints with role-based permissions (hasRole("ADMIN"))
  - **UI Improvements**:
    - Implemented UserLayout for all user-facing pages to provide consistent header with logout functionality
    - Fixed routing structure to nest user pages properly
    - Ensured proper user role checking and redirect after login/refresh
    - Added logout functionality accessible from both desktop and mobile views

- **User Authentication and Registration Flow - Troubleshooting & Fixes (Frontend & Backend)**:
    - **Initial Login Attempt (404 Error)**:
        - Symptom: Frontend login request to `/auth/login` (on port 3000) resulted in a 404 Not Found.
        - Cause: Frontend was sending API requests to itself instead of the backend (port 8080) because no proxy was configured.
        - Fix: Added `"proxy": "http://localhost:8080"` to `admin-interface/package.json` and restarted the frontend development server.
    - **Login Attempt (Backend 500 Error - User Not Found)**:
        - Symptom: After proxy fix, login request to `/auth/login` (forwarded to backend) resulted in a 500 Internal Server Error. Backend log showed `Failed to find user 'user@example.com'` followed by a confusing `User already exists` error from `AuthServiceImpl`.
        - Cause: The test user `user@example.com` did not exist in the database with that username.
        - Verification Step: Decided to test the registration flow first.
    - **Registration Attempt (Backend 500 Error - `full_name` NULL constraint)**:
        - Symptom: Frontend registration request to `/auth/register` resulted in a 500 Internal Server Error. Frontend displayed "Uncategorized error".
        - Cause: Backend log showed `ERROR: null value in column "full_name" of relation "users" violates not-null constraint`.
        - Investigation: Confirmed `Register.tsx` sends `fullName`. Found mismatch: frontend sends `fullName` (camelCase) while backend DTO `RegisterRequest.java` had `fullname` (lowercase). Also, `RegisterRequest.java` was missing an `email` field, though the entity had it.
        - Fix (Backend DTO & Service):
            - Modified `RegisterRequest.java`: changed field `fullname` to `fullName`, added `email` field with validation.
            - Modified `AuthServiceImpl.java`: updated to use `registerRequest.getFullName()`, added `user.setEmail(registerRequest.getEmail())`, and included a check `userRepository.existsByEmail()`.
    - **Registration Attempt (Backend Build FAILED - Missing ErrorCode)**:
        - Symptom: Backend build failed with `cannot find symbol: variable EMAIL_ALREADY_EXISTS location: class ErrorCode`.
        - Cause: The new `ErrorCode.EMAIL_ALREADY_EXISTS` used in `AuthServiceImpl` was not yet defined in `ErrorCode.java`.
        - Fix: Added `EMAIL_ALREADY_EXISTS(1004, "Email already exists", HttpStatus.CONFLICT)` to `src/main/java/com/booking/movieticket/exception/ErrorCode.java`.
    - **Registration Successful, Subsequent Login OK (Backend) but "Login failed" (Frontend)**:
        - Symptom: Registration worked. Login request `/auth/login` received 200 OK from backend, backend logs showed "Authenticated user". However, frontend UI still displayed "Login failed".
        - Frontend Console: Showed `GET http://localhost:3000/api/users/me 500 (Internal Server Error)` originating from `Login.tsx:56`.
        - Frontend Network Tab for `/auth/login` Response: Backend returned `{"message": "Authentication successful", "result": {"accessToken": "...", "refreshToken": "..."}}`.
        - Cause 1 (Frontend Token Parsing): `Login.tsx` was trying to access `response.data.data` for tokens, but backend returned them in `response.data.result`.
        - Fix 1 (Frontend `Login.tsx`): Changed token extraction to `response.data.result`.
        - Cause 2 (Frontend API Call for User Info): After fixing token parsing, the call to `GET /api/users/me` was made, but it failed with a 500 error. Backend logs for this specific request were initially uninformative beyond Spring Security securing the path.
        - Investigation (Backend `/api/users/me`): Realized `UserController` was mapped to `/user` and lacked a specific handler for `/me` or `/api/users/me`.
        - Fix 2 (Backend & Frontend):
            - Created `UserDetailResponse.java` DTO.
            - Added `@GetMapping("/me") public ResponseEntity<ApiResponse<UserDetailResponse>> getCurrentUser()` method to `UserController.java` to handle `GET /user/me`.
            - Modified `admin-interface/src/pages/auth/Login.tsx` to call `axios.get('/user/me')` instead of `/api/users/me` and parse user from `userResponse.data.result` (tentatively).
    - **Login and Redirection Successful**:
        - After all fixes, user registration and login flows are now working, and the user is correctly redirected to the admin dashboard upon successful login.
- **Login Redirection Fix (Frontend)**:
    - Identified that all users were redirected to `/admin/dashboard` post-login.
    - Removed hardcoded `role: 'ADMIN'` from login request payload in `Login.tsx`.
    - Updated `Login.tsx` to fetch user role from `/user/me` response.
    - Implemented conditional redirection:
        - Admins are redirected to `/admin/dashboard`.
        - Regular users are redirected to `/` (which maps to `/movies` - the user homepage).
    - Verified that regular users are correctly redirected to `/movies` after login.

- **Backend Startup Troubleshooting & Fixes**:
    - Resolved `AnnotationException` related to incorrect `mappedBy` properties in the `Cinema` entity:
        - Removed the direct `@OneToMany` relationship from `Cinema` to `Room` as `Room` is related via `Branch`.
        - Removed the direct `@OneToMany` relationship from `Cinema` to `Showtime` as `Showtime` does not have a direct `cinema` field.
    - Resolved `QueryCreationException` in `BookingRepository.findSalesReport`:
        - Modified the JPQL query to correctly join `Booking` -> `Showtime` -> `Schedule` -> `Movie` to fetch movie details.
        - Ensured `WHERE` and `ORDER BY` clauses reference the correct aliases after rejoining.
    - Addressed DDL execution error `ERROR: column "address" of relation "cinemas" contains null values`:
        - Modified the `Cinema` entity's `address` field by removing `nullable = false` from the `@Column` annotation, allowing null values to prevent startup failure due to existing data.
- **MovieForm Routes Refinement**:
    - Created a new `MovieFormWrapper.tsx` component to handle data fetching and state management:
        - Implemented proper data fetching for movie edit mode using `useQuery`
        - Added loading and error states
        - Created mock API functions for create/update operations using `useMutation`
        - Handled navigation after save/cancel actions
    - Created centralized type definitions:
        - Added `admin-interface/src/types/movie.ts` with `Movie` and `MovieFormData` interfaces
        - Created a barrel file `admin-interface/src/types/index.ts` for clean imports
    - Updated `MovieForm.tsx` to:
        - Use the new centralized type definitions
        - Handle file uploads properly with the `posterFile` field
        - Improve the component interface to work with `MovieFormData`
    - Updated `routes.tsx` to use `MovieFormWrapper` instead of directly using `MovieForm`
    - Updated `MovieManagement.tsx` to:
        - Use the new centralized type definitions
        - Update the `handleSave` function to work with `MovieFormData`
        - Add proper handling for poster file uploads
    - Used consistent barrel imports across components for better maintainability
- **User Authentication UI Implementation**:
    - Updated `Login.tsx` with existing API call logic and UI.
    - Significantly updated `Register.tsx`:
        - Added state management using Formik.
        - Implemented validation using Yup.
        - Added logic to call the registration API endpoint.
        - Included loading and error/success message handling.
        - Integrated `useTranslation` for i18n.
        - Added link to Login page.
    - Verified routes in `routes.tsx`.
- **API Integration for User-Facing Booking System**:
    - Created `bookingService.ts` service file for handling all booking-related API calls
    - Implemented interfaces for booking data types (Showtime, Seat, FoodItem, etc.)
    - Updated `BookingForm.tsx` to replace mock data with real API calls
    - Added proper error handling and loading states
    - Implemented symbolic payment process that simulates payment without actual gateway integration
    - Added booking success UI with booking details display
    - Structured API endpoints to match expected backend structure
- **Movie Schedule Calendar Integration for Rooms**:
    - Added a "Calendar" button to the `RoomManagement` component that links to room-specific showtimes.
    - Created a new `RoomScheduleCalendar` component, adapting `MovieScheduleCalendar` for room-specific views.
    - Implemented room-specific filtering of showtimes in `RoomScheduleCalendar`.
    - Added new routes for room schedules in `routes.tsx`.
    - Enabled features for viewing, adding, editing, and deleting movie showtimes for specific rooms, including time zone selection and date/time management.
    - Fixed linter error related to `RoomScheduleCalendar` import in `routes.tsx`.
- **Room Management UI Enhancements**:
    - Improved the title area of the `RoomManagement` page by adding padding and a bottom border for better visual separation.
    - Added padding to the `Paper` component that wraps the `DataGrid` for a less cramped look.
    - Configured `DataGrid` columns (`id`, `name`, `theaterName`, `roomType`, `status`) to use `flex` and `minWidth` properties, allowing them to distribute space more effectively and fill the table width. Adjusted fixed widths for `capacity`, `dimensions`, and `actions` columns.
    - Styled `DataGrid` column headers with a background color, bottom border, and bolded titles for improved readability.
- **Movie Schedule Calendar Implementation**:
    - Created a new `MovieScheduleCalendar.tsx` component using FullCalendar for a calendar-based movie schedule management interface.
    - Implemented time zone support with multiple selectable time zones (Vietnam, Bangkok, Singapore, Tokyo, London, New York).
    - Added interactive functionality for creating, editing, and deleting movie schedules.
    - Implemented filtering by cinema, movie, and room with dynamic room filtering based on selected cinema.
    - Added a dialog for schedule creation and editing with form validation.
    - Created comprehensive Vietnamese translations for all calendar UI elements.
    - Added the navigation item back to the sidebar under the Movies Management section.
    - Styled with Material-UI components to maintain design consistency.
- **Admin Panel Navigation Update**:
    - Removed "Lịch chiếu phim" (Movie Schedules) tab from the movies management section in the sidebar navigation.
    - Deleted the MovieSchedules.tsx component as it's no longer needed.
    - Updated progress.md to reflect this change.
- **Admin Panel Navigation Update**:
    - Removed "Vai trò & Phân quyền" (Roles & Permissions) tab from the user management section in the sidebar navigation.
    - Deleted the RolesManagement.tsx component as it's no longer needed.
    - Updated progress.md to reflect this change.
- **Admin Panel Placeholder Components - Enhanced Implementation**:
    - **RoomManagement.tsx**: Implemented with mock data for cinema rooms (2D, 3D, IMAX, VIP), added DataGrid display with comprehensive CRUD operations, form validation using Formik/Yup, and visual status indicators.
    - **PromotionsManagement.tsx**: Created rich mock data for different promotion types (percentage/fixed discounts), various targets (all/movie/food/combo), date range selection with Vietnamese localization, and comprehensive form validation.
    - **TheaterLocations.tsx**: Enhanced with theater location mock data, dual view modes (grid/list), Google Maps integration, search functionality, and detailed location management. Had linter errors regarding missing `MenuItem` imports which were attempted to be fixed.
    - All implementations maintained consistency with the existing UI patterns, used Material-UI components, included Vietnamese translations, and followed the project's established design conventions.
- **User-Facing Booking System - Full Implementation**:
    - Completed all four steps of the multi-step booking form in `BookingForm.tsx`:
        - **Showtime Selection**: Implemented UI for displaying available showtimes with movie time, room name, and available seats. Added state management for selected showtime and form validation.
        - **Seat Selection**: Created an interactive seat map with visual representation of rows and seats. Implemented seat status management (Available, Booked, Selected, Unavailable) with appropriate styling and click handlers for seat selection/deselection.
        - **Food & Drinks**: Built a grid layout of available food items with images, names, prices, and quantity selectors. Implemented state management for selected items and quantities.
        - **Confirm & Pay**: Designed a comprehensive booking summary showing details of selected showtime, seats, food items with quantities and subtotals, a grand total calculation, and payment method options.
    - Added appropriate TypeScript interfaces for all form components (`Showtime`, `Seat`, `SeatStatus`, `FoodItem`, `FoodSelection`).
    - Implemented form validation using Formik and Yup for all steps.
    - Added proper state management between form steps to ensure data consistency.
    - Added loading states and error handling for each step.
    - Currently using mock data with simulated API delays.
- **Vietnamese Localization**:
    - Added comprehensive Vietnamese translations for the entire booking form UI in `admin-interface/src/locales/vi/translation.json`.
    - Added a dedicated `booking` section in the translation file with nested keys for all UI elements.
    - Ensured proper use of the translation function `t()` throughout the booking form for consistent Vietnamese display.
    - Added Vietnamese translations for new placeholder components (RoomManagement, PromotionsManagement, TheaterLocations).
- **Linter Error Resolution**:
    - Fixed TypeScript errors in `BookingForm.tsx` related to formik validation by properly handling field error checks.
    - Resolved issues with `Register.tsx` import in `routes.tsx` which was causing persistent linter errors.
    - Explicitly typed Formik's fields to prevent TypeScript "argument of type string is not assignable to type never" errors.
    - Encountered but couldn't fully resolve import errors in TheaterLocations.tsx related to MenuItem components.
- **Vietnamese Localization Enhancements**:
    - Fixed translation issues in the user interface components for better Vietnamese language support:
        - Added comprehensive translations for Register page including form labels and validation messages
        - Added translations for the UserHeader component including profile dropdown menu items
        - Added translations for UserProfile component with personal information editing and password changing sections
        - Added translations for BookingHistory component with filtering tabs and booking details display
        - Added translations for the Footer component with all links and information sections
    - Organized translations hierarchically in the i18n structure to match UI component hierarchy:
        - Created separate translation namespaces (auth, profile, booking, bookings.history, etc.) for better organization
        - Added proper validation message translations for form validation
        - Ensured consistent translation keys across similar components
    - Fixed TypeScript errors in UserHeader component related to property access

## Next Steps
1.  **MoMo-Inspired Booking Flow Enhancements (User Interface - IMMEDIATE PRIORITY):**
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
2.  **Frontend Testing & Verification** (Ongoing):
    *   Thoroughly test the Movie Browsing UI and other frontend features to ensure they fetch and display data correctly now that the backend is running.
    *   Test user and admin role separation to ensure security measures are working correctly.
    *   Verify page refresh behavior maintains authentication state properly.
    *   Check that logout functionality works as expected across all pages.
2.  **Backend Warning Resolution**:
    *   Address MapStruct "Unmapped target properties" warnings in mappers (e.g., `CategoryMapper`, `CinemaMapper`, `ActorMapper`, `MovieMapper`, `UserMapper`) by either ignoring base entity fields explicitly or ensuring they are correctly mapped if intended.
    *   Evaluate and explicitly configure `spring.jpa.open-in-view` (currently enabled by default, causing a warning).
3.  **Data Integrity for `Cinema.address`**:
    *   Review existing `NULL` values in the `cinemas` table for the `address` column.
    *   Decide on a strategy: update existing `NULL`s to valid addresses or confirm that `address` can indeed be optional for cinemas. If it must be mandatory, plan to re-introduce `nullable = false` after data cleanup.
4.  **Continue Previously Planned Frontend Work**:
    *   **Testing**: Conduct a thorough review and test of the implemented features, especially the authentication flow and booking form.
    *   **Data Integration**: Xử lý vấn đề dữ liệu cho các UI hiện tại:
        *   Triển khai mock data cho Movie Browsing UI nếu backend chưa sẵn sàng (evaluate if still needed now backend is up).
        *   Tạo các hàm API service giả lập để đảm bảo UI hoạt động mà không cần backend đầy đủ (evaluate if still needed).
    *   **UI Polish**: Review all user-facing components to ensure consistent styling and proper Vietnamese translations.
5.  **Verify User Info Display After Login**:
    *   Confirm that user information (e.g., name in header, profile details) is correctly displayed after login, which depends on the `userResponse.data.result` assumption for `/user/me` in `Login.tsx`. Adjust if necessary based on the actual API response structure of `/user/me`.

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
- **Missing Controller Endpoint Mappings**: If a frontend API call reaches the backend but there's no specific controller method mapped to that exact path and HTTP method, it can lead to generic errors (like 500 Uncategorized) without clear application-level logs.
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

## Recent Updates (11/29/2023)

### Fixed API Data Handling in MovieList

Fixed the "Cannot read properties of undefined (reading 'length')" error in the MovieList component by:

1. Improving data handling in MovieList.tsx:
   - Added Array.isArray() check before accessing the length property
   - Added default values for undefined data
   - Added logging to debug the actual data structure from the API

2. Normalized API data in movieService.ts:
   - Created normalizeResponse() function to handle different API response formats
   - Added support for multiple response structures (data in result, data, or directly)
   - Ensured consistent data structure is returned to the frontend

This error occurred due to inconsistency between the data structure expected by the frontend (movie array in .content) and the actual data structure from the API. 