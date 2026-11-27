import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const URL = `${API_BASE_URL}/celebrations`;

export const fetchUpcomingCelebrations = createAsyncThunk(
  "celebrations/upcoming",
  async (days = 30) => {
    const res = await axios.get(`${URL}/upcoming`, { params: { days } });
    return res.data;
  }
);

export const fetchCelebrationLog = createAsyncThunk(
  "celebrations/log",
  async () => {
    const res = await axios.get(`${URL}/log`);
    return res.data;
  }
);

export const sendCelebrationGreeting = createAsyncThunk(
  "celebrations/send",
  async ({ employeeId, type }) => {
    const res = await axios.post(`${URL}/send`, { employeeId, type });
    return res.data;
  }
);

export const runCelebrationSweep = createAsyncThunk(
  "celebrations/runSweep",
  async () => {
    const res = await axios.post(`${URL}/run-sweep`);
    return res.data;
  }
);

const initialState = {
  events: [],
  summary: null,
  log: [],
  loading: false,
  sending: null, // `${employeeId}-${type}` currently being sent
  error: null,
};

const CelebrationSlice = createSlice({
  name: "celebrations",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUpcomingCelebrations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUpcomingCelebrations.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload.events;
        state.summary = action.payload.summary;
      })
      .addCase(fetchUpcomingCelebrations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchCelebrationLog.fulfilled, (state, action) => {
        state.log = action.payload;
      })
      .addCase(sendCelebrationGreeting.pending, (state, action) => {
        const { employeeId, type } = action.meta.arg;
        state.sending = `${employeeId}-${type}`;
      })
      .addCase(sendCelebrationGreeting.fulfilled, (state) => {
        state.sending = null;
      })
      .addCase(sendCelebrationGreeting.rejected, (state, action) => {
        state.sending = null;
        state.error = action.error.message;
      });
  },
});

export default CelebrationSlice.reducer;
