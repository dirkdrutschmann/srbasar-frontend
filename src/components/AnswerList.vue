<template>
  <div class="answer-container">
    <div class="container">
      
      <!-- Antworten-Header -->
      <div class="profile-section">
        <h4 class="section-title">
          <font-awesome-icon icon="fa-solid fa-list" class="me-2" />
          Antworten
        </h4>
        
        <div class="info-card">
          <p class="text-muted mb-4">
            <font-awesome-icon icon="fa-solid fa-info-circle" class="me-2" />
            Auf dieser Seite findest du die Antworten zum Link "{{route.params.link}}"
          </p>
          
          <div v-if="answers.length === 0" class="text-center py-5">
            <font-awesome-icon icon="fa-solid fa-inbox" class="display-1 text-muted mb-3" />
            <h5 class="text-muted">Keine Antworten vorhanden</h5>
            <p class="text-muted">Es wurden noch keine Antworten für diesen Link eingegangen.</p>
          </div>
          
          <div v-else>
            <div v-for="(answer, index) in answers" :key="index" class="answer-item mb-4">
              <div class="answer-header">
                <h5 class="answer-title">
                  <font-awesome-icon icon="fa-solid fa-user" class="me-2" />
                  Antwort {{index + 1}}
                </h5>
                <button 
                  type="button" 
                  class="btn btn-outline-danger btn-sm"
                  @click="deleteAnswer(answer)"
                >
                  <font-awesome-icon icon="fa-solid fa-trash" />
                </button>
              </div>
              
              <div class="answer-info">
                <div class="info-badges">
                  <span v-if="answer.name" class="info-badge">
                    <font-awesome-icon icon="fa-solid fa-user" class="me-1" />
                    {{answer.name}}
                  </span>
                  <span v-if="answer.lizenzstufe" class="info-badge">
                    <font-awesome-icon icon="fa-solid fa-certificate" class="me-1" />
                    {{answer.lizenzstufe}}
                  </span>
                  <span v-if="answer.email" class="info-badge">
                    <font-awesome-icon icon="fa-solid fa-envelope" class="me-1" />
                    {{answer.email}}
                  </span>
                  <span v-if="answer.telefon" class="info-badge">
                    <font-awesome-icon icon="fa-solid fa-phone" class="me-1" />
                    {{answer.telefon}}
                  </span>
                </div>
                
                <div v-if="answer.message" class="message-section">
                  <div class="message-content">
                    <font-awesome-icon icon="fa-solid fa-comment" class="me-2" />
                    <strong>Zusätzliche Mitteilung:</strong>
                  </div>
                  <blockquote class="message-text">
                    {{answer.message}}
                  </blockquote>
                </div>
              </div>
              
              <div class="games-section">
                <h6 class="games-title">
                  <font-awesome-icon icon="fa-solid fa-gamepad" class="me-2" />
                  Verfügbare Spiele
                </h6>
                
                <div class="games-list">
                  <div v-for="(game, gameIndex) in answer.games" :key="gameIndex" class="game-item">
                    <div class="game-header">
                      <div class="game-info">
                        <div class="game-date">
                          <font-awesome-icon icon="fa-solid fa-calendar" class="me-1" />
                          {{convertToGermanDate(game.kickoffDate)}}
                        </div>
                        <div class="game-time">
                          <font-awesome-icon icon="fa-solid fa-clock" class="me-1" />
                          {{game.kickoffTime}}
                        </div>
                        <div class="game-field">
                          <font-awesome-icon icon="fa-solid fa-map-marker-alt" class="me-1" />
                          {{game.spielfeld}}
                        </div>
                        <div class="game-league">
                          <font-awesome-icon icon="fa-solid fa-trophy" class="me-1" />
                          {{game.liganame}}
                        </div>
                      </div>
                      
                      <div class="game-teams">
                        <div class="team home-team">
                          <strong>{{game.homeTeam}}</strong>
                        </div>
                        <div class="vs">vs</div>
                        <div class="team guest-team">
                          <strong>{{game.guestTeam}}</strong>
                        </div>
                      </div>
                    </div>
                    
                    <div class="game-actions">
                      <!-- SR1 Section -->
                      <div class="sr-section" v-if="user?.club?.includes(game.sr1)">
                        <div class="sr-header">
                          <span class="sr-label">SR1</span>
                          <span class="sr-name">{{game.sr1}}</span>
                        </div>
                        
                        <div class="sr-status">
                          <span 
                            class="status-badge"
                            :class="{
                              'status-success': game.sr1Besetzt && !game.sr1Basar,
                              'status-warning': game.sr1Basar,
                              'status-danger': !game.sr1Besetzt && !game.sr1Basar
                            }"
                          >
                            {{getString(game.sr1Besetzt, game.sr1Basar)}}
                          </span>
                          
                          <span v-if="game.sr1Name" class="sr-assigned">{{game.sr1Name}}</span>
                          <span v-else-if="game.sr1Besetzt" class="sr-no-name">kein Name angegeben</span>
                        </div>
                        
                        <div class="sr-actions">
                          <button 
                            v-if="game.sr1Besetzt && game.sr1Name === answer.name && game.sr1Mail === answer.email"
                            class="btn btn-success btn-sm" 
                            disabled
                          >
                            <font-awesome-icon icon="fa-solid fa-check" class="me-1" />
                            bereits angesetzt
                          </button>
                          <button 
                            v-else-if="!game.sr1Besetzt"
                            class="btn btn-outline-success btn-sm"
                            @click="submit(1, game, answer)"
                          >
                            <font-awesome-icon icon="fa-solid fa-plus" class="me-1" />
                            ansetzen
                          </button>
                          <button 
                            v-else
                            class="btn btn-outline-danger btn-sm"
                            @click="submit(1, game, answer)"
                          >
                            <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="me-1" />
                            trotzdem ansetzen
                          </button>
                        </div>
                      </div>
                      
                      <div class="sr-section" v-else>
                        <div class="sr-header">
                          <span class="sr-label">SR1</span>
                          <span class="sr-name">{{game.sr1}}</span>
                        </div>
                        <span 
                          class="status-badge"
                          :class="{
                            'status-success': game.sr1Besetzt && !game.sr1Basar,
                            'status-warning': game.sr1Basar,
                            'status-danger': !game.sr1Besetzt && !game.sr1Basar
                          }"
                        >
                          {{getString(game.sr1Besetzt, game.sr1Basar)}}
                        </span>
                      </div>
                      
                      <!-- SR2 Section -->
                      <div class="sr-section" v-if="user?.club?.includes(game.sr2)">
                        <div class="sr-header">
                          <span class="sr-label">SR2</span>
                          <span class="sr-name">{{game.sr2}}</span>
                        </div>
                        
                        <div class="sr-status">
                          <span 
                            class="status-badge"
                            :class="{
                              'status-success': game.sr2Besetzt && !game.sr2Basar,
                              'status-warning': game.sr2Basar,
                              'status-danger': !game.sr2Besetzt && !game.sr2Basar
                            }"
                          >
                            {{getString(game.sr2Besetzt, game.sr2Basar)}}
                          </span>
                          
                          <span v-if="game.sr2Name" class="sr-assigned">{{game.sr2Name}}</span>
                          <span v-else-if="game.sr2Besetzt" class="sr-no-name">kein Name angegeben</span>
                        </div>
                        
                        <div class="sr-actions">
                          <button 
                            v-if="game.sr2Besetzt && game.sr2Name === answer.name && game.sr2Mail === answer.email"
                            class="btn btn-success btn-sm" 
                            disabled
                          >
                            <font-awesome-icon icon="fa-solid fa-check" class="me-1" />
                            bereits angesetzt
                          </button>
                          <button 
                            v-else-if="!game.sr2Besetzt"
                            class="btn btn-outline-success btn-sm"
                            @click="submit(2, game, answer)"
                          >
                            <font-awesome-icon icon="fa-solid fa-plus" class="me-1" />
                            ansetzen
                          </button>
                          <button 
                            v-else
                            class="btn btn-outline-danger btn-sm"
                            @click="submit(2, game, answer)"
                          >
                            <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="me-1" />
                            trotzdem ansetzen
                          </button>
                        </div>
                      </div>
                      
                      <div class="sr-section" v-else>
                        <div class="sr-header">
                          <span class="sr-label">SR2</span>
                          <span class="sr-name">{{game.sr2}}</span>
                        </div>
                        <span 
                          class="status-badge"
                          :class="{
                            'status-success': game.sr2Besetzt && !game.sr2Basar,
                            'status-warning': game.sr2Basar,
                            'status-danger': !game.sr2Besetzt && !game.sr2Basar
                          }"
                        >
                          {{getString(game.sr2Besetzt, game.sr2Basar)}}
                        </span>
                      </div>
                    </div>
                  </div>
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
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import LinkService from "@/services/link.service"
import GamesService from "@/services/games.service"

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.getCurrentUser())

const answers = ref([])

const getString = (besetzt, basar) => {
  if(!besetzt && !basar){
    return "offen"
  }
  if(basar && !besetzt){
    return "im Basar"
  }
  if(besetzt){
    return "besetzt"
  }
}

const deleteAnswer = async (answer) => {
  if(confirm("Wirklich löschen?")){
    await LinkService.removeAnswer(answer._id)
    await getAnswers()
  }
}

const submit = async (sr, game, answer) => {
  if(confirm("Wirklich ansetzen?")){
    let obj = {
      sr2Besetzt: true,
      sr2Basar: false,
      sr2Info: "Link-Übernahme: Lizenz ( "+answer.lizenzstufe+" ) " + (answer.telefon ? "Telefon ( " +answer.telefon + " ) " : "") + (answer.message ? "zusätzliche Mitteilung ( " + answer.message + " ) " : ""),
      sr2Mail: answer.email,
      sr2Bonus: 0,
      sr2Name: answer.name
    }
    if (sr === 1) {
      obj = {
        sr1Besetzt: true,
        sr1Basar: false,
        sr1Info: "Link-Übernahme: Lizenz ( "+answer.lizenzstufe+" ) " + (answer.telefon ? "Telefon ( " +answer.telefon + " ) " : "") + (answer.message ? "zusätzliche Mitteilung ( " + answer.message + " ) " : ""),
        sr1Mail: answer.email,
        sr1Bonus: 0,
        sr1Name: answer.name
      }
    }
    await GamesService.update(game.matchId, obj)
    await getAnswers()
  }
}

const getAnswers = async () => {
  answers.value = await LinkService.getAnswers(route.params.link)
  if(answers.value.length === 0){
    router.replace({name: "links"})
  }
}

const convertToGermanDate = (englishDateString) => {
  const [year, month, day] = englishDateString.split('-')
  const date = new Date(year, month - 1, day)
  
  if (isNaN(date.getTime())) {
    return "Ungültiges Datum"
  }
  
  const germanDateString = date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  
  return germanDateString
}

onMounted(async () => {
  if (!route.params.link) {
    router.replace({name: "home"})
  } else {
    await getAnswers()
  }
})
</script>

<style scoped>
.answer-container {
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

.answer-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1.5rem;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.answer-title {
  color: #ffffff;
  font-weight: 600;
  margin: 0;
}

.info-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.info-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.message-section {
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  border-left: 3px solid var(--bs-primary);
}

.message-content {
  color: #ffffff;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.message-text {
  color: rgba(255, 255, 255, 0.9);
  font-style: italic;
  margin: 0;
  padding-left: 1rem;
  border-left: 2px solid rgba(255, 255, 255, 0.3);
}

.games-section {
  margin-top: 1.5rem;
}

.games-title {
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 1rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.games-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.game-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.game-info {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
}

.game-teams {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #ffffff;
}

.vs {
  color: rgba(255, 255, 255, 0.6);
  font-weight: normal;
}

.game-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.sr-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
}

.sr-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sr-label {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.sr-name {
  color: #ffffff;
  font-weight: 500;
}

.sr-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-success {
  background: rgba(25, 135, 84, 0.2);
  color: #d1e7dd;
  border: 1px solid rgba(25, 135, 84, 0.3);
}

.status-warning {
  background: rgba(255, 193, 7, 0.2);
  color: #fff3cd;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.status-danger {
  background: rgba(220, 53, 69, 0.2);
  color: #f8d7da;
  border: 1px solid rgba(220, 53, 69, 0.3);
}

.sr-assigned {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
}

.sr-no-name {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  font-style: italic;
}

.sr-actions {
  margin-top: 0.5rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .game-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .game-info {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .game-actions {
    flex-direction: column;
  }
  
  .sr-section {
    min-width: auto;
  }
}
</style>
