# Technical Context

## Technology Stack
1. Frontend
   - React 18.x
   - TypeScript 5.x
   - Material-UI 5.x
   - Formik 2.x
   - Yup 1.x
   - i18next 23.x
   - Recharts 2.x
   - Axios 1.x
   - React Query 4.x
   - @tanstack/react-query v5.75.4
   - TypeScript 5.3.3
   - Query configuration:
     - Stale time: 5 minutes
     - Cache time: 30 minutes
     - Auto background refresh
     - Retry configuration
     - Error handling
     - Loading states
   - Branch management UI with React, TypeScript, Material-UI, Formik, Yup
   - Branch type definition in frontend
   - Invoice management UI with React, TypeScript, Material-UI, Formik, Yup
   - Invoice type definition in frontend
   - REST API endpoints: /api/branches, /api/cinema, /api/invoices, /api/users, /api/bookings

2. Backend
   - Spring Boot 3.x
   - Spring Security 6.x
   - Spring Data JPA 3.x
   - PostgreSQL 15.x
   - JWT 0.9.1
   - Apache POI 5.2.3
   - WebSocket 6.x
   - **Jackson**: For JSON serialization/deserialization. Annotations like `@JsonManagedReference`, `@JsonBackReference`, `@JsonIgnore` are used to manage object relationships and prevent circular dependencies during serialization of JPA entities.

## Development Setup
1. Frontend
   - Node.js 18.x
   - npm 9.x
   - TypeScript configuration
   - ESLint configuration
   - Prettier configuration
   - Vietnamese language support
   - Chart library setup
   - Export functionality setup
   - React Query DevTools
   - Query client configuration
   - Error boundary setup
   - Loading state components

2. Backend
   - Java 17
   - Gradle 8.x
   - Spring Boot configuration
   - Database configuration
   - Security configuration
   - Excel export configuration
   - Vietnamese localization

3. Frontend-Backend Communication
   - **Proxy for Development**: The `admin-interface/package.json` includes a `"proxy": "http://localhost:8080"` setting. This allows the React development server to forward API calls made to relative paths (e.g., `/auth/login`) to the backend server running on port 8080, avoiding CORS issues and simplifying API call URIs in frontend code during development.

4. Authentication Implementation
   - JWT-based token authentication
   - Token storage in localStorage
   - Access token and refresh token pattern
   - Token expiration tracking
   - Axios interceptors for automatic token refresh
   - 401 (Unauthorized) handling with graceful redirection
   - Session expiration detection and messaging
   - Booking form token validation before sensitive operations

## Dependencies
1. Frontend
   ```json
   {
     "dependencies": {
       "@emotion/react": "^11.11.0",
       "@emotion/styled": "^11.11.0",
       "@mui/material": "^5.13.0",
       "@mui/x-data-grid": "^6.5.0",
       "axios": "^1.4.0",
       "formik": "^2.2.9",
       "i18next": "^23.4.4",
       "react": "^18.2.0",
       "react-dom": "^18.2.0",
       "react-query": "^4.0.0",
       "recharts": "^2.6.2",
       "typescript": "^5.0.4",
       "yup": "^1.1.1",
       "@tanstack/react-query": "^5.75.4",
       "react-hot-toast": "^2.4.1"
     }
   }
   ```

2. Backend
   ```gradle
   dependencies {
       implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
       implementation 'org.springframework.boot:spring-boot-starter-security'
       implementation 'org.springframework.boot:spring-boot-starter-web'
       implementation 'io.jsonwebtoken:jjwt:0.9.1'
       implementation 'org.apache.poi:poi:5.2.3'
       implementation 'org.apache.poi:poi-ooxml:5.2.3'
       runtimeOnly 'org.postgresql:postgresql'
   }
   ```

## Technical Constraints
1. Frontend
   - Browser compatibility
   - Mobile responsiveness
   - Chart performance
   - Export file size
   - Vietnamese character support
   - Date format localization
   - Token refresh timing and session expiration
   - TypeScript type safety with axios interceptors
   - QR code generation and display
   - Payment status polling with optimized intervals
   - React render optimization for timer components

2. Backend
   - Database performance
   - Report generation time
   - Excel file size
   - Vietnamese character encoding
   - Date handling
   - Memory usage
   - JWT token expiration and refresh settings

## Tool Usage
1. Development
   - VS Code
   - IntelliJ IDEA
   - Git
   - Postman
   - pgAdmin
   - Chrome DevTools

2. Testing
   - Jest
   - React Testing Library
   - JUnit
   - Mockito
   - Postman
   - Vietnamese test data

## Configuration
1. Frontend
   ```typescript
   // i18n.ts
   import i18n from 'i18next';
   import { initReactI18next } from 'react-i18next';
   
   i18n.use(initReactI18next).init({
     lng: 'vi',
     resources: {
       vi: {
         translation: require('./locales/vi/translation.json')
       }
     }
   });
   ```

2. Backend
   ```yaml
   # application.yml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/movie_booking
       username: postgres
       password: postgres
     jpa:
       hibernate:
         ddl-auto: update
       properties:
         hibernate:
           dialect: org.hibernate.dialect.PostgreSQLDialect
   ```

3. CORS Configuration
   ```java
   // WebConfig.java
   @Configuration
   public class WebConfig {
       @Bean
       public CorsConfigurationSource corsConfigurationSource() {
           CorsConfiguration configuration = new CorsConfiguration();
           configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "https://your-production-domain.com"));
           configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
           configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"));
           configuration.setExposedHeaders(Collections.singletonList("Authorization"));
           configuration.setAllowCredentials(true);
           configuration.setMaxAge(3600L);
           
           UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
           source.registerCorsConfiguration("/**", configuration);
           return source;
       }
   }
   ```

4. React Query Configuration
   ```typescript
   const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         staleTime: 5 * 60 * 1000,
         gcTime: 30 * 60 * 1000,
         retry: 3,
         refetchOnWindowFocus: true,
       },
     },
   });
   ```

5. Authentication Configuration
   ```typescript
   // axios.ts
   import axios from 'axios';

   const axiosInstance = axios.create();

   axiosInstance.interceptors.request.use(
     (config) => {
       const token = localStorage.getItem('token');
       if (token) {
         config.headers.Authorization = `Bearer ${token}`;
       }
       return config;
     },
     (error) => Promise.reject(error)
   );

   // App.tsx or a dedicated auth interceptor file
   axiosInstance.interceptors.response.use(
     (response) => response,
     async (error) => {
       const originalRequest = error.config;
       
       // Handle 401 errors with token refresh
       if (error.response.status === 401 && !originalRequest._retry) {
         originalRequest._retry = true;
         try {
           const refreshToken = localStorage.getItem('refreshToken');
           if (!refreshToken) {
             throw new Error('No refresh token available');
           }
           
           // Request new token
           const response = await axios.post('/auth/refresh-token', { refreshToken });
           const { accessToken } = response.data.result;
           
           // Update stored token
           localStorage.setItem('token', accessToken);
           
           // Update authorization header and retry request
           originalRequest.headers.Authorization = `Bearer ${accessToken}`;
           return axios(originalRequest);
         } catch (refreshError) {
           // Clear auth data and redirect to login
           localStorage.removeItem('token');
           localStorage.removeItem('refreshToken');
           window.location.href = '/login?expired=true';
           return Promise.reject(refreshError);
         }
       }
       
       return Promise.reject(error);
     }
   );

   export default axiosInstance;
   ```

## API Endpoints
1. Reports
   ```
   GET /api/reports/sales
   GET /api/reports/attendance
   GET /api/reports/sales/export
   GET /api/reports/attendance/export
   ```

## Data Models
1. Reports
   ```java
   @Data
   public class SalesReportDTO {
       private String movieName;
       private String format;
       private LocalDate date;
       private BigDecimal revenue;
       private Integer tickets;
   }

   @Data
   public class AttendanceReportDTO {
       private String movieName;
       private String cinemaName;
       private LocalDate date;
       private Integer attendance;
   }
   ```

## Security
1. Authentication
   - JWT token-based
   - Role-based access
   - Secure endpoints
   - Vietnamese error messages

2. Data Protection
   - Input validation
   - SQL injection prevention
   - XSS protection
   - CSRF protection
   - Vietnamese security

## Performance
1. Frontend
   - Code splitting
   - Lazy loading
   - Memoization
   - Vietnamese optimization

2. Backend
   - Query optimization
   - Caching
   - Batch processing
   - Vietnamese handling

## Monitoring
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

## QR Payment Integration
1. Backend Implementation
   - REST endpoints for QR code generation and status checking
   - Service layer for payment provider integration
   - DTOs for payment requests and responses
   - Security configuration for payment-related endpoints
   - Payment status tracking and webhook handlers

2. Frontend Implementation
   - Modal component for QR display and countdown
   - Payment status checking with polling mechanism
   - useCallback and useEffect for performance optimization
   - Type definitions for payment-related data structures
   - Translations for payment UI
   - Toast notifications for payment status updates 