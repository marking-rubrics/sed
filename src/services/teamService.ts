import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
  writeBatch,
  where
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Team } from '@/types'

/**
 * 🚀 CREATE: Provision a brand new team document inside Firestore.
 * Automatically generates a clean UUID on the client side if no custom ID is passed.
 */
export async function createTeam(teamName: string, memberIds: string[] = []): Promise<Team> {
  try {
    const teamsCollectionRef = collection(db, 'teams')
    // Generate a fresh document reference to pre-extract the Firestore generated auto-ID
    const newTeamDocRef = doc(teamsCollectionRef)

    const newTeam: Team = {
      id: newTeamDocRef.id,
      name: teamName.trim(),
      members: memberIds
    }

    // Use setDoc since we want the document ID field inside the payload matrix to match the document path
    await setDoc(newTeamDocRef, newTeam)
    return newTeam
  } catch (error) {
    console.error('Failed to provision new team record:', error)
    throw error
  }
}

/**
 * 🔄 UPDATE: Modify details (name and/or member list matrix pointers) of an existing team.
 * Uses a Partial utility map so you can update just the name, just the members, or both.
 */
export async function updateTeamDetails(
  teamId: string,
  updates: Partial<Omit<Team, 'id'>>
): Promise<void> {
  try {
    const teamDocRef = doc(db, 'teams', teamId)

    // Sanitize values if present in the updates block
    const sanitizedUpdates: Record<string, any> = {}
    if (updates.name !== undefined) sanitizedUpdates.name = updates.name.trim()
    if (updates.members !== undefined) sanitizedUpdates.members = updates.members

    await updateDoc(teamDocRef, sanitizedUpdates)
  } catch (error) {
    console.error(`Failed to modify team properties for [${teamId}]:`, error)
    throw error
  }
}

/**
 * 📥 RETRIEVE ALL: Fetches a complete list of teams ordered alphabetically.
 * Ideal for your primary Admin Dashboard canvas grid list.
 */
export async function getAllTeams(): Promise<Team[]> {
  try {
    const teamsCollectionRef = collection(db, 'teams')
    const q = query(teamsCollectionRef, orderBy('name', 'asc'))
    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => doc.data() as Team)
  } catch (error) {
    console.error('Failed to compile absolute teams tracking list:', error)
    throw error
  }
}

/**
 * 🔍 RETRIEVE SINGLE: Fetches a single team payload index profile by its unique ID.
 * Optimized for standard student evaluation assignment canvas views or profile pages.
 */
export async function getTeamById(teamId: string): Promise<Team | null> {
  try {
    const teamDocRef = doc(db, 'teams', teamId)
    const snapshot = await getDoc(teamDocRef)

    if (!snapshot.exists()) return null
    return snapshot.data() as Team
  } catch (error) {
    console.error(`Failed to pull individual data profile for team [${teamId}]:`, error)
    throw error
  }
}

/**
 * 🗑️ DELETE: Permanently purges a team document from Firestore
 * and clears out any associated assignment junctions atomically.
 *
 * @param teamId The unique Firestore document ID of the team to delete
 */
export async function deleteTeamComplete(teamId: string): Promise<void> {
  const batch = writeBatch(db)

  // 1. Reference the primary team target document
  const teamDocRef = doc(db, 'teams', teamId)
  batch.delete(teamDocRef)

  try {
    // 2. Query all junction entries in the /assignments subcollection referencing this team
    const assignmentsCollectionRef = collection(db, 'assignments')
    const linkedAssignmentsQuery = query(assignmentsCollectionRef, where('teamId', '==', teamId))
    const assignmentsSnapshot = await getDocs(linkedAssignmentsQuery)

    // Append deletion operations for all matched assignment links into the batch execution pipeline
    assignmentsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })

    // 3. Commit the pipeline changes atomically
    await batch.commit()
    console.log(`Team [${teamId}] and its active assignment targets successfully purged.`)
  } catch (error) {
    console.error(`Failed to execute complete deletion process for team [${teamId}]:`, error)
    throw error
  }
}
