<template>
  <div class="mt-0">
    <!-- Collapsible Filter-Bereich -->
    <div class="filters-section mb-3">
      <div class="filters-header" @click="toggleFilters">
        <h5 class="mb-0">
          <font-awesome-icon icon="fa-solid fa-filter" class="me-2" />
          Filter anzeigen
          <font-awesome-icon 
            :icon="filtersCollapsed ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-up'" 
            class="ms-2 chevron-icon" 
          />
        </h5>
        <!-- Badge für aktive Filter -->
        <div v-if="hasActiveFilters" class="active-filters-badge" @click.stop="clearFilters">
          <span class="badge-count">{{ activeFiltersCount }}</span>
          <span class="badge-text">Filter aktiv</span>
          <font-awesome-icon icon="fa-solid fa-times" class="ms-1" />
        </div>
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
              searchPlaceholder="Suchen..."
              selectLabel="Enter zum Auswählen"
              deselectLabel="Enter zum Entfernen"
              selectedLabel="Ausgewählt"
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
              searchPlaceholder="Suchen..."
              selectLabel="Enter zum Auswählen"
              deselectLabel="Enter zum Entfernen"
              selectedLabel="Ausgewählt"
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
          <div class="col-12 d-flex justify-content-center gap-2 flex-wrap">
            <Datepicker
              v-model="localFilters.spieldatum"
              ref="datepicker"
              no-today
              :enable-time-picker="false"
              :locale="'de'"
              :auto-apply="true"
              :close-on-auto-apply="true"
              :teleport-to="'body'"
              :allowed-dates="availableDates"
              teleport-center 
              class="custom-datepicker"
            >
            </Datepicker>
            <button 
                  type="button" 
                  class="btn btn-outline-secondary btn-sm datepicker-trigger"
                  :class="{ 'active': localFilters.spieldatum }"
                  @click="toggleDatepicker"
                >
                  <font-awesome-icon icon="fa-solid fa-calendar" class="me-1" />
                  {{ localFilters.spieldatum ? formatDateForDisplay(localFilters.spieldatum.getTime().toString()) : 'Datum auswählen' }}
                </button>
            <button 
              @click="clearFilters" 
              class="btn btn-outline-secondary btn-sm"
              :disabled="loading"
            >
              <font-awesome-icon icon="fa-solid fa-undo" class="me-1" />
              Filter zurücksetzen
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
          perPage: pagination.pageSize || 10,
          perPageDropdown: [10, 20, 50, 100],
          perPageDropdownEnabled: true,
          nextLabel: 'Nächste',
          prevLabel: 'Vorherige',
          rowsPerPageLabel: 'Spiele pro Seite',
          ofLabel: 'von',
          pageLabel: 'Seite',
          allLabel: 'Alle'
        }"
        theme="nocturnal"
        :search-options="{
          enabled: false // Server-seitige Suche
        }"
        :sort-options="{
          enabled: true,
          initialSortBy: { field: 'datum', type: 'asc' },
          multiColumn: false
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

const datepicker = ref(null)
const toggleDatepicker = () => {
  datepicker.value.toggleMenu()
}
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

// Überprüfe ob aktive Filter vorhanden sind
const hasActiveFilters = computed(() => {
  return localFilters.value.spieldatum || 
         localFilters.value.ligaName || 
         localFilters.value.spielfeldName || 
         localFilters.value.search
})

// Zähle aktive Filter
const activeFiltersCount = computed(() => {
  let count = 0
  if (localFilters.value.spieldatum) count++
  if (localFilters.value.ligaName) count++
  if (localFilters.value.spielfeldName) count++
  if (localFilters.value.search) count++
  return count
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
  console.log('Sortierung empfangen:', params)
  if(Array.isArray(params)) {
    params = params[0]
  }
  const { field, type } = params
  emit('sort-change', { 
    sortBy: field, 
    sortOrder: type 
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
    sortField: 'spieldatum',
  },
  {
    label: 'Zeit',
    field: 'zeit',
    tdClass: 'text-center',
    thClass: 'text-center',
    sortable: false,
  },
  {
    label: 'Spielfeld',
    field: 'spielfeldName',
    thClass: 'text-center',
    tdClass: 'text-center',
    sortable: true,
    sortField: 'spielfeldName',
  },
  {
    label: 'Heimteam',
    field: 'heimMannschaftName',
    type: 'text',
    tdClass: 'text-center',
    thClass: 'text-center',
    sortable: true,
    sortField: 'heimMannschaftName',
  },
  {
    label: 'Gastteam',
    field: 'gastMannschaftName',
    type: 'text',
    tdClass: 'text-center',
    thClass: 'text-center',
    sortable: true,
    sortField: 'gastMannschaftName',
  },
  {
    label: 'SR Verein 1',
    field: 'sr1VereinName',
    tdClass: 'text-center',
    thClass: 'text-center',
    sortable: true,
    sortField: 'sr1VereinName',
  },
  {
    label: 'SR Verein 2',
    field: 'sr2VereinName',
    tdClass: 'text-center',
    thClass: 'text-center',
    sortable: true,
    sortField: 'sr2VereinName',
  },
  {
    label: 'SR Qualifikation',
    field: 'srQualifikation.bezeichnung',
    tdClass: 'text-center',
    thClass: 'text-center',
    sortable: false,
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
:deep(.custom-datepicker input),
:deep(.custom-datepicker .dp__input_icons),
:deep(.custom-datepicker .dp__input_icon),
:deep(.custom-datepicker .dp__input_wrap) {
  display:none !important;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.filters-header:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Aktive Filter Badge */
.active-filters-badge {
  display: flex;
  align-items: center;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.active-filters-badge:hover {
  background: rgba(220, 53, 69, 1);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.badge-count {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  margin-right: 0.5rem;
}

.badge-text {
  margin-right: 0.25rem;
}

.filters-header h5 {
  color: white;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chevron-icon {
  transition: transform 0.3s ease;
  font-size: 0.875rem;
}

.filters-header:hover .chevron-icon {
  transform: scale(1.1);
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
