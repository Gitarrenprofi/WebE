<script setup lang="ts">
import { defineProps } from 'vue';

defineProps<{ station: any }>();
</script>

<template>
  <h1>{{ station._attributes?.name }}</h1>
</template>

