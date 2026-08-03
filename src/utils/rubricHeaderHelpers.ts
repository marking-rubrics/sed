import type { RubricComponent } from '@/types'

/**
 * 📐 CALCULATE MAX DEPTH (Total Header Rows Needed)
 * Finds the deepest path in the rubric component tree.
 */
export function getRubricMaxDepth(components: RubricComponent[]): number {
  if (!components || components.length === 0) return 0

  let maxChildDepth = 0
  for (const comp of components) {
    if (comp.subcomponents && comp.subcomponents.length > 0) {
      const depth = getRubricMaxDepth(comp.subcomponents)
      if (depth > maxChildDepth) maxChildDepth = depth
    }
  }
  return 1 + maxChildDepth
}

/**
 * ↔️ CALCULATE LEAF COUNT (Col Span)
 * Counts how many leaf nodes (actual scoring criteria rows) exist under a branch.
 */
export function getComponentLeafCount(component: RubricComponent): number {
  // If it's a leaf node, it takes up exactly 1 column space
  if (!component.subcomponents || component.subcomponents.length === 0) {
    return 1
  }

  // If it's a branch node, sum up the leaf columns of all subcomponents
  let count = 0
  for (const subcomp of component.subcomponents) {
    count += getComponentLeafCount(subcomp)
  }
  return count
}

export interface HeaderCell {
  id: string
  name: string
  rowspan: number
  colspan: number
  pathCoordinates: number[] // 🚀 Appended path trackers coordinate list
}

export function buildHeaderMatrix(components: RubricComponent[]): HeaderCell[][] {
  const maxDepth = getRubricMaxDepth(components)
  const rows: HeaderCell[][] = Array.from({ length: maxDepth }, () => [])

  // Pass down the parent path coordinates chain index tracker variable array
  function traverse(comps: RubricComponent[], currentLevel: number, parentPath: number[]) {
    comps.forEach((comp, idx) => {
      const currentPath = parentPath.concat(idx)
      const isLeaf = !comp.subcomponents || comp.subcomponents.length === 0
      const colspan = getComponentLeafCount(comp)
      const rowspan = isLeaf ? maxDepth - currentLevel : 1

      rows[currentLevel]!.push({
        id: comp.id,
        name: comp.name,
        rowspan,
        colspan,
        pathCoordinates: currentPath // Save path coordinate matrix reference mapping array
      })

      if (comp.subcomponents && comp.subcomponents.length > 0) {
        traverse(comp.subcomponents, currentLevel + 1, currentPath)
      }
    })
  }

  traverse(components, 0, [])
  return rows
}
