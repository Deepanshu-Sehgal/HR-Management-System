import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const fetchAttendanceAnalytics = createAsyncThunk(
  "attendanceAnalytics/fetchAttendanceAnalytics",
  async () => {
    const response = await axios.get(`${API_BASE_URL}/attendance-analytics`);
    return response.data;
  }
);

export const getAttendanceSummary = createAsyncThunk(
  "attendanceAnalytics/getAttendanceSummary",
  async () => {
    const response = await axios.get(`${API_BASE_URL}/attendance-analytics/summary`);
    return response.data;
  }
);

const initialState = {
  analytics: [],
  summary: {},
  loading: false,
  error: null,
};

const AttendanceAnalyticsSlice = createSlice({
  name: "attendanceAnalytics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendanceAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAttendanceAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAttendanceAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(getAttendanceSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      });
  },
});

export default AttendanceAnalyticsSlice.reducer;
