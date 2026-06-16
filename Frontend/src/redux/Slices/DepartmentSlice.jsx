import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Async Thunks
export const fetchDepartments = createAsyncThunk(
  "department/fetchDepartments",
  async () => {
    const response = await axios.get(`${API_BASE_URL}/departments`);
    return response.data;
  }
);

export const createDepartment = createAsyncThunk(
  "department/createDepartment",
  async (departmentData) => {
    const response = await axios.post(`${API_BASE_URL}/departments`, departmentData);
    return response.data.department;
  }
);

export const updateDepartment = createAsyncThunk(
  "department/updateDepartment",
  async ({ id, data }) => {
    const response = await axios.put(`${API_BASE_URL}/departments/${id}`, data);
    return response.data.department;
  }
);

export const deleteDepartment = createAsyncThunk(
  "department/deleteDepartment",
  async (id) => {
    await axios.delete(`${API_BASE_URL}/departments/${id}`);
    return id;
  }
);

const initialState = {
  departments: [],
  loading: false,
  error: null,
};

const DepartmentSlice = createSlice({
  name: "department",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.departments.push(action.payload);
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        const index = state.departments.findIndex((d) => d._id === action.payload._id);
        if (index !== -1) {
          state.departments[index] = action.payload;
        }
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.departments = state.departments.filter((d) => d._id !== action.payload);
      });
  },
});

export default DepartmentSlice.reducer;
