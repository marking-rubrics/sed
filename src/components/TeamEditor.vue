<script setup lang="ts">
import type { Team } from "@/types";
import { ref, watch } from "vue";
import { Button } from "@/components/ui/button";
import { PhX, PhCheck, PhTrash, PhArrowCounterClockwise, PhPlus } from "@phosphor-icons/vue";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardAction } from "@/components/ui/card";

const props = defineProps<{
  team: Team
}>()
const name = ref('')
const members = ref<string[]>([])

watch(
  () => props.team,
  (newTeam) => {
    if (!newTeam) return
    name.value = newTeam.name
    members.value = [...newTeam.members]
  },
  { immediate: true, deep: true }
)

const addMember = () => {
  members.value.push('')
}

const confirmEdit = () => {
  emits('update', {
    ...props.team,
    name: name.value,
    members: [...members.value]
  })
}
const resetEdit = () => {
  name.value = props.team.name
  members.value = props.team.members
}
const deleteTeam = () => {
  emits('delete', props.team)
}

const emits = defineEmits<{
  (e: 'close'): void,
  (e: 'update', team: Team): void
  (e: 'delete', team: Team): void
}>()
const closeEditor = () => {
  emits('close')
}

</script>

<template>
<Card>
  <CardHeader class="">
    <CardTitle class="text-xl font-black">Team Editor</CardTitle>
    <CardAction>
      <Button variant="ghost" @click="closeEditor"><PhX/></Button>
    </CardAction>
  </CardHeader>

  <CardContent>
    <div class="flex flex-col">
      <!-- {{ team }} -->
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input v-model="name"></Input>
          </Field>
          <Field>
            <FieldLabel>Members</FieldLabel>
            <Input v-for="(member, i) in members" :key="i" v-model="members[i]"></Input>
            <Button @click="addMember" variant="outline"><PhPlus/></Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  </CardContent>

  <CardFooter class="flex flex-row gap-1 justify-end">
    <Button variant="secondary" @click="resetEdit"><PhArrowCounterClockwise/>Reset</Button>
    <Button variant="default" @click="confirmEdit"><PhCheck/>Confirm</Button>
    <Button variant="destructive" @click="deleteTeam" class="ms-auto"><PhTrash/>Delete</Button>
  </CardFooter>
</Card>
</template>
