<template>

    <div class="border border-white p-2 rounded-3">
      <p>SR{{ position }}:</p>
      <h5><img src="@/assets/whistle-icon.svg?data" width="24" alt="whistle"/> {{ sr }}</h5>
      <input :id="id +'srBesetzt'" v-model="srBesetzt" autocomplete="off" class="btn-check" type="checkbox"
             @change="updateData">
      <label :for="id +'srBesetzt'" class="btn btn-outline-success" v-if="srBesetzt">Besetzt</label>&nbsp;
      <label :for="id +'srBesetzt'" class="btn btn-outline-danger" v-else>Nicht besetzt</label>&nbsp;

      <input :id="id +'srBasar'" v-model="srBasar" autocomplete="off" class="btn-check" type="checkbox"
             @change="updateData">
      <label :for="id +'srBasar'" class="btn btn-outline-info" v-if="srBasar && !srBesetzt">im Basar</label>
      <label :for="id +'srBasar'" class="btn btn-outline-danger" v-else-if="!srBasar && !srBesetzt">nicht im
        Basar</label><br>
      <div class="mb-3">
        <label for="srName" class="form-label">Name</label>
        <input type="text" class="form-control" id="srName" v-model="srName" placeholder="Name" v-debounce:750ms="updateData">
      </div>
      <div class="mb-3">
        <label for="srName" class="form-label">E-Mail</label>
        <input type="text" class="form-control" id="srName" v-model="srEmail" placeholder="E-Mail vom SR" v-debounce:750ms="updateData">
      </div>
      <div class="mb-3">

        <label class="form-label" :for="id +'srInfo'">Interne Info:</label>
        <textarea :id="id +'srInfo'" v-model="srInfo" class="form-control" rows="2"
                  v-debounce:750ms="updateData"></textarea>
      </div>
      <label class="form-label" :for="id +'srBonus'">Bonus {{ srBonus }} €</label>
      <input :id="id +'srBonus'" v-model="srBonus" class="form-range" max="10" min="0" type="range"
             @change="updateData">
    </div>


</template>

<script setup>
import { ref, onMounted } from 'vue'
import GamesService from "../services/games.service.js";
import {v4 as uuidv4} from 'uuid';

const props = defineProps(['sr', 'besetzt', 'basar', 'info', 'bonus', 'position', 'match', 'name', 'email'])
const emit = defineEmits(['update'])

const id = ref([])
const srBesetzt = ref(false)
const srBasar = ref(false)
const srEmail = ref("")
const srInfo = ref("")
const srBonus = ref(0)
const srName = ref("")

const updateData = async () => {
  if (srBesetzt.value)
    srBasar.value = false
  var obj = {
    sr2Besetzt: srBesetzt.value,
    sr2Basar: srBasar.value,
    sr2Info: srInfo.value,
    sr2Mail: srEmail.value,
    sr2Bonus: srBonus.value,
    sr2Name: srName.value
  }
  if (parseInt(props.position) === 1) {
    obj = {
      sr1Besetzt: srBesetzt.value,
      sr1Basar: srBasar.value,
      sr1Info: srInfo.value,
      sr1Mail: srEmail.value,
      sr1Bonus: srBonus.value,
      sr1Name: srName.value
    }
  }
  emit('update', {match: props.match, ref: obj})
  await GamesService.update(props.match, obj)
}

onMounted(() => {
  srBesetzt.value = props.besetzt ? props.besetzt : false
  srBasar.value = props.basar ? props.basar : false;
  srInfo.value = props.info
  srEmail.value = props.email
  srBonus.value = props.bonus ? props.bonus : 0
  srName.value = props.name ? props.name: ""
  id.value = uuidv4();
})
</script>
<style scoped>
.btn-outline-info {
  --bs-btn-active-color: #fff;
  --bs-btn-active-bg: chocolate;
  --bs-btn-active-border-color: chocolate;
  --bs-btn-active-shadow: inset 0 3px 5px chocolate;

}
</style>