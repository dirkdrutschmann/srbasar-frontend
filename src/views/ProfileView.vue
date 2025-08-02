<template>
  <div class="profile-container">
    <div class="container">
      
      <!-- Benutzer-Informationen -->
      <div class="profile-section">
        <h4 class="section-title">
          <font-awesome-icon icon="fa-solid fa-user" class="me-2" />
          Benutzer-Informationen
        </h4>
        
        <div class="info-card">
          <div class="info-row">
            <label class="info-label">
              <font-awesome-icon icon="fa-solid fa-envelope" class="me-2" />
              E-Mail
            </label>
            <div class="info-value">
              <input 
                v-model="user.email" 
                class="form-control-plaintext text-end" 
                readonly 
                type="text"
              >
            </div>
          </div>
          
          <div class="info-row">
            <label class="info-label">
              <font-awesome-icon icon="fa-solid fa-users" class="me-2" />
              Vereine
            </label>
            <div class="info-value text-end">
              <div v-for="(club, index) in user.club" :key="index" class="club-badge">
                {{ club }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Passwort-Änderung -->
      <div class="profile-section">
        <h4 class="section-title">
          <font-awesome-icon icon="fa-solid fa-lock" class="me-2" />
          Passwort ändern
        </h4>
        
        <div class="password-card">
          <form @submit.prevent="updatePass" novalidate>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">
                  <font-awesome-icon icon="fa-solid fa-key" class="me-2" />
                  Neues Passwort
                </label>
                <div class="input-group">
                  <input 
                    v-model="pass" 
                    :class="{'is-invalid': passwordError, 'is-valid': passwordValid}" 
                    class="form-control"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Mindestens 6 Zeichen"
                    required
                    minlength="6"
                  >
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary"
                    @click="showPassword = !showPassword"
                  >
                    <font-awesome-icon :icon="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" />
                  </button>
                </div>
                <div v-if="passwordError" class="invalid-feedback d-block">
                  {{ passwordError }}
                </div>
              </div>
              
              <div class="col-md-6">
                <label class="form-label">
                  <font-awesome-icon icon="fa-solid fa-check" class="me-2" />
                  Passwort bestätigen
                </label>
                <div class="input-group">
                  <input 
                    v-model="control" 
                    :class="{'is-invalid': confirmError, 'is-valid': confirmValid}" 
                    class="form-control"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    placeholder="Passwort wiederholen"
                    required
                  >
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary"
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    <font-awesome-icon :icon="showConfirmPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" />
                  </button>
                </div>
                <div v-if="confirmError" class="invalid-feedback d-block">
                  {{ confirmError }}
                </div>
              </div>
            </div>
            
            <div class="feedback-container mt-3">
              <div ref="feedback" class="alert alert-danger" style="display: none;"></div>
              <div ref="valid" class="alert alert-success" style="display: none;"></div>
            </div>
            
            <div class="mt-3">
              <button 
                class="btn btn-primary" 
                type="submit"
                :disabled="!isFormValid"
              >
                <font-awesome-icon icon="fa-solid fa-save" class="me-2" />
                Passwort speichern
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Kontakt-Einstellungen -->
      <div class="profile-section">
        <h4 class="section-title">
          <font-awesome-icon icon="fa-solid fa-cog" class="me-2" />
          Kontakt-Einstellungen
        </h4>
        <p class="text-muted mb-4">
          <font-awesome-icon icon="fa-solid fa-info-circle" class="me-2" />
          Änderungen werden automatisch gespeichert
        </p>
        
        <div class="settings-card">
          <!-- Sichtbarkeits-Einstellungen -->
          <div class="settings-group">
            <h6 class="settings-subtitle">
              <font-awesome-icon icon="fa-solid fa-eye" class="me-2" />
              Sichtbarkeit
            </h6>
            
            <div class="settings-grid">
              <div class="setting-item">
                <input 
                  id="getEmail" 
                  v-model="getEmails" 
                  class="btn-check" 
                  type="checkbox"
                  @change="updateData"
                >
                <label 
                  :class="getEmails ? 'btn btn-success' : 'btn btn-outline-secondary'" 
                  for="getEmail"
                >
                  <font-awesome-icon :icon="getEmails ? 'fa-solid fa-check' : 'fa-solid fa-times'" class="me-2" />
                  {{ getEmails ? 'E-Mail-Feld aktiv' : 'E-Mail-Feld deaktiviert' }}
                </label>
              </div>

              <div class="setting-item">
                <input 
                  id="showContact" 
                  v-model="showContact" 
                  class="btn-check" 
                  type="checkbox"
                  @change="updateData"
                >
                <label 
                  :class="showContact ? 'btn btn-success' : 'btn btn-outline-secondary'" 
                  for="showContact"
                >
                  <font-awesome-icon :icon="showContact ? 'fa-solid fa-check' : 'fa-solid fa-times'" class="me-2" />
                  {{ showContact ? 'Telefonnummer sichtbar' : 'Telefonnummer versteckt' }}
                </label>
              </div>

              <div class="setting-item">
                <input 
                  id="whatsapp" 
                  v-model="whatsapp" 
                  class="btn-check" 
                  type="checkbox"
                  @change="updateData"
                  :disabled="!showContact"
                >
                <label 
                  :class="[
                    whatsapp && showContact ? 'btn btn-success' : 'btn btn-outline-secondary',
                    { 'disabled': !showContact }
                  ]" 
                  for="whatsapp"
                >
                  <font-awesome-icon :icon="whatsapp ? 'fa-solid fa-check' : 'fa-solid fa-times'" class="me-2" />
                  {{ whatsapp ? 'WhatsApp aktiv' : 'WhatsApp deaktiviert' }}
                </label>
              </div>

              <div class="setting-item">
                <input 
                  id="showInfo" 
                  v-model="showInfo" 
                  class="btn-check" 
                  type="checkbox"
                  @change="updateData"
                >
                <label 
                  :class="showInfo ? 'btn btn-success' : 'btn btn-outline-secondary'" 
                  for="showInfo"
                >
                  <font-awesome-icon :icon="showInfo ? 'fa-solid fa-check' : 'fa-solid fa-times'" class="me-2" />
                  {{ showInfo ? 'Kontaktinfo sichtbar' : 'Kontaktinfo versteckt' }}
                </label>
              </div>

              <div class="setting-item">
                <input 
                  id="showMail" 
                  v-model="showMail" 
                  class="btn-check" 
                  type="checkbox"
                  @change="updateData"
                >
                <label 
                  :class="showMail ? 'btn btn-success' : 'btn btn-outline-secondary'" 
                  for="showMail"
                >
                  <font-awesome-icon :icon="showMail ? 'fa-solid fa-check' : 'fa-solid fa-times'" class="me-2" />
                  {{ showMail ? 'E-Mail sichtbar' : 'E-Mail versteckt' }}
                </label>
              </div>
            </div>
          </div>

          <!-- Kontakt-Daten -->
          <div class="contact-data mt-4">
            <h6 class="settings-subtitle">
              <font-awesome-icon icon="fa-solid fa-address-card" class="me-2" />
              Kontakt-Daten
            </h6>
            
            <div class="row">
              <div class="dark col-md-8 mx-auto">
                <MazInput 
                  v-model="name" 
                  label="Vollständiger Name" 
                  placeholder="Ihr vollständiger Name"
                  v-debounce:750ms="updateData"
                  class="w-100 my-3"
                />
              </div>
              
              <div class="dark col-md-8 mx-auto" v-if="showContact">
                <MazPhoneNumberInput
                  v-model="phone"
                  :preferred-countries="['DE','FR', 'BE', 'US', 'GB']"
                  :success="results?.isValid"
                  :default-country-code="'DE'"
                  :translations="{
                    countrySelector: {
                      placeholder: 'Länderkennung',
                      error: 'Wähle ein Land',
                    },
                    phoneInput: {
                      placeholder: 'Telefonnummer',
                      example: 'Beispiel:',
                    },
                  }"
                  color="info"
                  show-code-on-list
                  @update="results= $event;"
                  class="w-100 my-3"
                  v-debounce:750ms="updateData"
                />
              </div>
            </div>

            <div class="col-md-8 mx-auto mt-3" v-if="showInfo">
              <label class="form-label">
                <font-awesome-icon icon="fa-solid fa-comment" class="me-2" />
                Zusätzliche Kontaktinformationen
              </label>
              <textarea 
                id="contactInfo" 
                v-model="contactInfo" 
                v-debounce:750ms="updateData" 
                class="form-control"
                placeholder="Zusätzliche Informationen für Kontaktanfragen..."
                rows="4"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import UserService from "../services/user.service.js";
import MazPhoneNumberInput from 'maz-ui/components/MazPhoneNumberInput'
import MazInput from 'maz-ui/components/MazInput'

const router = useRouter()
const authStore = useAuthStore()

const pass = ref('')
const control = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const passwordError = ref('')
const confirmError = ref('')
const passwordValid = ref(false)
const confirmValid = ref(false)
const user = ref({})
const contactInfo = ref('')
const phone = ref('')
const name = ref('')
const getEmails = ref(false)
const showContact = ref(false)
const whatsapp = ref(false)
const showInfo = ref(false)
const showMail = ref(false)
const results = ref(null)
const feedback = ref(null)
const valid = ref(null)

const currentUser = computed(() => authStore.getCurrentUser())
const isAuthenticated = computed(() => authStore.getIsAuthenticated())

// Form Validation
const validatePassword = () => {
  if (!pass.value) {
    passwordError.value = 'Passwort ist erforderlich'
    passwordValid.value = false
    return false
  }
  if (pass.value.length < 6) {
    passwordError.value = 'Passwort muss mindestens 6 Zeichen lang sein'
    passwordValid.value = false
    return false
  }
  passwordError.value = ''
  passwordValid.value = true
  return true
}

const validateConfirm = () => {
  if (!control.value) {
    confirmError.value = 'Passwort-Bestätigung ist erforderlich'
    confirmValid.value = false
    return false
  }
  if (pass.value !== control.value) {
    confirmError.value = 'Passwörter stimmen nicht überein'
    confirmValid.value = false
    return false
  }
  confirmError.value = ''
  confirmValid.value = true
  return true
}

const isFormValid = computed(() => {
  return validatePassword() && validateConfirm()
})

// Watch for changes
watch(pass, validatePassword)
watch(control, validateConfirm)

const updatePass = async () => {
  if (!isFormValid.value) {
    return
  }
  
  try {
    await UserService.updatePassword(pass.value)
    valid.value.innerHTML = 'Passwort erfolgreich geändert'
    valid.value.style.display = 'block'
    feedback.value.style.display = 'none'
    pass.value = ''
    control.value = ''
    showPassword.value = false
    showConfirmPassword.value = false
  } catch (error) {
    feedback.value.innerHTML = 'Fehler beim Ändern des Passworts'
    feedback.value.style.display = 'block'
    valid.value.style.display = 'none'
  }
}

const updateData = async () => {
  try {
    await UserService.updateUser({
      contactInfo: contactInfo.value,
      phone: phone.value,
      name: name.value,
      getEmails: getEmails.value,
      showContact: showContact.value,
      whatsapp: whatsapp.value,
      showInfo: showInfo.value,
      showMail: showMail.value
    })
  } catch (error) {
    console.error('Update error:', error)
  }
}

onMounted(() => {
  if (!isAuthenticated.value) {
    router.push('/login')
  }
  user.value = currentUser.value
  contactInfo.value = user.value.contactInfo
  phone.value = user.value.phone
  name.value = user.value.name ? user.value.name : []
})
</script>

<style scoped>
.profile-container {
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

.info-card, .password-card, .settings-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.info-card:hover, .password-card:hover, .settings-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.info-label {
  font-weight: 600;
  color: #ffffff;
  min-width: 120px;
  margin-right: 1rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.info-value {
  flex: 1;
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

.settings-subtitle {
  color: #ffffff;
  margin-bottom: 1rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.setting-item {
  margin-bottom: 0.5rem;
}

.setting-item .btn {
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
}

.setting-item .btn:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.setting-item .btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.setting-item .btn.btn-success {
  background: rgba(25, 135, 84, 0.3);
  border-color: rgba(25, 135, 84, 0.5);
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.setting-item .btn.btn-outline-secondary {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.9);
}

.feedback-container {
  min-height: 3rem;
}

.contact-data {
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.form-control-plaintext {
  color: #ffffff !important;
  background: transparent;
  border: none;
  padding: 0;
  font-weight: 500;
}

.form-control-plaintext:focus {
  box-shadow: none;
  outline: none;
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

.form-label {
  color: #ffffff;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
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

.btn-primary:disabled {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
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

.alert {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
}

.alert-danger {
  background: rgba(220, 53, 69, 0.2);
  border-color: rgba(220, 53, 69, 0.3);
  color: #f8d7da;
}

.alert-success {
  background: rgba(25, 135, 84, 0.2);
  border-color: rgba(25, 135, 84, 0.3);
  color: #d1e7dd;
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

.is-valid {
  border-color: rgba(25, 135, 84, 0.5) !important;
  box-shadow: 0 0 0 0.2rem rgba(25, 135, 84, 0.25) !important;
}

@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .info-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .info-label {
    margin-bottom: 0.5rem;
    margin-right: 0;
  }
}
</style>

