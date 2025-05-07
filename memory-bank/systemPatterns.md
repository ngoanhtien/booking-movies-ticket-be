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

## Key Technical Decisions
1. Frontend
   - React with TypeScript
   - Material-UI for components
   - Formik with Yup for validation
   - i18next for translations
   - Recharts for data visualization
   - Axios for API calls
   - React Query for data fetching

2. Backend
   - Spring Boot 3.x
   - Spring Security
   - Spring Data JPA
   - PostgreSQL database
   - JWT authentication
   - Apache POI for Excel export
   - WebSocket for real-time updates

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

2. Backend
   - Repository pattern
   - Service layer pattern
   - DTO pattern
   - Controller pattern
   - Exception handling pattern
   - Transaction management
   - Data aggregation pattern
   - Excel export pattern

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