# System Patterns

## Architecture Overview
- Spring Boot backend with React frontend
- RESTful API design
- JWT authentication
- Role-based access control
- Vietnamese language support
- Responsive design
- Data visualization
- Excel export functionality
- Booking system with payment integration
- Data Fetching Architecture:
  - React Query for server state management
  - Centralized query client configuration
  - Automatic background refetching
  - Cache invalidation strategies
  - Loading and error states
  - Optimistic updates
  - Infinite queries
  - Parallel queries
  - Dependent queries
  - Query retries and fallbacks

## Key Technical Decisions
1. Frontend
   - React with TypeScript
   - Material-UI for components
   - Formik with Yup for validation
   - i18next for translations
   - Recharts for data visualization
   - Axios for API calls
   - React Query for data fetching
   - @tanstack/react-query v5 for data fetching
   - TypeScript 5.3.3 for type safety
   - Query client configuration at app root
   - Stale time and cache time settings
   - Error boundary implementation
   - Loading state patterns

2. Backend
   - Spring Boot 3.x
   - Spring Security
   - Spring Data JPA
   - PostgreSQL database
   - JWT authentication
   - Apache POI for Excel export
   - WebSocket for real-time updates
   - JPA entity relationships
   - Enum-based status management

3. Data Visualization
   - Recharts library
   - Line charts for trends
   - Bar charts for comparisons
   - Date range selection
   - Responsive design
   - Vietnamese localization

4. Export Functionality
   - Apache POI for Excel
   - Custom formatting
   - Date localization
   - File naming conventions
   - Error handling

5. Booking System
   - JPA entity relationships
   - Status management using enums
   - Lazy loading for performance
   - Transaction management
   - Payment integration
   - Vietnamese localization
   - Authentication validation in booking flow
   - Token refresh during long booking sessions
   - Session expiration handling with user feedback
   - Graceful redirection to login when needed

## Design Patterns
1. Frontend
   - Component-based architecture
   - Custom hooks for logic
   - Context for state management
   - Higher-order components
   - Form validation patterns
   - Error boundary pattern
   - Loading state pattern
   - Responsive design pattern
   - Data visualization pattern
   - Export functionality pattern
   - React Query Patterns:
     - Query hooks for data fetching
     - Mutation hooks for updates
     - Query invalidation
     - Optimistic updates
     - Infinite queries
     - Parallel queries
     - Query retries
     - Error handling
     - Loading states
     - Cache management
   - API Data Normalization Pattern:
     - Centralized response normalization in service files
     - Data field mapping to handle different API naming conventions
     - Recursive data search for complex nested response structures
     - Fallback fields for handling missing or alternative data sources
     - Type-safe conversion between incompatible data types (string vs string[])
     - Component-level data adaptation with local variables
     - Comprehensive logging for API response troubleshooting
     - Default values for graceful handling of missing data
   - **Circular Reference Resolution Pattern**:
     - Multi-strategy extraction with progressively more aggressive approaches
     - Disabled automatic JSON parsing using axios `transformResponse`
     - Manual JSON parsing with error handling
     - Object cloning to break circular references
     - Targeted removal of specific circular paths (category.movies, schedule.movie)
     - Depth-limited recursive search to prevent stack overflow
     - RegEx-based data extraction as fallback strategy
     - Static sample data as final fallback
     - Detailed console logging of extraction process
     - Set-based tracking of processed object IDs to prevent duplicates
     - Direct extraction bypassing normalization when needed
   - **Authentication Error Handling Pattern**:
     - Pre-operation token validation to prevent unnecessary API calls
     - Specific error handling for 401 (Unauthorized) status codes
     - Differentiated handling of network vs. authentication errors
     - Delayed redirection with user feedback for better UX
     - Detection and display of expired session state
     - Token refresh with automatic request retry
     - Graceful degradation when refresh token fails
     - Clear localStorage cleanup on authentication failure
     - TypeScript-safe token handling with proper null/undefined checks
     - Consistent messaging for authentication errors

2. Backend
   - Repository pattern
   - Service layer pattern
   - DTO pattern
   - Controller pattern
   - Exception handling pattern
   - Transaction management
   - Data aggregation pattern
   - Excel export pattern
   - Entity relationship pattern
   - Status management pattern

## Component Relationships
1. Reports and Analytics
   - ReportService → ReportController
   - ReportController → Frontend
   - BookingRepository → ReportService
   - ShowtimeRepository → ReportService
   - DTOs → Service Layer
   - Service Layer → Controllers
   - Controllers → Frontend
   - Frontend → Charts
   - Frontend → Export

2. Booking System
   - Booking → User (Many-to-One)
   - Booking → Showtime (Many-to-One)
   - Booking → ShowtimeSeat (One-to-Many)
   - BookingRepository → BookingService
   - BookingService → BookingController
   - BookingController → Frontend
   - Frontend → Booking Form
   - Frontend → Payment Integration
   - Booking Form → Auth Check → Login (when session expires)
   - Axios Interceptor → Token Refresh → Auth Service

3. Branch Management
   - Branch → Cinema (Many-to-One)
   - BranchManagement page → DataGrid, Formik, Yup
   - BranchManagement page → CinemaManagement (for cinema selection)
   - BranchManagement page → Sidebar/Menu (navigation)
   - BranchManagement page → REST API endpoints (/api/branches, /api/cinema)

4. Invoice (Bill) Management
   - Invoice → User (Many-to-One)
   - Invoice → Booking (Many-to-One)
   - InvoiceManagement page → DataGrid, Formik, Yup
   - InvoiceManagement page → Sidebar/Menu (navigation)
   - InvoiceManagement page → REST API endpoints (/api/invoices, /api/users, /api/bookings)

3. Data Fetching Flow:
   - QueryClientProvider → App
   - useQuery hooks → Components
   - Query cache → React Query
   - Error boundaries → Components
   - Loading states → UI
   - Data → Charts

4. Authentication Flow:
   - Login Form → Auth Service → JWT Token
   - JWT Token → LocalStorage + Redux Store
   - API Requests → Axios Interceptor → Token Validation
   - 401 Error → Token Refresh Attempt → Auth Service
   - Token Refresh Success → Retry Original Request
   - Token Refresh Failure → Redirect to Login

## Critical Implementation Paths
1. Report Generation
   - Date range selection
   - Data aggregation
   - Chart rendering
   - Export functionality
   - Error handling
   - Loading states
   - Vietnamese translations

2. Data Export
   - Data retrieval
   - Excel generation
   - File formatting
   - Error handling
   - Download handling
   - Vietnamese localization

3. Booking System
   - Entity relationships
   - Status management
   - Payment integration
   - Transaction handling
   - Validation rules
   - Error handling
   - Authentication validation
   - Session expiration handling
   - Graceful redirection

4. Authentication Path
   - Login request → Token generation
   - Token storage → Redux + localStorage
   - API request → Axios interceptor
   - Token validation → Auth check
   - Token refresh → Access continuation
   - Refresh failure → Login redirect
   - User feedback → Clear messaging

## Security Patterns
1. Authentication
   - JWT token-based
   - Role-based access
   - Secure endpoints
   - Token refresh
   - Vietnamese error messages

2. Data Protection
   - Input validation
   - SQL injection prevention
   - XSS protection
   - CSRF protection
   - Vietnamese security messages

3. CORS Configuration
   - Configured CorsConfigurationSource bean in WebConfig
   - Explicit allowed origins (development and production)
   - Complete set of allowed methods (GET, POST, PUT, PATCH, DELETE, OPTIONS)
   - Comprehensive allowed headers configuration
   - Credentials enabled for cookie-based authentication
   - Exposed Authorization header for token-based auth
   - Appropriate max age for preflight requests
   - Applied to all endpoints

## Authentication Persistence Pattern
1. Token Management
   - JWT tokens stored in localStorage (`token` for access token, `refreshToken` for refresh token)
   - Token-based authentication with Spring Security on backend
   - Redux store synchronization with localStorage for application state persistence
   - Initialized flag to track authentication state verification
   - Token extraction and storage during login process
   - Token cleanup during logout process

2. Request Authorization
   - Axios interceptors for automatic token inclusion in all API requests
   - Consistent Authorization header format (`Bearer ${token}`)
   - TypeScript typing for proper axios configuration
   - Consolidated interceptor management in App.tsx for application-wide effect

3. Token Refresh Flow
   - Detection of 401 (Unauthorized) responses in interceptors
   - Token refresh attempt using stored refresh token
   - Request retry after successful token refresh
   - Original request preservation during refresh process
   - Request marking with _retry flag to prevent infinite refresh loops
   - Fallback to login screen on refresh failure
   - Error differentiation between auth issues and network problems

4. Authentication Verification
   - AuthCheck component for application-wide auth verification
   - Conditional API calls based on existing Redux state
   - Direct initialization from localStorage on application load
   - Support for multiple API response formats (`result` or `data` fields)
   - Role-based access control implemented with route protection
   - Loading state displayed during authentication verification

## Performance Patterns
1. Data Fetching
   - Pagination
   - Filtering
   - Sorting
   - Caching
   - Vietnamese search

2. Report Generation
   - Data aggregation
   - Caching
   - Async processing
   - Error handling
   - Vietnamese formatting

## Testing Patterns
1. Unit Testing
   - Service layer
   - Repository layer
   - Controller layer
   - Vietnamese validation

2. Integration Testing
   - API endpoints
   - Database operations
   - Vietnamese responses

## Deployment Patterns
1. Backend
   - Spring Boot deployment
   - Database migration
   - Environment configuration
   - Vietnamese configuration

2. Frontend
   - React build
   - Static file serving
   - Vietnamese static files
   - Environment variables

## Monitoring Patterns
1. Application
   - Logging
   - Error tracking
   - Performance monitoring
   - Vietnamese logging

2. Business
   - Report generation
   - Data analysis
   - Vietnamese analytics
   - Export tracking

## API Communication Patterns
- **Frontend to Backend Proxy:**
    - The React development server (port 3000) uses a proxy configuration in `package.json` (`"proxy": "http://localhost:8080"`) to forward API requests to the Spring Boot backend (port 8080). This allows frontend code to use relative paths for API calls (e.g., `/auth/login`, `/user/me`).
- **Consistent API Response Structure:**
    - Backend APIs (e.g., for login, fetching user details) generally wrap successful responses in an `ApiResponse` object containing `message` and `result` fields (e.g., `{"message": "Success", "result": {...actual_data...}}`).
    - The frontend must parse responses accordingly (e.g., `response.data.result` instead of `response.data.data` if the actual data is nested under `result`). Inconsistencies here can lead to frontend errors even with a 200 OK response from the backend.
- **DTO Naming Conventions:**
    - Discrepancies between JSON field names sent by the frontend (e.g., `fullName` in camelCase) and DTO field names in the backend (e.g., `fullname` in lowercase) can lead to `null` values in the DTO if not handled (e.g., by ensuring DTO field names match the expected JSON or using `@JsonProperty`). Resolved by aligning DTO field names (`fullName`) with frontend.

## Architecture Overview
The system follows a modern React application architecture with TypeScript, focusing on maintainability, scalability, and type safety.

### Frontend Architecture
1. Component Structure
   - Feature-based organization
   - Shared components in common directory
   - Page components in pages directory
   - Form components for data input
   - Layout components for structure
   - Translation components for Vietnamese support
   - Dialog components for confirmations
   - Status management components

2. State Management
   - Redux for global state
   - Local state for component-specific data
   - Form state managed by Formik
   - Validation state handled by Yup
   - Translation state for language management
   - Loading state management
   - Error state handling
   - Snackbar notifications

3. Data Flow
   - Unidirectional data flow
   - Props for component communication
   - Redux for global state
   - Context for theme and translations
   - API integration with axios
   - Error handling patterns
   - Loading state patterns

## Key Technical Decisions

### 1. UI Framework
- Material-UI for consistent design
- Custom theme configuration
- Responsive design patterns
- DataGrid for data display
- Form components for data input
- Vietnamese language support
- Dialog components for confirmations
- Status indicators
- Export functionality

### 2. Form Handling
- Formik for form state management
- Yup for validation schemas
- Custom form components
- Error handling patterns
- Image upload integration
- Vietnamese validation messages
- Confirmation dialogs
- Status management

### 3. Data Display
- DataGrid for tabular data
- Status indicators
- Image previews
- Responsive layouts
- Loading states
- Vietnamese column headers
- Export functionality
- Detailed view dialogs

### 4. Type Safety
- TypeScript for type checking
- Interface definitions
- Type guards
- Generic components
- Strict null checks
- Translation type definitions
- API response types
- Status type definitions

## Design Patterns

### 1. Component Patterns
- Functional components
- Custom hooks
- Higher-order components
- Compound components
- Render props
- Translation components
- Dialog components
- Status management components

### 2. State Management Patterns
- Redux for global state
- Context for theme/translations
- Local state for UI
- Form state with Formik
- Derived state
- Language state management
- Loading state management
- Error state handling

### 3. Form Patterns
- Controlled components
- Validation schemas
- Error handling
- Field arrays
- File uploads
- Vietnamese error messages
- Confirmation dialogs
- Status management

### 4. Layout Patterns
- Responsive grid
- Flexbox layouts
- Card-based design
- Consistent spacing
- Typography hierarchy
- RTL support for Vietnamese
- Dialog layouts
- Status indicator layouts

## Critical Implementation Paths

### 1. Data Management
- DataGrid implementation
- Form validation
- Status management
- Search and filtering
- Export functionality
- Vietnamese translations
- API integration
- Error handling

### 2. Translation Management
- Vietnamese text management
- Date formatting
- Number formatting
- Error messages
- Success notifications
- Status messages
- Dialog messages
- Export labels

### 3. Data Operations
- CRUD operations
- Data validation
- Error handling
- Loading states
- Success feedback
- Vietnamese user feedback
- Status management
- Export operations

## Component Relationships

### 1. Page Structure
```
Layout
├── Sidebar (Vietnamese)
├── Header (Vietnamese)
└── Content
    ├── Dashboard (Vietnamese)
    ├── MovieManagement (Vietnamese)
    │   ├── MovieList
    │   └── MovieForm
    ├── ShowtimeManagement (Vietnamese)
    ├── UserManagement (Vietnamese)
    │   ├── UserList
    │   └── UserForm
    └── BookingManagement (Vietnamese)
        ├── BookingList
        └── BookingDetails
```

### 2. Component Dependencies
- Layout → Sidebar, Header, Content
- UserManagement → UserList, UserForm
- UserForm → FormFields, ImageUpload
- UserList → DataGrid, StatusIndicator
- BookingManagement → BookingList, BookingDetails
- BookingDetails → StatusDialog, ExportButton
- All components → TranslationProvider

## Implementation Guidelines

### 1. Component Creation
- Use TypeScript
- Implement proper typing
- Follow naming conventions
- Add proper documentation
- Include error handling
- Support Vietnamese text
- Add loading states
- Implement status management

### 2. State Management
- Use Redux for global state
- Local state for UI
- Form state with Formik
- Context for translations
- Proper state updates
- Language state handling
- Loading state management
- Error state handling

### 3. Form Handling
- Use Formik for forms
- Implement Yup validation
- Handle file uploads
- Show validation errors
- Provide feedback
- Vietnamese error messages
- Confirmation dialogs
- Status management

### 4. Data Display
- Use DataGrid for tables
- Implement sorting
- Add filtering
- Show loading states
- Handle errors
- Vietnamese labels
- Export functionality
- Status indicators

## Best Practices

### 1. Code Organization
- Feature-based structure
- Shared components
- Type definitions
- Utility functions
- Constants
- Translation files
- API integration
- Error handling

### 2. Performance
- Memoization
- Lazy loading
- Code splitting
- Optimized renders
- Proper cleanup
- Translation caching
- Loading states
- Error boundaries

### 3. Error Handling
- Try-catch blocks
- Error boundaries
- User feedback
- Logging
- Recovery
- Vietnamese error messages
- Loading states
- Status management

### 4. Testing
- Unit tests
- Integration tests
- Component tests
- Form validation
- Error cases
- Translation tests
- API integration tests
- Status management tests

## Translation Patterns
1. Text Management
   - Centralized translation files
   - Vietnamese language support
   - Dynamic text loading
   - Fallback handling
   - Status messages
   - Dialog messages
   - Export labels

2. Formatting
   - Date formatting
   - Number formatting
   - Currency formatting
   - Vietnamese locale support
   - Status formatting
   - Error formatting
   - Export formatting

## Error Handling
1. User Feedback
   - Vietnamese error messages
   - Success notifications
   - Loading states
   - Validation feedback
   - Status messages
   - Dialog messages
   - Export feedback

2. Validation
   - Input validation
   - Business rule validation
   - Vietnamese error messages
   - Form feedback
   - Status validation
   - Export validation
   - API validation