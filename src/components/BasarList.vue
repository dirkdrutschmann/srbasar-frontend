<template>
  <div class="mt-0">
    <vue-good-table
        ref="my-table"
        :columns="columns"
        :enable-row-expand="true"
        :pagination-options="pagination"
        :row-style-class="rowStyleClassFn"
        :rows="games"
        :search-options="search"
        :sort-options="sort"
        expanded-row-classes="bg-red"
        expanded-row-detail-classes="bg-yellow"
        theme="nocturnal"
    >
      <template #row-details="props">
        <div class="row mx-auto justify-content-center">
          <div class="col-6 mt-1" v-if="props.row.sr1Basar">
            <div :class="{'basar': props.row.sr1Basar, 'besetzt':props.row.sr1Besetzt , 'offen': !props.row.sr1Besetzt}" class="border border-white p-2 rounded-3 position-relative">
              <p>SR1:</p>
              <h5>
                <a class="stretched-link text-decoration-none text-reset" data-bs-target="#sr1" data-bs-toggle="modal">
                  <img src="@/assets/whistle-icon.svg?data" width="24" alt="whistle"/>&nbsp;
                  {{ props.row.sr1 }}
                </a></h5>
              <h4 v-show="props.row.sr1Bonus > 0">
                <font-awesome-icon icon="fa-regular fa-money-bill-1"/>
                {{ props.row.sr1Bonus }} €
              </h4>
            </div>
          </div>

          <div v-if="props.row.sr1Basar" id="sr1" aria-hidden="true" class="modal fade"
               tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content bg-nocture">
                <div class="modal-header">
                  <h1 id="exampleModalLabel" class="modal-title fs-5">{{ props.row.liganame }}
                    {{ props.row.matchNo }}</h1>
                  <button ref="1" aria-label="Close" class="btn-close" data-bs-dismiss="modal" type="button"></button>
                </div>
                <div class="modal-body">
                  <h3>
                    <img src="@/assets/whistle-icon.svg?data" width="24" alt="whistle"/>&nbsp;{{ props.row.sr1 }}
                  </h3>
                  <div v-for="(contact, index) in props.row.sr1Contact" :key="index">
                    <hr class="my-3">
                      <h4  v-if="contact.name">
                      <font-awesome-icon icon="fa-solid fa-user"/>&nbsp;
                        {{ contact.name }}</h4>
                    <p v-if="contact.showInfo">
                      <font-awesome-icon icon="fa-solid fa-circle-info"/>&nbsp;
                      {{ contact.contactInfo }}
                    </p>
                    <p v-if="contact.showContact">
                      <font-awesome-icon icon="fa-solid fa-mobile"/>&nbsp;
                      <a :href="'tel:'+contact.phone" class="text-decoration-none text-reset">{{ contact.phone }}</a>
                      <br v-if="contact.whatsapp"/> <br v-if="contact.whatsapp"/>
                      <a :href="getWhatsappLink(contact.phone, props.row, props.row.sr1)" aria-label="Chat on WhatsApp"
                         v-if="contact.whatsapp">
                        <img src="@/assets/WhatsAppButtonGreenMedium.svg?data" alt="whatsapp"/></a>
                    </p>
                    <p v-if="contact.showMail">
                      <font-awesome-icon icon="fa-regular fa-envelope"/>&nbsp;
                      <a :href="getMailLink(contact.email, props.row, props.row.sr1)"
                         class="text-decoration-none text-reset">{{ contact.email }}</a>
                      <br><br>
                      <a :href="getMailLink(contact.email, props.row, props.row.sr1)" aria-label="Mail">
                        <img src="@/assets/email.svg?data" alt="email" width="189"/></a>
                    </p>

                </div>
                  <div v-if="!!props.row.sr1Contact.some(sr => sr.getEmails ? sr.getEmails : false)" class="border border-white p-2 rounded-3 mt-5 ">
                    <h5>Spiel übernehmen</h5>
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
                      <label class="form-label" for="mobile">Handynummer</label>
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
                                placeholder: 'Telefonnummer',
                                example: 'Beispiel:',
                              },
                            }"
                          color="info"
                          show-code-on-list
                      />
                    </div>
                    <div class="mb-3">
                      <label class="form-label" for="exampleFormControlTextarea1">Nachricht</label>
                      <textarea id="exampleFormControlTextarea1" v-model="contactMessage" class="form-control"
                                rows="3"></textarea>
                    </div>
                    <div class="form-check-inline">
                      <input id="flexCheckDefault" v-model="contactSaveInfo" class="form-check-input" type="checkbox"
                             value="">
                      <label class="form-check-label" for="flexCheckDefault">
                        Daten speichern
                      </label>
                    </div>
                    <button class="btn btn-outline-light" @click="contactEmail || (contactMobile && results.isValid) ? sendMail(props.row.matchId, 1, props.row.sr1) : message('Es muss eine Email oder Handynummer angegeben werden.')">
                      Senden
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-6 mt-1" v-if="props.row.sr2Basar">
            <div :class="{'basar': props.row.sr2Basar, 'besetzt':props.row.sr2Besetzt , 'offen': !props.row.sr2Besetzt}" class="border border-white p-2 rounded-3 position-relative">
              <p>SR2:</p>
              <h5>
                <a class="stretched-link text-decoration-none text-reset" data-bs-target="#sr2" data-bs-toggle="modal">
                  <img src="@/assets/whistle-icon.svg?data" width="24" alt="whistle"/>&nbsp;{{ props.row.sr2 }}
                </a>
              </h5>
              <h4 v-show="props.row.sr2Bonus > 0">
                <font-awesome-icon icon="fa-regular fa-money-bill-1"/>&nbsp;
                {{ props.row.sr2Bonus }} €
              </h4>
            </div>
          </div>

          <div v-if="props.row.sr2Basar" id="sr2" aria-hidden="true"
               class="modal fade"
               tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content bg-nocture">
                <div class="modal-header">
                  <h1 id="exampleModalLabel" class="modal-title fs-5">{{ props.row.liganame }}
                    {{ props.row.matchNo }}</h1>
                  <button ref="2" aria-label="Close" class="btn-close" data-bs-dismiss="modal" type="button"></button>
                </div>
                <div class="modal-body">
                  <h3>
                    <img src="@/assets/whistle-icon.svg?data" width="24" alt="whistle"/>&nbsp;{{ props.row.sr2 }}
                  </h3>
                  <div v-for="(contact, index) in props.row.sr2Contact" :key="index">
                    <hr class="my-3">
                    <h4  v-if="contact.name">
                      <font-awesome-icon icon="fa-solid fa-user"/>&nbsp;
                      {{ contact.name }}</h4>
                    <p v-if="contact.showInfo">
                      <font-awesome-icon icon="fa-solid fa-circle-info"/>&nbsp;
                      {{ contact.contactInfo }}
                    </p>
                    <p v-if="contact.showContact">
                      <font-awesome-icon icon="fa-solid fa-mobile"/>&nbsp;
                      <a :href="'tel:'+contact.phone" class="text-decoration-none text-reset">{{ contact.phone }}</a>
                      <br v-if="contact.whatsapp"/> <br v-if="contact.whatsapp"/>
                      <a :href="getWhatsappLink(contact.phone, props.row, props.row.sr2)" aria-label="Chat on WhatsApp"
                         v-if="contact.whatsapp">
                        <img src="@/assets/WhatsAppButtonGreenMedium.svg?data" alt="whatsapp"/></a>
                    </p>
                    <p v-if="contact.showMail">
                      <font-awesome-icon icon="fa-regular fa-envelope"/>&nbsp;
                      <a :href="getMailLink(contact.email, props.row, props.row.sr2)"
                         class="text-decoration-none text-reset">{{ contact.email }}</a>
                      <br><br>
                      <a :href="getMailLink(contact.email, props.row, props.row.sr2)" aria-label="Mail">
                        <img src="@/assets/email.svg?data" alt="email" width="189"/></a>
                    </p>

                  </div>
                  <div v-if="!!props.row.sr2Contact.some(sr => sr.getEmails ? sr.getEmails : false)" class="border border-white p-2 rounded-3 mt-5 ">
                    <h5>Spiel übernehmen</h5>
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
                      <label class="form-label" for="mobile">Handynummer</label>
                      <MazPhoneNumberInput
                          v-model="contactMobile"
                          :preferred-countries="['DE','FR', 'BE', 'US', 'GB']"
                          :success="results?.isValid"
                          @update="results= $event;"
                          :no-use-browser-locale="true"
                          :default-country-code="'DE'"
                          :translations="{
                              countrySelector: {
                                placeholder: 'Länderkennung',
                                error: 'Wähle ein Land',
                              },
                              phoneInput: {
                                placeholder: 'Telefonnummer',
                                example: 'Beispiel:',
                              },
                            }"
                          color="info"
                          show-code-on-list
                      />
                    </div>
                    <div class="mb-3">
                      <label class="form-label" for="exampleFormControlTextarea1">Nachricht</label>
                      <textarea id="exampleFormControlTextarea1" v-model="contactMessage" class="form-control"
                                rows="3"></textarea>
                    </div>
                    <div class="form-check-inline">
                      <input id="flexCheckDefault" v-model="contactSaveInfo" class="form-check-input" type="checkbox"
                             value="">
                      <label class="form-check-label" for="flexCheckDefault">
                        Daten speichern
                      </label>
                    </div>
                    <button class="btn btn-outline-light" @click="contactEmail || (contactMobile && results.isValid) ? sendMail(props.row.matchId, 1, props.row.sr2) : message('Es muss eine Email oder Handynummer angegeben werden.')">
                      Senden
                    </button>
                  </div>
                </div>
              </div>
              </div>
            </div>
        </div>
      </template>
      <template #emptystate>
        Es sind keine Spiele im Basar vorhanden.
      </template>
    </vue-good-table>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { fieldFn, pagination, search, sort } from '@/config/datatable.config'
import GamesService from "@/services/games.service"
import MazPhoneNumberInput from "maz-ui/components/MazPhoneNumberInput"
import { format } from "date-fns"

const games = ref([])
const contactMobile = ref("")
const contactEmail = ref("")
const contactName = ref("")
const contactWay = ref([])
const results = ref({})
const contactLizenz = ref("-1")
const contactMessage = ref("")
const contactSaveInfo = ref(false)

const getWhatsappLink = (phone, game, sr) => {
  var number = phone
  if (number[0] === "+") {
    number = number.substring(1)
  }
  return 'https://wa.me/' + number + '?text=' + encodeURI(`Hallo, ich würde gern das Spiel *${game.liganame}${game.matchNo}* am *${new Date(game.kickoffDate).getDate()}.${new Date(game.kickoffDate).getMonth() + 1}.${new Date(game.kickoffDate).getFullYear()}* um *${game.kickoffTime}* *${game.spielfeld}* für *${sr}* übernehmen. Liebe Grüße`)
}

const text = (text) => {
  if(text === "basar"){
    return "im Basar"
  }
  return text
}

const getMailLink = (mail, game, sr) => {
  return 'mailto:' + mail + '?body=' + encodeURI(`Hallo,

ich würde gern das Spiel ${game.liganame}${game.matchNo}
am ${new Date(game.kickoffDate).getDate()}.${new Date(game.kickoffDate).getMonth() + 1}.${new Date(game.kickoffDate).getFullYear()} um ${game.kickoffTime}
${game.spielfeld}
für ${sr} übernehmen.

Liebe Grüße`) + encodeURI("&") + "subject=" + encodeURI(`[SPIELEBASAR] Übernahme ${game.liganame}${game.matchNo}`)
}

const rowStyleClassFn = (row) => {
  if (row.sr1Basar && row.sr2Basar) {
    return 'spielausfall'
  }
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

const message = (text) => {
  alert(text)
}

const sendMail = (match, ref, sr) => {
  if (confirm("Wirklich absenden?")) {
    GamesService.uebernehmen(match, {
      sr: sr,
      name: contactName.value,
      mobile: contactMobile.value,
      email: contactEmail.value,
      lizenz: contactLizenz.value,
      message: contactMessage.value
    })

    if (contactSaveInfo.value) {
      contactMessage.value = ""
    } else {
      contactLizenz.value = -1
      contactMobile.value = ""
      contactEmail.value = ""
      contactMessage.value = ""
      contactName.value = ""
    }
  }
}

const sr2 = (row) => {
  const extra = row.sr2Besetzt === true ? "besetzt" : "offen"
  const add = row.sr2Basar === true && row.sr2Besetzt === false ? "basar" : extra
  const name = `<span class='${add}'>&nbsp;${text(add)}&nbsp;</span>`
  return `${row.sr2}<br/> <i>${name}</i>`
}

const sr1 = (row) => {
  const extra = row.sr1Besetzt === true ? "besetzt" : "offen"
  const add = row.sr1Basar === true && row.sr1Besetzt === false ? "basar" : extra
  const name = `<span class='${add}'>&nbsp;${text(add)}&nbsp;</span>`
  return `${row.sr1}<br/> <i>${name}</i>`
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
    name: "sr1",
    field: sr1,
    html: true,
    type: 'text',
    tdClass: (row) => {
      const extra = row.sr1Besetzt === true ? "besetzt" : "offen"
      const add = row.sr1Basar === true && row.sr1Besetzt === false ? "basar" : extra
      return 'text-center' + " " + add + " otherClub"
    },
    thClass: 'text-center',
    filterOptions: {
      enabled: true,
    },
  },
  {
    label: '2.SR',
    name: "sr2",
    field: sr2,
    html: true,
    type: 'text',
    tdClass: (row) => {
      const extra = row.sr2Besetzt === true ? "besetzt" : "offen"
      const add = row.sr2Basar === true && row.sr2Besetzt === false ? "basar" : extra
      return 'text-center' + " " + add + " otherClub"
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
  games.value = await GamesService.basar()
  games.value = games.value.filter((game) => {
    return (Math.floor(new Date() / 1000) - Math.floor(new Date(game.kickoffDate) / 1000)) < 86400
  })
  
  const contact = JSON.parse(localStorage.getItem('contact'))
  if (contact) {
    contactName.value = contact.name
    contactEmail.value = contact.email
    contactMobile.value = contact.mobile
    contactLizenz.value = contact.lizenz
    contactSaveInfo.value = contact.saveInfo
  }
})

watch(contactName, () => {
  updateLocal()
})

watch(contactLizenz, () => {
  updateLocal()
})

watch(contactEmail, () => {
  updateLocal()
})

watch(contactMobile, () => {
  updateLocal()
})

watch(contactSaveInfo, () => {
  updateLocal()
})
</script>

<style>
.btn-close {
  background: transparent url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23fff'%3e%3cpath d='M.293.293a1 1 0 011.414 0L8 6.586 14.293.293a1 1 0 111.414 1.414L9.414 8l6.293 6.293a1 1 0 01-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 01-1.414-1.414L6.586 8 .293 1.707a1 1 0 010-1.414z'/%3e%3c/svg%3e") center/1em auto no-repeat !important;
}
</style>
