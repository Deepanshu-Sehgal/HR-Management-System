import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const URL = `${API_BASE_URL}/tickets`;

export const fetchTickets = createAsyncThunk("ticket/fetchAll", async (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v)
  ).toString();
  const res = await axios.get(qs ? `${URL}?${qs}` : URL);
  return res.data;
});

export const fetchTicketStats = createAsyncThunk("ticket/stats", async () => {
  const res = await axios.get(`${URL}/stats`);
  return res.data;
});

export const createTicket = createAsyncThunk("ticket/create", async (data) => {
  const res = await axios.post(URL, data);
  return res.data.ticket;
});

export const updateTicket = createAsyncThunk("ticket/update", async ({ id, data }) => {
  const res = await axios.put(`${URL}/${id}`, data);
  return res.data.ticket;
});

export const addTicketComment = createAsyncThunk(
  "ticket/addComment",
  async ({ id, message, by }) => {
    const res = await axios.post(`${URL}/${id}/comments`, { message, by });
    return res.data.ticket;
  }
);

export const deleteTicket = createAsyncThunk("ticket/delete", async (id) => {
  await axios.delete(`${URL}/${id}`);
  return id;
});

const initialState = {
  items: [],
  stats: null,
  loading: false,
  error: null,
};

function replace(state, t) {
  const i = state.items.findIndex((x) => x._id === t._id);
  if (i !== -1) state.items[i] = t;
  else state.items.unshift(t);
}

const TicketSlice = createSlice({
  name: "ticket",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchTicketStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateTicket.fulfilled, (state, action) => {
        replace(state, action.payload);
      })
      .addCase(addTicketComment.fulfilled, (state, action) => {
        replace(state, action.payload);
      })
      .addCase(deleteTicket.fulfilled, (state, action) => {
        state.items = state.items.filter((x) => x._id !== action.payload);
      });
  },
});

export default TicketSlice.reducer;
