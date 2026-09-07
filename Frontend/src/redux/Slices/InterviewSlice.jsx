import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const INTERVIEWS_URL = `${API_BASE_URL}/interviews`;

export const fetchUpcomingInterviews = createAsyncThunk(
  "interview/fetchUpcoming",
  async () => {
    const response = await axios.get(`${INTERVIEWS_URL}/upcoming`);
    return response.data;
  }
);

export const fetchInterviewsByApplication = createAsyncThunk(
  "interview/fetchByApplication",
  async (applicationId) => {
    const response = await axios.get(`${INTERVIEWS_URL}/application/${applicationId}`);
    return { applicationId, interviews: response.data };
  }
);

export const scheduleInterview = createAsyncThunk(
  "interview/schedule",
  async (data) => {
    const response = await axios.post(INTERVIEWS_URL, data);
    return response.data.interview;
  }
);

export const updateInterview = createAsyncThunk(
  "interview/update",
  async ({ id, data }) => {
    const response = await axios.put(`${INTERVIEWS_URL}/${id}`, data);
    return response.data.interview;
  }
);

export const cancelInterview = createAsyncThunk(
  "interview/cancel",
  async (id) => {
    const response = await axios.patch(`${INTERVIEWS_URL}/${id}/cancel`);
    return response.data.interview;
  }
);

const initialState = {
  upcoming: [],
  // Interviews for the currently open candidate, keyed by applicationId.
  byApplication: {},
  loading: false,
  error: null,
};

function upsert(list, item) {
  const i = list.findIndex((x) => x._id === item._id);
  if (i !== -1) list[i] = item;
  else list.push(item);
}

const InterviewSlice = createSlice({
  name: "interview",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUpcomingInterviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUpcomingInterviews.fulfilled, (state, action) => {
        state.loading = false;
        state.upcoming = action.payload;
      })
      .addCase(fetchUpcomingInterviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchInterviewsByApplication.fulfilled, (state, action) => {
        state.byApplication[action.payload.applicationId] = action.payload.interviews;
      })
      .addCase(scheduleInterview.fulfilled, (state, action) => {
        const iv = action.payload;
        const list = state.byApplication[iv.applicationId] || [];
        upsert(list, iv);
        state.byApplication[iv.applicationId] = list;
        state.upcoming.push(iv);
        state.upcoming.sort(
          (a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)
        );
      })
      .addCase(updateInterview.fulfilled, (state, action) => {
        const iv = action.payload;
        const list = state.byApplication[iv.applicationId];
        if (list) upsert(list, iv);
        const i = state.upcoming.findIndex((x) => x._id === iv._id);
        if (i !== -1) {
          if (iv.status === "Scheduled") state.upcoming[i] = iv;
          else state.upcoming.splice(i, 1); // drop non-scheduled from upcoming
        }
      })
      .addCase(cancelInterview.fulfilled, (state, action) => {
        const iv = action.payload;
        const list = state.byApplication[iv.applicationId];
        if (list) upsert(list, iv);
        state.upcoming = state.upcoming.filter((x) => x._id !== iv._id);
      });
  },
});

export default InterviewSlice.reducer;
