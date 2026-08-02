<script setup lang="ts">
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { computed, ref, onMounted } from "vue"
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import type { User } from '@/types'
import { onAuthStateChanged } from 'firebase/auth'
import { formatUserFromServer } from "@/utils/users"

const username = ref<string>('')
const email = computed<string>(() => username.value + "@sed-marking.com")
const password = ref<string>('')
const isSubmitting = ref<boolean>(false)
const errorMessage = ref<string>('')

async function fetchUserWithRoles(firebaseUser: any): Promise<User> {
  const userDocRef = doc(db, 'users', firebaseUser.uid)
  const userDocSnap = await getDoc(userDocRef)

  let assignedRoles: string[] = ['']
  let assignedRubricIds: string[] = []
  let assignedTeamIds: string[] = []
  if (userDocSnap.exists()) {
    const data = userDocSnap.data()
    if (Array.isArray(data.roles)) {
      assignedRoles = data.roles
    }
    if (Array.isArray(data.rubricIds)) {
      assignedRubricIds = data.rubricIds
    }
    if (Array.isArray(data.teamIds)) {
      assignedTeamIds = data.teamIds
    }
  }

  const result: User = formatUserFromServer(firebaseUser)
  result.roles = assignedRoles
  result.rubricIds = assignedRubricIds
  result.teamIds = assignedTeamIds

  return result
}

/**
 * Handles post-authentication storage and redirection.
 * @param authResult The strictly typed user profile returned from the API
 */
function onLoginSuccess(authResult: User): void {
  // Save the session data matching the layout your SPA store expects
  localStorage.setItem('auth_user', JSON.stringify(authResult))

  // Extract the target redirection query track safely
  const urlParams = new URLSearchParams(window.location.search)
  const redirectTo = urlParams.get('redirect')

  if (redirectTo) {
    window.location.replace(decodeURIComponent(redirectTo))
  } else {
    window.location.replace('/')
  }
}

async function handleLogin(): Promise<void> {
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
    const firebaseUser = userCredential.user
    const authResult = await fetchUserWithRoles(firebaseUser)

    onLoginSuccess(authResult)

  } catch (error) {
    if (error instanceof Error) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'An unexpected authentication error occurred.'
    }
  } finally {
    isSubmitting.value = false
  }
}

const isCheckingSession = ref<boolean>(true)

onMounted(() => {
  // onAuthStateChanged returns an unsubscribe function we can call later
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const authResult = await fetchUserWithRoles(firebaseUser)

      unsubscribe() // Stop listening and auto-redirect them straight into the SPA track
      onLoginSuccess(authResult)
    } else {
      // No active session found, turn off loading state to show the login form safely
      isCheckingSession.value = false
    }
  })
})
</script>

<template>
  <div class="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
    <div class="flex w-full max-w-sm flex-col gap-6">
      <div class="flex flex-col items-center gap-0 self-center font-medium">
        <!-- <div class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
          <GalleryVerticalEnd class="size-4" />
        </div> -->
        <div class="font-black text-xl">Marking Rubrics</div>
        <div class="font-thin">Sustainability Engineering Design</div>
      </div>
      <div class="flex flex-col gap-6">
        <Card>
          <!-- <CardHeader class="text-center">
            <CardTitle class="text-xl">
              Welcome back
            </CardTitle>
          </CardHeader> -->
          <CardContent>
            <form @submit.prevent="handleLogin">
              <FieldGroup>
                <Field>
                  <FieldLabel for="user">
                    User
                  </FieldLabel>
                  <Input
                    v-model="username"
                    id="user"
                    type="text"
                    placeholder="user"
                    required
                  />
                </Field>
                <Field>
                  <div class="flex items-center">
                    <FieldLabel for="password">
                      Password
                    </FieldLabel>
                    <!-- <a
                      href="#"
                      class="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a> -->
                  </div>
                  <Input
                    v-model="password"
                    id="password"
                    type="password"
                    required
                  />
                </Field>
                <Field>
                  <Button type="submit">
                    Login
                  </Button>
                  <!-- <FieldDescription class="text-center">
                    Don't have an account?
                    <a href="#">
                      Sign up
                    </a>
                  </FieldDescription> -->
                </Field>
                <!-- <Field>
                  <FieldDescription class="text-center text-destructive" v-if="errorMessage">
                    {{ errorMessage }}
                  </FieldDescription>
                </Field> -->
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
         <FieldDescription class="px-6 text-center">
           Log in with the account provided by the course instructor.
          <!-- By clicking continue, you agree to our <a href="#">Terms of Service</a>
          and <a href="#">Privacy Policy</a>. -->
        </FieldDescription>
      </div>
    </div>
  </div>

</template>
