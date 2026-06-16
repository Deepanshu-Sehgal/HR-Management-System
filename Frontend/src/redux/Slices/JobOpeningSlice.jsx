import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const fetchJobOpenings = createAsyncThunk(
  "jobOpening/fetchJobOpenings",
  async () => {
    const response = await axios.get(`${API_BASE_URL}/job-openings`);
    return response.data;
  }
);

export const createJobOpening = createAsyncThunk(
  "jobOpening/createJobOpening",
  async (jobData) => {
    const response = await axios.post(`${API_BASE_URL}/job-openings`, jobData);
    return response.data.jobOpening;
  }
);

export const updateJobOpening = createAsyncThunk(
  "jobOpening/updateJobOpening",
  async ({ id, data }) => {
    const response = await axios.put(`${API_BASE_URL}/job-openings/${id}`, data);
    return response.data.jobOpening;
  }
);

export const closeJobOpening = createAsyncThunk(
  "jobOpening/closeJobOpening",
  async (id) => {
    const response = await axios.patch(`${API_BASE_URL}/job-openings/${id}/close`);
    return response.data.jobOpening;
  }
);

const initialState = {
  jobOpenings: [],
  loading: false,
  error: null,
};

const JobOpeningSlice = createSlice({
  name: "jobOpening",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobOpenings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobOpenings.fulfilled, (state, action) => {
        state.loading = false;
        state.jobOpenings = action.payload;
      })
      .addCase(fetchJobOpenings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createJobOpening.fulfilled, (state, action) => {
        state.jobOpenings.push(action.payload);
      })
      .addCase(updateJobOpening.fulfilled, (state, action) => {
        const index = state.jobOpenings.findIndex((j) => j._id === action.payload._id);
        if (index !== -1) {
          state.jobOpenings[index] = action.payload;
        }
      })
      .addCase(closeJobOpening.fulfilled, (state, action) => {
        const index = state.jobOpenings.findIndex((j) => j._id === action.payload._id);
        if (index !== -1) {
          state.jobOpenings[index] = action.payload;
        }
      });
  },
});

export default JobOpeningSlice.reducer;
