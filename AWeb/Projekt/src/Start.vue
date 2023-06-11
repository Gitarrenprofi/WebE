<script setup lang="ts">
import Timetable from "./Entrys.vue"
import StationInfo from "./Schedule.vue"

defineProps<{ msg: string }>()
</script>

<template>
  <div class="container">
    <div class="row">
      <div class="mark">
        <form>
          <div class="mb-3">
            <input class="form-control text-center" placeholder="Haltestelle waehlen..." type="text" v-model="stationPattern" @input="searchPatternChanged"/>
            <ul class="list-group ">
              <li class="list-group-item" v-for="station in stations" @click="selectStation(station)">{{ station._attributes.name }}</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
    <div class="row">
      <div class="mark">
        <StationInfo :station="selectedStation"/>
        <Timetable v-if="selectedStation._attributes" :station="selectedStation"/>
      </div>
    </div>
  </div>
</template>


<style scoped>
</style>

<script lang="ts">
import { reactive } from "vue"
import fetchConstructor from "fetch-retry"
const fetchRetry = fetchConstructor(fetch, {
    retryOn: [429],
    retryDelay: (attempt: number) => {
      return Math.pow(2, attempt) * 1000;
    },
})

let stationPattern: any = null;
let allStations: any[] = reactive([]);
let stations: any[] = reactive([]);
let selectedStation: any = reactive({_attributes: null});
function searchPatternChanged() {
  if (stationPattern.length > 0) {
    stations.splice(0, stations.length, ...allStations.filter(s => s._attributes.name.toLowerCase().startsWith(stationPattern.toLowerCase())));
  } else {
    stations.splice(0, stations.length);
  }
}

findAllStations();
function selectStation(station: any) {
  stations.splice(0, stations.length);
  stationPattern = station._attributes.name;
  selectedStation = station;
}

async function findAllStations() {
  try {
    const response = await fetchRetry('http://localhost:3030/tt?endpoint=' + encodeURIComponent(`station/*`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    });

    if (response.status !== 200) {
      throw new Error(response.statusText);
    }

    const data = await response.json();
    let stationsData = data?.stations?.station;

    if (stationsData) {
      allStations.splice(0, allStations.length, ...(Array.isArray(stationsData) ? stationsData : [stationsData]));
    } else {
      allStations.splice(0, allStations.length);
    }
  } catch (err) {
    console.error(err);
    alert('Verbindung Fehlgeschlagen');
    setTimeout(findAllStations, 11111);
  }
}



</script>