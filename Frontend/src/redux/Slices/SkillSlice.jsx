import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const fetchSkills = createAsyncThunk("skill/fetchSkills", async () => {
  const response = await axios.get(`${API_BASE_URL}/skills`);
  return response.data;
});

export const addSkill = createAsyncThunk("skill/addSkill", async (skillData) => {
  const response = await axios.post(`${API_BASE_URL}/skills`, skillData);
  return response.data.skill;
});

export const updateSkill = createAsyncThunk(
  "skill/updateSkill",
  async ({ id, data }) => {
    const response = await axios.put(`${API_BASE_URL}/skills/${id}`, data);
    return response.data.skill;
  }
);

export const endorseSkill = createAsyncThunk("skill/endorseSkill", async (id) => {
  const response = await axios.patch(`${API_BASE_URL}/skills/${id}/endorse`);
  return response.data.skill;
});

const initialState = {
  skills: [],
  loading: false,
  error: null,
};

const SkillSlice = createSlice({
  name: "skill",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSkills.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSkills.fulfilled, (state, action) => {
        state.loading = false;
        state.skills = action.payload;
      })
      .addCase(fetchSkills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addSkill.fulfilled, (state, action) => {
        state.skills.push(action.payload);
      })
      .addCase(updateSkill.fulfilled, (state, action) => {
        const index = state.skills.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) {
          state.skills[index] = action.payload;
        }
      })
      .addCase(endorseSkill.fulfilled, (state, action) => {
        const index = state.skills.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) {
          state.skills[index] = action.payload;
        }
      });
  },
});

export default SkillSlice.reducer;
