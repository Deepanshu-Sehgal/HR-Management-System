import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const EmployeeApi = createApi({
  reducerPath: "EmployeeApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:4000/api" }),
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
            url: "/candidates",
            method: "POST",
            body: userData,
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
  useDeleteUserMutation,
  useUpdateUserMutation,
} = EmployeeApi;
