import { useEffect } from "react";
import { useDispatch } from "react-redux";

import type { AppDispatch } from "./store/store";
import { fetchCurrentUser } from "./store/slices/authSlice";

import AppRoutes from "./routes/AppRoutes";

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return <AppRoutes />;
}

export default App;