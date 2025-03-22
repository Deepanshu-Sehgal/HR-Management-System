import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: null,
  status: "Pending",
  working: false,
};

const LeaveSlice = createSlice({
  name: "leave",
  initialState,
  reducers: {
    changeLeaveId: (state, action) => {
      state.id = action.payload;
    },
    changeLeaveStatus: (state, action) => {
      state.status = action.payload;
    },
    changeLeaveWorking: (state, action) => {
      state.working = action.payload;
    },
  },
});

export const { changeLeaveId, changeLeaveStatus, changeLeaveWorking } =
  LeaveSlice.actions;
export default LeaveSlice.reducer;
