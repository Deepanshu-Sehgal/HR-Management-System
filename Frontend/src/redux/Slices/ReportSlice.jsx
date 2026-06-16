import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const fetchReports = createAsyncThunk("report/fetchReports", async () => {
  const response = await axios.get(`${API_BASE_URL}/reports`);
  return response.data;
});

export const createReport = createAsyncThunk("report/createReport", async (reportData) => {
  const response = await axios.post(`${API_BASE_URL}/reports`, reportData);
  return response.data.report;
});

export const getReportsByType = createAsyncThunk(
  "report/getReportsByType",
  async (type) => {
    const response = await axios.get(`${API_BASE_URL}/reports/type/${type}`);
    return response.data;
  }
);

const initialState = {
  reports: [],
  filteredReports: [],
  loading: false,
  error: null,
};

const ReportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.reports.push(action.payload);
      })
      .addCase(getReportsByType.fulfilled, (state, action) => {
        state.filteredReports = action.payload;
      });
  },
});

export default ReportSlice.reducer;
