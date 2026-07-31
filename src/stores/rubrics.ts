import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Rubric, RubricComponent, RubricLookup, RubricLevel } from '@/types'
import {
  getCompleteRubric,
  getRubricsLookup,
  createNewRubric,
  saveRubricComponents,
  updateRubricMetadata,
  deleteCompleteRubric
} from '@/services/rubricService'
import { populateMissingLevelDescriptions } from '@/utils/rubrics'

export const useRubricStore = defineStore('rubrics', () => {
  // --- State ---
  const activeRubric = ref<Rubric | null>(null)
  const originalRubric = ref<Rubric | null>(null)
  const rubricsList = ref<RubricLookup[]>([])
  const isLoading = ref<boolean>(false)
  const isSaving = ref<boolean>(false)
  const errorMessage = ref<string | null>(null)

  // --- Getters (Computed) ---
  const hasActiveRubric = computed(() => activeRubric.value !== null)

  // Flatten components getter if you ever need a quick sequential list of all criteria
  const allRootComponents = computed(() => activeRubric.value?.components || [])

  // --- Actions ---

  /**
   * Fetches the lookup list (IDs + Titles) for dropdowns and navigation bars.
   */
  async function loadRubricsLookup(): Promise<void> {
    isLoading.value = true
    errorMessage.value = null
    try {
      rubricsList.value = await getRubricsLookup()
    } catch (error) {
      errorMessage.value = 'Failed to load the rubrics lookup list.'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Loads a full recursive rubric document into the global active state slot.
   */
  async function loadActiveRubric(rubricId: string): Promise<void> {
    isLoading.value = true
    errorMessage.value = null
    try {
      const rubric = await getCompleteRubric(rubricId)
      if (rubric) {
        rubric.components = populateMissingLevelDescriptions(
          rubric.components,
          rubric.levels
        )
        activeRubric.value = rubric
        originalRubric.value = JSON.parse(JSON.stringify(rubric))
      } else {
        errorMessage.value = 'Requested rubric could not be found.'
      }
    } catch (error) {
      errorMessage.value = 'An error occurred while fetching the rubric details.'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
    * 💡 Computed getter to evaluate if the active working rubric
    * has changed compared to the pristine database version.
    * Returns true if there are unsaved changes.
    */
  const isDirty = computed(() => {
    // If both are completely null, nothing has changed
    if (!activeRubric.value && !originalRubric.value) return false

    // If one is loaded but the other isn't, they are mismatched
    if (!activeRubric.value || !originalRubric.value) return true

    // Compare stringified variations to deeply inspect nested component keys
    return JSON.stringify(activeRubric.value) !== JSON.stringify(originalRubric.value)
  })

  /**
    * Resets active mutations back to the database snapshot baseline
    */
  function revertChanges(): void {
    if (originalRubric.value) {
      activeRubric.value = JSON.parse(JSON.stringify(originalRubric.value))
    }
  }

  /**
   * Orchestrates full creation of metadata and component arrays under a single execution state.
   */
  async function createRubric(): Promise<string> {
    isSaving.value = true
    errorMessage.value = null

    const metadata: Omit<Rubric, 'id' | 'components'> = {
      title: new Date().toISOString(),
      maxScore: 100,
      levels: [{
        range: "90-100",
        descriptor: "T10"
      }, {
        range: "0-90",
        descriptor: "B90"
      }]
    }
    const components: RubricComponent[] = [{
      id: "",
      name: "Criteria 1",
      weightage: 100
    }]
    try {
      // 1. Save metadata to get generated ID
      const newId = await createNewRubric(metadata)
      // 2. Save components using the new ID
      await saveRubricComponents(newId, components)
      // 3. Refresh lookup tracking list in the background
      await loadRubricsLookup()
      return newId
    } catch (error) {
      errorMessage.value = 'Failed to create and initialize the new rubric.'
      throw error
    } finally {
      isSaving.value = false
    }
  }

  /**
    * Adds a new global evaluation level column relative to an existing level index,
    * then automatically normalizes all nested criteria leaf fields to match.
    *
    * @param targetIndex The numeric index of the current level column clicked in the UI
    * @param direction The placement parameter determined by the button click ('left' | 'right')
    */
  function insertGlobalLevel(targetIndex: number, direction: 'left' | 'right'): void {
    if (!activeRubric.value) return

    // 1. Instantiate a fresh, empty rubric level template column block
    const newLevel: RubricLevel = {
      descriptor: 'New Tier Level',
      range: '0-0' // Placeholder range to be adjusted by the user in the form template
    }

    // 2. Compute the exact splice insertion point index array location
    const insertionIndex = direction === 'left' ? targetIndex : targetIndex + 1

    // 3. Inject the new level structural rule directly into the root levels configuration array
    activeRubric.value.levels.splice(insertionIndex, 0, newLevel)

    // 4. 🚀 Critical Normalization: Re-run the structural tree filler.
    // This instantly tracks down every leaf node and fills the missing slot with an empty string array structure.
    activeRubric.value.components = populateMissingLevelDescriptions(
      activeRubric.value.components,
      activeRubric.value.levels
    )

    console.log(`Successfully injected new grading level column at position index: ${insertionIndex}`)
  }

  /**
   * Removes a global evaluation level column from the metadata configuration,
   * but deliberately leaves the component-level description matrix objects untouched.
   *
   * @param targetIndex The numeric index of the level column to remove
   */
  function deleteGlobalLevel(targetIndex: number): void {
    if (!activeRubric.value) return

    // Guard check: Prevent deleting the final level if your design patterns require at least one tier
    if (activeRubric.value.levels.length <= 1) {
      console.warn('Cannot delete the last remaining evaluation level column.')
      return
    }

    const removedLevel = activeRubric.value.levels[targetIndex]

    // 🚀 Remove the level rule directly from the root layout mapping array
    activeRubric.value.levels.splice(targetIndex, 1)

    // 💡 Note: We explicitly avoid calling populateMissingLevelDescriptions here.
    // This ensures all component node datasets remain dirty/intact in memory storage.
    console.log(`Removed global tier level column: "${removedLevel?.descriptor}" at index [${targetIndex}]. Component descriptions preserved.`)
  }

  /**
    * Injects a brand new criteria component row at the same tree depth
    * as the targeted component path.
    *
    * @param targetPath The array of indexes tracking the element clicked (e.g., [0, 2])
    * @param direction Placement configuration ('above' | 'below')
    */
  function insertComponentAtDepth(targetPath: number[], direction: 'above' | 'below'): void {
    if (!activeRubric.value || !targetPath || targetPath.length === 0) return

    // 1. Generate a clean, unique ID and initial data blueprint for the new component row
    const newComponent: RubricComponent = {
      id: `comp_${crypto.randomUUID()}`, // Or your preferred client-side ID generator
      name: 'New Criteria Component',
      weightage: 0,
      commentable: false,
      subcomponents: [],
      levelDescriptions: []
    }

    // 2. Identify target placement index and decouple the structural trajectory
    const targetIndex = targetPath[targetPath.length - 1]
    const insertionIndex = direction === 'above' ? targetIndex : targetIndex! + 1
    const parentPath = targetPath.slice(0, -1)

    // 3. Locate the correct array collection container to splice into
    let targetArray: RubricComponent[] = activeRubric.value.components

    // If the path length is greater than 1, we are dealing with nested subcomponents
    if (parentPath.length > 0) {
      let currentElement: RubricComponent | null = null
      let currentSearchArray = activeRubric.value.components

      for (let i = 0; i < parentPath.length; i++) {
        const pathIndex = parentPath[i]
        currentElement = currentSearchArray[pathIndex!]!
        currentSearchArray = currentElement!.subcomponents || []
      }

      // Initialize the array wrapper safety layer if it was missing
      if (currentElement) {
        if (!currentElement.subcomponents) {
          currentElement.subcomponents = []
        }
        targetArray = currentElement.subcomponents
      }
    }

    // 4. Inject the initialized component node seamlessly in place
    targetArray.splice(insertionIndex!, 0, newComponent)

    // 5. 🚀 Clean Normalization Sync: Ensure the newly inserted row instantly
    // matches the global level configuration columns without leaving undefined items.
    activeRubric.value.components = populateMissingLevelDescriptions(
      activeRubric.value.components,
      activeRubric.value.levels
    )

    console.log(`Injected component row ${direction} target index. Path committed successfully.`)
  }

  /**
   * Removes a criteria component row at a specific path from the layout tree.
   * Automatically deletes all nested subcomponents contained within it.
   *
   * @param targetPath The array of indexes tracking the element to remove (e.g., [0, 2, 1])
   */
  function deleteComponentAtPath(targetPath: number[]): void {
    if (!activeRubric.value || !targetPath || targetPath.length === 0) return

    // 1. Identify the target deletion index and its parent path trajectory
    const targetIndex = targetPath[targetPath.length - 1]!
    const parentPath = targetPath.slice(0, -1)

    // 2. Default to the root components array container
    let targetArray: RubricComponent[] = activeRubric.value.components

    // 3. If the path has multiple layers, trace down to target the correct nested subcomponents array
    if (parentPath.length > 0) {
      let currentSearchArray = activeRubric.value.components

      for (let i = 0; i < parentPath.length; i++) {
        const pathIndex = parentPath[i]!

        // Safety step: break early if path becomes invalid midway
        if (!currentSearchArray || !currentSearchArray[pathIndex]) return

        if (i === parentPath.length - 1) {
          targetArray = currentSearchArray[pathIndex]!.subcomponents || []
        } else {
          currentSearchArray = currentSearchArray[pathIndex]!.subcomponents || []
        }
      }
    }

    // 4. Safety execution check: ensure the target array exists and the index is within bounds
    if (targetIndex >= 0 && targetIndex < targetArray.length) {
      const nameOfRemoved = targetArray[targetIndex]!.name

      // Splice out the target node—this permanently deletes it and its nested child tree
      targetArray.splice(targetIndex, 1)

      console.log(`Successfully removed criteria row "${nameOfRemoved}" and its subcomponents.`)
    }
  }

  /**
    * Appends a fresh child subcomponent row underneath the targeted component path.
    *
    * @param targetPath The array of indexes tracking the element to add a child to (e.g., [0, 1])
    */
  function addSubcomponent(targetPath: number[]): void {
    if (!activeRubric.value || !targetPath || targetPath.length === 0) return

    // 1. Trace down the tree structure to isolate the target component
    let currentSearchArray = activeRubric.value.components
    let targetComponent: RubricComponent | null = null

    for (let i = 0; i < targetPath.length; i++) {
      const pathIndex = targetPath[i]!
      if (!currentSearchArray || !currentSearchArray[pathIndex]) return

      targetComponent = currentSearchArray[pathIndex]
      currentSearchArray = targetComponent.subcomponents || []
    }

    // 2. Double check that we successfully matched a component configuration node
    if (targetComponent) {
      // Initialize subcomponents array layout layer wrapper if it is currently missing
      if (!targetComponent.subcomponents) {
        targetComponent.subcomponents = []
      }

      // 3. Instantiate a fresh child component template blueprint
      const newSubcomponent: RubricComponent = {
        id: `comp_${crypto.randomUUID()}`,
        name: 'New Sub-Criteria Element',
        weightage: 0,
        commentable: false,
        subcomponents: [],
        levelDescriptions: []
      }

      // 4. Transform the parent node to a branch structural group container
      // Clear out the level descriptions since it is no longer a terminal leaf row
      targetComponent.levelDescriptions = []

      // 5. Append the child node seamlessly to the sub-array list
      targetComponent.subcomponents.push(newSubcomponent)

      // 6. 🚀 Normalization Sync: Automatically populate empty descriptor strings
      // down to the newly appended leaf subcomponent row.
      activeRubric.value.components = populateMissingLevelDescriptions(
        activeRubric.value.components,
        activeRubric.value.levels
      )

      console.log(`Successfully added subcomponent under path [${targetPath.join(', ')}]`)
    }
  }

  /**
   * Saves updates to the active rubric's structural components and updates local store state.
   */
  async function updateActiveComponents(components: RubricComponent[]): Promise<void> {
    if (!activeRubric.value) return

    isSaving.value = true
    errorMessage.value = null
    try {
      await saveRubricComponents(activeRubric.value.id, components)
      // Sync local reactive state seamlessly
      activeRubric.value.components = components
    } catch (error) {
      errorMessage.value = 'Failed to synchronize component changes.'
      throw error
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Updates top-level active metadata configuration block (title, scores, thresholds).
   */
  async function updateActiveMetadata(updatedFields: Partial<Omit<Rubric, 'id' | 'components'>>): Promise<void> {
    if (!activeRubric.value) return

    isSaving.value = true
    errorMessage.value = null
    try {
      await updateRubricMetadata(activeRubric.value.id, updatedFields)
      // Merge changes directly into store memory
      activeRubric.value = { ...activeRubric.value, ...updatedFields }

      // Update entry title in the cached tracking lookup array if it exists
      const fallbackListIndex = rubricsList.value.findIndex(r => r.id === activeRubric.value?.id)
      if (fallbackListIndex !== -1 && updatedFields.title) {
        rubricsList.value[fallbackListIndex]!.title = updatedFields.title
      }
    } catch (error) {
      errorMessage.value = 'Failed to save configuration updates.'
      throw error
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Orchestrates a complete save operation for the active rubric workspace.
   * Synchronizes the parent metadata configuration fields and the recursive components tree
   * to Firestore concurrently, resetting the tracking snapshot upon completion.
   */
  async function saveAllChanges(): Promise<void> {
    // Guard clause if no active rubric is currently open in the editor
    if (!activeRubric.value) return

    isSaving.value = true
    errorMessage.value = null

    try {
      const rubricId = activeRubric.value.id

      // 1. Prepare clean payload containing only metadata fields
      const metadataPayload = {
        title: activeRubric.value.title,
        maxScore: activeRubric.value.maxScore,
        levels: activeRubric.value.levels
      }

      // 2. Extract components tree array structure
      const componentsPayload = activeRubric.value.components

      // 3. Fire both database requests concurrently to maximize performance speed
      await Promise.all([
        updateRubricMetadata(rubricId, metadataPayload),
        saveRubricComponents(rubricId, componentsPayload)
      ])

      // 4. Update entry title in the local dropdown listing tracking lookup array if present
      const listIndex = rubricsList.value.findIndex(r => r.id === rubricId)
      if (listIndex !== -1) {
        rubricsList.value[listIndex]!.title = activeRubric.value.title
      }

      // 5. Success! Re-snapshot the pristine baseline copy so that isDirty instantly drops to false
      originalRubric.value = JSON.parse(JSON.stringify(activeRubric.value))

      console.log(`All structural changes for Rubric [${rubricId}] successfully committed.`)
    } catch (error) {
      errorMessage.value = 'Failed to completely save changes to cloud storage.'
      throw error
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Dumps current state memory keys cleanly when leaving editing workflows.
   */
  function clearActiveRubric(): void {
    activeRubric.value = null
    errorMessage.value = null
  }

  /**
   * Permanently removes a rubric configuration from both Firestore and local store states.
   */
  async function removeRubric(rubricId: string): Promise<void> {
    isSaving.value = true
    errorMessage.value = null
    try {
      // 1. Fire database deletion pipeline
      await deleteCompleteRubric(rubricId)

      // 2. If the user currently had this specific rubric open, clean the display slot
      if (activeRubric.value?.id === rubricId) {
        activeRubric.value = null
      }

      // 3. Filter out the deleted entry from the local tracking lookup list array
      rubricsList.value = rubricsList.value.filter(rubric => rubric.id !== rubricId)
    } catch (error) {
      errorMessage.value = 'Failed to successfully delete the selected rubric.'
      throw error
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Permanently deletes the active rubric configuration from Firestore,
   * purges it from local tracking arrays, and completely clears the active working slots.
   */
  async function deleteAndClearActiveRubric(): Promise<void> {
    // Guard clause if no active rubric context exists to be deleted
    if (!activeRubric.value) return

    isSaving.value = true
    errorMessage.value = null

    try {
      const targetId = activeRubric.value.id

      // 1. Execute full batch deletion on Firestore (Metadata + Subcollection Components)
      await deleteCompleteRubric(targetId)

      // 2. Filter out the deleted record from the local lightweight cache dropdown list
      rubricsList.value = rubricsList.value.filter(rubric => rubric.id !== targetId)

      // 3. Clear all active selection state keys from store memory completely
      clearActiveRubric()
      originalRubric.value = null

      console.log(`Rubric [${targetId}] successfully purged and local workspaces cleared.`)
    } catch (error) {
      errorMessage.value = 'Failed to permanently delete the active rubric configuration.'
      throw error
    } finally {
      isSaving.value = false
    }
  }

  return {
    // State
    activeRubric,
    originalRubric,
    isDirty,
    revertChanges,
    rubricsList,
    isLoading,
    isSaving,
    errorMessage,
    // Getters
    hasActiveRubric,
    allRootComponents,
    // Actions
    loadRubricsLookup,
    loadActiveRubric,
    createRubric,
    insertGlobalLevel,
    deleteGlobalLevel,
    insertComponentAtDepth,
    deleteComponentAtPath,
    addSubcomponent,
    updateActiveComponents,
    updateActiveMetadata,
    saveAllChanges,
    clearActiveRubric,
    removeRubric,
    deleteAndClearActiveRubric
  }
})
