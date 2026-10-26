import { apiSlice } from './apiSlice'

export const onboardingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Student Endpoints
    getOnboardingConfig: builder.query({
      query: () => '/onboarding/config',
      providesTags: ['OnboardingConfig'],
    }),

    getStudentProfile: builder.query({
      query: () => '/profile/me',
      providesTags: ['Profile'],
    }),

    saveOnboardingStep: builder.mutation({
      query: (stepPayload) => ({
        url: '/onboarding/save-step',
        method: 'PUT',
        body: stepPayload,
      }),
      invalidatesTags: ['Profile', 'OnboardingStats'],
    }),

    completeOnboarding: builder.mutation({
      query: () => ({
        url: '/onboarding/complete',
        method: 'POST',
      }),
      invalidatesTags: ['Profile', 'User', 'OnboardingStats'],
    }),

    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: '/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['Profile', 'User'],
    }),

    addProject: builder.mutation({
      query: (project) => ({
        url: '/profile/projects',
        method: 'POST',
        body: project,
      }),
      invalidatesTags: ['Profile'],
    }),

    deleteProject: builder.mutation({
      query: (id) => ({
        url: `/profile/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Profile'],
    }),

    addExperience: builder.mutation({
      query: (experience) => ({
        url: '/profile/experiences',
        method: 'POST',
        body: experience,
      }),
      invalidatesTags: ['Profile'],
    }),

    deleteExperience: builder.mutation({
      query: (id) => ({
        url: `/profile/experiences/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Profile'],
    }),

    addCertification: builder.mutation({
      query: (certification) => ({
        url: '/profile/certifications',
        method: 'POST',
        body: certification,
      }),
      invalidatesTags: ['Profile'],
    }),

    deleteCertification: builder.mutation({
      query: (id) => ({
        url: `/profile/certifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Profile'],
    }),

    // Admin Endpoints
    getAdminSections: builder.query({
      query: () => '/admin/onboarding/sections',
      providesTags: ['OnboardingSections'],
    }),

    updateAdminSection: builder.mutation({
      query: ({ key, ...payload }) => ({
        url: `/admin/onboarding/sections/${key}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['OnboardingSections', 'OnboardingConfig'],
    }),

    reorderAdminSections: builder.mutation({
      query: (orders) => ({
        url: '/admin/onboarding/sections-order',
        method: 'PUT',
        body: { orders },
      }),
      invalidatesTags: ['OnboardingSections', 'OnboardingConfig'],
    }),

    getAdminCatalogs: builder.query({
      query: () => '/admin/onboarding/catalogs',
      providesTags: ['Catalogs'],
    }),

    addCatalogDegree: builder.mutation({
      query: (data) => ({
        url: '/admin/onboarding/catalogs/degrees',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Catalogs', 'OnboardingConfig'],
    }),

    updateCatalogDegree: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/onboarding/catalogs/degrees/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Catalogs', 'OnboardingConfig'],
    }),

    deleteCatalogDegree: builder.mutation({
      query: (id) => ({
        url: `/admin/onboarding/catalogs/degrees/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Catalogs', 'OnboardingConfig'],
    }),

    addCatalogSkill: builder.mutation({
      query: (data) => ({
        url: '/admin/onboarding/catalogs/skills',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Catalogs', 'OnboardingConfig'],
    }),

    updateCatalogSkill: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/onboarding/catalogs/skills/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Catalogs', 'OnboardingConfig'],
    }),

    deleteCatalogSkill: builder.mutation({
      query: (id) => ({
        url: `/admin/onboarding/catalogs/skills/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Catalogs', 'OnboardingConfig'],
    }),

    addCatalogOption: builder.mutation({
      query: (data) => ({
        url: '/admin/onboarding/catalogs/options',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Catalogs', 'OnboardingConfig'],
    }),

    updateCatalogOption: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/onboarding/catalogs/options/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Catalogs', 'OnboardingConfig'],
    }),

    deleteCatalogOption: builder.mutation({
      query: (id) => ({
        url: `/admin/onboarding/catalogs/options/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Catalogs', 'OnboardingConfig'],
    }),

    getAdminOnboardingStats: builder.query({
      query: () => '/admin/onboarding/stats',
      providesTags: ['OnboardingStats'],
    }),
  }),
})

export const {
  useGetOnboardingConfigQuery,
  useGetStudentProfileQuery,
  useSaveOnboardingStepMutation,
  useCompleteOnboardingMutation,
  useUpdateProfileMutation,
  useAddProjectMutation,
  useDeleteProjectMutation,
  useAddExperienceMutation,
  useDeleteExperienceMutation,
  useAddCertificationMutation,
  useDeleteCertificationMutation,
  useGetAdminSectionsQuery,
  useUpdateAdminSectionMutation,
  useReorderAdminSectionsMutation,
  useGetAdminCatalogsQuery,
  useAddCatalogDegreeMutation,
  useUpdateCatalogDegreeMutation,
  useDeleteCatalogDegreeMutation,
  useAddCatalogSkillMutation,
  useUpdateCatalogSkillMutation,
  useDeleteCatalogSkillMutation,
  useAddCatalogOptionMutation,
  useUpdateCatalogOptionMutation,
  useDeleteCatalogOptionMutation,
  useGetAdminOnboardingStatsQuery,
} = onboardingApiSlice
