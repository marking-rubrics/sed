import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AssessedRubric, AssessedComponent } from '@/types'
import type { Rubric } from '@/types'
import { getExistingAssessment, saveAssessment } from '@/services/assessmentService'
import { syncAssessmentWithRubric } from '@/utils/assessmentHelpers'

export const useAssessmentStore = defineStore('assessmentWorkspace', () => {
  const activeAssessmentId = ref<string | undefined>(undefined)
  const gradingComponents = ref<AssessedComponent[]>([])
  const isSaving = ref(false)
  const isLoading = ref(false)

  /**
   * Loads the workspace for an assessment instance.
   * Pulls the history if it exists, normalizes it, or generates a clean sheet.
   */
  async function prepareEvaluationCanvas(
    assessorId: string,
    teamId: string,
    masterRubric: Rubric
  ): Promise<void> {
    isLoading.value = true
    activeAssessmentId.value = undefined
    
    try {
      const existingHistory = await getExistingAssessment(assessorId, teamId, masterRubric.id)

      if (existingHistory) {
        activeAssessmentId.value = existingHistory.id
        // 🔄 Sync existing marks onto the current structural model variations
        gradingComponents.value = syncAssessmentWithRubric(
          masterRubric.components,
          existingHistory.components
        )
      } else {
        // 🆕 Zero-state initialization matching the rubric structure perfectly
        gradingComponents.value = syncAssessmentWithRubric(masterRubric.components, [])
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Commits the workspace updates back to the database.
   */
  async function submitEvaluation(
    assessorId: string,
    teamId: string,
    rubricId: string
  ): Promise<void> {
    isSaving.value = true
    try {
      await saveAssessment({
        id: activeAssessmentId.value,
        assessorId,
        teamId,
        rubricId,
        components: gradingComponents.value
      })
    } finally {
      isSaving.value = false
    }
  }

  return {
    gradingComponents,
    isLoading,
    isSaving,
    prepareEvaluationCanvas,
    submitEvaluation
  }
})
