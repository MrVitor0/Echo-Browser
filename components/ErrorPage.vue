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
          <li>Verifique o endereço digitado</li>
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
// Definição de props tipadas
const props = defineProps<{
  url: string;
  errorCode?: number;
  title?: string;
}>();

// Valor padrão para título
const title = props.title || "Página não encontrada";

// Métodos
function goBack(): void {
  window.history.back();
}

function retry(): void {
  window.location.reload();
}
</script>

<style scoped>
.error-page {
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;
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

.action-button.primary:hover {
  background-color: #1766ca;
}
</style>
