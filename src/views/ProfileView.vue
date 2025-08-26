<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h3>Profil bearbeiten</h3>
          </div>
          <div class="card-body">
            <!-- Profil-Formular -->
            <form @submit.prevent="updateProfile" class="mb-4">
              <div class="mb-3">
                <label for="name" class="form-label">Name</label>
                <input
                  type="text"
                  class="form-control"
                  id="name"
                  v-model="profileForm.name"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">E-Mail</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="profileForm.email"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="username" class="form-label">Benutzername</label>
                <input
                  type="text"
                  class="form-control"
                  id="username"
                  v-model="profileForm.username"
                  required
                />
              </div>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                {{ loading ? 'Speichern...' : 'Profil speichern' }}
              </button>
            </form>

            <hr />

            <!-- Passwort-Änderung -->
            <form @submit.prevent="changePassword">
              <h4>Passwort ändern</h4>
              <div class="mb-3">
                <label for="currentPassword" class="form-label">Aktuelles Passwort</label>
                <input
                  type="password"
                  class="form-control"
                  id="currentPassword"
                  v-model="passwordForm.currentPassword"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="newPassword" class="form-label">Neues Passwort</label>
                <input
                  type="password"
                  class="form-control"
                  id="newPassword"
                  v-model="passwordForm.newPassword"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Neues Passwort bestätigen</label>
                <input
                  type="password"
                  class="form-control"
                  id="confirmPassword"
                  v-model="passwordForm.confirmPassword"
                  required
                />
              </div>
              <button type="submit" class="btn btn-warning" :disabled="passwordLoading">
                {{ passwordLoading ? 'Ändern...' : 'Passwort ändern' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import UserService from '@/services/user.service'

const authStore = useAuthStore()
const loading = ref(false)
const passwordLoading = ref(false)

const profileForm = ref({
  name: '',
  email: '',
  username: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

onMounted(async () => {
  try {
    const profile = await UserService.getProfile()
    profileForm.value = {
      name: profile.name || '',
      email: profile.email || '',
      username: profile.username || ''
    }
  } catch (error) {
    console.error('Fehler beim Laden des Profils:', error)
  }
})

const updateProfile = async () => {
  loading.value = true
  try {
    await UserService.updateProfile(profileForm.value)
    // Aktualisiere den Store
    await authStore.setUser(profileForm.value)
    alert('Profil erfolgreich aktualisiert!')
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Profils:', error)
    alert('Fehler beim Aktualisieren des Profils')
  } finally {
    loading.value = false
  }
}

const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('Die neuen Passwörter stimmen nicht überein!')
    return
  }

  passwordLoading.value = true
  try {
    await UserService.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    
    // Formular zurücksetzen
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    
    alert('Passwort erfolgreich geändert!')
  } catch (error) {
    console.error('Fehler beim Ändern des Passworts:', error)
    alert('Fehler beim Ändern des Passworts')
  } finally {
    passwordLoading.value = false
  }
}
</script>

<style scoped>
.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.btn {
  min-width: 120px;
}
</style>

