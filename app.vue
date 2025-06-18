// app.vue
<template>
  <div>
    <h1>Echo Browser</h1>
    <div v-if="versions">
      <p>Electron: {{ versions.electron }}</p>
      <p>Chrome: {{ versions.chrome }}</p>
      <p>Node.js: {{ versions.node }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Define a tipagem para o objeto de versões
interface AppVersions {
  node: string;
  chrome: string;
  electron: string;
}

const versions = ref<AppVersions | null>(null);

onMounted(() => {
  // Verifica se a API foi exposta pelo preload
  if (window.electronAPI) {
    // Chama a função e atualiza a referência
    window.electronAPI.getVersions().then(v => {
      versions.value = v;
    });
  }
});
</script>