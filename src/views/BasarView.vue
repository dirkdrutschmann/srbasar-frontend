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
  console.log('Server-Parameter aktualisiert:', serverParams.value)
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
    console.error('Fehler beim Laden der Spiele:', error)
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
    console.warn('Ungültige Sortierung in BasarView:', sort)
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
})
</script>
