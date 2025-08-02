<template>
  <div class="link-container">
    <div class="container">
      
      <!-- Link erstellen -->
      <div class="profile-section">
        <h4 class="section-title">
          <font-awesome-icon icon="fa-solid fa-link" class="me-2" />
          Link erstellen
        </h4>
        
        <div class="info-card">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">
                <font-awesome-icon icon="fa-solid fa-link" class="me-2" />
                Link-URL
              </label>
              <div class="input-group">
                <span class="input-group-text">https://srbasar.de/link/</span>
                <input 
                  type="text" 
                  class="form-control" 
                  :class="{'is-invalid' : invalid || already}" 
                  v-model="link" 
                  placeholder="Link-Name eingeben"
                >
              </div>
              <div v-if="invalid" class="invalid-feedback d-block">
                Bitte Link eingeben
              </div>
              <div v-if="already" class="invalid-feedback d-block">
                Link wird bereits verwendet, bitte einen anderen wählen
              </div>
            </div>
            
            <div class="col-md-6">
              <label class="form-label">
                <font-awesome-icon icon="fa-solid fa-certificate" class="me-2" />
                Lizenzstufe
              </label>
              <div class="dropdown">
                <button 
                  class="btn btn-outline-light dropdown-toggle w-100" 
                  type="button" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  {{ lizenzstufe }}
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><a class="dropdown-item" @click="lizenzstufe ='LSE'">LSE</a></li>
                  <li><a class="dropdown-item" @click="lizenzstufe ='LSE+ | LSD'">LSE+ | LSD</a></li>
                  <li><a class="dropdown-item" @click="lizenzstufe ='LSD'">LSD</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div class="row g-3 mt-3">
            <div class="col-md-6">
              <label class="form-label">
                <font-awesome-icon icon="fa-solid fa-users" class="me-2" />
                Vereine
              </label>
              <div class="dropdown">
                <button 
                  class="btn btn-outline-light dropdown-toggle w-100" 
                  type="button" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  {{ clubs }}
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><a class="dropdown-item" @click="clubs ='ALLE'">Alle meine Vereine</a></li>
                  <li v-for="club of user?.club" :key="club">
                    <a class="dropdown-item" @click="clubs = club">{{ club }}</a>
                  </li>
                </ul>
              </div>
            </div>
            
            <div class="col-md-6">
              <label class="form-label">
                <font-awesome-icon icon="fa-solid fa-eye" class="me-2" />
                Link-Typ
              </label>
              <div class="form-check form-switch">
                <input 
                  type="checkbox" 
                  class="form-check-input" 
                  id="onlyShow" 
                  v-model="onlyShow"
                >
                <label class="form-check-label" for="onlyShow">
                  {{ onlyShow ? "Nur anzeigen (keine Eintragung)" : "Eintragung möglich" }}
                </label>
              </div>
            </div>
          </div>
          
          <div class="row g-3 mt-3">
            <div class="col-md-6">
              <label class="form-label">
                <font-awesome-icon icon="fa-solid fa-calendar" class="me-2" />
                Start-Datum
              </label>
              <input 
                type="date" 
                class="form-control" 
                :class="{'is-invalid' : invalid || already}" 
                v-model="start" 
                :min="(new Date()).toISOString().split('T')[0]" 
                :max="`${(new Date).getFullYear() +1}-05-31`"
              >
            </div>
            
            <div class="col-md-6">
              <label class="form-label">
                <font-awesome-icon icon="fa-solid fa-calendar" class="me-2" />
                End-Datum
              </label>
              <input 
                type="date" 
                class="form-control" 
                :class="{'is-invalid' : invalid || already}" 
                v-model="ende" 
                :min="start || (new Date()).toISOString().split('T')[0]"  
                :max="`${(new Date).getFullYear() +1}-05-31`"
              >
            </div>
          </div>
          
          <div class="mt-3">
            <button class="btn btn-primary" @click="create">
              <font-awesome-icon icon="fa-solid fa-plus" class="me-2" />
              Link erstellen
            </button>
          </div>
        </div>
      </div>

      <!-- Link-Liste -->
      <div class="profile-section">
        <h4 class="section-title">
          <font-awesome-icon icon="fa-solid fa-list" class="me-2" />
          Meine Links
        </h4>
        
        <div class="info-card">
          <link-view-list :links="links" @update="getLinks"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import LinkService from "@/services/link.service"
import LinkViewList from "@/components/LinkViewList.vue"

const authStore = useAuthStore()
const user = computed(() => authStore.getCurrentUser())

const lizenzstufe = ref("LSD")
const link = ref(null)
const onlyShow = ref(false)
const invalid = ref(false)
const already = ref(false)
const start = ref((new Date()).toISOString().split('T')[0])
const clubs = ref("ALLE")
const ende = ref(null)
const links = ref([])

const create = async () => {
  invalid.value = false
  already.value = false
  if(!link.value || lizenzstufe.value === "Lizenzstufe"){
    invalid.value = true
    return
  }
  const res = await LinkService.add({
    alias: link.value, 
    onlyShow: onlyShow.value, 
    start: start.value, 
    end: ende.value, 
    lizenzstufe: lizenzstufe.value, 
    verein: clubs.value
  })
  if(res === false){
    already.value = true
  } else {
    await getLinks()
    link.value = null
  }
}

const getLinks = async () => {
  links.value = await LinkService.get()
}

onMounted(async () => {
  await getLinks()
})
</script>

<style scoped>
.link-container {
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

.btn-outline-light {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  color: #ffffff;
  backdrop-filter: blur(5px);
}

.btn-outline-light:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  color: #ffffff;
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

.dropdown-menu {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
}

.dropdown-item {
  color: #ffffff;
  transition: all 0.3s ease;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.form-check-input {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.form-check-input:checked {
  background-color: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.25);
}

.form-check-input:focus {
  background-color: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.25);
}

.form-check-input:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.form-check-label {
  color: #ffffff;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.form-check-label:hover {
  color: rgba(255, 255, 255, 0.9);
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

@media (max-width: 768px) {
  .info-card {
    padding: 1rem;
  }
}
</style>
