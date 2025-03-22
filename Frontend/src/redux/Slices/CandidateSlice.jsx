import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: null,
  status: "New",
  working: false,
};

const CandidateSlice = createSlice({
  name: "candidate",
  initialState,
  reducers: {
    changeCandidateId: (state, action) => {
      state.id = action.payload;
    },
    changeStatus: (state, action) => {
      state.status = action.payload;
    },
    changeWorking: (state, action) => {
      state.working = action.payload;
    },
  },
});

export const { changeCandidateId, changeStatus, changeWorking } =
  CandidateSlice.actions;
export default CandidateSlice.reducer;
