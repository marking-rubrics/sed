<script setup lang="ts">
import { ref } from 'vue'
import { TableCell, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

import { PhPen, PhCheck, PhX, PhTrash } from '@phosphor-icons/vue'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'
import type { User } from '@/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import TagsInputWithListbox from './TagsInputWithListbox.vue'

const props = defineProps<{
  user: User
}>()
const role = ref(props.user.role)
const rubricIds = ref(props.user.rubricIds ?? [])
const teamIds = ref(props.user.teamIds ?? [])

const editing = ref(false)
const confirmEdit = () => { editing.value = false }
const cancelEdit = () => {
  role.value = props.user.role
  rubricIds.value = props.user.rubricIds ?? []
  teamIds.value = props.user.teamIds ?? []
  editing.value = false
}
const deleteUser = () => { editing.value = false }

</script>

<template>
<TableRow>
  <TableCell>{{ user.uid }}</TableCell>
  <TableCell>{{ user.displayName }}</TableCell>
  <TableCell>{{ user.role }}</TableCell>
  <TableCell class="flex flex-row flex-wrap gap-1">
    <Badge v-for="rubricId in rubricIds" :key="rubricId">{{ rubricId }}</Badge>
  </TableCell>
  <TableCell>
    <Badge v-for="teamId in teamIds" :key="teamId">{{ teamId }}</Badge>
  </TableCell>
</TableRow>
<!-- <Card>
  <CardHeader>
    <CardTitle>{{ user.uid }}</CardTitle>
    <CardDescription>{{ user.displayName }}</CardDescription>
  </CardHeader>
  <CardContent>
    <FieldGroup>
      <Field>
        <FieldLabel>Role</FieldLabel>
        <Input type="text" v-model="role"
          :readonly="!editing"
          class="togglable-input"
        />
      </Field>
      <Field>
        <FieldLabel>Rubrics</FieldLabel>
        <Select multiple v-model="rubricIds">
          <SelectTrigger class="w-full togglable-select disabled:[&_svg]:opacity-0" :disabled="!editing">
            <SelectValue placeholder="Select rubrics" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="rubric in rubricList" :key="rubric" :value="rubric">{{ rubric }}</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel>Teams</FieldLabel>
        <Select multiple v-model="teamIds">
          <SelectTrigger class="w-full togglable-select disabled:[&_svg]:opacity-0" :disabled="!editing">
            <SelectValue placeholder="Select teams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="team in teamList" :key="team" :value="team">{{ team }}</SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </FieldGroup>
  </CardContent>
  <CardFooter>
    <div class="flex flex-row gap-2 w-full">
      <template v-if="!editing">
        <Button variant="default" @click="editing = true" class="ms-auto"><PhPen/>Edit</Button>
      </template>
      <template v-else>
        <Button variant="destructive" @click="deleteUser" class="me-auto"><PhTrash/>Delete</Button>
        <Button variant="default" @click="confirmEdit"><PhCheck/>Confirm</Button>
        <Button variant="secondary" @click="cancelEdit"><PhX/>Cancel</Button>
      </template>
    </div>
  </CardFooter>
</Card> -->
</template>

<style scoped>
.togglable-input {
  @apply read-only:pointer-events-none read-only:border-transparent read-only:bg-transparent read-only:shadow-none
}
.togglable-select {
  @apply disabled:opacity-100 disabled:pointer-events-none disabled:border-transparent disabled:bg-transparent disabled:shadow-none
}
</style>
