import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import { getMe } from "../../api/auth.api";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "attendee" | "organizer";
  isVerified: boolean;
  profileImage: string | null;
  phone: string | null;
  companyName: string | null;
  website: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
    isLoading: boolean;

}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMe();

      return response.data;
    } catch (error) {
      return rejectWithValue("Not authenticated");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    setCredentials: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
    },

    clearCredentials: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoading = false;
      })

      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      });
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;

export default authSlice.reducer;