<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Team, Rubric, User } from '@/types'
import { Marker, MarkerContent } from '@/components/ui/marker'
import { getCompleteRubric } from '@/services/rubricService'
import { getAllAssessmentsForRubric } from '@/services/assessmentService'
import { buildHeaderMatrix, getRubricMaxDepth } from '@/utils/rubricHeaderHelpers'
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/ui/table'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { PhChatTeardropDots } from '@phosphor-icons/vue'

const props = defineProps<{
  rubricId: string
  teams: Team[]
  examiners?: User[]
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
 * 🧮 SINGLE RECORD TOTAL WEIGHTED SCORE
 */
const getRecordTotalScore = (record: any): number => {
  if (!record || !record.components || !rubric.value) return 0

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

/**
 * 🏗️ GROUP & SORT ASSESSMENTS BY TEAM
 * Groups rows by team and calculates the team's overall average total score.
 */
const sortedGroupedAssessments = computed(() => {
  if (!assessments.value.length) return []

  // 1. Group records by teamId
  const groups: Record<string, any[]> = {}
  assessments.value.forEach(record => {
    if (!groups[record.teamId]) {
      groups[record.teamId] = []
    }
    groups[record.teamId]!.push({
      ...record,
      totalScore: getRecordTotalScore(record)
    })
  })

  // 2. Build sorted array with calculated structural metadata
  const result: any[] = []

  // Sort based on your configured teams array sequence
  props.teams.forEach(team => {
    const teamRecords = groups[team.id] || []
    if (teamRecords.length === 0) return

    // Calculate the team average total score
    const sum = teamRecords.reduce((acc, rec) => acc + rec.totalScore, 0)
    const averageScore = Math.round((sum / teamRecords.length) * 100) / 100

    teamRecords.forEach((record, index) => {
      result.push({
        ...record,
        teamName: team.name,
        isFirstOfGroup: index === 0,
        groupSize: teamRecords.length,
        averageTotalScore: averageScore
      })
    })
  })

  return result
})

const getTeamName = (teamId: string): string => {
  const team = props.teams.find(t => t.id === teamId)
  return team ? team.name : 'Unknown Team'
}

const getExaminerName = (assessorId: string): string => {
  if (!assessorId) return '-'
  const examiner = props.examiners?.find(e => e.id === assessorId)
  return examiner ? examiner.displayName : assessorId
}

const getComponentScore = (record: any, componentIndicesPath: number[]): number | string => {
  if (!record || !record.components) return '-'

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

const getComponentComment = (record: any, componentIndicesPath: number[]): string => {
  if (!record || !record.components) return ''

  let current: any = record.components
  for (let i = 0; i < componentIndicesPath.length; i++) {
    const idx = componentIndicesPath[i]!
    if (i === componentIndicesPath.length - 1) {
      return current[idx]?.comment ?? ''
    }
    if (current[idx] && current[idx].subcomponents) {
      current = current[idx].subcomponents
    } else {
      return ''
    }
  }
  return ''
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
          class="text-center"
        >
          {{ cell.name }}
        </TableHead>

        <!-- ✒️ EXAMINER COLUMN HEADER -->
        <TableHead v-if="rowIndex === 0" :rowspan="maxHeaderDepth" class="text-center">
          Assessor
        </TableHead>

        <!-- Top Right Column Total Score Aggregator Anchor -->
        <TableHead v-if="rowIndex === 0" :rowspan="maxHeaderDepth" class="text-center">
          Assessor Score
        </TableHead>

        <!-- AGGREGATED AVERAGE COLUMN HEADER -->
        <TableHead v-if="rowIndex === 0" :rowspan="maxHeaderDepth" class="text-center">
          Average Score
        </TableHead>
      </TableRow>
    </TableHeader>


    <TableBody>
      <TableRow v-for="record in sortedGroupedAssessments" :key="record.id">

        <!-- 👥 Spanned Team Name Cell (Only renders once per team block) -->
        <TableCell
          v-if="record.isFirstOfGroup"
          :rowspan="record.groupSize"
        >
          {{ record.teamName }}
        </TableCell>

        <!-- 🔢 Leaf Scores Cell Output Map -->
        <TableCell v-for="cell in leafComponents"
          :key="cell.id">
            <div class="flex flex-row items-center">
              <span class="flex-1 text-center">{{ getComponentScore(record, cell.pathCoordinates || []) }}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger as-child>
                    <PhChatTeardropDots
                      class="text-gray-500"
                      :class="getComponentComment(record, cell.pathCoordinates || []) ? '' : 'invisible'"
                    />
                  </TooltipTrigger>
                  <TooltipContent v-if="getComponentComment(record, cell.pathCoordinates || [])">
                    <p>{{ getComponentComment(record, cell.pathCoordinates || []) }}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
        </TableCell>

        <!-- ✒️ Examiner Identity Column -->
        <TableCell class="text-center">
          {{ getExaminerName(record.assessorId) }}
        </TableCell>

        <!-- 🎖️ Raw Assessor Total Score -->
        <TableCell class="text-center">
          <div class="flex items-baseline justify-center">
            <span class="flex-1">{{ record.totalScore }}</span>
            <span class="text-[10px] text-slate-400 font-normal">/100</span>
          </div>
        </TableCell>

        <!-- 🧮 Spanned Aggregated Team Average Cell (Only renders once per team block) -->
        <TableCell
          v-if="record.isFirstOfGroup"
          :rowspan="record.groupSize"
          class="text-center"
        >
          <div class="flex items-baseline justify-center">
            <span class="flex-1">{{ record.averageTotalScore }}</span>
            <span class="text-[10px] text-teal-600/70 font-normal">/100</span>
          </div>
        </TableCell>
      </TableRow>

      <TableRow v-if="sortedGroupedAssessments.length === 0">
        <TableCell :colspan="leafComponents.length + 4" class="text-center py-8 text-slate-400">
          No grading evaluations submitted yet for this rubric configuration.
        </TableCell>
      </TableRow>
    </TableBody>

  </Table>
</div>
</template>
<!--

-->
