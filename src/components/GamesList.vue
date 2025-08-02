<template>
  <div class="mt-0">
    <vue-good-table
        ref="my-table"
        :columns="columns"
        :rows="games"
        :enable-row-expand="true"
        expanded-row-classes="bg-red"
        expanded-row-detail-classes="bg-yellow"
        theme="nocturnal"
        :search-options="search"
        :pagination-options="pagination"
        :sort-options="sort"
    >
    <template #row-details="props">
      <p>
        <font-awesome-icon icon="fa-solid fa-house"/>
        &nbsp;{{ props.row.homeTeam }}
        &nbsp;
        <font-awesome-icon icon="fa-solid fa-arrows-left-right-to-line"/>
        &nbsp;{{ props.row.guestTeam }}
        &nbsp;
        <font-awesome-icon icon="fa-solid fa-suitcase"/>
      </p>
      <p>{{ props.row.liganame }} {{ props.row.matchNo }}</p>
      <div class="row mx-2">
        <div v-if="refInclude(props.row.sr1)" class="col-lg-6 mt-1">
          <SRList :key="props.row._id" :sr="props.row.sr1" :besetzt="props.row.sr1Besetzt" :info="props.row.sr1Info"
                  :basar="props.row.sr1Basar"
                  :bonus="props.row.sr1Bonus" position="1" :match="props.row.matchId" :name="props.row.sr1Name" :email="props.row.sr1Mail"
                  @update="(payload) => updateRef(payload)"/>
        </div>
        <div v-else class="col-lg-6 mt-1">
          <div class="border border-white p-2 rounded-3"
               :class="{'basar': props.row.sr1Basar, 'besetzt':props.row.sr1Besetzt , 'offen': !props.row.sr1Besetzt}">
            <p>SR1:</p>
            <h5><img src="@/assets/whistle-icon.svg?data" width="24" alt="whistle"/> {{ props.row.sr1 }}</h5>
          </div>
        </div>
        <div v-if="refInclude(props.row.sr2)" class="col-lg-6 mt-1">
          <SRList :key="props.row._id" :sr="props.row.sr2" :besetzt="props.row.sr2Besetzt" :info="props.row.sr2Info"
                  :basar="props.row.sr2Basar"
                  :bonus="props.row.sr2Bonus" position="2" :match="props.row.matchId" :name="props.row.sr2Name" :email="props.row.sr2Mail"
                  @update="(payload) => updateRef(payload)"/>
        </div>
        <div v-else class="col-lg-6 mt-1">
          <div class="border border-white p-2 rounded-3"
               :class="{'basar': props.row.sr2Basar, 'besetzt':props.row.sr2Besetzt , 'offen': !props.row.sr2Besetzt}">
            <p>SR2:</p>
            <h5><img src="@/assets/whistle-icon.svg?data" width="24" alt="whistle"/> {{ props.row.sr2 }}</h5>
          </div>
        </div>
      </div>
    </template>
      <template #emptystate>
        Es sind keine Spiele vorhanden.
      </template>
    </vue-good-table>
  </div>
  <download-excel :data="totalGames"
                  :name="'Ansetzungsexport' + (new Date()).getDate() + ((new Date()).getMonth() +1) + (new Date()).getFullYear() + (new Date()).getHours() + (new Date()).getMinutes()"
                  :worksheet="'Ansetzungen'" :escapeCsv="true" class="mt-1 mb-5">
    <button class="btn btn-outline-light">Excel Downloaden
      <font-awesome-icon icon="fa-solid fa-download"/>
    </button>
  </download-excel>

</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { fieldFn, pagination, search, sort } from '@/config/datatable.config'
import SRList from "./SRList.vue"
import GamesService from "@/services/games.service"
import { format } from "date-fns"

const authStore = useAuthStore()
const games = ref([])
const totalGames = ref([])

const text = (text) => {
  if(text === "basar"){
    return "im Basar"
  }
  return text
}

const refInclude = (team) => {
  const user = authStore.getCurrentUser()
  return !!user?.club?.includes(team)
}

const updateRef = (payload) => {
  const game = games.value.findIndex(_g => _g.matchId === payload.match)
  try {
    games.value[game] = {...games.value[game], ...payload.ref}
  } catch (err) {
    console.log(err)
  }
}

const sr1 = (row) => {
  let name = ""
  if (refInclude(row.sr1) && row.sr1Besetzt) {
    name = row.sr1Name ? row.sr1Name : "besetzt"
  } else if (refInclude(row.sr1) && !row.sr1Besetzt) {
    name = "offen"
  } else if(!refInclude(row.sr1)){
    const extra = row.sr1Besetzt === true ? "besetzt" : "offen"
    const add = row.sr1Basar === true && row.sr1Besetzt === false ? "basar" : extra
    name = `<span class='${add}'>&nbsp;${text(add)}&nbsp;</span>`
  }
  return `${row.sr1}<br/> <i>${name}</i>`
}

const sr2 = (row) => {
  let name = ""
  if (refInclude(row.sr2) && row.sr2Besetzt) {
    name = row.sr2Name ? row.sr2Name : "besetzt"
  } else if (refInclude(row.sr2) && !row.sr2Besetzt) {
    name = "offen"
  }
  else if(!refInclude(row.sr2)){
    const extra = row.sr2Besetzt === true ? "besetzt" : "offen"
    const add = row.sr2Basar === true && row.sr2Besetzt === false ? "basar" : extra
    name = `<span class='${add}'>&nbsp;${text(add)}&nbsp;</span>`
  }
  return `${row.sr2}<br/> <i>${name}</i>`
}

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
    field: sr1,
    html: true,
    type: 'text',
    tdClass: (row) => {
      const extra = row.sr1Besetzt === true ? "besetzt" : "offen"
      const add = row.sr1Basar === true && row.sr1Besetzt === false ? "basar" : extra
      const other = !refInclude(row.sr1) ? "otherClub" : ""
      return 'text-center' + " " + add + " " + other
    },
    thClass: 'text-center',
    filterOptions: {
      enabled: true,
    },
  },
  {
    label: '2.SR',
    field: sr2,
    html: true,
    type: 'text',
    tdClass: (row) => {
      const extra = row.sr2Besetzt === true ? "besetzt" : "offen"
      const add = row.sr2Basar === true && row.sr2Besetzt === false ? "basar" : extra
      const other = !refInclude(row.sr2) ? "otherClub" : ""
      return 'text-center' + " " + add + " " + other
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
  try {
    const spiele = await GamesService.get()
    games.value = spiele.filter((game) => {
      return (Math.floor(new Date() / 1000) - Math.floor(new Date(game.kickoffDate) / 1000)) < 86400
    })
    
    totalGames.value = spiele.map((game) => {
      return {
        Datum: game.kickoffDate,
        Halle: game.spielfeld,
        Uhrzeit: game.kickoffTime,
        Spieltag: game.matchDay,
        Liga: game.liganame,
        Spielnummer: game.matchNo,
        Heim: game.homeTeam,
        Gast: game.guestTeam,
        SR1: game.sr1,
        SR2: game.sr2,
        SR1Basar: refInclude(game.sr1) ? (game.sr1Basar ? "Ja" : "Nein") : "",
        SR1Besetzt: refInclude(game.sr1) ? (game.sr1Besetzt ? "Ja" : "Nein") : "",
        SR1Bonus: refInclude(game.sr1) ? game.sr1Bonus : "",
        SR1Info: refInclude(game.sr1) ? game.sr1Info : "",
        SR1Name: refInclude(game.sr1) ? game.sr1Name : "",
        SR2Basar: refInclude(game.sr2) ? (game.sr2Basar ? "Ja" : "Nein") : "",
        SR2Besetzt: refInclude(game.sr2) ? (game.sr2Besetzt ? "Ja" : "Nein") : "",
        SR2Bonus: refInclude(game.sr2) ? game.sr2Bonus : "",
        SR2Info: refInclude(game.sr2) ? game.sr2Info : "",
        SR2Name: refInclude(game.sr2) ? game.sr2Name : "",
      }
    })
  } catch (error) {
    console.error('Fehler beim Laden der Spiele:', error)
  }
})
</script>

<style>

</style>