<template>
  <vue-good-table
      ref="my-table"
      :class="'m-0'"
      :columns="columns"
      :pagination-options="pagination"
      :rows="matches"
      :search-options="search"
      :sort-options="sort"
      theme="nocturnal"
  >
    <template #emptystate>
      Es sind keine Spiele vorhanden.
    </template>
  </vue-good-table>
  <download-excel 
    :data="matches.map(game => {
      return {
        Datum: game.kickoffDate,
        Liga: game.liganame,
        Spielnummer: game.matchNo,
        Spieltag: game.matchDay,
        Spielzeit: game.kickoffTime,
        Halle: game.spielfeld,
        Heim: game.homeTeam,
        Gast: game.guestTeam,
        SR1: game.sr1,
        SR2: game.sr2
      }
    })"
    :escapeCsv="true"
    :name="'Spielplan ' + (new Date()).getDate() + ((new Date()).getMonth() +1) + (new Date()).getFullYear() + (new Date()).getHours() + (new Date()).getMinutes()" 
    :worksheet="'Spielplan'" 
    class="mt-1 mb-5"
  >
    <button class="btn btn-outline-light">
      Excel Downloaden
      <font-awesome-icon icon="fa-solid fa-download"/>
    </button>
  </download-excel>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import GameService from "../services/games.service.js"
import { pagination, search, sort, fieldFn } from '../config/datatable.config.js'
import { format } from "date-fns"

const matches = ref([])

const columns = [
  {
    label: 'Datum',
    field: 'kickoffDate',
    type: 'date',
    dateInputFormat: 'yyyy-MM-dd',
    dateOutputFormat: 'dd.MM.yyyy',
    tdClass: 'text-center',
    thClass: 'text-center',
    filterOptions: {
      enabled: true,
      filterDropdownItems: [],
      filterFn: function (data, filterString) {
        return format(new Date(data), "dd.MM.yyyy").includes(filterString)
      },
      trigger: 'keyup',
    },
  },
  {
    label: 'Halle',
    field: 'spielfeld',
    thClass: 'text-center',
    filterOptions: {
      enabled: true,
    },
    tdClass: 'text-center'
  },
  {
    label: 'Liga',
    field: 'liganame',
    thClass: 'text-center',
    filterOptions: {
      enabled: true,
    },
    tdClass: 'text-center'
  },
  {
    label: 'Zeit',
    field: 'kickoffTime',
    type: 'date',
    tdClass: 'text-center',
    thClass: 'text-center',
    dateInputFormat: 'HH:mm',
    dateOutputFormat: 'HH:mm',
    filterOptions: {
      enabled: true,
    },
  },
  {
    label: 'Heim',
    field: 'homeTeam',
    type: 'text',
    tdClass: 'text-center',
    thClass: 'text-center',
    filterOptions: {
      enabled: true,
    },
  },
  {
    label: 'Gast',
    field: 'guestTeam',
    type: 'text',
    tdClass: 'text-center',
    thClass: 'text-center',
    filterOptions: {
      enabled: true,
    },
  },
  {
    label: '1.SR',
    field: 'sr1',
    html: true,
    type: 'text',
    tdClass: (row) => {
      const extra = row.sr1Besetzt === true ? "besetzt" : "offen"
      const add = row.sr1Basar === true && row.sr1Besetzt === false ? "basar" : extra
      return 'text-center' + " " + add
    },
    thClass: 'text-center',
    filterOptions: {
      enabled: true,
    },
  },
  {
    label: '2.SR',
    field: 'sr2',
    html: true,
    type: 'text',
    tdClass: (row) => {
      const extra = row.sr2Besetzt === true ? "besetzt" : "offen"
      const add = row.sr2Basar === true && row.sr2Besetzt === false ? "basar" : extra
      return 'text-center' + " " + add
    },
    thClass: 'text-center',
    filterOptions: {
      enabled: true,
    },
  },
  {
    label: 'Lizenz',
    field: fieldFn,
    tdClass: 'text-center',
    filterOptions: {
      enabled: true,
      filterDropdownItems: ["LSE", "LSE+ | LSD", "LSD"],
    },
  },
]

onMounted(async () => {
  const res = await GameService.all()
  matches.value = res
})
</script>

<style scoped>
.bg-darker {
  color: #2c3e50;
}
</style>
