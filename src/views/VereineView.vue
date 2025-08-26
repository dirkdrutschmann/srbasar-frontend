<template>
  <div class="vereine-container">
    <div class="container mt-4">
      <div class="row justify-content-center">
        <div class="col-md-10">
          <div class="vereine-card">
            <div class="card-header">
              <h3 class="section-title">
                <font-awesome-icon icon="fa-solid fa-users" class="me-2" />
                Vereine verwalten
              </h3>
            </div>
            <div class="card-body">
              <!-- Suchfeld -->
              <div class="mb-4">
                <div class="search-container">
                  <input
                    type="text"
                    class="form-control search-input"
                    placeholder="Verein suchen..."
                    v-model="searchTerm"
                  />
                  <font-awesome-icon icon="fa-solid fa-search" class="search-icon" />
                </div>
              </div>

              <!-- Vereinsliste -->
              <div class="table-responsive">
                <table class="vereine-table">
                  <thead>
                    <tr>
                      <th>Vereinsname</th>
                      <th class="text-center">Ansetzungen</th>
                      <th class="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="verein in filteredVereine" :key="verein.vereinId" class="verein-row">
                      <td class="verein-name">{{ verein.vereinsname }}</td>
                      <td class="text-center">
                        <div class="form-check d-flex justify-content-center">
                          <input
                            class="form-check-input custom-checkbox"
                            type="checkbox"
                            :id="'hideLink-' + verein.vereinId"
                            v-model="verein.hideLink"
                            @change="updateHideLink(verein)"
                            :disabled="updating === verein.vereinId"
                          />
                          <label class="form-check-label ms-2" :for="'hideLink-' + verein.vereinId">
                            {{ verein.hideLink ? 'Versteckt' : 'Sichtbar' }}
                          </label>
                        </div>
                      </td>
                      <td class="text-center">
                        <span v-if="updating === verein.vereinId" class="status-saving">
                          <font-awesome-icon icon="fa-solid fa-spinner" class="fa-spin me-1" />
                          Speichern...
                        </span>
                        <span v-else-if="updateStatus[verein.vereinId]" class="status-saved">
                          <font-awesome-icon icon="fa-solid fa-check" class="me-1" />
                          Gespeichert
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Keine Vereine gefunden -->
              <div v-if="filteredVereine.length === 0" class="empty-state">
                <div v-if="searchTerm" class="text-center text-muted">
                  <font-awesome-icon icon="fa-solid fa-search" class="empty-icon" />
                  <p>Keine Vereine gefunden, die "{{ searchTerm }}" enthalten.</p>
                </div>
                <div v-else class="text-center text-muted">
                  <font-awesome-icon icon="fa-solid fa-users" class="empty-icon" />
                  <p>Keine Vereine verfügbar.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import VereinService from '@/services/verein.service'

const vereine = ref([])
const searchTerm = ref('')
const updating = ref(null)
const updateStatus = ref({})

const filteredVereine = computed(() => {
  if (!searchTerm.value) return vereine.value
  
  return vereine.value.filter(verein =>
    verein.vereinsname.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

onMounted(async () => {
  try {
    const response = await VereinService.getVereine()
    vereine.value = response || []
  } catch (error) {
    console.error('Fehler beim Laden der Vereine:', error)
    vereine.value = []
  }
})

const updateHideLink = async (verein) => {
  updating.value = verein.vereinId
  
  try {
    await VereinService.updateHideLink(verein.vereinId, verein.hideLink)
    
    // Zeige Erfolgsstatus
    updateStatus.value[verein.vereinId] = true
    setTimeout(() => {
      updateStatus.value[verein.vereinId] = false
    }, 2000)
    
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Vereins:', error)
    
    // Setze Checkbox zurück bei Fehler
    verein.hideLink = !verein.hideLink
    
    alert('Fehler beim Speichern der Änderung')
  } finally {
    updating.value = null
  }
}
</script>

<style scoped>
.vereine-container {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bs-primary), var(--bs-dark));
  padding: 2rem 0;
}

.vereine-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.vereine-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-header {
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem 0.75rem 0 0;
  padding: 1.5rem;
}

.section-title {
  color: #ffffff;
  margin: 0;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.card-body {
  padding: 1.5rem;
}

.search-container {
  position: relative;
  max-width: 400px;
  margin: 0 auto;
}

.search-input {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  padding: 0.75rem 1rem;
  padding-right: 3rem;
  border-radius: 0.5rem;
  backdrop-filter: blur(5px);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-input:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.5);
  color: #ffffff;
  box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.25);
}

.search-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
}

.vereine-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-top: 1rem;
}

.vereine-table th {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  font-weight: 600;
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.vereine-table th.text-center {
  text-align: center;
}

.verein-row {
  transition: all 0.2s ease;
}

.verein-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.vereine-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.verein-name {
  font-weight: 500;
  color: #ffffff;
}

.custom-checkbox {
  width: 1.2rem;
  height: 1.2rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.custom-checkbox:checked {
  background: #198754;
  border-color: #198754;
}

.custom-checkbox:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-check-label {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  cursor: pointer;
}

.status-saving {
  color: #ffc107;
  font-weight: 500;
}

.status-saved {
  color: #198754;
  font-weight: 500;
}

.empty-state {
  padding: 3rem 1rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 1rem;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  margin: 0;
}

@media (max-width: 768px) {
  .vereine-container {
    padding: 1rem 0;
  }
  
  .card-header,
  .card-body {
    padding: 1rem;
  }
  
  .vereine-table th,
  .vereine-table td {
    padding: 0.75rem 0.5rem;
  }
}
</style>
