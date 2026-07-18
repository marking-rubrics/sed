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
            <form>
              <FieldGroup>
                <Field>
                  <FieldLabel for="user">
                    User
                  </FieldLabel>
                  <Input
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
                  <Input id="password" type="password" required />
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
