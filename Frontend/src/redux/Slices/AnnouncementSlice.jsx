import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const fetchAnnouncements = createAsyncThunk(
  "announcement/fetchAnnouncements",
  async () => {
    const response = await axios.get(`${API_BASE_URL}/announcements`);
    return response.data;
  }
);

export const createAnnouncement = createAsyncThunk(
  "announcement/createAnnouncement",
  async (announcementData) => {
    const response = await axios.post(`${API_BASE_URL}/announcements`, announcementData);
    return response.data.announcement;
  }
);

export const updateAnnouncement = createAsyncThunk(
  "announcement/updateAnnouncement",
  async ({ id, data }) => {
    const response = await axios.put(`${API_BASE_URL}/announcements/${id}`, data);
    return response.data.announcement;
  }
);

const initialState = {
  announcements: [],
  loading: false,
  error: null,
};

const AnnouncementSlice = createSlice({
  name: "announcement",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnnouncements.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.loading = false;
        state.announcements = action.payload;
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.announcements.push(action.payload);
      })
      .addCase(updateAnnouncement.fulfilled, (state, action) => {
        const index = state.announcements.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) {
          state.announcements[index] = action.payload;
        }
      });
  },
});

export default AnnouncementSlice.reducer;
