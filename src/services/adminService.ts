import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { provisionNewUser } from '@/services/userService'

interface AdminCreateUserForm {
  displayName: string
  email: string
  password: string // Required only during this provisioning state
  roles: string[]
  rubricIds?: string[]
  teamIds?: string[]
}

/**
 * Executes the complete transactional flow to provision an authenticated account
 * and generate its accompanying database node definitions in a single action pipeline.
 */
 export async function adminRegisterAndProvisionUser(form: AdminCreateUserForm): Promise<void> {
   const auth = getAuth()
   const sanitizedEmail = form.email.trim().toLowerCase()
   let targetUid: string | null = null

   try {
     // Stage 1: Auth Account Creation / Resolution
     try {
       const authResult = await createUserWithEmailAndPassword(auth, sanitizedEmail, form.password)
       targetUid = authResult.user.uid
     } catch (authError: any) {
       if (authError.code === 'auth/email-already-in-use') {
         // Intercept: Email exists, grab the UID from the existing Firestore document
         const q = query(collection(db, 'users'), where('email', '==', sanitizedEmail))
         const snapshot = await getDocs(q)

         if (!snapshot.empty) {
           targetUid = snapshot.docs[0]!.id
         } else {
           throw authError // Fallback if Auth has it but database somehow doesn't
         }
       } else {
         throw authError
       }
     }

     if (!targetUid) throw new Error('Could not resolve a valid User ID.')

     // Stage 2: Hand off entirely to your standard provision function! 🚀
     await provisionNewUser({
       id: targetUid,
       displayName: form.displayName,
       email: sanitizedEmail,
       roles: form.roles,
       rubricIds: form.rubricIds,
       teamIds: form.teamIds
     })

   } catch (error) {
     console.error('Failed complete user registration workflow execution:', error)
     throw error
   }
 }
