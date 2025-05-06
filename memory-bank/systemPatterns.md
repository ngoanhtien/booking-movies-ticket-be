# System Patterns

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

2. State Management
   - Redux for global state
   - Local state for component-specific data
   - Form state managed by Formik
   - Validation state handled by Yup
   - Translation state for language management

3. Data Flow
   - Unidirectional data flow
   - Props for component communication
   - Redux for global state
   - Context for theme and translations

## Key Technical Decisions

### 1. UI Framework
- Material-UI for consistent design
- Custom theme configuration
- Responsive design patterns
- DataGrid for data display
- Form components for data input
- Vietnamese language support

### 2. Form Handling
- Formik for form state management
- Yup for validation schemas
- Custom form components
- Error handling patterns
- Image upload integration
- Vietnamese validation messages

### 3. Data Display
- DataGrid for tabular data
- Status indicators
- Image previews
- Responsive layouts
- Loading states
- Vietnamese column headers

### 4. Type Safety
- TypeScript for type checking
- Interface definitions
- Type guards
- Generic components
- Strict null checks
- Translation type definitions

## Design Patterns

### 1. Component Patterns
- Functional components
- Custom hooks
- Higher-order components
- Compound components
- Render props
- Translation components

### 2. State Management Patterns
- Redux for global state
- Context for theme/translations
- Local state for UI
- Form state with Formik
- Derived state
- Language state management

### 3. Form Patterns
- Controlled components
- Validation schemas
- Error handling
- Field arrays
- File uploads
- Vietnamese error messages

### 4. Layout Patterns
- Responsive grid
- Flexbox layouts
- Card-based design
- Consistent spacing
- Typography hierarchy
- RTL support for Vietnamese

## Critical Implementation Paths

### 1. Movie Management
- DataGrid implementation
- Form validation
- Image handling
- Status management
- Date handling
- Vietnamese translations

### 2. Translation Management
- Vietnamese text management
- Date formatting
- Number formatting
- Error messages
- Success notifications

### 3. Data Operations
- CRUD operations
- Data validation
- Error handling
- Loading states
- Success feedback
- Vietnamese user feedback

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
    └── BookingManagement (Vietnamese)
```

### 2. Component Dependencies
- Layout → Sidebar, Header, Content
- MovieManagement → MovieList, MovieForm
- MovieForm → FormFields, ImageUpload
- MovieList → DataGrid, StatusIndicator
- All components → TranslationProvider

## Implementation Guidelines

### 1. Component Creation
- Use TypeScript
- Implement proper typing
- Follow naming conventions
- Add proper documentation
- Include error handling
- Support Vietnamese text

### 2. State Management
- Use Redux for global state
- Local state for UI
- Form state with Formik
- Context for translations
- Proper state updates
- Language state handling

### 3. Form Handling
- Use Formik for forms
- Implement Yup validation
- Handle file uploads
- Show validation errors
- Provide feedback
- Vietnamese error messages

### 4. Data Display
- Use DataGrid for tables
- Implement sorting
- Add filtering
- Show loading states
- Handle errors
- Vietnamese labels

## Best Practices

### 1. Code Organization
- Feature-based structure
- Shared components
- Type definitions
- Utility functions
- Constants
- Translation files

### 2. Performance
- Memoization
- Lazy loading
- Code splitting
- Optimized renders
- Proper cleanup
- Translation caching

### 3. Error Handling
- Try-catch blocks
- Error boundaries
- User feedback
- Logging
- Recovery
- Vietnamese error messages

### 4. Testing
- Unit tests
- Integration tests
- Component tests
- Form validation
- Error cases
- Translation tests

## Translation Patterns
1. Text Management
   - Centralized translation files
   - Vietnamese language support
   - Dynamic text loading
   - Fallback handling

2. Formatting
   - Date formatting
   - Number formatting
   - Currency formatting
   - Vietnamese locale support

## Error Handling
1. User Feedback
   - Vietnamese error messages
   - Success notifications
   - Loading states
   - Validation feedback

2. Validation
   - Input validation
   - Business rule validation
   - Vietnamese error messages
   - Form feedback 