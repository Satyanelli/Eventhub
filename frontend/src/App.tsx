import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import EventsPage from "./pages/events/EventsPage";
import CreateEventPage from "./pages/events/CreateEventPage";
import EventDetailsPage from "./pages/events/EventDetailsPage";
import OrganizerDashboard from "./pages/organizer/OrganizerDashboard";
import ManageTicketsPage from "./pages/tickets/ManageTicketsPage";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "./store/store";
import { fetchCurrentUser } from "./store/slices/authSlice";

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <Routes>
        <Route path="/test" element={<h1 style={{ padding: "40px" }}>ROUTER WORKS</h1>} />
      <Route element={<MainLayout />}>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Authentication */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<SignupPage />} />

        {/* Events */}
        <Route path="/events" element={<EventsPage />} />

         <Route
        path="/events/create"
        element={<CreateEventPage />}/>

        <Route
        path="/events/:id"
        element={<EventDetailsPage />}/> 

        <Route
        path="/organizer/dashboard"
       element={<OrganizerDashboard />}/>

       <Route
       path="/events/:id/tickets"
       element={<ManageTicketsPage />}/>
      </Route>
    </Routes>
  );
}

export default App;