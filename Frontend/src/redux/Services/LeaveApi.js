import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const LeaveApi = createApi({
  reducerPath: "LeaveApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ["LeaveApi"],
  endpoints: (builder) => {
    return {
      getUsers: builder.mutation({
        query: (data) => {
          return {
            url: "/employeeleavefilterbystatus",
            method: "POST",
            body: data,
          };
        },
        providesTags: ["LeaveApi"],
      }),
      getUsersbydate: builder.mutation({
        query: (data) => {
          return {
            url: "/employeeleavefilter",
            method: "POST",
            body: data,
          };
        },
        providesTags: ["LeaveApi"],
      }),
      getLeaveSummary: builder.query({
        query: () => ({
          url: "/employeeleave/summary",
          method: "GET",
        }),
        providesTags: ["LeaveApi"],
      }),
      addUser: builder.mutation({
        query: (userData) => {
          return {
            url: "/employeeleave",
            method: "POST",
            body: userData,
          };
        },
        invalidatesTags: ["LeaveApi"],
      }),
      deleteUser: builder.mutation({
        query: (id) => {
          return {
            url: `/candidates/${id}`,
            method: "DELETE",
          };
        },
        invalidatesTags: ["LeaveApi"],
      }),
      updateUser: builder.mutation({
        query: ({ idd, body }) => {
          return {
            url: `/employeeleave/${idd}`,
            method: "PUT",
            body: body,
          };
        },
        invalidatesTags: ["LeaveApi"],
      }),
    };
  },
});

export const {
  useGetUsersMutation,
  useAddUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useGetUsersbydateMutation,
  useGetLeaveSummaryQuery,
} = LeaveApi;
