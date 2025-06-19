# Guia de Desenvolvimento do Echo Browser

Este documento fornece orientações para desenvolvedores que desejam contribuir ou estender o Echo Browser.

## Ambiente de Desenvolvimento

### Requisitos

- **Node.js:** v16.x ou superior
- **npm:** v8.x ou superior (ou yarn/pnpm)
- **Editor recomendado:** VS Code com extensões:
  - Vue Language Features (Volar)
  - TypeScript Vue Plugin (Volar)
  - ESLint
  - Prettier

### Configuração Inicial

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/echo-browser.git
cd echo-browser

# Instale as dependências
npm install

# Execute em modo de desenvolvimento
npm run dev
```

## Estrutura do Projeto

A estrutura do projeto é organizada da seguinte forma:

``` bash
echo-browser/
├── app.vue                # Componente raiz da aplicação
├── components/            # Componentes reutilizáveis
├── composables/           # Lógica reutilizável (hooks)
├── electron/              # Código específico do Electron
├── readme/                # Documentação do projeto
├── public/                # Arquivos estáticos
├── assets/                # Imagens e outros recursos
├── store/                 # Gerenciamento de estado 
├── package.json           # Configurações do projeto
├── tsconfig.json          # Configurações do TypeScript
├── vite.config.ts         # Configurações do Vite
└── README.md              # Documentação do projeto
```
