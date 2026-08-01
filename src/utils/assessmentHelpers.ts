import type { RubricComponent } from '@/types/rubric'
import type { AssessedComponent } from '@/types/assessment'

/**
 * Recursively maps existing grading history nodes onto the current master rubric structure.
 * This guarantees the UI matches the current schema, even if the structural definition changed.
 */
export function syncAssessmentWithRubric(
  rubricComponents: RubricComponent[],
  existingAssessedComponents: AssessedComponent[] = []
): AssessedComponent[] {
  return rubricComponents.map((rubricComp) => {
    // Attempt to locate matching historical grading entry
    const historicalNode = existingAssessedComponents.find(
      (c) => c.componentId === rubricComp.id
    )

    const assessedNode: AssessedComponent = {
      componentId: rubricComp.id,
      score: historicalNode?.score ?? undefined,
      comment: historicalNode?.comment ?? ''
    }

    // Process recursively if child subcomponents are defined in the master schema
    if (rubricComp.subcomponents && rubricComp.subcomponents.length > 0) {
      assessedNode.subcomponents = syncAssessmentWithRubric(
        rubricComp.subcomponents,
        historicalNode?.subcomponents || []
      )
      // Structural parent branches shouldn't hold scores directly
      delete assessedNode.score
    }

    return assessedNode
  })
}
