import { computed } from 'vue'
import { useAssessmentStore } from '@/stores/assessments'

/**
 * A reusable composable to handle direct reactive binding to a deeply nested
 * node inside the assessment workspace store via a coordinate indices path array.
 *
 * @param indices Path coordinates array (e.g. [0, 1])
 */
export function useNestedGrading(indices: number[]) {
  const assessmentStore = useAssessmentStore()

  /**
   * 🎯 NESTED TRAVERSAL: Drills down into the nested store state
   * following the coordinates path array structure.
   */
  const targetGradingNode = computed(() => {
    let current: any = assessmentStore.gradingComponents

    for (let i = 0; i < indices.length; i++) {
      const targetIdx = indices[i]

      if (i === indices.length - 1) {
        return current[targetIdx]
      }

      if (current[targetIdx] && current[targetIdx].subcomponents) {
        current = current[targetIdx].subcomponents
      } else {
        return null
      }
    }
    return null
  })

  // 🔄 TWO-WAY SCORE BINDING
  const score = computed({
    get() {
      return targetGradingNode.value?.score ?? 0
    },
    set(newValue: number) {
      if (targetGradingNode.value) {
        targetGradingNode.value.score = newValue
      }
    }
  })

  // 🔄 TWO-WAY FEEDBACK BINDING
  const comment = computed({
    get() {
      return targetGradingNode.value?.comment ?? ''
    },
    set(newValue: string) {
      if (targetGradingNode.value) {
        targetGradingNode.value.comment = newValue
      }
    }
  })

  return {
    score,
    comment,
    targetGradingNode
  }
}
