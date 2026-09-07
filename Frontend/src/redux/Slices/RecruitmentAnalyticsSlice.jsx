import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const fetchRecruitmentOverview = createAsyncThunk(
  "recruitmentAnalytics/overview",
  async () => {
    const res = await axios.get(`${API_BASE_URL}/recruitment-analytics/overview`);
    return res.data;
  }
);

const initialState = {
  overview: null,
  loading: false,
  error: null,
};

const RecruitmentAnalyticsSlice = createSlice({
  name: "recruitmentAnalytics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecruitmentOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecruitmentOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.overview = action.payload;
      })
      .addCase(fetchRecruitmentOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default RecruitmentAnalyticsSlice.reducer;
