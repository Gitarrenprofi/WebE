<template>
    <div class="trip-item" :class="{'collapsable': props.trip?.departurePath?.length > 1 }" @click="isCollapsed.collapsed = !isCollapsed.collapsed" v-if="(props.trip.isDeparture && mode == 'departure') || (props.trip.isArrival && mode == 'arrival')">
      <div class="time-info" v-if="!props.trip.isCancelled">
        <div class="time-info-heading">
          <span v-if="mode == 'departure'" class="time-label">Abfahrt</span>
          <span v-if="mode == 'arrival'" class="time-label">Ankunft</span>
        </div>
        <div class="time-info-content">
          <div v-if="mode == 'departure'" class="time time-departure" :class="{'time-invalid': props.trip.isDelay}">{{ getFormattedTime(props.trip.plannedDeparture) }}</div>
          <div v-if="mode == 'departure' && props.trip.isDelay" class="time time-departure time-delay">{{ getFormattedTime(props.trip.departure) }}</div>
          <div v-if="mode == 'arrival'" class="time time-arrival" :class="{'time-invalid': props.trip.isDelay}">{{ getFormattedTime(props.trip.plannedArrival) }}</div>
          <div v-if="mode == 'arrival' && props.trip.isDelay" class="time time-arrival time-delay">{{ getFormattedTime(props.trip.arrival) }}</div>
        </div>
      </div>
      <div class="cancelled-info" v-else>
        Zug faellt aus
      </div>
      <div class="path-info">
        <div class="trip-badges">
          <span class="badge">{{ props.trip.name }}</span>
        </div>
        <h4 v-if="props.trip.isDeparture" class="destination destination-departure" :class="{'text-decoration-line-through': props.trip.isCancelled}">{{ props.trip.departurePath.slice(-1)[0] }}</h4>
        <h4 v-else class="destination destination-arrival">von {{ props.trip.arrivalPath[0] }}</h4>
        <div class="path-wrapper" v-if="props.trip.isDeparture">
          <div v-if="props.trip?.departurePath?.length > 1">
            <span class="path collapse" :class="{'path-changed': props.trip.departurePathChanged}"><small>via&nbsp;</small>{{ props.trip.departurePath.slice(0,-1).join(' > ') }}</span>
          </div>
        </div>
        <div class="path-wrapper" v-else>
          <span>Endstation.</span>
        </div>
      </div>
      <div class="platform-info">
        <span class="platform-label">Gleis</span>
        <h3 :class="{'platform-changed': props.trip.platformChanged}">{{ props.trip.platform || '?' }}</h3>
        <i v-if="props.trip?.departurePath?.length > 1" :class="{ 'bi-caret-down': isCollapsed.collapsed, 'bi-caret-up': !isCollapsed.collapsed }" class="bi bi-caret-down"></i>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { defineProps, reactive } from 'vue';
  
  const props = defineProps<{ trip: any, mode: 'departure' | 'arrival' }>();
  const isCollapsed = reactive({ collapsed: true });
  
  const getFormattedTime = (time: string) => {
    const date = new Date(time);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  </script>
  
  <style scoped>
  .trip-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .time-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 1rem;
  }
  
  .time-label {
    font-size: 0.8rem;
    color: #777;
  }
  
  .time {
    font-size: 1.2rem;
    font-weight: bold;
  }
  
  .time-invalid {
    text-decoration: line-through;
    color: #dc3545;
  }
  
  .time-delay {
    color: #dc3545;
  }
  
  .cancelled-info {
    font-size: 1.2rem;
    font-weight: bold;
    color: #dc3545;
  }
  
  .path-info {
    flex-grow: 1;
    margin-left: 1rem;
  }
  
  .trip-badges {
    margin-bottom: 0.5rem;
  }
  
  .badge {
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
    background-color: #777;
    color: #fff;
    border-radius: 0.25rem;
  }
  
  .destination-departure {
    font-size: 1.2rem;
  }
  
  .text-decoration-line-through {
    text-decoration: line-through;
  }
  
  .destination-arrival {
    font-size: 1.2rem;
    color: #777;
  }
  
  .path-wrapper {
    margin-top: 0.5rem;
  }
  
  .path {
    font-size: 0.8rem;
    color: #777;
    word-break: break-all;
  }
  
  .path-changed {
    color: #dc3545;
  }
  
  .platform-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-left: 1rem;
  }
  
  .platform-label {
    font-size: 0.8rem;
    color: #777;
  }
  
  .platform-changed {
    color: #dc3545;
  }
  
  .bi-caret-down,
  .bi-caret-up {
    font-size: 1.5rem;
    color: #777;
    margin-left: 0.5rem;
  }
  </style>
  