import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { AssessedRubric, AssessedComponent } from '@/types'
import type { RubricComponent } from '@/types'

/**
 * 🔍 FETCH EXISTING: Checks if this assessor has an evaluation history for this team/rubric pair.
 */
export async function getExistingAssessment(
  assessorId: string,
  teamId: string,
  rubricId: string
): Promise<AssessedRubric | null> {
  const q = query(
    collection(db, 'assessedRubrics'),
    where('assessorId', '==', assessorId),
    where('teamId', '==', teamId),
    where('rubricId', '==', rubricId)
  )
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null

  const docData = snapshot.docs[0]!.data()
  return { id: snapshot.docs[0]!.id, ...docData } as AssessedRubric
}

/**
 * 💾 SAVE/UPDATE: Saves or completely overwrites an assessment record in Firestore.
 */
export async function saveAssessment(
  assessment: Omit<AssessedRubric, 'assessedAt'> & { id?: string }
): Promise<void> {
  const collectionRef = collection(db, 'assessedRubrics')
  // Use existing ID to overwrite or generate a fresh one for a new evaluation
  const docRef = assessment.id ? doc(collectionRef, assessment.id) : doc(collectionRef)

  const payload: AssessedRubric = {
    teamId: assessment.teamId,
    assessorId: assessment.assessorId,
    rubricId: assessment.rubricId,
    assessedAt: serverTimestamp() as Timestamp,
    components: assessment.components
  }

  await setDoc(docRef, payload)
}

/**
 * 📥 MASTER REPORT: Retrieves all evaluation instances for the lecturer's overview dashboard.
 */
export async function getAllAssessmentsForRubric(rubricId: string): Promise<AssessedRubric[]> {
  const q = query(
    collection(db, 'assessedRubrics'),
    where('rubricId', '==', rubricId),
    orderBy('assessedAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as AssessedRubric)
}
