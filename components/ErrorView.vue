<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-icon">🔍</div>
      <h1>{{ title }}</h1>
      <p>
        Não foi possível carregar a página: <strong>{{ url }}</strong>
      </p>
      <p v-if="errorCode">Código de erro: {{ errorCode }}</p>
      <div class="error-suggestions">
        <p>Sugestões:</p>
        <ul>
          <li>Verifique se o endereço foi digitado corretamente</li>
          <li>Certifique-se de que você está conectado à internet</li>
          <li>Verifique se o site está disponível</li>
        </ul>
      </div>
      <div class="error-actions">
        <button class="action-button" @click="goBack">Voltar</button>
        <button class="action-button primary" @click="retry">
          Tentar novamente
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props do componente
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  url: string;
  errorCode?: number;
  title?: string;
}>();

// Emits para ações
const emit = defineEmits<{
  back: [];
  retry: [];
}>();

// Métodos para as ações
function goBack(): void {
  emit("back");
}

function retry(): void {
  emit("retry");
}
</script>

<style scoped>
.error-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif;
}

.error-container {
  max-width: 500px;
  padding: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

h1 {
  font-size: 24px;
  margin-bottom: 16px;
  color: #333;
}

p {
  margin-bottom: 16px;
  color: #555;
}

.error-suggestions {
  text-align: left;
  margin: 24px 0;
}

.error-suggestions ul {
  padding-left: 20px;
}

.error-suggestions li {
  margin: 8px 0;
  color: #666;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}

.action-button {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  background-color: #e0e0e0;
  color: #333;
  transition: background-color 0.2s;
}

.action-button:hover {
  background-color: #d0d0d0;
}

.action-button.primary {
  background-color: #1a73e8;
  color: white;
}

.action-button.primary:hover {
  background-color: #1766ca;
}

/* Estilos para tema escuro */
:global(.dark-mode) .error-page {
  background-color: #202124;
}

:global(.dark-mode) .error-container {
  background-color: #292a2d;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

:global(.dark-mode) h1 {
  color: #e4e4e4;
}

:global(.dark-mode) p {
  color: #9aa0a6;
}

:global(.dark-mode) .error-suggestions li {
  color: #9aa0a6;
}

:global(.dark-mode) .action-button {
  background-color: #3c4043;
  color: #e4e4e4;
}

:global(.dark-mode) .action-button:hover {
  background-color: #4a4c50;
}

:global(.dark-mode) .action-button.primary {
  background-color: #8ab4f8;
  color: #202124;
}

:global(.dark-mode) .action-button.primary:hover {
  background-color: #aecbfa;
}
</style>
