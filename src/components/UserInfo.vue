<script setup lang="ts">
import { ref } from 'vue'
import { PhPen, PhCheck, PhX, PhTrash } from '@phosphor-icons/vue'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'
import type { User } from '@/types'
import TagsInputWithListbox from './TagsInputWithListbox.vue'

const props = defineProps<{
  user: User
}>()
const editing = ref(false)
const confirmEdit = () => { editing.value = false }
const cancelEdit = () => { editing.value = false }
const deleteUser = () => { editing.value = false }
</script>

<template>
<Card>
  <CardHeader>
    <CardTitle>{{ user.uid }}</CardTitle>
    <CardSubtitle>{{ user.displayName }}</CardSubtitle>
  </CardHeader>
  <CardContent>
    <FieldGroup>
      <Field>
        <FieldLabel>Role</FieldLabel>
        <Input type="text" v-model="user.role"
          :readonly="!editing"
          class="togglable-input"
        />
      </Field>
      <Field>
        <FieldLabel>Rubrics</FieldLabel>
        <Input type="text"
          :readonly="!editing"
          class="togglable-input"
        />
        <TagsInputWithListbox v-model="user.rubricIds"/>
      </Field>
      <Field>
        <FieldLabel>Teams</FieldLabel>
        <Input type="text"
          :readonly="!editing"
          class="togglable-input"
        />
      </Field>
    </FieldGroup>
  </CardContent>
  <CardFooter>
    <div class="ms-auto flex flex-row gap-2">
      <template v-if="!editing">
        <Button variant="default" @click="editing = true"><PhPen/>Edit</Button>
      </template>
      <template v-else>
        <Button variant="default" @click="confirmEdit"><PhCheck/>Confirm</Button>
        <Button variant="secondary" @click="cancelEdit"><PhX/>Cancel</Button>
        <Button variant="destructive" @click="deleteUser"><PhTrash/>Delete</Button>
      </template>
    </div>
  </CardFooter>
</Card>
</template>

<style scoped>
.togglable-input {
  @apply read-only:pointer-events-none read-only:border-transparent read-only:bg-transparent read-only:shadow-none
}
</style>
