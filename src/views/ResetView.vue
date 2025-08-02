<template>
  <div class="reset-container">
    <div class="card reset-card">
      <div class="card-body">
        <div class="text-center mb-4">
          <h2 class="reset-title">Passwort vergessen</h2>
          <p class="text-muted">Geben Sie Ihre E-Mail-Adresse ein, um einen Reset-Link zu erhalten</p>
        </div>
        
        <form @submit.prevent="handleReset">
          <div class="mb-3">
            <label for="email" class="form-label">E-Mail</label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="form-control"
              placeholder="ihre.email@beispiel.de"
              required
              :class="{ 'is-invalid': error }"
            />
            <div v-if="error" class="invalid-feedback">
              {{ error }}
            </div>
          </div>
          
          <button
            type="submit"
            class="btn btn-primary btn-lg w-100"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'Wird gesendet...' : 'Reset-Link anfordern' }}
          </button>
        </form>
        
        <div v-if="message" class="alert alert-success mt-3" role="alert">
          <font-awesome-icon icon="fa-solid fa-check-circle" class="me-2" />
          {{ message }}
        </div>
        
        <div class="text-center mt-4">
          <router-link 
            :to="{name: 'login'}" 
            class="text-decoration-none"
          >
            Zurück zur Anmeldung
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import AuthService from "@/services/auth.service"

const router = useRouter()
const authStore = useAuthStore()

const email = ref("")
const loading = ref(false)
const message = ref('')
const error = ref('')

const isAuthenticated = computed(() => authStore.getIsAuthenticated())

onMounted(() => {
  if (isAuthenticated.value) {
    router.push('/profile')
  }
})

const handleReset = async () => {
  if (!email.value) {
    error.value = "Bitte geben Sie eine E-Mail-Adresse ein"
    return
  }
  
  loading.value = true
  error.value = ''
  message.value = ''
  
  try {
    await AuthService.reset(email.value)
    message.value = "Sollte es einen Benutzer mit dieser E-Mail-Adresse geben, wurde dir gerade ein Reset-Link zugesendet. Bitte überprüfe auch deinen Spam-Ordner. Der Link ist 24 Stunden gültig."
  } catch (err) {
    error.value = "Fehler beim Senden des Reset-Links"
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.reset-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.reset-card {
  max-width: 400px;
  width: 100%;
  background: var(--bs-dark);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.reset-title {
  color: white;
  font-weight: 600;
}

.form-label {
  color: white;
  font-weight: 500;
}

.form-control {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.form-control::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.form-control:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.5);
  color: white;
  box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.25);
}

.btn-primary {
  background: var(--bs-primary);
  border: none;
  font-weight: 500;
}

.btn-primary:hover {
  background: var(--bs-primary);
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.alert {
  background: rgba(25, 135, 84, 0.1);
  border: 1px solid rgba(25, 135, 84, 0.3);
  color: #d1e7dd;
}

.alert-danger {
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #f8d7da;
}

.text-decoration-none {
  color: rgba(255, 255, 255, 0.8);
}

.text-decoration-none:hover {
  color: white;
}

.invalid-feedback {
  color: #f8d7da;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.is-invalid {
  border-color: rgba(220, 53, 69, 0.5) !important;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
}
</style>