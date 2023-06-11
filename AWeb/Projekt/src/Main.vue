<template>
  <div class="main-container">
    <Railpage msg="Vite + Vue" />
  </div>
</template>

<style scoped>
.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.logo {
  width: 10em;
  height: 10em;
  border-radius: 50%;
  background-color: #fff;
  padding: 2em;
  box-shadow: 0 0 2em rgba(0, 0, 0, 0.2);
  transition: transform 300ms;
}

.logo:hover {
  transform: rotate(360deg);
  box-shadow: 0 0 4em rgba(0, 0, 0, 0.4);
}
</style>

<script setup lang="ts">
import Railpage from './Start.vue'
</script>
