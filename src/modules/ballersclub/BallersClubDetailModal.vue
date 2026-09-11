<template>
  <dialog ref="dialog" class="ballers-club bc-detail-dialog" aria-labelledby="bc-detail-title" @cancel.prevent="emit('close')" @click="onBackdrop">
    <span class="bc-detail-accent" aria-hidden="true"></span>
    <div class="bc-detail-content">
      <button class="bc-close" type="button" aria-label="Schließen" @click="emit('close')">×</button>
      <header class="bc-detail-brand">
        <img :src="logo" width="64" height="64" alt="ALBA Berlin Gropiusstadt">
        <div class="bc-detail-brand-copy">
          <strong class="bc-detail-wordmark bc-display">Ballers <br>Club</strong>
          <span class="bc-muted">Schiedsrichter gesucht</span>
        </div>
        <BallersStatusPill class="bc-detail-brand-status" :spots="game.freeSpots" dot />
      </header>

      <section class="bc-detail-hero">
        <div class="bc-detail-hero-copy">
          <span class="bc-detail-label">Turnier</span>
          <h2 id="bc-detail-title" class="bc-display">{{ game.tournamentType }}</h2>
        </div>
        <div class="bc-detail-schedule bc-mono">
          <time :datetime="game.date">{{ dateLabel }}</time>
          <span>{{ game.timeLabel }}</span>
        </div>
      </section>

      <div class="bc-detail-grid">
        <div class="bc-detail-item bc-detail-item--venue">
          <span class="bc-detail-label">Halle</span>
          <strong>{{ game.venue }}</strong>
          <span v-if="game.address">{{ game.address }}</span>
        </div>
        <div class="bc-detail-item bc-detail-item--pay">
          <span class="bc-detail-label">Vergütung</span>
          <strong>40–50 €</strong>
          <span>je nach Länge des Turniers</span>
        </div>
        <div v-if="meetingTimeLabel" class="bc-detail-item bc-detail-item--meeting">
          <span class="bc-detail-label">Treffpunkt</span>
          <strong>{{ meetingTimeLabel }}</strong>
        </div>
      </div>

      <p class="bc-detail-note">Die genaue Vergütung und weitere organisatorische Details bitte erfragen. Über die gelbe Anfrage öffnest du anschließend deine Bewerbung per WhatsApp oder E-Mail.</p>
      <p v-if="!available" class="bc-detail-unavailable" role="status">Für dieses Turnier ist momentan kein aktueller freier Platz verfügbar.</p>

      <footer class="bc-detail-actions">
        <button class="bc-detail-secondary" type="button" @click="emit('close')">Schließen</button>
        <button class="bc-button" type="button" :disabled="!available" @click="emit('request', game)">Anfrage per WhatsApp oder E-Mail <span aria-hidden="true">→</span></button>
      </footer>
    </div>
  </dialog>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import logo from '@/assets/ballersclub/logo.svg'
import BallersStatusPill from './BallersStatusPill.vue'
import './ballersclub.css'

const props = defineProps({
  game: { type: Object, required: true },
  available: Boolean
})
const emit = defineEmits(['close', 'request'])
const dialog = ref(null)
const dateLabel = computed(() => new Intl.DateTimeFormat('de-DE', {
  day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Berlin'
}).format(new Date(props.game.date)))
const meetingTimeLabel = computed(() => String(props.game.meetingTime || '').replace(/^Treffpunkt\s*:\s*/i, '').trim())
let previousFocus

onMounted(() => {
  previousFocus = document.activeElement
  dialog.value?.showModal()
})

onUnmounted(() => {
  dialog.value?.close()
  previousFocus?.focus?.()
})

function onBackdrop(event) {
  if (event.target !== dialog.value) return
  const rect = dialog.value.getBoundingClientRect()
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
    emit('close')
  }
}
</script>

<style scoped>
.bc-detail-dialog{width:min(44rem,calc(100% - 2rem));max-height:calc(100dvh - 2rem);border:0;border-radius:1rem;padding:0;overflow:auto;background:var(--bc-navy);color:#fff;box-shadow:0 1.5rem 5rem #0005}
.bc-detail-dialog::backdrop{background:#071426b3}.bc-detail-accent{display:block;height:.35rem;background:var(--bc-yellow)}.bc-detail-content{position:relative;padding:1.15rem 1.25rem 1.25rem}.bc-close{position:absolute;z-index:1;top:.65rem;right:.7rem;display:grid;width:2.4rem;height:2.4rem;place-items:center;padding:0;border:1px solid #315170;border-radius:.55rem;background:#07325f;color:#fff;cursor:pointer;font:1.45rem/1 Arial,sans-serif}.bc-close:hover{border-color:var(--bc-yellow);color:var(--bc-yellow)}.bc-close:focus-visible{outline:3px solid var(--bc-yellow);outline-offset:2px}
.bc-detail-brand{display:flex;align-items:center;gap:.75rem;min-width:0;padding-right:3rem}.bc-detail-brand img{flex:none;width:3.5rem;height:3.5rem}.bc-detail-brand-copy{display:grid;min-width:0;gap:.25rem}.bc-detail-wordmark{font-size:clamp(1.4rem,3.5vw,2rem);overflow-wrap:anywhere}.bc-detail-brand-copy .bc-muted{font-size:.8rem}.bc-detail-brand-status{flex:none;margin-left:auto}
.bc-detail-hero{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(10rem,.85fr);align-items:end;gap:1rem;margin-top:1rem;padding:.85rem 0;border-top:1px solid #315170;border-bottom:1px solid #315170}.bc-detail-hero-copy{display:grid;min-width:0;gap:.25rem}.bc-detail-label{font:500 .68rem Ballers Mono,monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--bc-muted)}.bc-detail-dialog h2{max-width:100%;margin:0;color:var(--bc-yellow);font-size:clamp(1.8rem,4vw,2.6rem);overflow-wrap:anywhere}.bc-detail-schedule{display:grid;align-content:end;justify-items:end;gap:.25rem;min-width:0;font-size:.86rem;line-height:1.35;text-align:right}.bc-detail-schedule time,.bc-detail-schedule span{overflow-wrap:anywhere}.bc-detail-schedule span{color:var(--bc-muted)}
.bc-detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.7rem;margin:1rem 0}.bc-detail-item{display:grid;align-content:start;gap:.28rem;min-width:0;padding:.85rem;border:1px solid #315170;border-radius:.7rem;background:#07325f}.bc-detail-item strong{font-size:1.05rem;overflow-wrap:anywhere}.bc-detail-item span:not(.bc-detail-label){color:#d8e3ef;font-size:.85rem;line-height:1.35;overflow-wrap:anywhere}.bc-detail-item--pay{border-color:#6e5e00;background:#123b60}.bc-detail-item--pay strong{color:var(--bc-yellow);font-size:1.5rem}.bc-detail-item--meeting{grid-column:1 / -1}.bc-detail-note{margin:.7rem 0;padding:.75rem;border-radius:.6rem;background:#07325f;color:#d8e3ef;font-size:.85rem;line-height:1.5}.bc-detail-unavailable{margin:.7rem 0;color:#ffcfcc;font-size:.85rem;line-height:1.45}.bc-detail-actions{display:flex;align-items:stretch;justify-content:flex-end;gap:.7rem;margin-top:1rem;padding-top:1rem;border-top:1px solid #315170}.bc-detail-actions .bc-button{flex:1 1 18rem;min-height:2.45rem;max-width:100%;padding:.6rem 1rem;text-align:center;white-space:normal}.bc-detail-secondary{flex:0 1 auto;min-height:2.45rem;padding:.6rem 1rem;border:1px solid #6e85a0;border-radius:.6rem;background:transparent;color:#fff;font:500 .9rem Ballers Sans,Arial,sans-serif;cursor:pointer}.bc-detail-secondary:hover{background:#07325f}.bc-detail-secondary:focus-visible{outline:3px solid var(--bc-yellow);outline-offset:2px}
@media(max-width:560px){.bc-detail-content{padding:.95rem 1rem 1rem}.bc-detail-brand{align-items:flex-start;flex-wrap:wrap}.bc-detail-brand-status{width:100%;margin:.1rem 0 0}.bc-detail-hero{grid-template-columns:1fr;gap:.65rem}.bc-detail-schedule{justify-items:start;text-align:left}.bc-detail-grid{grid-template-columns:1fr}.bc-detail-item--meeting{grid-column:auto}.bc-detail-actions{flex-direction:column-reverse}.bc-detail-actions button{width:100%}.bc-detail-actions .bc-button{flex:0 0 auto;min-height:3rem}}
</style>
