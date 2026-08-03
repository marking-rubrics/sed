<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Team, Rubric } from '@/types'
import { Marker, MarkerContent } from '@/components/ui/marker'
import { getCompleteRubric } from '@/services/rubricService'
import { getAllAssessmentsForRubric } from '@/services/assessmentService'
import { buildHeaderMatrix, getRubricMaxDepth } from '@/utils/rubricHeaderHelpers'
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/ui/table'

const props = defineProps<{
  rubricId: string
  teams: Team[]
}>()

const rubric = ref<Rubric | null>(null)
const assessments = ref<any[]>([])
const isLoading = ref(true)

const loadTableData = async () => {
  isLoading.value = true
  try {
    const [rubricData, assessmentRecords] = await Promise.all([
      getCompleteRubric(props.rubricId),
      getAllAssessmentsForRubric(props.rubricId)
    ])
    rubric.value = rubricData
    assessments.value = assessmentRecords
  } catch (error) {
    console.error('Failed to load matrix data:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadTableData)
watch(() => props.rubricId, loadTableData)

const headerRows = computed(() => {
  if (!rubric.value?.components) return []
  return buildHeaderMatrix(rubric.value.components)
})

const maxHeaderDepth = computed(() => {
  if (!rubric.value?.components) return 1
  return getRubricMaxDepth(rubric.value.components)
})

/**
 * 🎯 FIXED COLUMN ALIGNMENT: Dynamically extracts only the true active leaf
 * nodes across all tree branches in their exact visual left-to-right order.
 */
const leafComponents = computed(() => {
  if (!rubric.value?.components) return []

  const leaves: any[] = []

  function extractLeaves(comps: any[], parentPath: number[]) {
    comps.forEach((comp, idx) => {
      const currentPath = parentPath.concat(idx)
      // If it doesn't have subcomponents, it's a scoring leaf column
      if (!comp.subcomponents || comp.subcomponents.length === 0) {
        leaves.push({
          id: comp.id,
          name: comp.name,
          pathCoordinates: currentPath
        })
      } else {
        // Otherwise, continue digging down the branch paths
        extractLeaves(comp.subcomponents, currentPath)
      }
    })
  }

  extractLeaves(rubric.value.components, [])
  return leaves
})

/**
 * 🔍 EXAMINER IDENTITY LOOKUP
 * Extracts the assessor identifier tied to the team's assessment record.
 */
const getTeamExaminer = (teamId: string): string => {
  const record = assessments.value.find(a => a.teamId === teamId)
  if (!record || !record.assessorId) return '-'

  // If an examiners list prop is available, you can resolve the name here:
  // const examiner = props.examiners?.find(e => e.id === record.assessorId)
  // return examiner ? examiner.name : record.assessorId

  return record.assessorId
}

/**
 * 🧮 LEAF SCORE LOOKUP FUNCTION
 * Recourses down a team's saved assessment entry tree following the exact
 * column coordinate path to find the matching node score.
 */
const getTeamComponentScore = (teamId: string, componentIndicesPath: number[]): number | string => {
  const record = assessments.value.find(a => a.teamId === teamId)
  if (!record || !record.components) return '-' // No score submitted yet

  let current: any = record.components
  for (let i = 0; i < componentIndicesPath.length; i++) {
    const idx = componentIndicesPath[i]!
    if (i === componentIndicesPath.length - 1) {
      return current[idx]?.score ?? '-'
    }
    if (current[idx] && current[idx].subcomponents) {
      current = current[idx].subcomponents
    } else {
      return '-'
    }
  }
  return '-'
}

/**
 * 🧮 TOTAL TEAM WEIGHTED SCORE
 * Calculates the final normalized result summary value out of 100 for a team.
 */
const getTeamTotalScore = (teamId: string): number | string => {
  const record = assessments.value.find(a => a.teamId === teamId)
  if (!record || !record.components || !rubric.value) return '-'

  let accumulatedEarnedWeight = 0
  let totalConfiguredWeight = 0

  function traverseNode(rubricComp: any, gradingComp: any) {
    if (!rubricComp.subcomponents || rubricComp.subcomponents.length === 0) {
      const score = gradingComp?.score ?? 0
      const maxScore = rubric.value!.maxScore ?? 1
      const weightage = rubricComp.weightage ?? 0

      accumulatedEarnedWeight += (score / maxScore) * weightage
      totalConfiguredWeight += weightage
      return
    }
    if (rubricComp.subcomponents && gradingComp?.subcomponents) {
      for (let i = 0; i < rubricComp.subcomponents.length; i++) {
        traverseNode(rubricComp.subcomponents[i], gradingComp.subcomponents[i])
      }
    }
  }

  for (let i = 0; i < rubric.value.components.length; i++) {
    traverseNode(rubric.value.components[i], record.components[i])
  }

  if (totalConfiguredWeight === 0) return 0
  return Math.round(((accumulatedEarnedWeight / totalConfiguredWeight) * 100) * 100) / 100
}
</script>

<template>
<div class="flex flex-col" v-if="!isLoading && rubric">
  <div class="text-xl font-black">
    {{ rubric.title }}
  </div>

  <Table>
    <TableHeader>
      <TableRow v-for="(rowCells, rowIndex) in headerRows" :key="rowIndex">
        <!-- Top Left Row Header Spacer Anchor -->
        <TableHead v-if="rowIndex === 0" :rowspan="maxHeaderDepth">
          Team Name
        </TableHead>

        <!-- Dynamic Header Elements Cells Mapping -->
        <TableHead
          v-for="cell in rowCells"
          :key="cell.id"
          :colspan="cell.colspan"
          :rowspan="cell.rowspan"
        >
          {{ cell.name }}
        </TableHead>

        <!-- ✒️ EXAMINER COLUMN HEADER -->
        <TableHead v-if="rowIndex === 0" :rowspan="maxHeaderDepth">
          Assessor
        </TableHead>

        <!-- Top Right Column Total Score Aggregator Anchor -->
        <TableHead v-if="rowIndex === 0" :rowspan="maxHeaderDepth">
          Total Score
        </TableHead>
      </TableRow>
    </TableHeader>

    <TableBody>
      <TableRow v-for="team in teams" :key="team.id">
        <!-- 👥 Team Name Label Node -->
        <TableCell>
          {{ team.name }}
        </TableCell>

        <!-- 🔢 Criteria Leaves Matrix Iteration Loop -->
        <!--
          Note: To ensure column cells render in the exact structural path ordering,
          we loop over rowCells from the bottom level layer of the header Rows matrix.
        -->
        <TableCell
          v-for="cell in leafComponents"
          :key="cell.id"
        >
          <!-- To query the index path array accurately, pass the item down via a search utility mapping -->
          {{ getTeamComponentScore(team.id, cell.pathCoordinates || []) }}
        </TableCell>

        <!-- ✒️ EXAMINER CELL VALUE -->
        <TableCell>
          {{ getTeamExaminer(team.id) }}
        </TableCell>

        <!-- 🧮 Overall Normalization Mark Cell -->
        <TableCell>
          {{ getTeamTotalScore(team.id) }}<span v-if="getTeamTotalScore(team.id) !== '-'" class="text-[10px] text-slate-400 font-normal">/100</span>
        </TableCell>
      </TableRow>
    </TableBody>

  </Table>
</div>
</template>
<!--

-->
