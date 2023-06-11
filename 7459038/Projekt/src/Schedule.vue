<template>
    <form>
      <div class="row">
        <div class="class1">
          <label>Von</label>
          <input class="form-control" type="date" v-model="from_date" />
          <input class="form-control" type="time" v-model="from_time" />
        </div>

        <div class="class1">
          <label>Bis</label>
          <input class="form-control" type="date" v-model="to_date" />
          <input class="form-control" type="time" v-model="to_time" />
        </div>
        
      </div>
      <div class="row">
        <div class="center">
          <input class="btn btn-primary" :disabled="isLoading.timetable || !props.station?._attributes" type="button" value="Suchen" @click="fetchTimetables()" />
        </div>
      </div>
    </form>

    <div v-if="props.station._attributes">
      <div v-if="isLoading.timetable" class="spinner-border" role="status"></div>
      <div v-else>
        <div v-if="timetable.length === 0">Keine Daten vorhanden.</div>
        <div v-else class="row">
          <div class="col-lg">
            <h2>Abfahrt</h2>
            <ul class="list-group">
              <TimeTableEntry mode="departure" v-for="trip in timetableDeparture" :key="trip.id" :trip="trip" />
            </ul>
          </div>
          <div class="col-lg">
            <h2>Ankunft</h2>
            <ul class="list-group">
              <TimeTableEntry mode="arrival" v-for="trip in timetableArrival" :key="trip.id" :trip="trip" />
            </ul>
          </div>
        </div>
      </div>
    </div>
  </template>


<script setup lang="ts">
import { reactive, watch } from "vue"
import fetchConstructor from "fetch-retry"
import TimeTableEntry from "./Entrys.vue"

const isLoading = reactive({changes: false, timetable: false});
const fetchRetry = fetchConstructor(fetch, {
    retryOn: [429],
    retryDelay: (attempt: number) => {
      return Math.pow(2, attempt) * 1000;
    },
})

async function fetchChanges() {
    try {
        isLoading.changes = true;
        const endpoint = `fchg/${stationEvaNo}`;
        const url = `http://localhost:3030/tt?endpoint=${encodeURIComponent(endpoint)}`;
        const response = await fetchRetry(url);
        const changes = await response.json();
        updateTimetableWithChanges(changes);
    } catch (error) {
        console.log("Fehler")
        // Fehlerbehandlung
    } finally {
        isLoading.changes = false;
    }
}

async function monitorChanges(evaNo: string) {
    if (props.station._attributes.eva !== evaNo) {
        return;
    }

    if (!isLoading.timetable) {
        try {
            const endpoint = `rchg/${stationEvaNo}`;
            const url = `http://localhost:3030/tt?endpoint=${encodeURIComponent(endpoint)}`;
            const response = await fetchRetry(url);
            const changes = await response.json();
            updateTimetableWithChanges(changes);
        } catch (error) {
            console.log("Fehler")
            // Fehlerbehandlung
        }
    }

    setTimeout(() => monitorChanges(evaNo), 30000);
}


const props = defineProps<{ station: any }>()
const dateFormat = {
    "YYMMDD": (timestamp: number) => {
        let year = new Date(timestamp).getFullYear();
        let month = new Date(timestamp).getMonth() + 1;
        let day = new Date(timestamp).getDate();
        return `${String(year).substring(2,4)}${month < 10 ? "0" + month : "" + month}${day < 10 ? "0" + day : "" + day}`;
    },
    "YYYY-MM-DD": (timestamp: number) => {
        let year = new Date(timestamp).getFullYear();
        let month = new Date(timestamp).getMonth() + 1;
        let day = new Date(timestamp).getDate();
        return `${String(year)}-${month < 10 ? "0" + month : "" + month}-${day < 10 ? "0" + day : "" + day}`;
    },
    "fromYYYY-MM-DDHH:MM": (date: string) => {
        let timestamp = 0;
        if (date.length === 15) {
            let year = Number(date.substring(0, 4));
            let month = Number(date.substring(5, 7));
            let day = Number(date.substring(8, 10));
            let hours = Number(date.substring(10, 12));
            let minutes = Number(date.substring(13, 15));
            timestamp = new Date(year, month - 1, day, hours, minutes).getTime();
        }
        return timestamp;
    },
}
const timeFormat = {
    "HH": (timestamp: number) => {
        let hours = new Date(timestamp).getHours();
        return hours < 10 ? "0" + hours : "" + hours;
    },
    "HH:MM": (timestamp: number) => {
        let hours = new Date(timestamp).getHours();
        let minutes = new Date(timestamp).getMinutes();
        return `${hours < 10 ? "0" + hours : "" + hours}:${minutes < 10 ? "0" + minutes : "" + minutes}`;
    },
}
const datetimeFormat = {
    "fromYYMMDDHHMM": (datetime: string) => {
        let timestamp = 0;
        if (datetime.length === 10) {
            let year = Number(datetime.substring(0, 2));
            let month = Number(datetime.substring(2, 4));
            let day = Number(datetime.substring(4, 6));
            let hours = Number(datetime.substring(6, 8));
            let minutes = Number(datetime.substring(8, 10));
            timestamp = new Date(2000 + year, month - 1, day, hours, minutes).getTime();
        }
        return timestamp;
    }
}

let stationEvaNo = "";
let timetable: any[] = reactive([]);
let timetableArrival: any[] = reactive([]);
let timetableDeparture: any[] = reactive([]);
let from_date = dateFormat["YYYY-MM-DD"](Date.now());
let from_time = timeFormat["HH:MM"](Date.now());
let to_date = dateFormat["YYYY-MM-DD"](Date.now() + 1000 * 60 * 60);
let to_time = timeFormat["HH:MM"](Date.now() + 1000 * 60 * 60);

watch(() => props.station, async (newStation, oldStation) => {
    if (newStation?._attributes?.eva === oldStation?._attributes?.eva) return;
    timetable.splice(0, timetable.length);
    if (newStation._attributes) {
        stationEvaNo = newStation._attributes.eva;
        const tempEvaNo = String(stationEvaNo);
        await fetchTimetables();
        await updateTimetableWithChanges(tempEvaNo);
    } else {
        stationEvaNo = "";
    }
});

function updateTimetableWithChanges(changes: any) {
  if (!changes?.timetable) return;

  const changesArray = Array.isArray(changes.timetable.s) ? changes.timetable.s : [changes.timetable.s];

  changesArray.forEach((change: any) => {
    if (!change?._attributes) return;

    const changeId = change._attributes.id;
    const changeTrip = timetable.find((trip) => trip.id === changeId);

    if (!changeTrip) return;

    if (changeTrip.isArrival && change.ar) {
      if (change.ar._attributes?.cp) {
        changeTrip.platformChanged = changeTrip.plannedPlatform !== change.ar._attributes.cp;
        changeTrip.platform = change.ar._attributes.cp || '?';
      }

      if (change.ar._attributes?.ct) {
        changeTrip.arrival = datetimeFormat.fromYYMMDDHHMM(change.ar._attributes.ct) || 0;
        changeTrip.isDelay = changeTrip.arrival > (changeTrip.plannedArrival + (1000 * 60));
      }

      if (change.ar._attributes?.cpth) {
        changeTrip.arrivalPath = change.ar._attributes.cpth.split('|') || [];
        changeTrip.arrivalPathChanged = true;
      }
    } else if (changeTrip.isDeparture && change.dp) {
      if (change.dp._attributes?.cp) {
        changeTrip.platformChanged = changeTrip.plannedPlatform !== change.dp._attributes.cp;
        changeTrip.platform = change.dp._attributes.cp || '?';
      }

      if (change.dp._attributes?.ct) {
        changeTrip.departure = datetimeFormat.fromYYMMDDHHMM(change.dp._attributes.ct) || 0;
        changeTrip.isDelay = changeTrip.departure > (changeTrip.plannedDeparture + (1000 * 60));
      }

      if (change.dp._attributes?.cpth) {
        changeTrip.departurePath = change.dp._attributes.cpth.split('|') || [];
        changeTrip.departurePathChanged = true;
      }
    }
  });

  timetableArrival.sort((a, b) => a.arrival - b.arrival);
  timetableDeparture.sort((a, b) => a.departure - b.departure);
}

async function fetchTimetables() {
  isLoading.timetable = true;
  timetable.splice(0, timetable.length);
  const fromTimestamp = dateFormat["fromYYYY-MM-DDHH:MM"](from_date + from_time);
  const toTimestamp = dateFormat["fromYYYY-MM-DDHH:MM"](to_date + to_time);
  console.log("fetch timetable from " + fromTimestamp + " to " + toTimestamp);
  let completePlan = [];

  const fetchPlan = async (timestamp: number) => {
    const plan = await fetchRetry(`http://localhost:3030/tt?endpoint=${encodeURIComponent(`plan/${stationEvaNo}/${dateFormat.YYMMDD(timestamp)}/${timeFormat.HH(timestamp)}`)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    });

    if (plan.status === 200) {
      const planJson = await plan.json();
      console.log(planJson);
      if (planJson?.timetable?.s) {
        if (Array.isArray(planJson.timetable.s)) {
          completePlan.push(...planJson.timetable.s);
        } else {
          completePlan.push(planJson.timetable.s);
        }
      }
    } else {
      console.error(plan.statusText);
    }
  };

  const fetchPromises = [];
  for (let i = fromTimestamp; i < toTimestamp + 1; i += 1000 * 60 * 60) {
    fetchPromises.push(fetchPlan(i));
  }

  await Promise.all(fetchPromises);

  isLoading.timetable = false;
  timetable.splice(0, timetable.length, ...completePlan);
}



    completePlan = completePlan.map((trip) => {
        return {
            raw: trip,
            name: `${trip?.tl?._attributes?.c || ''}${trip?.dp?._attributes?.l || trip?.ar?._attributes?.l || ''}`,
            departure: datetimeFormat.fromYYMMDDHHMM(trip?.dp?._attributes?.pt || '') || 0,
            plannedDeparture: datetimeFormat.fromYYMMDDHHMM(trip?.dp?._attributes?.pt || '') || 0,
            arrival: datetimeFormat.fromYYMMDDHHMM(trip?.ar?._attributes?.pt || '') || 0,
            plannedArrival: datetimeFormat.fromYYMMDDHHMM(trip?.ar?._attributes?.pt || '') || 0,
            isCancelled: false,
            isArrival: !!trip?.ar,
            isDeparture: !!trip?.dp,
            isDelay: false,
            arrivalPath: trip?.ar?._attributes?.ppth?.split('|') || [],
            arrivalPathChanged: false,
            departurePath: trip?.dp?._attributes?.ppth?.split('|') || [],
            departurePathChanged: false,
            plannedPlatform: trip?.ar?._attributes?.pp || trip?.dp?._attributes?.pp || '',
            platform: trip?.ar?._attributes?.pp || trip?.dp?._attributes?.pp || '',
            platformChanged: false,
            id: trip?._attributes?.id || null,
        }
    }).map(trip => trip.id ? trip : Object.assign(trip, { id: trip.name + trip.departure + trip.arrival }))
    completePlan = completePlan.filter((trip) => (trip.departure >= fromTimestamp && trip.departure <= toTimestamp) || (trip.arrival >= fromTimestamp && trip.arrival <= toTimestamp));
    
    completePlan = completePlan.filter((trip, index, self) => {
        const nextTrip = self[index + 1];
        return !nextTrip || (trip.departure !== nextTrip.departure || trip.arrival !== nextTrip.arrival || trip.platform !== nextTrip.platform);
    })
    timetable.push(...completePlan);
    
    await fetchChanges();

    timetableArrival.splice(0, timetableArrival.length);
    timetableDeparture.splice(0, timetableDeparture.length);
    timetableArrival.push(...timetable.filter((trip) => trip.isArrival));
    timetableDeparture.push(...timetable.filter((trip) => trip.isDeparture));
    timetableArrival.sort((a, b) => a.arrival - b.arrival);
    timetableDeparture.sort((a, b) => a.departure - b.departure);
    isLoading.timetable = false;



</script>
<style scoped>
</style>