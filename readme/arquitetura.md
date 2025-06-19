# Arquitetura do Echo Browser

Este documento descreve a arquitetura do Echo Browser, seu design de sistema e os principais componentes.

## Visão Geral da Arquitetura

O Echo Browser segue uma arquitetura em camadas onde o Electron fornece a integração com o sistema operacional e o motor de renderização, enquanto o Vue.js/Nuxt gerencia a interface do usuário e a lógica de aplicação.

![Diagrama de Arquitetura](../assets/images/architecture.png)

## Processos Principais

O Electron opera com dois tipos de processos:

### Processo Principal (Main Process)

O processo principal é responsável por:

- Gerenciar janelas do navegador
- Integração com o sistema operacional
- Gerenciar o ciclo de vida do aplicativo
- Implementar recursos do sistema (ex: menus nativos)
- Fornecer APIs seguras para o processo de renderização

**Arquivos principais:**

- `electron/main.cts`: Ponto de entrada do processo principal
- `electron/preload.cts`: Script de pré-carregamento para comunicação segura

### Processo de Renderização (Renderer Process)

O processo de renderização lida com:

- Renderização da interface do usuário
- Interação do usuário
- Gerenciamento de abas, favoritos e histórico
- Comunicação com o processo principal via IPC

**Arquivos principais:**

- `app.vue`: Componente raiz da interface de usuário
- `components/`: Componentes da UI
- `composables/`: Lógica reutilizável

## Arquitetura de Componentes

O Echo Browser utiliza uma arquitetura baseada em componentes:

### Componentes Principais

#### WebViewManager

Classe central que gerencia webviews. Responsabilidades:

- Navegação e gestão do histórico de navegação
- Injeção de scripts para bloqueio de anúncios
- Gerenciamento de recursos de webview
- Tratamento de eventos de navegação

#### Sistema de Abas

Gerencia múltiplas abas de navegação:

- Criação e fechamento de abas
- Alternância entre abas
- Abas normais e privadas
- Estado de navegação por aba

#### Gerenciador de UI

Componentes para uma experiência de usuário consistente:

- Barra de ferramentas
- Gestor de favoritos
- Sistema de histórico
- Modal de configurações

## Fluxos de Dados

### Fluxo de Navegação

1. Usuário insere URL ou termo de pesquisa
2. `WebViewManager` processa a entrada e determina se é URL ou pesquisa
3. O bloqueador de anúncios verifica se o domínio deve ser bloqueado
4. Se não for bloqueado, o webview carrega a página
5. Eventos de carregamento atualizam a UI e o histórico

### Sistema de Temas

1. O sistema detecta a preferência do usuário ou do sistema operacional
2. Classes CSS são aplicadas ao nível raiz do documento
3. Componentes reagem às mudanças de tema via classes CSS
4. As preferências são salvas localmente

### Sistema de Bloqueio de Anúncios

1. Lista de domínios bloqueados é mantida no estado do aplicativo
2. Antes de cada navegação, a URL é verificada contra esta lista
3. Scripts de bloqueio são injetados em cada página carregada
4. O usuário pode personalizar a lista via interface gráfica

## Otimizações Arquiteturais

- **Lazy Loading**: Componentes menos usados são carregados apenas quando necessários
- **Suspensão de Abas**: Abas inativas têm seus recursos limitados
- **Cache Estratégico**: Resultados de operações frequentes são cacheados
