import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const fetchDocuments = createAsyncThunk("document/fetchDocuments", async () => {
  const response = await axios.get(`${API_BASE_URL}/documents`);
  return response.data;
});

export const uploadDocument = createAsyncThunk(
  "document/uploadDocument",
  async (documentData) => {
    const response = await axios.post(`${API_BASE_URL}/documents`, documentData);
    return response.data.document;
  }
);

export const searchDocuments = createAsyncThunk(
  "document/searchDocuments",
  async (query) => {
    const response = await axios.get(`${API_BASE_URL}/documents/search?query=${query}`);
    return response.data;
  }
);

export const fetchExpiringDocuments = createAsyncThunk(
  "document/fetchExpiring",
  async (days = 30) => {
    const response = await axios.get(`${API_BASE_URL}/documents/expiring`, {
      params: { days },
    });
    return response.data;
  }
);

export const fetchExpiryStats = createAsyncThunk(
  "document/expiryStats",
  async () => {
    const response = await axios.get(`${API_BASE_URL}/documents/expiry-stats`);
    return response.data;
  }
);

export const sendDocumentReminder = createAsyncThunk(
  "document/sendReminder",
  async (id) => {
    const response = await axios.post(`${API_BASE_URL}/documents/${id}/send-reminder`);
    return { id, ...response.data };
  }
);

export const runDocumentExpirySweep = createAsyncThunk(
  "document/runExpirySweep",
  async () => {
    const response = await axios.post(`${API_BASE_URL}/documents/run-expiry-sweep`);
    return response.data;
  }
);

const initialState = {
  documents: [],
  searchResults: [],
  expiring: [],
  expiryStats: null,
  sendingReminderId: null,
  loading: false,
  error: null,
};

const DocumentSlice = createSlice({
  name: "document",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.documents.push(action.payload);
      })
      .addCase(searchDocuments.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      .addCase(fetchExpiringDocuments.fulfilled, (state, action) => {
        state.expiring = action.payload;
      })
      .addCase(fetchExpiryStats.fulfilled, (state, action) => {
        state.expiryStats = action.payload;
      })
      .addCase(sendDocumentReminder.pending, (state, action) => {
        state.sendingReminderId = action.meta.arg;
      })
      .addCase(sendDocumentReminder.fulfilled, (state, action) => {
        state.sendingReminderId = null;
        const item = state.expiring.find((d) => d._id === action.payload.id);
        if (item) item.reminderSent = true;
      })
      .addCase(sendDocumentReminder.rejected, (state) => {
        state.sendingReminderId = null;
      });
  },
});

export default DocumentSlice.reducer;
