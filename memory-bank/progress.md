# Progress Tracking

## What Works
- Project initialization with React and TypeScript
- Material-UI theme configuration
- Basic routing structure
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
- Minor UI Fixes:
    - Login Page: Removed unnecessary "auth.noAccount" text.
    - `Register.tsx`: Simplified by removing a `Typography` wrapper.
    - Translation Files: Added "logout" key for consistency.

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

## Known Issues
- Some linter errors in TheaterLocations.tsx related to MenuItem imports
- ~~MovieForm routes using placeholder props instead of actual data flow~~ (Resolved with MovieFormWrapper implementation)
- ~~Backend startup failures due to Hibernate AnnotationException and QueryCreationException~~ (Resolved)
- ~~Backend DDL errors due to NOT NULL constraint on `cinemas.address` with existing NULL data~~ (Resolved by making address nullable in Entity)
- Booking form using mock data instead of API integration
- Missing content for some placeholder components
- Lack of proper error handling for offline mode
- Limited mobile responsiveness for complex UIs like seat selection
- Incomplete translations for some newer components
- Missing confirmation dialogs for critical actions in some components
- Limited filtering options in some DataGrid implementations
- Lack of proper error handling for image upload failures in some components

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
2. **Frontend Testing & Verification (Post-Backend Fixes)**:
    *   Thoroughly test Movie Browsing UI and other frontend features to ensure correct data fetching and display now that the backend is operational.
    *   Verify API integrations across all user-facing features.
2. **Backend Warning Resolution**:
    *   Address MapStruct "Unmapped target properties" warnings in various mappers.
    *   Evaluate and explicitly configure `spring.jpa.open-in-view`.
3. **Data Integrity for `Cinema.address`**:
    *   Review `NULL` values in `cinemas.address` and decide on a data update strategy or confirm if optionality is permanent.
4. Complete Booking System:
   - Implement booking service layer
   - Add booking controller
   - Create booking DTOs
   - Add validation
   - Implement booking workflow
2. Implement Payment Integration:
   - Implement simplified payment flow (symbolic only, no actual payment gateway integration required)
   - Add basic payment status tracking
   - Add payment simulation for user experience
   - Add Vietnamese translations for payment UI
3. Add Real-time Updates:
   - Implement WebSocket
   - Add real-time notifications
   - Add live booking updates
4. Admin Panel Development:
   - Add mock data for UI preview
   - Enhance error handling for offline mode
   - Add loading states for data-dependent components
5. New Modules:
   - Complete Cinema (Theater) management module
   - Complete Branch management module (backend integration, enhancements)
   - Complete Invoice (Bill) management module (backend integration, enhancements)

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