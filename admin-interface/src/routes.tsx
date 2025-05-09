import React, { lazy, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import MovieManagement from './pages/movies/MovieManagement';
import ShowtimeManagement from './pages/showtimes/ShowtimeManagement';
import UserManagement from './pages/users/UserManagement';
import BookingManagement from './pages/bookings/BookingManagement';
import ReportsAndAnalytics from './pages/reports/ReportsAndAnalytics';
import CinemaManagement from './pages/cinemas/CinemaManagement';
import BranchManagement from './pages/branches/BranchManagement';
import InvoiceManagement from './pages/invoices/InvoiceManagement';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import TheaterManagement from './pages/theaters/TheaterManagement';
import TheaterLocations from './pages/theaters/TheaterLocations';
import RoomManagement from './pages/rooms/RoomManagement';
import PromotionsManagement from './pages/promotions/PromotionsManagement';
import DiscountManagement from './pages/promotions/DiscountManagement';
import NotificationManagement from './pages/promotions/NotificationManagement';
import BookingPage from './pages/bookings/BookingPage';
import MovieFormWrapper from './pages/movies/MovieFormWrapper';
import Register from './pages/auth/Register';
import MovieScheduleCalendar from './pages/movies/MovieScheduleCalendar';
import RoomScheduleCalendar from './pages/rooms/RoomScheduleCalendar';
import MovieList from './pages/user/MovieList';
import MovieDetails from './pages/user/MovieDetails';
import UserProfile from './pages/user/UserProfile';
import BookingHistory from './pages/user/BookingHistory';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* User Routes */}
      <Route path="/movies" element={<MovieList />} />
      <Route path="/movies/:id" element={<MovieDetails />} />
      <Route path="/profile" element={
        <ProtectedRoute>
          <UserProfile />
        </ProtectedRoute>
      } />
      <Route path="/booking-history" element={
        <ProtectedRoute>
          <BookingHistory />
        </ProtectedRoute>
      } />

      <Route path="/admin" element={<ProtectedRoute>
        <Layout />
      </ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="movies" element={<MovieManagement />} />
        <Route path="movies/add" element={<MovieFormWrapper />} />
        <Route path="movies/edit/:id" element={<MovieFormWrapper />} />
        <Route path="movies/schedules" element={<MovieScheduleCalendar />} />
        <Route path="showtimes" element={<ShowtimeManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="bookings" element={<BookingManagement />} />
        <Route path="reports" element={<ReportsAndAnalytics />} />
        <Route path="cinemas" element={<CinemaManagement />} />
        <Route path="branches" element={<BranchManagement />} />
        <Route path="invoices" element={<InvoiceManagement />} />
        <Route path="theaters" element={<TheaterManagement />} />
        <Route path="theaters/locations" element={<TheaterLocations />} />
        <Route path="rooms" element={<RoomManagement />} />
        <Route path="rooms/schedules/:roomId" element={<RoomScheduleCalendar />} />
        <Route path="rooms/schedules" element={<RoomScheduleCalendar />} />
        <Route path="promotions" element={<PromotionsManagement />} />
        <Route path="promotions/discounts" element={<DiscountManagement />} />
        <Route path="promotions/notifications" element={<NotificationManagement />} />
      </Route>

      <Route path="/booking/:movieId" element={<BookingPage />} />
      <Route path="/booking" element={<BookingPage />} />

      <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />

      <Route path="/" element={<Navigate to="/movies" replace />} />
      <Route path="*" element={<Navigate to="/movies" replace />} />
    </Routes>
  );
};

export default AppRoutes; 