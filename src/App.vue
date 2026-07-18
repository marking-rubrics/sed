<script setup lang="ts">
import { Button } from './components/ui/button';

import { useRouter } from 'vue-router';
const router = useRouter();
const routerList = router.getRoutes();

const user = "user";
</script>

<template>
  <div class="flex flex-row px-5 py-3 border-b border-border gap-2 items-center">
    <div class="font-black">SED Poster</div>
    <Button variant="ghost" v-for="route in routerList" :key="route.name" :to="route.path">{{ route.name }}</Button>
    <div class="flex-1"></div>
    <div>Logged in as <span class="font-bold">{{ user }}</span></div>
    <Button variant="destructive">Log out</Button>
  </div>
  <div class="w-dvw flex flex-row items-center justify-center h-dvh">
    <RouterView />
  </div>
</template>

<style scoped></style>
