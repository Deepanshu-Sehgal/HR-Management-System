import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const CandidateApi = createApi({
  reducerPath: "CandidateApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ["CandidateApi"],
  endpoints: (builder) => {
    return {
      getUsers: builder.mutation({
        query: (data) => {
          return {
            url: "/candidates/fetch",
            method: "POST",
            body: data,
          };
        },
        providesTags: ["CandidateApi"],
      }),
      addUser: builder.mutation({
        query: (userData) => {
          return {
            url: "/candidates",
            method: "POST",
            body: userData,
          };
        },
        invalidatesTags: ["CandidateApi"],
      }),
      deleteUser: builder.mutation({
        query: (id) => {
          return {
            url: `/candidates/${id}`,
            method: "DELETE",
          };
        },
        invalidatesTags: ["CandidateApi"],
      }),
      updateUser: builder.mutation({
        query: ({ idd, body }) => {
          return {
            url: `/candidates/${idd}`,
            method: "PUT",
            body: body,
          };
        },
        invalidatesTags: ["CandidateApi"],
      }),
    };
  },
});

export const {
  useGetUsersMutation,
  useAddUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
} = CandidateApi;
