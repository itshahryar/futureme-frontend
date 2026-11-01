import { apiSlice } from './apiSlice'

export const aiLearningApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSkillAnalysis: builder.query({
      query: (targetRole) => (targetRole ? `/ai/skill-analysis?targetRole=${encodeURIComponent(targetRole)}` : '/ai/skill-analysis'),
      providesTags: ['SkillAnalysis'],
    }),

    generateSkillAnalysis: builder.mutation({
      query: (payload = {}) => ({
        url: '/ai/skill-analysis/generate',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['SkillAnalysis'],
    }),

    getLearningPath: builder.query({
      query: (targetRole) => (targetRole ? `/ai/learning-path?targetRole=${encodeURIComponent(targetRole)}` : '/ai/learning-path'),
      providesTags: ['LearningPath'],
    }),

    generateLearningPath: builder.mutation({
      query: (payload = {}) => ({
        url: '/ai/learning-path/generate',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['LearningPath'],
    }),

    updateSubtopicStatus: builder.mutation({
      query: ({ pathId, subtopicId, completed }) => ({
        url: `/ai/learning-path/${pathId}/subtopic-status`,
        method: 'PATCH',
        body: { subtopicId, completed },
      }),
      async onQueryStarted({ subtopicId, completed }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          aiLearningApiSlice.util.updateQueryData('getLearningPath', undefined, (draft) => {
            if (!draft?.learningPath) return
            const milestones = typeof draft.learningPath.milestones === 'string'
              ? JSON.parse(draft.learningPath.milestones)
              : draft.learningPath.milestones
            for (const m of milestones || []) {
              for (const t of (m.topics || [])) {
                for (const sub of (t.subtopics || [])) {
                  if (sub.id === subtopicId) {
                    sub.isCompleted = Boolean(completed)
                  }
                }
              }
            }
            draft.learningPath.milestones = milestones
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),

    // Phase 5: Topic Learning Materials & Resources
    getTopicContent: builder.mutation({
      query: ({ topicId, ...payload }) => ({
        url: `/ai/topic/${topicId}/content`,
        method: 'POST',
        body: payload,
      }),
    }),

    // Phase 6: Topic Quizzes & Assessments
    getTopicAssessment: builder.mutation({
      query: ({ topicId, ...payload }) => ({
        url: `/ai/topic/${topicId}/assessment`,
        method: 'POST',
        body: payload,
      }),
    }),

    submitAssessment: builder.mutation({
      query: ({ topicId, ...payload }) => ({
        url: `/ai/topic/${topicId}/submit-assessment`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['LearningPath', 'SkillAnalysis', 'Profile'],
    }),

    // Where user says "I have learned this skill / update my skill proficiency"
    updateLearnedSkill: builder.mutation({
      query: (payload) => ({
        url: '/ai/update-learned-skill',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['SkillAnalysis', 'Profile', 'LearningPath'],
    }),

    getMyAssessments: builder.query({
      query: () => '/ai/my-assessments',
      providesTags: ['LearningPath'],
    }),
  }),
})

export const {
  useGetSkillAnalysisQuery,
  useGenerateSkillAnalysisMutation,
  useGetLearningPathQuery,
  useGenerateLearningPathMutation,
  useUpdateSubtopicStatusMutation,
  useGetTopicContentMutation,
  useGetTopicAssessmentMutation,
  useSubmitAssessmentMutation,
  useUpdateLearnedSkillMutation,
  useGetMyAssessmentsQuery,
} = aiLearningApiSlice
