import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const URL = `${API_BASE_URL}/onboarding`;

export const fetchOnboardings = createAsyncThunk("onboarding/fetchAll", async () => {
  const res = await axios.get(URL);
  return res.data;
});

export const fetchOnboardingStats = createAsyncThunk("onboarding/stats", async () => {
  const res = await axios.get(`${URL}/stats`);
  return res.data;
});

export const createOnboarding = createAsyncThunk(
  "onboarding/create",
  async (data) => {
    const res = await axios.post(URL, data);
    return res.data.onboarding;
  }
);

export const updateOnboardingTask = createAsyncThunk(
  "onboarding/updateTask",
  async ({ id, taskId, data }) => {
    const res = await axios.patch(`${URL}/${id}/tasks/${taskId}`, data);
    return res.data.onboarding;
  }
);

export const addOnboardingTask = createAsyncThunk(
  "onboarding/addTask",
  async ({ id, data }) => {
    const res = await axios.post(`${URL}/${id}/tasks`, data);
    return res.data.onboarding;
  }
);

export const deleteOnboarding = createAsyncThunk(
  "onboarding/delete",
  async (id) => {
    await axios.delete(`${URL}/${id}`);
    return id;
  }
);

const initialState = {
  items: [],
  stats: null,
  loading: false,
  error: null,
};

function replace(state, o) {
  const i = state.items.findIndex((x) => x._id === o._id);
  if (i !== -1) state.items[i] = o;
  else state.items.unshift(o);
}

const OnboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOnboardings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOnboardings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOnboardings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchOnboardingStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(createOnboarding.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateOnboardingTask.fulfilled, (state, action) => {
        replace(state, action.payload);
      })
      .addCase(addOnboardingTask.fulfilled, (state, action) => {
        replace(state, action.payload);
      })
      .addCase(deleteOnboarding.fulfilled, (state, action) => {
        state.items = state.items.filter((x) => x._id !== action.payload);
      });
  },
});

export default OnboardingSlice.reducer;
