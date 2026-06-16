import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const fetchPayrolls = createAsyncThunk("payroll/fetchPayrolls", async () => {
  const response = await axios.get(`${API_BASE_URL}/payroll`);
  return response.data;
});

export const createPayroll = createAsyncThunk("payroll/createPayroll", async (payrollData) => {
  const response = await axios.post(`${API_BASE_URL}/payroll`, payrollData);
  return response.data.payroll;
});

export const updatePayroll = createAsyncThunk(
  "payroll/updatePayroll",
  async ({ id, data }) => {
    const response = await axios.put(`${API_BASE_URL}/payroll/${id}`, data);
    return response.data.payroll;
  }
);

export const processPayroll = createAsyncThunk(
  "payroll/processPayroll",
  async (id) => {
    const response = await axios.patch(`${API_BASE_URL}/payroll/${id}/process`);
    return response.data.payroll;
  }
);

const initialState = {
  payrolls: [],
  loading: false,
  error: null,
};

const PayrollSlice = createSlice({
  name: "payroll",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayrolls.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPayrolls.fulfilled, (state, action) => {
        state.loading = false;
        state.payrolls = action.payload;
      })
      .addCase(fetchPayrolls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createPayroll.fulfilled, (state, action) => {
        state.payrolls.push(action.payload);
      })
      .addCase(updatePayroll.fulfilled, (state, action) => {
        const index = state.payrolls.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.payrolls[index] = action.payload;
        }
      })
      .addCase(processPayroll.fulfilled, (state, action) => {
        const index = state.payrolls.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.payrolls[index] = action.payload;
        }
      });
  },
});

export default PayrollSlice.reducer;
