<template>
  <div class="ballers-card-shell">
    <article
      class="ballers-club ballers-card"
      role="button"
      tabindex="0"
      :aria-label="'Details zu Ballers Club – ' + game.tournamentType"
      @click="openDetails"
      @keydown.enter="openDetails"
      @keydown.space.prevent="openDetails"
    >
      <span class="bc-card-accent" aria-hidden="true"></span>
      <header class="bc-card-brand">
        <img :src="logo" width="56" height="56" alt="ALBA Berlin Gropiusstadt">
        <div class="bc-card-brand-copy">
          <strong class="bc-card-wordmark bc-display">Ballers <br>Club</strong>
          <span class="bc-muted">Schiedsrichter gesucht</span>
        </div>
      </header>
      <section class="bc-card-event">
        <span class="bc-card-label">Turnier</span>
        <h3 class="bc-display">{{ game.tournamentType }}</h3>
      </section>
      <div class="bc-card-date bc-mono">
        <time :datetime="game.date">{{ dateLabel }}</time>
        <span>{{ game.timeLabel }}</span>
      </div>
      <div class="bc-card-venue">
        <span>{{ game.venue }}</span>
        <small v-if="game.address">{{ game.address }}</small>
        <small v-if="game.meetingTime" class="bc-muted">{{ game.meetingTime }}</small>
        <small v-if="showDistance && Number.isFinite(game.distanceKm)" class="bc-muted">{{ game.distance }} entfernt</small>
      </div>
      <div class="bc-card-actions">
        <BallersStatusPill :spots="game.freeSpots" dot />
        <span class="bc-card-action" aria-hidden="true">
          <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" />
        </span>
      </div>
    </article>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import logo from '@/assets/ballersclub/logo.svg'
import BallersStatusPill from './BallersStatusPill.vue'
import './ballersclub.css'
const props = defineProps({ game: { type: Object, required: true }, showDistance: Boolean })
const emit = defineEmits(['open'])
const dateLabel = computed(() => new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(props.game.date)))
function openDetails() { emit('open', props.game) }
</script>
<style scoped>
.ballers-card-shell{container-type:inline-size;min-width:0;height:100%}
.ballers-card{align-self:stretch;align-content:start;position:relative;min-width:0;height:100%;border-radius:.9rem;padding:.95rem 1rem 1rem;display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"brand brand" "event date" "venue venue" "actions actions";align-items:start;gap:.7rem 1rem;overflow:hidden;cursor:pointer;transition:border-color .2s ease,box-shadow .2s ease}
.ballers-card:hover{border-color:var(--bc-yellow);box-shadow:0 4px 18px #00265226}
.ballers-card:focus-visible{outline:2px solid var(--bc-yellow);outline-offset:3px}
.bc-card-accent{position:absolute;z-index:1;top:0;left:1rem;display:block;width:3.4rem;height:.24rem;background:var(--bc-yellow);pointer-events:none}
.bc-card-brand{grid-area:brand;display:flex;align-items:center;gap:.75rem;min-width:0;padding-bottom:.7rem;border-bottom:1px solid #315170}
.bc-card-brand-copy{display:grid;min-width:0;gap:.28rem}
.bc-card-wordmark{font-size:clamp(1.65rem,5cqw,2.4rem);overflow-wrap:anywhere}
.bc-card-brand img{flex:none;width:3.25rem;height:3.25rem}
.bc-card-brand-copy .bc-muted{font-size:.78rem;line-height:1.3}
.bc-card-event{grid-area:event;display:grid;min-width:0;align-content:start;gap:.25rem}
.bc-card-label{color:var(--bc-muted);font:500 .68rem Ballers Mono,monospace;letter-spacing:.06em;text-transform:uppercase}
.bc-card-event h3{max-width:100%;margin:0;color:var(--bc-yellow);font-size:clamp(1.4rem,4cqw,2.15rem);overflow-wrap:anywhere}
.bc-card-date{grid-area:date;display:grid;align-content:start;justify-items:end;gap:.25rem;min-width:0;padding-top:.1rem;font-size:.8rem;line-height:1.35;text-align:right}
.bc-card-date time,.bc-card-date span{overflow-wrap:anywhere}
.bc-card-date span{color:var(--bc-muted)}
.bc-card-venue{grid-area:venue;display:grid;min-width:0;gap:.25rem;padding-top:.15rem;overflow-wrap:anywhere}
.bc-card-venue>span{font-size:1rem;line-height:1.3}
.bc-card-venue small{color:var(--bc-muted);font-size:.75rem;line-height:1.35}
.bc-card-actions{grid-area:actions;display:flex;align-items:center;justify-content:space-between;gap:.6rem;min-width:0;padding-top:.65rem;border-top:1px solid #315170}
.bc-card-actions .bc-status{min-height:1.75rem;padding:.28rem .7rem;font-size:.76rem}
.bc-card-action{display:inline-flex;align-items:center;justify-content:center;min-width:1.8rem;min-height:1.8rem;color:var(--bc-yellow);font-size:1rem;line-height:1}
@container (min-width:44rem){
  .ballers-card{padding:1.1rem 1.25rem 1rem;grid-template-columns:minmax(12rem,.82fr) minmax(14rem,1fr) minmax(15rem,1.1fr);grid-template-areas:"brand event venue" "brand date actions";gap:.8rem 1.4rem}
  .bc-card-brand{align-items:flex-start;flex-direction:column;gap:.7rem;padding:0;border:0}
  .bc-card-brand img{width:4rem;height:4rem}
  .bc-card-wordmark{font-size:clamp(2rem,4cqw,2.8rem)}
  .bc-card-date{justify-items:start;padding-top:.15rem;text-align:left}
  .bc-card-venue{padding-top:0}
  .bc-card-actions{padding-top:.15rem;border-top:0}
}
</style>
