import { collection, doc, getDoc, getDocs, addDoc, updateDoc, writeBatch } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { RubricLookup, Rubric, RubricComponent } from '@/types'

/**
 * Retrieves a list of all rubric IDs and titles for lightweight UI dropdowns or listings.
 * Bypasses subcollections completely to keep network payloads small.
 */
export async function getRubricsLookup(): Promise<RubricLookup[]> {
  try {
    const rubricsCollectionRef = collection(db, 'rubrics')
    const querySnapshot = await getDocs(rubricsCollectionRef)

    const rubricsList: RubricLookup[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      rubricsList.push({
        id: doc.id,
        title: data.title || 'Untitled Rubric' // Fallback protection
      })
    })

    return rubricsList
  } catch (error) {
    console.error('Failed to retrieve rubrics lookup list:', error)
    throw error
  }
}

/**
 * Fetches a complete rubric including all its root-level components
 * from its subcollection and builds the nested structure.
 */
export async function getCompleteRubric(rubricId: string): Promise<Rubric | null> {
  try {
    // 1. Fetch the parent Rubric metadata
    const rubricDocRef = doc(db, 'rubrics', rubricId)
    const rubricSnapshot = await getDoc(rubricDocRef)

    if (!rubricSnapshot.exists()) {
      console.warn(`Rubric with ID ${rubricId} not found.`)
      return null
    }

    const rubricData = rubricSnapshot.data()

    // 2. Fetch all root components from the subcollection
    const componentsCollectionRef = collection(db, 'rubrics', rubricId, 'components')
    const componentsSnapshot = await getDocs(componentsCollectionRef)

    const components: RubricComponent[] = []
    componentsSnapshot.forEach((doc) => {
      components.push({
        id: doc.id,
        ...doc.data()
      } as RubricComponent)
    })

    // 3. Assemble and return the complete Rubric object
    return {
      id: rubricSnapshot.id,
      title: rubricData.title || '',
      levels: rubricData.levels || [],
      maxScore: rubricData.maxScore || 0,
      components: components // Fully mapped array containing potential recursive subcomponents
    }
  } catch (error) {
    console.error(`Failed to fetch complete rubric [${rubricId}]:`, error)
    throw error
  }
}

export async function createNewRubric(rubric: Omit<Rubric, 'id' | 'components'>): Promise<string> {
  try {
    const rubricsCollectionRef = collection(db, 'rubrics')

    // Save the top level schema (title, levels array, maxScore)
    const docRef = await addDoc(rubricsCollectionRef, {
      title: rubric.title,
      levels: rubric.levels,
      maxScore: rubric.maxScore
    })

    return docRef.id // Return the generated ID so your view can save components next
  } catch (error) {
    console.error('Failed to create new root rubric:', error)
    throw error
  }
}

export async function updateRubricMetadata(
  rubricId: string,
  updatedFields: Partial<Omit<Rubric, 'id' | 'components'>>
): Promise<void> {
  try {
    const rubricDocRef = doc(db, 'rubrics', rubricId)

    // Perform a shallow update on the root document fields
    await updateDoc(rubricDocRef, updatedFields)

    console.log(`Rubric ${rubricId} metadata successfully updated.`)
  } catch (error) {
    console.error(`Failed to update metadata for rubric ${rubricId}:`, error)
    throw error
  }
}

export async function saveRubricComponents(rubricId: string, components: RubricComponent[]): Promise<void> {
  try {
    const batch = writeBatch(db)
    const componentsCollectionRef = collection(db, 'rubrics', rubricId, 'components')

    components.forEach((component) => {
      // If the component already has an ID, overwrite it; otherwise generate a clean client-side ID
      const componentId = component.id || doc(componentsCollectionRef).id
      const componentDocRef = doc(db, 'rubrics', rubricId, 'components', componentId)

      // Clean up local UI data and separate runtime subcomponents tree
      const { id, ...dataToSave } = component

      // Ensure the recursive nested subcomponent trees map cleanly as deep JS objects within the doc
      if (dataToSave.subcomponents) {
        dataToSave.subcomponents = sanitizeSubcomponentsTree(dataToSave.subcomponents)
      }

      batch.set(componentDocRef, {
        id: componentId,
        ...dataToSave
      }, { merge: true })
    })

    // Commit the entire collection modifications to Firestore atomically
    await batch.commit()
  } catch (error) {
    console.error(`Failed to save components tree for rubric ${rubricId}:`, error)
    throw error
  }
}

function sanitizeSubcomponentsTree(components: RubricComponent[]): RubricComponent[] {
  return components.map(comp => {
    const cleaned: RubricComponent = {
      id: comp.id || crypto.randomUUID(), // Ensure deep nested models carry client IDs
      name: comp.name,
      weightage: comp.weightage ?? 0,
      commentable: comp.commentable ?? false,
      levelDescriptions: comp.levelDescriptions ?? []
    }

    if (comp.subcomponents && comp.subcomponents.length > 0) {
      cleaned.subcomponents = sanitizeSubcomponentsTree(comp.subcomponents)
    } else {
      cleaned.subcomponents = []
    }

    return cleaned
  })
}

export async function deleteCompleteRubric(rubricId: string): Promise<void> {
  try {
    const batch = writeBatch(db)

    // 1. Fetch all nested documents inside the components subcollection
    const componentsCollectionRef = collection(db, 'rubrics', rubricId, 'components')
    const componentsSnapshot = await getDocs(componentsCollectionRef)

    // 2. Queue every component document for deletion in the batch
    componentsSnapshot.forEach((componentDoc) => {
      batch.delete(componentDoc.ref)
    })

    // 3. Queue the parent rubric metadata document for deletion
    const rubricDocRef = doc(db, 'rubrics', rubricId)
    batch.delete(rubricDocRef)

    // 4. Commit all deletions atomically to the database
    await batch.commit()
    console.log(`Rubric ${rubricId} and all subcomponents successfully deleted.`)
  } catch (error) {
    console.error(`Failed to completely delete rubric ${rubricId}:`, error)
    throw error
  }
}
