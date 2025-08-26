<template>
  <div class="admin-users-container">
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h3 class="mb-0">
          <font-awesome-icon icon="fa-solid fa-users-cog" class="me-2" />
          Benutzerverwaltung
        </h3>
        <button 
          @click="showCreateModal = true" 
          class="btn btn-primary"
        >
          <font-awesome-icon icon="fa-solid fa-user-plus" class="me-2" />
          Neuer Benutzer
        </button>
      </div>
      
      <div class="card-body">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Laden...</span>
          </div>
        </div>

        <!-- Users Table -->
        <div v-else-if="users.length > 0" class="table-responsive">
          <table class="table table-striped table-hover">
            <thead class="table-dark">
              <tr>
                <th>ID</th>
                <th>Benutzername</th>
                <th>Name</th>
                <th>E-Mail</th>
                <th>Rolle</th>
                <th>Erstellt am</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.id }}</td>
                <td>
                  <strong>{{ user.username }}</strong>
                </td>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span 
                    :class="getRoleBadgeClass(user.role)"
                    class="badge"
                  >
                    {{ getRoleDisplayName(user.role) }}
                  </span>
                </td>
                <td>{{ formatDate(user.createdAt) }}</td>
                <td>
                  <div class="btn-group btn-group-sm" role="group">
                    <button 
                      @click="editUser(user)"
                      class="btn btn-outline-primary"
                      title="Rolle ändern"
                    >
                      <font-awesome-icon icon="fa-solid fa-edit" />
                    </button>
                    <button 
                      @click="confirmDeleteUser(user)"
                      class="btn btn-outline-danger"
                      title="Benutzer löschen"
                      :disabled="user.id === currentUserId"
                    >
                      <font-awesome-icon icon="fa-solid fa-trash" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-4">
          <font-awesome-icon icon="fa-solid fa-users" class="fa-3x text-muted mb-3" />
          <p class="text-muted">Keine Benutzer gefunden</p>
        </div>
      </div>
    </div>

    <!-- Create User Modal -->
    <div 
      v-if="showCreateModal" 
      class="modal fade show d-block" 
      tabindex="-1"
      style="background-color: rgba(0,0,0,0.5);"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Neuen Benutzer erstellen</h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="closeCreateModal"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="createUser">
              <div class="mb-3">
                <label for="username" class="form-label">Benutzername</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="username"
                  v-model="newUser.username"
                  required
                  minlength="3"
                  maxlength="50"
                />
              </div>
              <div class="mb-3">
                <label for="name" class="form-label">Name</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="name"
                  v-model="newUser.name"
                  required
                  minlength="2"
                  maxlength="100"
                />
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">E-Mail</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="email"
                  v-model="newUser.email"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="role" class="form-label">Rolle</label>
                <select 
                  class="form-select" 
                  id="role"
                  v-model="newUser.role"
                  required
                >
                  <option value="user">Benutzer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="closeCreateModal"
            >
              Abbrechen
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="createUser"
              :disabled="createLoading"
            >
              <span v-if="createLoading" class="spinner-border spinner-border-sm me-2"></span>
              Benutzer erstellen
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Role Modal -->
    <div 
      v-if="showEditModal" 
      class="modal fade show d-block" 
      tabindex="-1"
      style="background-color: rgba(0,0,0,0.5);"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Rolle ändern</h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="closeEditModal"
            ></button>
          </div>
          <div class="modal-body">
            <p>Rolle für Benutzer <strong>{{ editingUser?.name }} ({{ editingUser?.username }})</strong> ändern:</p>
            <div class="mb-3">
              <label for="editRole" class="form-label">Neue Rolle</label>
              <select 
                class="form-select" 
                id="editRole"
                v-model="editingUser.role"
              >
                <option value="user">Benutzer</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="closeEditModal"
            >
              Abbrechen
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="updateUserRole"
              :disabled="updateLoading"
            >
              <span v-if="updateLoading" class="spinner-border spinner-border-sm me-2"></span>
              Rolle aktualisieren
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div 
      v-if="showDeleteModal" 
      class="modal fade show d-block" 
      tabindex="-1"
      style="background-color: rgba(0,0,0,0.5);"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-danger">Benutzer löschen</h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="closeDeleteModal"
            ></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-danger">
              <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="me-2" />
              <strong>Achtung!</strong> Diese Aktion kann nicht rückgängig gemacht werden.
            </div>
            <p>Möchten Sie den Benutzer <strong>{{ userToDelete?.name }} ({{ userToDelete?.username }})</strong> wirklich löschen?</p>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="closeDeleteModal"
            >
              Abbrechen
            </button>
            <button 
              type="button" 
              class="btn btn-danger" 
              @click="deleteUser"
              :disabled="deleteLoading"
            >
              <span v-if="deleteLoading" class="spinner-border spinner-border-sm me-2"></span>
              Benutzer löschen
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Messages -->
    <div 
      v-if="toastMessage" 
      class="toast-container position-fixed top-0 end-0 p-3"
    >
      <div class="toast show" role="alert">
        <div class="toast-header" :class="toastClass">
          <strong class="me-auto">{{ toastTitle }}</strong>
          <button 
            type="button" 
            class="btn-close" 
            @click="hideToast"
          ></button>
        </div>
        <div class="toast-body">
          {{ toastMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import AdminService from '@/services/admin.service'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const authStore = useAuthStore()

// Reactive data
const users = ref([])
const loading = ref(false)
const createLoading = ref(false)
const updateLoading = ref(false)
const deleteLoading = ref(false)

// Modals
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

// Form data
const newUser = ref({
  username: '',
  name: '',
  email: '',
  role: 'user'
})

const editingUser = ref(null)
const userToDelete = ref(null)

// Toast
const toastMessage = ref('')
const toastTitle = ref('')
const toastType = ref('success')

// Computed
const currentUserId = computed(() => authStore.getCurrentUser()?.id)

const toastClass = computed(() => {
  return toastType.value === 'success' ? 'text-success' : 'text-danger'
})

// Methods
const loadUsers = async () => {
  loading.value = true
  try {
    const response = await AdminService.getAllUsers()
    users.value = response.data || []
  } catch (error) {
    showToast('Fehler beim Laden der Benutzer', 'error')
    console.error('Fehler beim Laden der Benutzer:', error)
  } finally {
    loading.value = false
  }
}

const createUser = async () => {
  createLoading.value = true
  try {
    await AdminService.createUser(newUser.value)
    showToast('Benutzer erfolgreich erstellt und Willkommens-E-Mail gesendet', 'success')
    closeCreateModal()
    await loadUsers()
  } catch (error) {
    const message = error.response?.data?.message || 'Fehler beim Erstellen des Benutzers'
    showToast(message, 'error')
  } finally {
    createLoading.value = false
  }
}

const editUser = (user) => {
  editingUser.value = { ...user }
  showEditModal.value = true
}

const updateUserRole = async () => {
  updateLoading.value = true
  try {
    await AdminService.updateUserRole(editingUser.value.id, editingUser.value.role)
    showToast('Benutzerrolle erfolgreich aktualisiert', 'success')
    closeEditModal()
    await loadUsers()
  } catch (error) {
    const message = error.response?.data?.message || 'Fehler beim Aktualisieren der Rolle'
    showToast(message, 'error')
  } finally {
    updateLoading.value = false
  }
}

const confirmDeleteUser = (user) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const deleteUser = async () => {
  deleteLoading.value = true
  try {
    await AdminService.deleteUser(userToDelete.value.id)
    showToast('Benutzer erfolgreich gelöscht', 'success')
    closeDeleteModal()
    await loadUsers()
  } catch (error) {
    const message = error.response?.data?.message || 'Fehler beim Löschen des Benutzers'
    showToast(message, 'error')
  } finally {
    deleteLoading.value = false
  }
}

const closeCreateModal = () => {
  showCreateModal.value = false
  newUser.value = {
    username: '',
    name: '',
    email: '',
    role: 'user'
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  editingUser.value = null
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  userToDelete.value = null
}

const showToast = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  toastTitle.value = type === 'success' ? 'Erfolg' : 'Fehler'
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    hideToast()
  }, 5000)
}

const hideToast = () => {
  toastMessage.value = ''
}

const getRoleBadgeClass = (role) => {
  return role === 'admin' ? 'bg-danger' : 'bg-primary'
}

const getRoleDisplayName = (role) => {
  return role === 'admin' ? 'Administrator' : 'Benutzer'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.admin-users-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.card {
  border: none;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.card-header {
  background: linear-gradient(135deg, var(--bs-primary), var(--bs-dark));
  color: white;
  border-radius: 0.5rem 0.5rem 0 0;
  padding: 1.5rem;
}

.table {
  margin-bottom: 0;
  background: white !important;
}

.table th {
  border-top: none;
  font-weight: 600;
  background: #f8f9fa !important;
  color: #212529 !important;
  border-bottom: 2px solid #dee2e6;
}

.table td {
  background: white !important;
  color: #212529 !important;
  border-bottom: 1px solid #dee2e6;
  vertical-align: middle;
}

.table tbody tr:hover {
  background: #f8f9fa !important;
}

.table tbody tr:hover td {
  background: #f8f9fa !important;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
}

.modal-content {
  border-radius: 0.5rem;
  border: none;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.modal-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.modal-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.125);
}

.toast-container {
  z-index: 1055;
}

.toast {
  border-radius: 0.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  background: white !important;
  border: 1px solid #dee2e6;
}

.toast-header {
  background: white !important;
  color: #212529 !important;
  border-bottom: 1px solid #dee2e6;
}

.toast-body {
  background: white !important;
  color: #212529 !important;
}

.toast.show .toast-header.text-success {
  color: #198754 !important;
}

.toast.show .toast-header.text-danger {
  color: #dc3545 !important;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* Modal-spezifische Styles - überschreibt die globalen Glasmorphismus-Styles */
.modal-content .form-control,
.modal-content .form-select {
  background: #ffffff !important;
  border: 1px solid #ced4da !important;
  color: #495057 !important;
}

.modal-content .form-control:focus,
.modal-content .form-select:focus {
  background: #ffffff !important;
  border-color: #86b7fe !important;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
  color: #495057 !important;
}

.modal-content .form-control::placeholder {
  color: #6c757d !important;
}

.modal-content .form-label {
  color: #212529 !important;
  font-weight: 500;
}

@media (max-width: 768px) {
  .admin-users-container {
    padding: 0.5rem;
  }
  
  .card-header {
    padding: 1rem;
  }
  
  .card-header h3 {
    font-size: 1.25rem;
  }
  
  .btn-group-sm .btn {
    padding: 0.125rem 0.25rem;
    font-size: 0.75rem;
  }
}
</style>