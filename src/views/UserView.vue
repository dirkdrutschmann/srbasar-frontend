<template>
  <div class="user-container">
    <div class="container">
      
      <!-- Benutzer hinzufügen -->
      <div class="profile-section">
        <h4 class="section-title">
          <font-awesome-icon icon="fa-solid fa-user-plus" class="me-2" />
          Benutzer hinzufügen
        </h4>
        
        <div class="info-card">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">
                <font-awesome-icon icon="fa-solid fa-envelope" class="me-2" />
                E-Mail
              </label>
              <input 
                type="text" 
                class="form-control" 
                v-model="email"
                placeholder="E-Mail-Adresse eingeben"
              >
            </div>
            <div class="col-md-6">
              <label class="form-label">
                <font-awesome-icon icon="fa-solid fa-users" class="me-2" />
                Vereine
              </label>
              <VueMultiselect 
                v-model="club" 
                :options="options" 
                :multiple="true" 
                :searchable="true"
                select-label="Drücke Enter zum Auswählen"
                select-group-label="Drücke Enter zum Auswählen der Gruppe"
                selected-label="Ausgewählt"
                deselect-label="Drücke Enter zum Entfernen"
                deselect-group-label="Drücke Enter zum Abwählen der Gruppe"
                placeholder="Vereine auswählen..."
                :show-labels="true"
                :limit="10"
                :limit-text="limitText"
                :show-no-options="true"
                :show-no-results="true"
                key="1">
              </VueMultiselect>
            </div>
          </div>
          
          <div class="mt-3">
            <button class="btn btn-primary" @click="register()">
              <font-awesome-icon icon="fa-solid fa-plus" class="me-2" />
              Benutzer anlegen
            </button>
          </div>
        </div>
      </div>

      <!-- Benutzerliste -->
      <div class="profile-section">
        <h4 class="section-title">
          <font-awesome-icon icon="fa-solid fa-list" class="me-2" />
          Benutzerliste
        </h4>
        
        <div class="info-card">
          <div class="row mb-3">
            <div class="col-md-6">
              <div class="input-group">
                <span class="input-group-text">
                  <font-awesome-icon icon="fa-solid fa-search" />
                </span>
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="Benutzer suchen..." 
                  v-model="searchQuery"
                >
              </div>
            </div>
            <div class="col-md-6 text-end">
              <span class="text-white">{{ filteredUsers.length }} von {{ user.length }} Benutzern</span>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-dark table-striped">
              <thead>
              <tr>
                <th scope="col">E-Mail</th>
                <th scope="col">Vereine</th>
                <th scope="col">Bearbeiten</th>
                <th scope="col">Löschen</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="_u in filteredUsers" :key="_u._id">
                <td>{{ _u.email }}</td>
                <td>
                  <span class="club-badge me-1" v-for="club in _u.club" :key="club">
                    {{ club }}
                  </span>
                </td>
                <td @click="editHandler(_u)" class="text-center">
                  <font-awesome-icon icon="fa-solid fa-pen-to-square" class="action-icon"/>
                </td>
                <td class="text-center text-danger" @click="remove(_u.email)">
                  <font-awesome-icon icon="fa-solid fa-trash" class="action-icon"/>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Edit Modal -->
    <div v-if="edit" class="edit-overlay">
      <div class="edit-modal">
        <div class="profile-section">
          <h4 class="section-title">
            <font-awesome-icon icon="fa-solid fa-edit" class="me-2" />
            Benutzer bearbeiten
          </h4>
          
          <div class="info-card">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">
                  <font-awesome-icon icon="fa-solid fa-envelope" class="me-2" />
                  E-Mail
                </label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="editEmail"
                  placeholder="E-Mail-Adresse"
                >
              </div>
              <div class="col-md-6">
                <label class="form-label">
                  <font-awesome-icon icon="fa-solid fa-users" class="me-2" />
                  Vereine
                </label>
                <VueMultiselect 
                  v-model="editClub" 
                  :options="options" 
                  :multiple="true" 
                  :searchable="true"
                  select-label="Drücke Enter zum Auswählen"
                  select-group-label="Drücke Enter zum Auswählen der Gruppe"
                  selected-label="Ausgewählt"
                  deselect-label="Drücke Enter zum Entfernen"
                  deselect-group-label="Drücke Enter zum Abwählen der Gruppe"
                  placeholder="Vereine auswählen..."
                  key="2">
                </VueMultiselect>
              </div>
            </div>
            
            <div class="mt-3 d-flex gap-2">
              <button class="btn btn-primary" @click="save()">
                <font-awesome-icon icon="fa-solid fa-save" class="me-2" />
                Speichern
              </button>
              <button class="btn btn-outline-secondary" @click="edit = false">
                <font-awesome-icon icon="fa-solid fa-times" class="me-2" />
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import UserService from "@/services/user.service"
import GamesService from "@/services/games.service"
import AuthService from "@/services/auth.service"
import VueMultiselect from 'vue-multiselect'

const user = ref([])
const club = ref(null)
const email = ref("")
const options = ref(['list', 'of', 'options'])
const edit = ref(false)
const editClub = ref([])
const editEmail = ref("")
const editId = ref("")
const searchQuery = ref("")

const limitText = (count) => {
  return `und ${count} weitere`
}

const filteredUsers = computed(() => {
  if (!searchQuery.value) {
    return user.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return user.value.filter(_u => {
    const emailMatch = _u.email.toLowerCase().includes(query)
    const clubMatch = _u.club.some(club => club.toLowerCase().includes(query))
    return emailMatch || clubMatch
  })
})

const register = async () => {
  await AuthService.register({email: email.value, club: club.value})
  user.value = await UserService.list()
}

const remove = async (email) => {
  if (confirm("Wirklich löschen ?")) {
    await AuthService.delete({email: email})
    user.value = await UserService.list()
  }
}

const editHandler = (_u) => {
  edit.value = true
  editClub.value = _u.club
  editEmail.value = _u.email
  editId.value = _u._id
}

const save = async () => {
  await UserService.updateData({
    email: editEmail.value,
    id: editId.value,
    club: editClub.value
  }).then(() => {
    edit.value = false
    editClub.value = ""
    editEmail.value = ""
    editId.value = ""
  })
  user.value = await UserService.list()
}

onMounted(async () => {
  user.value = await UserService.list()
  options.value = await GamesService.vereine()
})
</script>

<style scoped>
.user-container {
  padding: 2rem 0;
}

.profile-section {
  margin-bottom: 3rem;
}

.section-title {
  color: #ffffff;
  margin-bottom: 1.5rem;
  font-weight: 600;
  border-bottom: 2px solid #ffffff;
  padding-bottom: 0.5rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.info-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.info-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.form-label {
  color: #ffffff;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.form-control {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  backdrop-filter: blur(5px);
}

.form-control:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: #ffffff;
  box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.form-control::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.input-group-text {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  backdrop-filter: blur(5px);
}

.btn-primary {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: #ffffff;
  backdrop-filter: blur(5px);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.btn-primary:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.4);
  color: #ffffff;
  transform: translateY(-1px);
}

.btn-outline-secondary {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  color: #ffffff;
}

.btn-outline-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  color: #ffffff;
}

.table {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  overflow: hidden;
}

.table th {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.table td {
  border-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  vertical-align: middle;
}

.club-badge {
  display: inline-block;
  background: #ffffff;
  color: var(--bs-primary);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  margin: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.action-icon {
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0.5rem;
  border-radius: 0.25rem;
}

.action-icon:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

.edit-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.edit-modal {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  border-radius: 1rem;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.gap-2 {
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .edit-modal {
    margin: 1rem;
    padding: 1rem;
  }
  
  .table-responsive {
    font-size: 0.875rem;
  }
}
</style>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>