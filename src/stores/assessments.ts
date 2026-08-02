import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { AssessedComponent, Rubric } from '@/types'
import { getExistingAssessment, saveAssessment } from '@/services/assessmentService'
import { syncAssessmentWithRubric } from '@/utils/assessmentHelpers'
import { getCompleteRubric } from '@/services/rubricService'
import { debounce } from '@/utils/debounce'

export const useAssessmentStore = defineStore('assessmentWorkspace', () => {
  // --- Workspace State Definitions ---
  const activeAssessmentId = ref<string | undefined>(undefined)
  const gradingComponents = ref<AssessedComponent[]>([])
  const activeRubric = ref<Rubric | null>(null)
  const rubricsCache = ref<Record<string, Rubric>>({})

  // --- Operational State Flags ---
  const isLoading = ref(false)
  const isSaving = ref(false)
  const isDirty = ref(false)
  const error = ref<string | null>(null)

  // --- Internals for Autosave Optimization ---
  const lastSavedPayloadString = ref<string>('')
  let unwatchActiveAssessment: (() => void) | null = null


  // function revertChanges(): void {
  //   if (originalGradingComponents.value) {
  //     gradingComponents.value = JSON.parse(JSON.stringify(originalGradingComponents.value))
  //   }
  // }

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
    * 💾 CORE SAVE EXECUTION: Commits the workspace updates back to the database.
    * Includes structural zero-diff protection mapping against network overhead.
    */
  async function executeSave(assessorId: string, teamId: string): Promise<void> {
    if (!activeRubric.value) {
      error.value = 'Cannot save evaluation without an active rubric context.'
      return
    }

    // Verify if changes actually exist relative to the last save action payload
    const currentPayloadString = JSON.stringify(gradingComponents.value)
    if (currentPayloadString === lastSavedPayloadString.value) {
      isDirty.value = false
      return // 🛡️ Abort transaction early: no database mutation occurred
    }

    isSaving.value = true
    error.value = null

    console.log({
      id: activeAssessmentId.value,
      assessorId,
      teamId,
      rubricId: activeRubric.value.id,
      components: gradingComponents.value
    })

    try {
      // 🛠️ Construct the payload payload safely without undefined fields
      const assessmentData: any = {
        assessorId,
        teamId,
        rubricId: activeRubric.value.id,
        components: gradingComponents.value
      }

      // Only attach the ID if it's explicitly defined (existing entry update)
      if (activeAssessmentId.value !== undefined) {
        assessmentData.id = activeAssessmentId.value
      }

      // Delegate the clean, sanitized object to the backend service layer
      await saveAssessment(assessmentData)

      // Update baseline tracking values
      lastSavedPayloadString.value = currentPayloadString
      isDirty.value = false
      console.log(`[AssessmentStore] Workspace successfully saved for Team: ${teamId}`)
    } catch (err: any) {
      error.value = err.message || 'Failed to execute database write operation.'
      console.error('[AssessmentStore] Submission/Autosave error:', err)
      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
    * ⏳ DEBOUNCED SAVE THREAD: Delays execution for 2.5 seconds to gather micro-updates.
    */
  const debouncedSave = debounce((assessorId: string, teamId: string) => {
    executeSave(assessorId, teamId)
  }, 2500)

  /**
    * 🔄 INITIALIZE AUTOSAVE WATCHER: Attaches a deep watcher loop to catch
    * UI updates from your recursive composable models.
    */
  function initializeAutosaveWatcher(assessorId: string, teamId: string) {
    if (unwatchActiveAssessment) unwatchActiveAssessment()

    // Establish fresh zero baseline state data mapping references
    lastSavedPayloadString.value = JSON.stringify(gradingComponents.value)
    isDirty.value = false

    unwatchActiveAssessment = watch(
      () => gradingComponents.value,
      () => {
        isDirty.value = true
        debouncedSave(assessorId, teamId)
      },
      { deep: true }
    )
  }

  /**
    * 🧼 WIPE WORKSPACE: Cleans active references out of the canvas state
    * to ensure no data leaks when switching evaluation views.
    */
  function resetWorkspace() {
    if (unwatchActiveAssessment) {
      unwatchActiveAssessment()
      unwatchActiveAssessment = null
    }
    activeAssessmentId.value = undefined
    gradingComponents.value = []
    activeRubric.value = null
    isDirty.value = false
    error.value = null
  }

  return {
    // Reactive Properties State
    activeAssessmentId,
    activeRubric,
    gradingComponents,
    isLoading,
    isSaving,
    isDirty,
    error,

    // Asynchronous Flow Pipelines Actions
    fetchAndSetActiveRubric,
    prepareEvaluationCanvas,
    initializeAutosaveWatcher,
    // submitEvaluation: executeSave, // Alias for manual form submission overrides
    resetWorkspace
  }
})
