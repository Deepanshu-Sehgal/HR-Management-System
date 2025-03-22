import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const LeaveApi = createApi({
  reducerPath: "LeaveApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:4000/api" }),
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
} = LeaveApi;
