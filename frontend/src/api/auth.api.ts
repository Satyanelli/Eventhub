import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

export const registerUser = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "attendee" | "organizer";
}) => {
  const response = await axios.post(`${API_URL}/register`, data);

  return response.data;
};

export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  const response = await axios.post(`${API_URL}/login`, data, {
    withCredentials: true,
  });

  return response.data;
};

export const getMe = async () => {
  const response = await axios.get(`${API_URL}/me`, {
    withCredentials: true,
  });

  return response.data;
};

export const logoutUser = async () => {
  const response = await axios.post(
    `${API_URL}/logout`,
    {},
    {
      withCredentials: true,
    }
  );

  return response.data;
};

// =========================
// FORGOT PASSWORD
// =========================

export const forgotPassword = async (email: string) => {
  const response = await axios.post(
    `${API_URL}/forgot-password`,
    { email }
  );

  return response.data;
};

// =========================
// RESET PASSWORD
// =========================

export const resetPassword = async (
  token: string,
  password: string
) => {
  const response = await axios.post(
    `${API_URL}/reset-password`,
    {
      token,
      password,
    }
  );

  return response.data;
};