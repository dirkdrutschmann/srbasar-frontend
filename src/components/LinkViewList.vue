<template>
  <table class="table">
    <thead class="thead-dark">
    <tr>
      <th scope="col">Link</th>
      <th scope="col">Lizenzstufe</th>
      <th scope="col">von</th>
      <th scope="col">bis</th>
      <th scope="col">Verein</th>
      <th scope="col">Linkart</th>
      <th scope="col">Aktion</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="link in links" :key="link._id">
      <th scope="row"><a :href="`https://srbasar.de/link/${link.link}`">https://srbasar.de/link/{{ link.link }}</a></th>
      <td>{{ link.lizenzstufe }}</td>
      <td>{{ link.start ? convertToGermanDate(link.start) : "*/*" }}</td>
      <td>{{link.end ? convertToGermanDate(link.end): "*/*"}}</td>
      <td>{{ JSON.parse(link.verein).join(" | ") }}</td>
      <td><font-awesome-icon icon="fa-solid fa-pen-to-square" size="xl" v-if="!link.onlyShow"/><font-awesome-icon icon="fa-solid fa-eye" size="xl" v-else/></td>
      <td><button class="btn btn-outline-light" v-if="!!link.answer" :disabled="link.answer.length === 0" @click="$router.push(`/answer/${link.link}`)">{{link.answer.length}} Antworten</button><button class="btn btn-outline-danger" @click="remove(link._id)"> löschen</button></td>
    </tr>
    </tbody>
  </table>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import LinkService from "@/services/link.service"

const props = defineProps(['links'])
const emit = defineEmits(['update'])
const router = useRouter()

const remove = async (id) => {
  await LinkService.remove(id)
  emit("update")
}

const convertToGermanDate = (englishDateString) => {
  // Aufteilen des Eingabe-Strings in Jahr, Monat und Tag
  const [year, month, day] = englishDateString.split('-')

  // Erstellen eines Date-Objekts
  const date = new Date(year, month - 1, day) // Monate sind in JavaScript 0-basiert

  // Überprüfen, ob das Date-Objekt gültig ist
  if (isNaN(date.getTime())) {
    return "Ungültiges Datum"
  }

  // Erstellen eines deutschen Datums-Strings
  const germanDateString = date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })

  return germanDateString
}
</script>

<style scoped>
.table tr td{
background: transparent !important;
}
.table th a{
  color: white !important;
}
</style>