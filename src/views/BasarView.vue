<template>
  <div>
    <BasarList :games="games" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BasarList from "../components/BasarList.vue";
import GameService from "../services/games.service.js";

const games = ref([])

onMounted(async () => {
  try {
    const res = await GameService.basar()
    games.value = res || []
  } catch (error) {
    console.error('Fehler beim Laden der Spiele:', error)
    games.value = []
  }
})
</script>
