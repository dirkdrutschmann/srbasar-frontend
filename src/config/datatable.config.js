import {format} from "date-fns";
import { fieldFn } from '@/utils/fieldUtils'

// Vue Good Table Next globale Konfiguration
export const globalTableConfig = {
  theme: 'nocturnal',
  styleClass: 'vgt-table-custom',
  tableStyle: {
    backgroundColor: 'transparent',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
  },
  headerStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#ffffff',
    fontWeight: '600',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
  },
  rowStyle: {
    backgroundColor: 'transparent',
    color: '#ffffff',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'all 0.2s ease'
  },
  rowHoverStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  },
  searchStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: '#ffffff',
    backdropFilter: 'blur(10px)'
  },
  paginationStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    backdropFilter: 'blur(10px)'
  },
  buttonStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '6px',
    color: '#ffffff',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      transform: 'translateY(-1px)'
    }
  }
}

// Bestehende Konfigurationen
export const search = {
  enabled: true,
  placeholder: 'Suchen...',
  style: globalTableConfig.searchStyle
}

export const pagination = {
  enabled: true,
  perPage: 10,
  perPageDropdown: [10, 20, 50],
  dropdownAllowAll: false,
  setCurrentPage: 1,
  nextLabel: 'Nächste',
  prevLabel: 'Vorherige',
  rowsPerPageLabel: 'Zeilen pro Seite',
  ofLabel: 'von',
  pageLabel: 'Seite',
  style: globalTableConfig.paginationStyle
}

export const sort = {
  enabled: true,
  multiColumn: true,
  initialSortBy: { field: 'kickoffDate', type: 'asc' }
}

export { fieldFn }

export const columns = [
    {
        label: 'Datum',
        field: 'kickoffDate',
        type: 'date',
        dateInputFormat: 'yyyy-MM-dd',
        dateOutputFormat: 'dd.MM.yyyy',
        tdClass: 'text-center',
        filterOptions: {
            enabled: true, // enable filter for this column
            filterDropdownItems: [], // dropdown (with selected values) instead of text input
            filterFn: function (data, filterString) {
                return format(new Date(data), "dd.MM.yyyy").includes(filterString)
            }, //custom filter function that
            trigger: 'keyup', //only trigger on enter not on keyup
        },
    },
    {
        label: 'Halle',
        field: 'spielfeld',
        filterOptions: {
            enabled: true, // enable filter for this column
        },
        tdClass: 'text-center'
    },
    {
        label: 'Zeit',
        field: 'kickoffTime',
        type: 'date',
        tdClass: 'text-center',
        dateInputFormat: 'HH:mm',
        dateOutputFormat: 'HH:mm',
        filterOptions: {
            enabled: true, // enable filter for this column
        },
    },
    {
        label: 'Lizenz',
        field: fieldFn,
        tdClass: 'text-center',
        filterOptions: {
            enabled: true, // enable filter for this column
            filterDropdownItems: ["LSE", "LSE+ | LSD", "LSD"],
        },
    },
]
