
import { Route, Routes } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import MyBookingsPage from "../pages/bookings/MyBookingsPage";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />

        <Route
          path="/my-bookings"
          element={<MyBookingsPage />}
        />
      </Route>
    </Routes>
  );
}

export default AppRoutes;

