import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: "1",
  delete: false,
  status: "Absent",
  working: false,
};

const EmployeeSlice = createSlice({
  name: "employee",
  initialState,
  reducers: {
    changeId: (state, action) => {
      state.id = action.payload;
    },
    deletepop: (state, action) => {
      state.delete = !state.delete;
    },
    changeStatusEmp: (state, action) => {
      state.status = action.payload;
    },
    changeWorkingEmp: (state, action) => {
      state.working = action.payload;
    },
  },
});

export const { changeId, deletepop, changeStatusEmp, changeWorkingEmp } =
  EmployeeSlice.actions;

export default EmployeeSlice.reducer;
