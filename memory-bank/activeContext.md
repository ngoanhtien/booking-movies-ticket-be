# Active Context

## Current Focus
- Moving from implementing the user-facing Booking System (now with complete UI for all form steps) to either:
    - API integration for the multi-step booking form
    - Continued refinement of other admin modules

## Recent Changes
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
- **Linter Error Resolution**:
    - Fixed TypeScript errors in `BookingForm.tsx` related to formik validation by properly handling field error checks.
    - Resolved issues with `Register.tsx` import in `routes.tsx` which was causing persistent linter errors.
    - Explicitly typed Formik's fields to prevent TypeScript "argument of type string is not assignable to type never" errors.

## Next Steps
1. **API Integration for Booking System**:
   * Replace mock data with actual API calls for each step:
     * Fetch showtimes from backend based on movieId (or all upcoming showtimes)
     * Fetch seat layout based on selected showtime
     * Fetch available food/drink items from backend
     * Implement actual booking submission with payment processing
   * Implement proper error handling for API failures
   * Add loading states for API calls
   * Consider optimistic UI updates for better user experience
2. **Refine `MovieForm` Routes**:
   * Modify the `movies/add` and `movies/edit/:id` routes in `admin-interface/src/routes.tsx`
   * For "edit", fetch movie data based on `id` and pass it to `MovieForm`
   * Implement actual `onSave` and `onCancel` handlers (e.g., API calls, navigation)
3. **Enhance User Experience for Booking Form**:
   * Add animations for step transitions
   * Improve responsive design for mobile users
   * Add more detailed validation messages
   * Implement better error recovery for failed operations
4. **Address Placeholder Admin Modules**: Systematically work through other placeholder components in the admin panel (e.g., `RoomManagement`, `RolesManagement`, `PromotionsManagement`) to implement their full functionality.
5. **Testing**: Conduct a thorough review and test of the recently implemented features, especially the multi-step booking form.

## Active Decisions
- Using JPA for entity relationships
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

## Important Patterns
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

## Project Insights
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
- Vietnamese translations should be organized hierarchically to match the UI structure.
- Form validation should provide immediate feedback but avoid disrupting user flow.
- Mock data with simulated API delays helps test loading states and error handling.
- Complex UIs like seat maps benefit from a component-based approach with clear visual state indicators.

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
- The `MovieForm` routes currently use placeholder props; these need to be replaced with actual data fetching and callback implementations.
- The booking form needs real API integration to replace the current mock data.
- Add animations for smoother transitions between booking form steps.
- Implement better mobile responsiveness for the seat selection UI.
- Add more detailed validation feedback for each booking step.
- Consider implementing a seat category system with different pricing.
- Add visual indicators of selected seats count and total price on all steps.
- Implement actual payment processing integration.
- Add booking confirmation emails/notifications.
- Implement a booking history view for users.

## Current Considerations
- API integration approach for the booking form
- How to structure API endpoints for the multi-step booking process
- Best practices for handling seat availability in real-time
- Payment integration options
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

## Learnings
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