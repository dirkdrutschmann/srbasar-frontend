<template>
  <div class="mt-0">
    <!-- Collapsible Filter-Bereich -->
    <div class="filters-section mb-3">
      <div class="filters-header" @click="toggleFilters">
        <h5 class="mb-0">
          <i class="fas fa-filter me-2"></i>
          Filter anzeigen
          <i :class="filtersCollapsed ? 'fas fa-chevron-down' : 'fas fa-chevron-up'" class="ms-2"></i>
        </h5>
      </div>
      
      <div v-show="!filtersCollapsed" class="filters-content">
        <div class="row">
          <div class="col-md-4">
            <label class="form-label">Spielfeld</label>
            <Multiselect
              v-model="localFilters.spielfeldName"
              :options="availableFilters.spielfeldName"
              :searchable="true"
              :create-option="false"
              placeholder="Alle Spielfelder"
              noOptionsText="Keine Optionen verfügbar"
              noResultsText="Keine Ergebnisse gefunden"
              @change="applyFilters"
              class="custom-multiselect"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">Liga</label>
            <Multiselect
              v-model="localFilters.ligaName"
              :options="availableFilters.ligaName"
              :searchable="true"
              :create-option="false"
              placeholder="Alle Ligen"
              noOptionsText="Keine Optionen verfügbar"
              noResultsText="Keine Ergebnisse gefunden"
              @change="applyFilters"
              class="custom-multiselect"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">Globale Suche</label>
            <div class="input-group">
              <span class="input-group-text">
                <font-awesome-icon icon="fa-solid fa-magnifying-glass" />
              </span>
              <input 
                type="text" 
                v-model="localFilters.search" 
                class="form-control"
                placeholder="Suche nach Team, Verein, Ort..."
                @input="debounceSearch"
              />
            </div>
          </div>
        </div>
        <div class="row mt-3">
          <div class="col-12 d-flex justify-content-center gap-2">
            <Datepicker
              v-model="localFilters.spieldatum"
              :enable-time-picker="false"
              :locale="'de'"
              :auto-apply="true"
              :close-on-auto-apply="true"
              :teleport-to="'body'"
              :allowed-dates="availableDates"
              teleport-center 
              class="custom-datepicker"
            >
              <template #trigger>
                <button 
                  type="button" 
                  class="btn btn-outline-secondary btn-sm datepicker-trigger"
                  :class="{ 'active': localFilters.spieldatum }"
                >
                  <font-awesome-icon icon="fa-solid fa-calendar" class="me-1" />
                  {{ localFilters.spieldatum ? formatDateForDisplay(localFilters.spieldatum.getTime().toString()) : 'Datum auswählen' }}
                </button>
              </template>
            </Datepicker>
            
            <button 
              @click="clearFilters" 
              class="btn btn-outline-secondary btn-sm"
              :disabled="loading"
            >
              <i class="fas fa-undo me-1"></i>Filter zurücksetzen
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabelle mit Server-Side-Modus -->
    <vue-good-table
        ref="my-table"
        mode="remote"
        :columns="columns"
        :rows="games"
        :totalRows="pagination.totalItems"
        :isLoading.sync="loading"
        :pagination-options="{
          enabled: true,
          perPage: pagination.pageSize,
          perPageDropdown: [10, 20, 50, 100],
          perPageDropdownEnabled: true
        }"
        theme="nocturnal"
        :search-options="{
          enabled: false // Server-seitige Suche
        }"
        :sort-options="{
          enabled: true,
          initialSortBy: { field: 'datum', type: 'asc' }
        }"
        @page-change="onPageChange"
        @per-page-change="onPerPageChange"
        @sort-change="onSortChange"
        @column-filter="onColumnFilter"
    >
      <template #emptystate>
        <div class="text-center py-4">
          <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
          <p class="text-muted">Es sind keine Spiele im Basar vorhanden.</p>
        </div>
      </template>
      
      <template #loadingContent>
        <div class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Laden...</span>
          </div>
        </div>
      </template>
    </vue-good-table>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Multiselect from 'vue-multiselect'
import Datepicker from '@vuepic/vue-datepicker'

const props = defineProps({
  games: {
    type: Array,
    default: () => []
  },
  pagination: {
    type: Object,
    default: () => ({})
  },
  availableFilters: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  },
  availableDates: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['page-change', 'filter-change', 'sort-change', 'search-change', 'per-page-change'])

// Collapsible Filter
const filtersCollapsed = ref(true)

// Lokale Filter
const localFilters = ref({
  spieldatum: null,
  ligaName: '',
  spielfeldName: '',
  search: ''
})

// Verfügbare Datums für den Datepicker
const availableDates = computed(() => {
  if (!props.availableFilters.spieldatum) return []
  
  return props.availableFilters.spieldatum.map(timestamp => {
    const date = new Date(parseInt(timestamp))
    return date
  })
})

// Filter ein-/ausklappen
const toggleFilters = () => {
  filtersCollapsed.value = !filtersCollapsed.value
}

// Debounce für Suche
let searchTimeout = null
const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 500)
}

// Filter anwenden
const applyFilters = () => {
  emit('filter-change', { ...localFilters.value })
}

// Filter zurücksetzen
const clearFilters = () => {
  localFilters.value = {
    spieldatum: null,
    ligaName: '',
    spielfeldName: '',
    search: ''
  }
  
  applyFilters()
}



// Event-Handler für Remote-Modus
const onPageChange = (params) => {
  emit('page-change', params.currentPage)
}

const onPerPageChange = (params) => {
  emit('per-page-change', params.currentPerPage)
}

const onSortChange = (params) => {
  const { sortBy, sortType, columnIndex } = params
  const sortOrder = sortType === 'asc' ? 'ASC' : 'DESC'
  
  // Verwende sortField aus der Spalten-Definition oder fallback auf das ursprüngliche Feld
  let backendSortField = sortBy
  
  // Versuche columnIndex zu verwenden, falls verfügbar
  if (columnIndex !== undefined && columns[columnIndex]) {
    const column = columns[columnIndex]
    backendSortField = column.sortField || sortBy
  } else {
    // Fallback: Mappe bekannte Felder manuell
    if (sortBy === 'datum' || sortBy === 'zeit') {
      backendSortField = 'spieldatum'
    }
  }
  
  // Sende Sortierung direkt an das Backend
  emit('sort-change', { 
    sortBy: backendSortField, 
    sortOrder: sortOrder 
  })
}

const onColumnFilter = (params) => {
  emit('filter-change', params)
}

const columns = [
  {
    label: 'Datum',
    field: 'datum',
    tdClass: 'text-center',
    thClass: 'text-center',
    sortable: true,
    sortField: 'spieldatum', // Backend-Feld für Sortierung
  },
  {
    label: 'Zeit',
    field: 'zeit',
    tdClass: 'text-center',
    thClass: 'text-center',
    sortable: true,
    sortField: 'spieldatum', // Backend-Feld für Sortierung
  },
  {
    label: 'Spielfeld',
    field: 'spielfeldName',
    thClass: 'text-center',
    tdClass: 'text-center',
    sortable: true,
  },
  {
    label: 'Heimteam',
    field: 'heimMannschaftName',
    type: 'text',
    tdClass: 'text-center',
    thClass: 'text-center',
    sortable: true,
  },
  {
    label: 'Gastteam',
    field: 'gastMannschaftName',
    type: 'text',
    tdClass: 'text-center',
    thClass: 'text-center',
    sortable: true,
  },
  {
    label: 'SR Verein 1',
    field: 'sr1VereinName',
    tdClass: 'text-center',
    thClass: 'text-center',
    sortable: true,
  },
  {
    label: 'SR Verein 2',
    field: 'sr2VereinName',
    tdClass: 'text-center',
    thClass: 'text-center',
    sortable: true,
  },
  {
    label: 'SR Qualifikation',
    field: 'srQualifikation.bezeichnung',
    tdClass: 'text-center',
    thClass: 'text-center',
    sortable: false, // Komplexe Felder können nicht sortiert werden
  },
  {
    label: 'Aktion',
    field: 'id',
    tdClass: 'text-center',
    thClass: 'text-center',
    sortable: false,
    html: true,
  },
]

// Datum für Anzeige formatieren
const formatDateForDisplay = (timestamp) => {
  if (!timestamp) return 'N/A'
  try {
    const date = new Date(parseInt(timestamp))
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch (error) {
    return 'N/A'
  }
}

// Watch für Filter-Änderungen
watch(() => localFilters.value.spieldatum, (newVal) => {
  if (newVal) {
    const timestamp = newVal.getTime().toString()
    emit('filter-change', { spieldatum: timestamp })
  } else {
    emit('filter-change', { spieldatum: '' })
  }
})

watch(() => localFilters.value.spielfeldName, (newVal) => {
  emit('filter-change', { spielfeldName: newVal?.value || newVal })
})

watch(() => localFilters.value.ligaName, (newVal) => {
  emit('filter-change', { ligaName: newVal?.value || newVal })
})
</script>

<style scoped>
/* Vue Multiselect Styling */
:deep(.multiselect) {
  min-height: 38px;
  background: white;
  border-radius: 0.375rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.multiselect-dropdown) {
  border: none;
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background: white;
  margin-top: 2px;
}

:deep(.multiselect-option) {
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
}

:deep(.multiselect-option:last-child) {
  border-bottom: none;
}

:deep(.multiselect-option:hover) {
  background: rgba(102, 126, 234, 0.1);
}

:deep(.multiselect-option.is-selected) {
  background: #667eea;
  color: white;
}

:deep(.multiselect-input) {
  border: none;
  padding: 0.5rem;
  background: transparent;
  color: #495057;
}

:deep(.multiselect-input::placeholder) {
  color: #6c757d;
}

:deep(.multiselect-tags) {
  padding: 0.25rem 0.5rem;
}

:deep(.multiselect-tag) {
  background: #667eea;
  color: white;
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  margin: 0.125rem;
  font-size: 0.875rem;
}

:deep(.multiselect-tag-remove) {
  color: white;
  margin-left: 0.5rem;
  cursor: pointer;
  font-weight: bold;
}

:deep(.multiselect-tag-remove:hover) {
  color: rgba(255, 255, 255, 0.8);
}

:deep(.multiselect-placeholder) {
  color: #6c757d;
  padding: 0.5rem;
}

:deep(.multiselect-single-label) {
  color: #495057;
  padding: 0.5rem;
}

:deep(.multiselect-caret) {
  border-top: 5px solid #6c757d;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  margin-top: 0.5rem;
}

:deep(.multiselect-caret.is-open) {
  border-top: none;
  border-bottom: 5px solid #6c757d;
  margin-top: 0;
  margin-bottom: 0.5rem;
}

/* Vue Datepicker Styling */
:deep(.dp__main) {
  font-family: inherit;
}

:deep(.dp__input) {
  border: none;
  border-radius: 0.375rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
  background: white;
  color: #495057;
  min-height: 38px;
  width: 100%;
}

:deep(.dp__input::placeholder) {
  color: #6c757d;
}

:deep(.dp__input:focus) {
  outline: none;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.25);
}

:deep(.dp__menu) {
  border: none;
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background: white;
  margin-top: 2px;
}

:deep(.dp__calendar_header) {
  background: #667eea;
  color: white;
  border-radius: 0.375rem 0.375rem 0 0;
}

:deep(.dp__calendar_header_cell) {
  color: white;
  font-weight: 600;
}

:deep(.dp__calendar_header_cell--clickable:hover) {
  background: rgba(255, 255, 255, 0.2);
}

:deep(.dp__cell_inner) {
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

:deep(.dp__cell_inner:hover) {
  background: rgba(102, 126, 234, 0.1);
}

:deep(.dp__active_date) {
  background: #667eea;
  color: white;
}

:deep(.dp__active_date:hover) {
  background: #5a6fd8;
}

:deep(.dp__today) {
  border: 2px solid #667eea;
  color: black;
}

:deep(.dp__today:hover) {
  background: rgba(102, 126, 234, 0.1);
}

:deep(.dp__arrow_bottom) {
  border-top: 5px solid #6c757d;
}

:deep(.dp__arrow_top) {
  border-bottom: 5px solid #6c757d;
}

/* Datepicker Button Styling */
.datepicker-trigger {
  min-height: 38px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.datepicker-trigger:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.7);
  transform: translateY(-1px);
}

.datepicker-trigger.active {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.filters-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.filters-header {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.filters-header:hover {
  background: rgba(255, 255, 255, 0.2);
}

.filters-header h5 {
  color: white;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.filters-content {
  padding: 1.5rem;
  color: white;
}

.filters-content .form-label {
  color: white;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.filters-content .form-control {
  border: none;
  border-radius: 0.375rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-height: 38px;
  padding: 0.5rem;
  background: white;
  color: #495057;
  transition: all 0.3s ease;
}

.filters-content .form-control:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.25);
  transform: translateY(-1px);
}

.filters-content .form-control::placeholder {
  color: #6c757d;
}

.filters-content .input-group-text {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  color: #667eea;
  border-radius: 0.375rem 0 0 0.375rem;
}

.filters-content .btn-outline-secondary {
  border-color: rgba(255, 255, 255, 0.5);
  color: white;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.filters-content .btn-outline-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.7);
  transform: translateY(-1px);
}

/* Vue Good Table Anpassungen */
:deep(.vgt-table) {
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

:deep(.vgt-table thead th) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 0.75rem;
  font-weight: 600;
}

:deep(.vgt-table thead th.sortable) {
  cursor: pointer;
  transition: all 0.3s ease;
}

:deep(.vgt-table thead th.sortable:hover) {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: translateY(-1px);
}

:deep(.vgt-table thead th.sort-asc::after) {
  content: '↑';
  opacity: 1;
}

:deep(.vgt-table thead th.sort-desc::after) {
  content: '↓';
  opacity: 1;
}

:deep(.vgt-table tbody tr) {
  transition: all 0.3s ease;
}

:deep(.vgt-table tbody tr:hover) {
  background: rgba(102, 126, 234, 0.1);
  transform: translateX(2px);
}

:deep(.vgt-table tbody td) {
  padding: 0.75rem;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
}
</style>
