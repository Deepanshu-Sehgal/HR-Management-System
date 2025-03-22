import { configureStore } from "@reduxjs/toolkit";
import employeIdRed from "./Slices/EmployeeSlice";
import candidate from "./Slices/CandidateSlice";
import leaveid from "./Slices/LeaveSlice";
import { CandidateApi } from "./Services/CandidateApi";
import { setupListeners } from "@reduxjs/toolkit/query";
import { EmployeeApi } from "./Services/EmployeeApi";
import { LeaveApi } from "./Services/LeaveApi";

export const store = configureStore({
  reducer: {
    candidate: candidate,
    employeeId: employeIdRed,
    leave: leaveid,
    [CandidateApi.reducerPath]: CandidateApi.reducer,
    [EmployeeApi.reducerPath]: EmployeeApi.reducer,
    [LeaveApi.reducerPath]: LeaveApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(CandidateApi.middleware)
      .concat(EmployeeApi.middleware)
      .concat(LeaveApi.middleware),
});

setupListeners(store.dispatch);
