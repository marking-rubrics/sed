import type { RubricComponent, RubricLevel } from '@/types'

/**
 * Traverses a nested component tree using an array of index tracking steps.
 *
 * @param components The root array of RubricComponents (e.g., store.allRootComponents)
 * @param indexList An array of integers representing the tree path (e.g., [0, 1])
 * @returns The target RubricComponent if found, or null if the path is invalid
 */
export function getComponentByIndexPath(
  components: RubricComponent[],
  indexList: number[]
): RubricComponent | null {
  // If the path tracking array is empty, there is nothing to find
  if (!indexList || indexList.length === 0) return null

  let currentArray: RubricComponent[] | undefined = components
  let targetComponent: RubricComponent | null = null

  for (let i = 0; i < indexList.length; i++) {
    const targetIndex = indexList[i]

    // Safety check: verify the current layer array is populated and the index exists inside it
    if (!currentArray || targetIndex! < 0 || targetIndex! >= currentArray.length) {
      return null
    }

    // Step into the current targeted node component
    targetComponent = currentArray[targetIndex!] || null

    // Prepare the pointer for the next layer down the tree loop
    if (targetComponent && i < indexList.length - 1) currentArray = targetComponent.subcomponents
  }

  return targetComponent
}

/**
 * Recursively updates a component tree. For leaf components, ensures there is an entry
 * in levelDescriptions for every level defined in globalLevels. Missing ones are injected with empty text.
 */
export function populateMissingLevelDescriptions(
  components: RubricComponent[],
  globalLevels: RubricLevel[]
): RubricComponent[] {
  if (!globalLevels || globalLevels.length === 0) return components

  return components.map((component) => {
    // Make a shallow copy of the component to maintain clean reactivity mapping
    const updatedComponent = { ...component }

    // Case A: Component has children (structural parent branch). Recurse down.
    if (updatedComponent.subcomponents && updatedComponent.subcomponents.length > 0) {
      updatedComponent.subcomponents = populateMissingLevelDescriptions(
        updatedComponent.subcomponents,
        globalLevels
      )
    }
    // Case B: Component is a leaf node. Normalize its descriptive array.
    else {
      const currentDescriptions = updatedComponent.levelDescriptions || []

      // Map across every global rubric level configuration row
      const completeDescriptions = globalLevels.map((level) => {
        // Look to see if a text matrix block already exists for this level range descriptor
        const existing = currentDescriptions.find(
          (desc) => desc.levelDescriptor === level.descriptor
        )

        // Return the existing one, or fall back to an initialized empty configuration
        return existing || { levelDescriptor: level.descriptor, description: '' }
      })

      updatedComponent.levelDescriptions = completeDescriptions
    }

    return updatedComponent
  })
}
