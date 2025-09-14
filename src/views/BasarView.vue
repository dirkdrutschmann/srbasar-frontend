<template>
  <div>
    <BasarList 
      :games="processedGames" 
      :pagination="pagination"
      :available-filters="availableFilters"
      :loading="loading"
      @page-change="handlePageChange"
      @filter-change="handleFilterChange"
      @sort-change="handleSortChange"
      @search-change="handleSearchChange"
      @per-page-change="handlePerPageChange"
    />
    
    <div class="row justify-content-center mt-3">
      <div class="col-12 col-lg-6">
        <div class="polling-controls">
          <div class="d-flex flex-column flex-lg-row justify-content-center justify-content-lg-between align-items-center align-items-lg-center gap-3">
            <div class="d-flex align-items-center">
              <div class="form-check">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  id="autoUpdateCheckbox"
                  v-model="autoUpdateEnabled"
                  @change="toggleAutoUpdate"
                >
                <label class="form-check-label" for="autoUpdateCheckbox">
                  Automatisches Update
                </label>
              </div>
            </div>
            <div class="polling-status d-flex flex-column flex-sm-row align-items-center align-items-sm-center gap-2 gap-sm-3 mb-3">
              <div v-if="autoUpdateEnabled">
                <span class="countdown-text">
                  Nächstes Update in: <strong>{{ countdown }}s</strong>
                </span>
              </div>
              <div v-else>
                <span class="countdown-text text-muted">
                  Auto-Update pausiert
                </span>
              </div>
              <button 
                class="btn btn-outline-light btn-sm"
                @click="manualUpdate"
                :disabled="loading"
              >
                <font-awesome-icon icon="fa-solid fa-sync-alt" class="me-1" />
                {{ loading ? 'Aktualisiere...' : '' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, h, createApp } from 'vue'
import BasarList from "../components/BasarList.vue";
import GamesService from "../services/games.service.js";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const games = ref([])
const loading = ref(false)
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false
})
const availableFilters = ref({
  spielfeldName: [],
  ligaName: [],
  spieldatum: []
})

const pollingInterval = ref(null)
const countdownInterval = ref(null)
const autoUpdateEnabled = ref(true)
const countdown = ref(30)

const serverParams = ref({
  columnFilters: {
    spieldatum: '',
    ligaName: '',
    spielfeldName: '',
    search: ''
  },
  sort: {
    field: 'spieldatum',
    type: 'ASC'
  },
  page: 1,
  perPage: 10
})

function renderToHtml(icon, options = {}) {
  const container = document.createElement('span')
  const app = createApp({
    render() {
      return h(FontAwesomeIcon, { icon, ...options })
    },
  })
  app.component('font-awesome-icon', FontAwesomeIcon)
  app.mount(container)
  const html = container.innerHTML
  app.unmount()
  return html
}


const processedGames = computed(() => {
  return games.value.map(game => ({
    ...game,
    id: `<a href="https://www.basketball-bund.net/app.do?app=/sr/take&spielId=${game.spielplanId}" target="_blank" class="btn btn-primary btn-sm">
        ${renderToHtml('fa-solid fa-handshake')} Übernehmen
      </a>`
  }))
})

const updateParams = (newProps) => {
  serverParams.value = Object.assign({}, serverParams.value, newProps)
}

const loadGames = async () => {
  loading.value = true
  try {
    const params = {
      page: serverParams.value.page,
      limit: serverParams.value.perPage,
      sortBy: serverParams.value.sort.field,
      sortOrder: serverParams.value.sort.type,
      ...serverParams.value.columnFilters
    }
    
    const res = await GamesService.getSpiele(params)
    
    if (res && res.data) {
      games.value = res.data.spiele || []
      pagination.value = res.data.pagination || {}
      availableFilters.value = res.data.availableFilters || {}
    }
  } catch (error) {
    games.value = []
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page) => {
  updateParams({ page: page })
  loadGames()
}

const handleFilterChange = (filters) => {
  updateParams({
    columnFilters: { ...serverParams.value.columnFilters, ...filters },
    page: 1
  })
  loadGames()
}

const handleSortChange = (sort) => {
  if (!sort.sortBy || !sort.sortOrder) {
    return
  }
  updateParams({
    sort: {
      field: sort.sortBy,
      type: sort.sortOrder
    }
  })
  loadGames()
}

const handlePerPageChange = (perPage) => {
  updateParams({
    perPage: perPage,
    page: 1 
  })
  loadGames()
}

const handleSearchChange = (searchTerm) => {
  updateParams({
    columnFilters: { ...serverParams.value.columnFilters, search: searchTerm },
    page: 1 
  })
  loadGames()
}

const startCountdown = () => {
  countdown.value = 30
  countdownInterval.value = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      countdown.value = 30
    }
  }, 1000)
}

const stopCountdown = () => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
    countdownInterval.value = null
  }
}

const startPolling = () => {
  if (autoUpdateEnabled.value) {
    // Polling alle 30 Sekunden
    pollingInterval.value = setInterval(() => {
      loadGames()
    }, 30000)
    startCountdown()
  }
}

const stopPolling = () => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
    pollingInterval.value = null
  }
  stopCountdown()
}

const toggleAutoUpdate = () => {
  if (autoUpdateEnabled.value) {
    startPolling()
  } else {
    stopPolling()
  }
}

const manualUpdate = async () => {
  await loadGames()
  // Countdown zurücksetzen wenn Auto-Update aktiv ist
  if (autoUpdateEnabled.value) {
    countdown.value = 30
  }
}

onMounted(() => {
  serverParams.value = {
    columnFilters: {
      spieldatum: '',
      ligaName: '',
      spielfeldName: '',
      search: ''
    },
    sort: {
      field: 'spieldatum',
      type: 'ASC'
    },
    page: 1,
    perPage: pagination.value.pageSize
  }
  
  loadGames()
  startPolling()
})

onUnmounted(() => {
  stopPolling()
  stopCountdown()
})
</script>

<style scoped>
.polling-controls {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
}

.form-check-label {
  color: white;
  font-weight: 500;
}

.form-check-input:checked {
  background-color: #28a745;
  border-color: #28a745;
}

.form-check-input:checked:focus {
  background-color: #28a745;
  border-color: #28a745;
  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
}

.countdown-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.countdown-text.text-muted {
  color: rgba(255, 255, 255, 0.5) !important;
}
</style>
