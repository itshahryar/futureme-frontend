import { apiSlice } from './apiSlice'

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (params = {}) => {
        const { page = 1, limit = 15, search = '', role = 'ALL' } =
          typeof params === 'object' && params !== null ? params : {}
        const queryParams = new URLSearchParams()
        queryParams.append('page', String(page))
        queryParams.append('limit', String(limit))
        if (search) queryParams.append('search', search)
        if (role && role !== 'ALL') queryParams.append('role', role)

        return `/users?${queryParams.toString()}`
      },
      keepUnusedDataFor: 300, // Cache inactive query results for 5 minutes
      providesTags: (result) =>
        result?.users
          ? [
              ...result.users.map(({ id }) => ({ type: 'Users', id })),
              { type: 'Users', id: 'LIST' },
            ]
          : [{ type: 'Users', id: 'LIST' }],
    }),
    updateUserByAdmin: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [{ type: 'Users', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetUsersQuery,
  useUpdateUserByAdminMutation,
} = usersApiSlice
