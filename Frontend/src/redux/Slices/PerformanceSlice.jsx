import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const fetchPerformanceReviews = createAsyncThunk(
  "performance/fetchPerformanceReviews",
  async () => {
    const response = await axios.get(`${API_BASE_URL}/performance`);
    return response.data;
  }
);

export const createPerformanceReview = createAsyncThunk(
  "performance/createPerformanceReview",
  async (reviewData) => {
    const response = await axios.post(`${API_BASE_URL}/performance`, reviewData);
    return response.data.review;
  }
);

export const updatePerformanceReview = createAsyncThunk(
  "performance/updatePerformanceReview",
  async ({ id, data }) => {
    const response = await axios.put(`${API_BASE_URL}/performance/${id}`, data);
    return response.data.review;
  }
);

export const deletePerformanceReview = createAsyncThunk(
  "performance/deletePerformanceReview",
  async (id) => {
    await axios.delete(`${API_BASE_URL}/performance/${id}`);
    return id;
  }
);

const initialState = {
  reviews: [],
  loading: false,
  error: null,
};

const PerformanceSlice = createSlice({
  name: "performance",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPerformanceReviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPerformanceReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchPerformanceReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createPerformanceReview.fulfilled, (state, action) => {
        state.reviews.push(action.payload);
      })
      .addCase(updatePerformanceReview.fulfilled, (state, action) => {
        const index = state.reviews.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
      })
      .addCase(deletePerformanceReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter((r) => r._id !== action.payload);
      });
  },
});

export default PerformanceSlice.reducer;
