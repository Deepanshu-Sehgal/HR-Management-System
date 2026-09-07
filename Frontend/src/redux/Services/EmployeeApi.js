import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const EmployeeApi = createApi({
  reducerPath: "EmployeeApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ["EmployeeApi"],
  endpoints: (builder) => {
    return {
      getUsers: builder.mutation({
        query: (data) => {
          return {
            url: "/employee/filter",
            method: "POST",
            body: data,
          };
        },
        providesTags: ["EmployeeApi"],
      }),
      addUser: builder.mutation({
        query: (userData) => {
          return {
            url: "/employee",
            method: "POST",
            body: userData,
          };
        },
        invalidatesTags: ["EmployeeApi"],
      }),
      recordAttendance: builder.mutation({
        query: (id) => {
          return {
            url: `/employee/${id}/attendance`,
            method: "POST",
          };
        },
        invalidatesTags: ["EmployeeApi"],
      }),
      deleteUser: builder.mutation({
        query: (id) => {
          return {
            url: `/candidates/${id}`,
            method: "DELETE",
          };
        },
        invalidatesTags: ["EmployeeApi"],
      }),
      updateUser: builder.mutation({
        query: ({ id, body }) => {
          return {
            url: `/employee/${id}`,
            method: "PUT",
            body: body,
          };
        },
        invalidatesTags: ["EmployeeApi"],
      }),
    };
  },
});

export const {
  useGetUsersMutation,
  useAddUserMutation,
  useRecordAttendanceMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
} = EmployeeApi;
