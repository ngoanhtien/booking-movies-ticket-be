# API Integration Documentation

This document outlines the API endpoints used in the Movie Ticket Booking System frontend.

## User Authentication
- `POST /login` - User authentication with username and password
- `POST /register` - User registration with personal details
- `POST /refresh-token` - Refresh JWT token
- `POST /logout` - Logout user and invalidate token

## User Profile Management
- `GET /user/profile` - Get current user profile information
- `PUT /user/profile` - Update user profile information (supports multipart form for avatar upload)
- `POST /user/change-password` - Change user password

## Movie Management
- `GET /movies` - Get list of movies (supports filtering, pagination)
- `GET /movies/{id}` - Get movie details by ID
- `GET /movies/now-showing` - Get currently showing movies
- `GET /movies/coming-soon` - Get upcoming movies

## Booking System
- `GET /showtimes/movie/{movieId}` - Get available showtimes for a movie
- `GET /showtimes/available` - Get all available showtimes
- `GET /seats/showtime?scheduleId={id}&roomId={id}` - Get seat layout for a specific showtime
- `GET /foods` - Get available food and beverage items
- `POST /bookings` - Create a new booking
- `GET /user/bookings` - Get booking history for current user
- `GET /bookings/{id}` - Get booking details by ID
- `POST /payments/simulate` - Simulate a payment (no actual payment gateway)

## Error Response Structure
All API endpoints return consistent error responses with the following structure:
```json
{
  "success": false,
  "message": "Error message description",
  "errorCode": "ERROR_CODE"
}
```

## Success Response Structure
Successful responses follow this structure:
```json
{
  "success": true,
  "data": { /* Response data */ },
  "message": "Success message"
}
```

## Authentication
Most endpoints (except login and register) require JWT authentication via the Authorization header:
```
Authorization: Bearer <token>
```

## File Upload
File uploads are handled using multipart/form-data. The following endpoints support file uploads:
- `PUT /user/profile` - For avatar uploads
- `POST /movies` - For movie poster uploads

## Pagination
Endpoints that return lists support pagination with the following query parameters:
- `page` - Page number (starting from 0)
- `size` - Number of items per page
- `sort` - Sort field and direction (e.g., "id,desc") 