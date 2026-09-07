import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/apiClient";

export const fetchPages = createAsyncThunk("page/fetchPages", async () => {
  const response = await apiClient.get("/pages");
  return response.data;
});

export const createPage = createAsyncThunk("page/createPage", async (pageData) => {
  const response = await apiClient.post("/pages", pageData);
  return response.data.page;
});

export const updatePage = createAsyncThunk("page/updatePage", async ({ id, data }) => {
  const response = await apiClient.put(`/pages/${id}`, data);
  return response.data.page;
});

export const deletePage = createAsyncThunk("page/deletePage", async (id) => {
  await apiClient.delete(`/pages/${id}`);
  return id;
});

const initialState = {
  pages: [],
  loading: false,
  error: null,
};

const pageSlice = createSlice({
  name: "page",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPages.fulfilled, (state, action) => {
        state.loading = false;
        state.pages = action.payload;
      })
      .addCase(fetchPages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createPage.fulfilled, (state, action) => {
        state.pages.unshift(action.payload);
      })
      .addCase(updatePage.fulfilled, (state, action) => {
        state.pages = state.pages.map((page) =>
          page._id === action.payload._id ? action.payload : page
        );
      })
      .addCase(deletePage.fulfilled, (state, action) => {
        state.pages = state.pages.filter((page) => page._id !== action.payload);
      });
  },
});

export default pageSlice.reducer;
