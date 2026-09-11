<template>
  <article class="ballers-club ballers-row" role="rowgroup">
    <div
      role="row"
      tabindex="0"
      :aria-label="'Details zu Ballers Club – ' + game.tournamentType"
      @click="openDetails"
      @keydown.enter="openDetails"
      @keydown.space.prevent="openDetails"
    ><div role="cell" :aria-colspan="columnCount" class="bc-row-layout">
      <div class="bc-row-brand"><img :src="logo" width="36" height="36" alt="ALBA Berlin Gropiusstadt"><span class="bc-display">Ballers <br>Club</span></div>
      <div class="bc-row-date bc-mono"><time :datetime="game.date">{{ dateLabel }}</time><small>{{ game.timeLabel }}</small></div>
      <div class="bc-row-event"><strong class="bc-display">{{ game.tournamentType }}</strong><span class="bc-muted">{{ game.venue }}</span><small v-if="showDistance && Number.isFinite(game.distanceKm)" class="bc-muted">{{ game.distance }}</small></div>
      <BallersStatusPill :spots="game.freeSpots" />
      <div class="bc-row-action"><span class="bc-row-detail-action" aria-hidden="true"><font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" /></span></div>
    </div></div>
  </article>
</template>
<script setup>
import { computed } from 'vue'
import logo from '@/assets/ballersclub/logo.svg'
import BallersStatusPill from './BallersStatusPill.vue'
import './ballersclub.css'
const props = defineProps({ game: { type: Object, required: true }, columnCount: { type: Number, default: 7 }, showDistance: Boolean })
const emit = defineEmits(['open'])
const dateLabel = computed(() => new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(props.game.date)))
function openDetails() { emit('open', props.game) }
</script>
<style scoped>
.ballers-row{position:relative;align-self:stretch;border-left:.2rem solid var(--bc-yellow);margin:.25rem .4rem;border-radius:.6rem;padding:.55rem .7rem;overflow:hidden}
.ballers-row::before{position:absolute;top:0;left:.7rem;width:3.4rem;height:.24rem;background:var(--bc-yellow);content:''}
.ballers-row>div[role="row"]{min-width:0;border-radius:.35rem;cursor:pointer;outline:0}
.ballers-row>div[role="row"]:focus-visible{box-shadow:inset 0 0 0 2px var(--bc-yellow)}
.bc-row-layout{display:grid;grid-template-columns:minmax(7rem,.8fr) minmax(7rem,.85fr) minmax(9rem,1.35fr) minmax(5.8rem,.7fr) minmax(9rem,.9fr);align-items:center;gap:.6rem;min-width:0}
.bc-row-brand{display:flex;min-width:0;gap:.5rem;align-items:center;color:var(--bc-yellow)}
.bc-row-brand img{flex:none;width:2.25rem;height:2.25rem}.bc-row-brand span{font-size:.85rem}
.bc-row-brand span,.bc-row-date,.bc-row-event,.bc-row-action{overflow-wrap:anywhere}.bc-row-date{min-width:0;font-size:.8rem;line-height:1.35}.bc-row-date time{overflow-wrap:anywhere}.bc-row-date small{display:block;margin-top:.25rem;color:var(--bc-muted);font-size:.74rem;line-height:1.3}
.bc-row-event{display:grid;min-width:0;gap:.3rem;overflow-wrap:anywhere}.bc-row-event strong{font-size:1.35rem}.bc-row-event span{font-size:.8rem;line-height:1.3}.bc-row-event small{font-size:.74rem}
.bc-row-action{display:grid;min-width:0;justify-items:center;text-align:center}.bc-row-detail-action{display:inline-flex;align-items:center;justify-content:center;min-width:1.8rem;min-height:1.8rem;color:var(--bc-yellow);font-size:1rem;line-height:1}
.bc-row-layout>.bc-status{min-height:1.85rem;padding:.3rem .7rem;font-size:.78rem}
@media(max-width:1100px){.bc-row-layout{gap:.5rem;grid-template-columns:minmax(5.5rem,.75fr) minmax(5.4rem,.8fr) minmax(8rem,1.35fr) minmax(5.3rem,.7fr) minmax(8rem,.85fr)}.bc-row-brand{gap:.35rem}.bc-row-brand span br{display:none}.bc-row-brand span{font-size:.78rem}.bc-row-brand img{width:2rem;height:2rem}.bc-row-event strong{font-size:1.15rem}.bc-row-layout>.bc-status{font-size:.72rem;padding-inline:.55rem}}
</style>
