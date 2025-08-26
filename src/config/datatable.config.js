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
  initialSortBy: { field: 'datum', type: 'asc' }
}

export { fieldFn }

