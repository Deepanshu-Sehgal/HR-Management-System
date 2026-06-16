import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const fetchJobApplications = createAsyncThunk(
  "jobApplication/fetchJobApplications",
  async () => {
    const response = await axios.get(`${API_BASE_URL}/job-applications`);
    return response.data;
  }
);

export const createJobApplication = createAsyncThunk(
  "jobApplication/createJobApplication",
  async (applicationData) => {
    const response = await axios.post(`${API_BASE_URL}/job-applications`, applicationData);
    return response.data.application;
  }
);

export const updateApplicationStatus = createAsyncThunk(
  "jobApplication/updateApplicationStatus",
  async ({ id, data }) => {
    const response = await axios.put(`${API_BASE_URL}/job-applications/${id}`, data);
    return response.data.application;
  }
);

const initialState = {
  applications: [],
  loading: false,
  error: null,
};

const JobApplicationSlice = createSlice({
  name: "jobApplication",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobApplications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload;
      })
      .addCase(fetchJobApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createJobApplication.fulfilled, (state, action) => {
        state.applications.push(action.payload);
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        const index = state.applications.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) {
          state.applications[index] = action.payload;
        }
      });
  },
});

export default JobApplicationSlice.reducer;
