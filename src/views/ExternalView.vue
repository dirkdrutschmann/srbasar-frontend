<template>
  <div class="nocturnal text-white" v-if="loaded">
    <div v-if="onlyShow">
    <h2 class="p-2 bg-darker text-white">Ansetzungsübersicht</h2>

    <p v-if="onlyShow">Auf dieser Seite sind die Ansetzungen von <strong>{{ vereine.join(" und ") }}</strong> {{ getDateString }} zu
      sehen.
    </p>
      </div>
    <div v-else>
      <div v-if="!dataComplete">
      <h2 class="p-2 bg-darker text-white">Ansetzungen</h2>
      <p>
        Auf dieser Seite kannst du dich für die Ansetzungen von <strong>{{ vereine.join(" und ") }}</strong> {{ getDateString }} eintragen.
      </p>


        <div class="container-sm">
        <div class="border border-white pt-3 pb-5 px-5 rounded-3 mb-5 ">
          <h3 class="p-2 bg-darker text-white"> Wer bin ich?</h3>
          <p>Bevor du die Daten sehen kannst, muss du dich erst identifizieren:</p>
        <div class="mb-3">
          <label class="form-label" for="exampleFormControlInput1">Name</label>
          <input id="text" v-model="contactName" class="form-control" placeholder="Name" type="text">
        </div>
        <select v-model="contactLizenz" class="form-select mb-3">
          <option disabled value="-1">Lizenz wählen</option>
          <option value="LSE">LSE</option>
          <option value="LSE">LSE+</option>
          <option value="LSD">LSD oder höher</option>
        </select>
        <div class="mb-3">
          <label class="form-label" for="email">E-Mail-Adresse</label>
          <input id="email" v-model="contactEmail" class="form-control"
                 placeholder="E-Mail-Adresse" type="text">
        </div>
        <div class="mb-3 dark">
          <label class="form-label" for="phone">Handynummer</label>
          <MazPhoneNumberInput
              v-model="contactMobile"
              :preferred-countries="['DE','FR', 'BE', 'US', 'GB']"
              :success="results?.isValid"
              @update="results= $event;"
              :default-country-code="'DE'"
              :translations="{
                              countrySelector: {
                                placeholder: 'Länderkennung',
                                error: 'Wähle ein Land',
                              },
                              phoneInput: {
                                placeholder: 'Handynummer',
                                example: 'Beispiel:',
                              },
                            }"
              color="info"
              show-code-on-list
              class="w-100"
          />
        </div>
          <p class="text-danger my-2" v-if="errorMessage"><strong v-html="errorMessage"></strong></p>
          <div class="form-check-inline">
            <input id="flexCheckDefault" v-model="contactSaveInfo" class="form-check-input" type="checkbox"
                   value="">
            <label class="form-check-label" for="flexCheckDefault">
              &nbsp;Daten speichern
            </label>
          </div>
          <div>
            <button class="btn btn-outline-light" @click="forward">Weiter</button>
          </div>

        </div>
        </div>
      </div>
      <div v-else-if="dataComplete && !overview">
        <h2 class="p-2 bg-darker text-white">Ansetzungen auswählen</h2>
        <p>Bitte wähle die Spiele, die du gerne übernehmen möchtest aus, eine Mehrfachnennung ist möglich und klicke dann auf absenden. Den Button findest du nach Auswahl von Spielen oberhalb der Tabelle. </p>
        <div class="btn-group my-3" role="group">

          <button type="button" class="btn btn-outline-light" v-if="contactName" disabled>{{contactName}}</button>
          <button type="button" class="btn btn-outline-light" v-if="contactLizenz !== -1" disabled>{{contactLizenz}}</button>
          <button type="button" class="btn btn-outline-light" v-if="contactEmail" disabled>{{contactEmail}}</button>
          <button type="button" class="btn btn-outline-light" v-if="contactMobile" disabled>{{contactMobile}}</button>
          <button class="btn btn-outline-danger" @click="dataComplete = !dataComplete">Daten bearbeiten</button>
        </div>
        <div class="container-sm">
          <div class="mb-3">
            <label for="exampleFormControlTextarea1" class="form-label">Nachricht an den*die Schiedsrichterwart*in:</label>
            <textarea class="form-control" id="exampleFormControlTextarea1" v-model="contactMessage" rows="3"></textarea>
          </div>
            <button type="button" class="btn btn-outline-light my-3" :disabled="selectedRows.length === 0" @click="overview = !overview">{{selectedRows.length === 0 ? `Bitte zuerst mindestens ein Spiel auswählen`: `Übernahme von ${selectedRows.length} Spielen absenden`}}</button>
        </div>
      </div>
      <div v-else>
        <h2 class="p-2 bg-darker text-white">Ansetzungen bestätigen</h2>
        <p>Bitte überprüfe die Spiele, die du ausgewählt hast. </p>
        <div>
          <div class="container-sm">
          <ul class="list-group">
            <li v-for="(game, index) in selectedRows" :key="index" class="list-group-item nocturnal text-white d-flex">
              <input class="form-check-input me-1" type="checkbox" :value="index" :id="index" checked @click="uncheck">
              <label class="form-check-label flex-fill" :for="index">
              <div class="d-flex justify-content-evenly">
                <div>
                  {{convertToGermanDate(game.kickoffDate)}}
                </div>
                <div>
                  {{game.kickoffTime}}
                </div>
                <div>
                  {{game.spielfeld}}
                </div>
                <div>
                  {{game.liganame}}
                </div>
              </div>
              </label>
            </li>
          </ul>
            </div>
        </div>
        <div class="form-check-inline mt-2">
          <input id="flexCheckDefault" v-model="sendMailCopy" class="form-check-input" type="checkbox"
                 value="">
          <label class="form-check-label" for="flexCheckDefault">
            &nbsp;Kopie der Spiele als Mail erhalten?
          </label>
        </div>
        <p>Bitte beachte, dass du mit dieser Auswahl lediglich den Wunsch äußerst die Spiele zu übernehmen, dies <strong><u>ist keine</u></strong> verbindliche Zusage des Vereines!</p>
        <div>
          <div class="btn-group my-3" role="group">
            <button type="button" class="btn btn-outline-success" @click="sendAnswer">Absenden</button>
            <button type="button" class="btn btn-outline-danger" @click="overview = !overview">Zurück zur Liste</button>
          </div>
        </div>
      </div>
    </div>

  </div>

  <vue-good-table
      ref="myTable"
      :class="'m-0'"
      :columns="columns"
      :pagination-options="pagination"
      :rows="matches"
      :search-options="search"
      :select-all-by-page="false"
      :select-options="{
              enabled: !link.onlyShow,
              selectionInfoClass: 'nocturnal text-white',
              selectionText: 'Ausgewählte Spiele',
              clearSelectionText: 'löschen',
              selectAllByGroup: false,
            }"
      :sort-options="sort"
      theme="nocturnal"
      v-on:selected-rows-change="selectionChanged"
      v-if="onlyShow || (!onlyShow && dataComplete && !overview)"
  >
    <template #emptystate>
      Es sind keine Spiele vorhanden.
    </template>
  </vue-good-table>
  <button v-if="link.onlyShow" class="btn btn-outline-dark" @click="ical">Liste Filtern => ICal Downloaden
    <font-awesome-icon icon="fa-solid fa-download"/>
  </button>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LinkService from "../services/link.service.js"
import { pagination, search, sort, fieldFn } from '../config/datatable.config.js'
import { format } from "date-fns"
import { generateICal } from "../services/ical.service.js"
import MazPhoneNumberInput from "maz-ui/components/MazPhoneNumberInput"

const route = useRoute()
const router = useRouter()

const contactName = ref(null)
const contactLizenz = ref("-1")
const contactMobile = ref(null)
const contactEmail = ref(null)
const errorMessage = ref("")
const contactMessage = ref("")
const contactSaveInfo = ref(false)
const uncheckedList = ref([])
const overview = ref(false)
const sendMailCopy = ref(true)
const results = ref({})
const matches = ref([])
const vereine = ref([])
const loaded = ref(false)
const dataComplete = ref(false)
const onlyShow = ref(false)
const selectedRows = ref([])
const link = ref({})

const myTable = ref(null)

const ical = () => {
  generateICal(myTable.value.processedRows[0].children, vereine.value)
}

const selectionChanged = (params) => {
  selectedRows.value = params.selectedRows
}

const text = (text) => {
  if(text === "basar"){
    return "im Basar"
  }
  return text
}

const convertToGermanDate = (englishDateString) => {
  const [year, month, day] = englishDateString.split('-')
  const date = new Date(year, month - 1, day)
  if (isNaN(date.getTime())) {
    return "Ungültiges Datum"
  }
  return date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const refInclude = (team) => {
  return !!vereine.value.includes(team)
}

const forward = () => {
  if(completed.value){
    errorMessage.value = ""
    dataComplete.value = true
  } else {
    if(contactLizenz.value == "-1"){
      errorMessage.value += "Bitte Lizenzstufe angeben!"
    }
    if(!contactName.value){
      if(errorMessage.value !== ""){
        errorMessage.value += "<br />"
      }
      errorMessage.value += "Bitte Namen angeben!"
    }
    if(!contactEmail.value){
      if(errorMessage.value !== ""){
        errorMessage.value += "<br />"
      }
      errorMessage.value += "Bitte Email-Adresse angeben!"
    }
    if(!istGueltigeEmail(contactEmail.value)){
      if(errorMessage.value !== ""){
        errorMessage.value += "<br />"
      }
      errorMessage.value += "Bitte gültige Email-Adresse angeben!"
    }
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

const updateLocal = () => {
  if (contactSaveInfo.value) {
    localStorage.setItem('contact', JSON.stringify({
      name: contactName.value,
      mobile: contactMobile.value,
      email: contactEmail.value,
      lizenz: contactLizenz.value,
      saveInfo: contactSaveInfo.value
    }))
  }
}

const istGueltigeEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const sendAnswer = async () => {
  await LinkService.answer({
    link: link.value._id,
    name: contactName.value,
    email: contactEmail.value,
    telefon: contactMobile.value,
    lizenzstufe: contactLizenz.value,
    message: contactMessage.value,
    games: selectedRows.value.filter( (row, index) => !uncheckedList.value.includes(index)),
    sendMail: sendMailCopy.value
  }).then(() => router.replace({name: "home"}))
}

const uncheck = (e) => {
  if(!e.target.checked){
    uncheckedList.value.push(parseInt(e.target.id))
  } else {
    removeItemFromArray(uncheckedList.value, parseInt(e.target.id))
  }
}

const removeItemFromArray = (array, item) => {
  const index = array.indexOf(item)
  if (index !== -1) {
    array.splice(index, 1)
  }
}

const getDateString = computed(() => {
  if (link.value.start && link.value.end) {
    return `von ${convertToGermanDate(link.value.start)} bis ${convertToGermanDate(link.value.end)}`
  } else if (link.value.start) {
    return `ab ${convertToGermanDate(link.value.start)}`
  } else if (link.value.end) {
    return `ab ${convertToGermanDate(link.value.end)}`
  } else {
    return ``
  }
})

const completed = computed(() => {
  if(contactLizenz.value !== "-1" && contactName.value && contactEmail.value && istGueltigeEmail(contactEmail.value)){
    return true
  }
  return false
})

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
      const other = !vereine.value.includes(row.sr1) ? "otherClub" : ""
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
      const other = !vereine.value.includes(row.sr2) ? "otherClub" : ""
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
  const contact = JSON.parse(localStorage.getItem('contact'))
  if (contact) {
    contactName.value = contact.name
    contactEmail.value = contact.email
    contactMobile.value = contact.mobile
    contactLizenz.value = contact.lizenz
    contactSaveInfo.value = contact.saveInfo
    if(completed.value){
      dataComplete.value = true
    }
  }
  if (!route.params.link) {
    router.replace({name: "home"})
  } else {
    const res = await LinkService.getGames(route.params.link)
    if(res === false){
      router.replace({name: "home"})
    }
    vereine.value = JSON.parse(res.club)
    matches.value = res.matches
    link.value = res.link
    onlyShow.value = res.link.onlyShow
  }
  loaded.value = true
})

watch(contactName, updateLocal)
watch(contactLizenz, updateLocal)
watch(contactEmail, updateLocal)
watch(contactMobile, updateLocal)
watch(contactSaveInfo, updateLocal)
</script>

