import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AssessedRubric, AssessedComponent, Rubric } from '@/types'
import { getExistingAssessment, saveAssessment } from '@/services/assessmentService'
import { syncAssessmentWithRubric } from '@/utils/assessmentHelpers'
import { getCompleteRubric } from '@/services/rubricService'

export const useAssessmentStore = defineStore('assessmentWorkspace', () => {
  const activeAssessmentId = ref<string | undefined>(undefined)
  const gradingComponents = ref<AssessedComponent[]>([])
  const activeRubric = ref<Rubric | null>(null)
  const rubricsCache = ref<Record<string, Rubric>>({})
  const isSaving = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 🔍 RETRIEVE & SET ACTIVE RUBRIC: Fetches a rubric configuration via
   * the rubricService layer (using local store cache first) and binds it to the canvas.
   */
  async function fetchAndSetActiveRubric(rubricId: string): Promise<Rubric> {
    isLoading.value = true
    error.value = null

    try {
      if (rubricsCache.value[rubricId]) {
        activeRubric.value = rubricsCache.value[rubricId]
        return activeRubric.value
      }

      const rubricData = await getCompleteRubric(rubricId)
      if (!rubricData) {
        throw new Error(`The requested rubric configuration [${rubricId}] could not be found.`)
      }

      rubricsCache.value[rubricId] = rubricData
      activeRubric.value = rubricData
      return rubricData
    } catch (err: any) {
      error.value = err.message || 'An error occurred while loading the rubric details.'
      console.error(`[AssessmentStore] Failed to fetch rubric via service [${rubricId}]:`, err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Loads the workspace for an assessment instance.
   * Now accepts an optional rubricId to guarantee context initialization.
   */
  async function prepareEvaluationCanvas(
    assessorId: string,
    teamId: string,
    rubricId?: string
  ): Promise<void> {
    isLoading.value = true
    error.value = null
    activeAssessmentId.value = undefined

    try {
      // 🛡️ Context Safety Net: If a rubricId is passed or missing, ensure it's loaded first
      if (rubricId && (!activeRubric.value || activeRubric.value.id !== rubricId)) {
        await fetchAndSetActiveRubric(rubricId)
      }

      if (!activeRubric.value) {
        throw new Error('No active rubric loaded. Cannot initialize evaluation canvas.')
      }

      const existingHistory = await getExistingAssessment(assessorId, teamId, activeRubric.value.id)

      if (existingHistory) {
        activeAssessmentId.value = existingHistory.id
        gradingComponents.value = syncAssessmentWithRubric(
          activeRubric.value.components,
          existingHistory.components
        )
      } else {
        gradingComponents.value = syncAssessmentWithRubric(activeRubric.value.components, [])
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to prepare the evaluation canvas.'
      console.error('[AssessmentStore] Canvas preparation error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Commits the workspace updates back to the database.
   */
  async function submitEvaluation(assessorId: string, teamId: string): Promise<void> {
    if (!activeRubric.value) {
      error.value = 'Cannot submit evaluation without an active rubric context.'
      return
    }

    isSaving.value = true
    error.value = null
    try {
      await saveAssessment({
        id: activeAssessmentId.value,
        assessorId,
        teamId,
        rubricId: activeRubric.value.id,
        components: gradingComponents.value
      })
    } catch (err: any) {
      error.value = err.message || 'Failed to save evaluation.'
      console.error('[AssessmentStore] Submission error:', err)
      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
   * 🧼 WIPE WORKSPACE: Cleans active references out of the canvas state
   * to ensure no data leaks when switching evaluation views.
   */
  function resetWorkspace() {
    activeAssessmentId.value = undefined
    gradingComponents.value = []
    activeRubric.value = null
    error.value = null
  }

  return {
    activeAssessmentId,
    activeRubric,
    gradingComponents,
    isLoading,
    isSaving,
    error,
    fetchAndSetActiveRubric,
    prepareEvaluationCanvas,
    submitEvaluation,
    resetWorkspace
  }
})
