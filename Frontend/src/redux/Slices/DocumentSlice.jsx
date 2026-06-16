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

const initialState = {
  documents: [],
  searchResults: [],
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
      });
  },
});

export default DocumentSlice.reducer;
