import React, { lazy, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import MovieManagement from './pages/movies/MovieManagement';
import MovieSchedules from './pages/movies/MovieSchedules';
import ShowtimeManagement from './pages/showtimes/ShowtimeManagement';
import UserManagement from './pages/users/UserManagement';
import UserList from './pages/users/UserList';
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
import MovieForm from './pages/movies/MovieForm';
import Register from './pages/auth/Register';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/admin" element={<ProtectedRoute>
        <Layout />
      </ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="movies" element={<MovieManagement />} />
        <Route path="movies/add" element={<MovieForm movie={null} onSave={() => {}} onCancel={() => {}} />} />
        <Route path="movies/edit/:id" element={<MovieForm movie={null} onSave={() => {}} onCancel={() => {}} />} />
        <Route path="movies/schedules" element={<MovieSchedules />} />
        <Route path="showtimes" element={<ShowtimeManagement />} />
        <Route path="users" element={<UserList />} />
        <Route path="bookings" element={<BookingManagement />} />
        <Route path="reports" element={<ReportsAndAnalytics />} />
        <Route path="cinemas" element={<CinemaManagement />} />
        <Route path="branches" element={<BranchManagement />} />
        <Route path="invoices" element={<InvoiceManagement />} />
        <Route path="theaters" element={<TheaterManagement />} />
        <Route path="theaters/locations" element={<TheaterLocations />} />
        <Route path="rooms" element={<RoomManagement />} />
        <Route path="promotions" element={<PromotionsManagement />} />
        <Route path="promotions/discounts" element={<DiscountManagement />} />
        <Route path="promotions/notifications" element={<NotificationManagement />} />
      </Route>

      <Route path="/booking/:movieId" element={<BookingPage />} />
      <Route path="/booking" element={<BookingPage />} />

      <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes; 