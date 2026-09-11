<template>
  <dialog ref="dialog" class="ballers-club bc-dialog" aria-labelledby="bc-dialog-title" @cancel.prevent="$emit('close')" @click="onBackdrop">
    <button class="bc-close" type="button" aria-label="Schließen" @click="$emit('close')">×</button>
    <h2 id="bc-dialog-title" class="bc-display">Beim Ballers Club pfeifen</h2>
    <p>{{ game.tournamentType }} · {{ dateLabel }}<br>{{ game.timeLabel }}<br>{{ game.venue }}</p>
    <form ref="form" @submit.prevent="openContact('whatsapp')">
      <label>Dein Name<input v-model="application.name" name="name" autocomplete="name" required maxlength="100" autofocus></label>
      <div class="bc-form-row"><label>Alter<input v-model="application.age" name="age" type="number" inputmode="numeric" min="1" max="120" step="1" required></label>
      <label>Lizenzstufe<input v-model="application.license" name="license" list="bc-license-options" maxlength="40" required placeholder="z. B. LSE"><datalist id="bc-license-options"><option v-for="license in licenses" :key="license" :value="license" /></datalist></label></div>
      <p class="bc-muted bc-form-notice">Deine Angaben werden nicht in der API gespeichert. Du öffnest einen Nachrichtentwurf und sendest ihn selbst ab.</p>
      <p v-if="!available" role="status">Für dieses Turnier liegt gerade kein aktueller freier Platz vor. Bitte aktualisiere die Spiele.</p>
      <p v-if="error" role="alert">{{ error }}</p>
      <div class="bc-dialog-actions"><button class="bc-button" type="submit" :disabled="!available">WhatsApp</button><button class="bc-button" type="button" :disabled="!available" @click="openContact('email')">E-Mail</button></div>
    </form>
  </dialog>
</template>
<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { buildContactLinks, validateApplication } from './contact.js'
import './ballersclub.css'
const props = defineProps({ game: { type: Object, required: true }, contact: { type: Object, default: null }, available: Boolean, validUntil: { type: Number, required: true } })
const emit = defineEmits(['close'])
const dialog = ref(null)
const form = ref(null)
const error = ref('')
const application = reactive({ name: '', age: '', license: '' })
const licenses = ['LSE', 'LSE+', 'LSD', 'LSC', 'LSB', 'LSA']
const dateLabel = computed(() => new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Berlin' }).format(new Date(props.game.date)))
let previousFocus
onMounted(() => { previousFocus = document.activeElement; dialog.value.showModal() })
onUnmounted(() => { dialog.value?.close(); previousFocus?.focus?.() })
function onBackdrop(event) { if (event.target === dialog.value) { const rect = dialog.value.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) emit('close') } }
function openContact(channel) {
  error.value = ''
  if (!props.available || !form.value.reportValidity()) return
  if (!Number.isFinite(props.validUntil) || !Number.isFinite(props.game.endTimestamp) || Date.now() > props.validUntil || Date.now() > props.game.endTimestamp) {
    error.value = 'Die Verfügbarkeit muss aktualisiert werden. Bitte schließe das Fenster und aktualisiere die Spiele.'
    return
  }
  const errors = validateApplication(application)
  if (Object.keys(errors).length) { error.value = Object.values(errors)[0]; return }
  try {
    const links = buildContactLinks(props.game, props.contact, application)
    if (channel === 'whatsapp') window.open(links.whatsapp, '_blank', 'noopener,noreferrer')
    else window.location.href = links.email
  } catch (failure) { error.value = failure.message }
}
</script>
<style scoped>
.bc-dialog{width:min(34rem,calc(100% - 2rem));max-height:calc(100dvh - 2rem);border:0;border-radius:1rem;padding:2rem;overflow:auto;box-shadow:0 1.5rem 5rem #0005}
.bc-dialog::backdrop{background:#071426b3}.bc-dialog h2{font-size:2rem;color:var(--bc-yellow);margin:0 1.4rem 1rem 0}.bc-dialog p{line-height:1.6}
.bc-close{position:absolute;right:.8rem;top:.5rem;background:none;border:0;color:#fff;cursor:pointer;font:2rem Arial;padding:.4rem}
.bc-dialog form,.bc-dialog label{display:grid;gap:.6rem}.bc-dialog form{gap:1rem}.bc-dialog label{font-size:.9375rem}
.bc-dialog input{width:100%;min-width:0;border:1px solid #6885a5;border-radius:.5rem;background:#fff;color:#002652;padding:.7rem;font:1rem Ballers Sans,Arial,sans-serif}
.bc-dialog input:focus-visible{outline:3px solid var(--bc-yellow);outline-offset:2px}.bc-form-row{display:grid;grid-template-columns:1fr 2fr;gap:1rem}.bc-form-notice{font-size:.8125rem;margin:0}
.bc-dialog-actions{display:flex;gap:1rem;flex-wrap:wrap}.bc-dialog-actions button{flex:1}
@media(max-width:380px){.bc-dialog{padding:1.4rem}.bc-form-row{grid-template-columns:1fr}}
</style>
