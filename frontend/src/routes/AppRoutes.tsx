import { Route, Routes } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../components/layout/ProtectedRoute";

import Home from "../pages/Home";

import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";

import EventsPage from "../pages/events/EventsPage";
import EventDetailsPage from "../pages/events/EventDetailsPage";
import CreateEventPage from "../pages/events/CreateEventPage";
import EditEventPage from "../pages/events/EditEventPage";

import OrganizerDashboard from "../pages/organizer/OrganizerDashboard";

import ManageTicketsPage from "../pages/tickets/ManageTicketsPage";

import MyBookingsPage from "../pages/bookings/MyBookingsPage";
import VerifyEmailPage from "../pages/VerifyEmailPage";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>

        {/* Public Routes */}

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<SignupPage />} />

        <Route path="/events" element={<EventsPage />} />

        <Route
          path="/events/:id"
          element={<EventDetailsPage />}
        />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>

          {/* My Bookings */}
          <Route
            path="/my-bookings"
            element={<MyBookingsPage />}
          />

          {/* Create Event */}
          <Route
            path="/events/create"
            element={<CreateEventPage />}
          />

          {/* Edit Event */}
          <Route
            path="/events/:id/edit"
            element={<EditEventPage />}
          />

          {/* Organizer Dashboard */}
          <Route
            path="/organizer/dashboard"
            element={<OrganizerDashboard />}
          />

          {/* Manage Tickets */}
          <Route
            path="/events/:id/tickets"
            element={<ManageTicketsPage />}
          />

        </Route>
        <Route path="/verify-email" element={<VerifyEmailPage />} />

      </Route>
    </Routes>
  );
}

export default AppRoutes;