import './jquery.js'
import './bootstrap.js'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useStorage } from '@vueuse/core'
import { globalTableConfig } from '@/config/datatable.config'

export default {
  install(app) {
    // Pinia Store
    const pinia = createPinia()
    app.use(pinia)

    // Globale vue-good-table-next Konfiguration
    app.config.globalProperties.$vgtConfig = globalTableConfig

    // Globale Methoden
    app.config.globalProperties.$formatDate = (date) => {
      return new Date(date).toLocaleDateString('de-DE')
    }

    app.config.globalProperties.$formatTime = (time) => {
      return time
    }

    // Globale Filter
    app.config.globalProperties.$capitalize = (value) => {
      if (!value) return ''
      return value.charAt(0).toUpperCase() + value.slice(1)
    }

    // Globale Direktiven
    app.directive('focus', {
      mounted(el) {
        el.focus()
      }
    })

    app.directive('blur', {
      mounted(el) {
        el.blur()
      }
    })

    // Globale Komponenten
    app.component('LoadingSpinner', {
      template: `
        <div class="loading-spinner">
          <div class="spinner-border text-light" role="status">
            <span class="visually-hidden">Laden...</span>
          </div>
        </div>
      `
    })

    app.component('EmptyState', {
      props: {
        message: {
          type: String,
          default: 'Keine Daten vorhanden'
        },
        icon: {
          type: String,
          default: 'fa-solid fa-inbox'
        }
      },
      template: `
        <div class="empty-state text-center py-5">
          <font-awesome-icon :icon="icon" class="fa-3x text-muted mb-3"/>
          <p class="text-muted">{{ message }}</p>
        </div>
      `
    })
  }
}