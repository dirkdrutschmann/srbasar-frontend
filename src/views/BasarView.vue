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
  </div>
</template>

<script setup>
import { ref, onMounted, computed, h, createApp } from 'vue'
import BasarList from "../components/BasarList.vue";
import GamesService from "../services/games.service.js";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const games = ref([])
const loading = ref(false)
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
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

// Aktuelle Filter und Sortierung
const currentFilters = ref({
  spieldatum: '',
  ligaName: '',
  spielfeldName: '',
  search: '',
  sortBy: 'spieldatum',
  sortOrder: 'ASC'
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

// Verarbeite die Spiele-Daten für die Anzeige
const processedGames = computed(() => {
  return games.value.map(game => ({
    ...game,
    id: `<a href="https://www.basketball-bund.net/app.do?app=/sr/take&spielId=${game.spielplanId}" target="_blank" class="btn btn-primary btn-sm">
        ${renderToHtml('fa-solid fa-handshake')} Übernehmen
      </a>`
  }))
})

// Lade Spiele mit aktuellen Filtern
const loadGames = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.currentPage,
      limit: pagination.value.pageSize,
      ...currentFilters.value
    }
    
    const res = await GamesService.getSpiele(params)
    
    if (res && res.data) {
      games.value = res.data.spiele || []
      pagination.value = res.data.pagination || {}
      availableFilters.value = res.data.availableFilters || {}
    }
  } catch (error) {
    console.error('Fehler beim Laden der Spiele:', error)
    games.value = []
  } finally {
    loading.value = false
  }
}

// Event-Handler für Paginierung
const handlePageChange = (page) => {
  pagination.value.currentPage = page
  loadGames()
}

// Event-Handler für Filter
const handleFilterChange = (filters) => {
  currentFilters.value = { ...currentFilters.value, ...filters }
  pagination.value.currentPage = 1 // Zurück zur ersten Seite
  loadGames()
}

// Event-Handler für Sortierung
const handleSortChange = (sort) => {
  currentFilters.value.sortBy = sort.sortBy
  currentFilters.value.sortOrder = sort.sortOrder
  loadGames()
}

// Event-Handler für Seitengröße
const handlePerPageChange = (perPage) => {
  pagination.value.pageSize = perPage
  pagination.value.currentPage = 1 // Zurück zur ersten Seite
  loadGames()
}

// Event-Handler für Suche
const handleSearchChange = (searchTerm) => {
  currentFilters.value.search = searchTerm
  pagination.value.currentPage = 1 // Zurück zur ersten Seite
  loadGames()
}

onMounted(() => {
  loadGames()
})
</script>
