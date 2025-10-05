# 🥗 Catálogo de Receitas Saudáveis

Aplicação desenvolvida com **Vue 3 + Vuetify 3**, demonstrando domínio de **componentização**, **vue-router**, **bindings/diretivas** e **persistência local via localStorage**.  

O projeto implementa um **CRUD completo de receitas**, com **login via Google**, **modo escuro**, **filtro avançado**, **estatísticas**, **exportação/importação de dados** e **interface responsiva**.  


---
### 👩‍💻 Equipe
| Integrante |	Matrícula |
|------------|-------------|
| **Camila Weber** | 20230006577 |


---

## 📋 Tema Escolhido

**T1 — Catálogo de Receitas Saudáveis**  

Funcionalidades principais:

- CRUD de receitas (título, ingredientes, modo de preparo, tags)  
- Listagem em **cards** com busca, filtro e avaliação por estrelas  
- Página **Sobre** com dicas gerais e informações do sistema  
- Login via **Google OAuth** (Firebase Authentication)  
- Interface com **tema escuro caramelo** e foco acessível  
- Persistência de dados no **localStorage** do navegador  

---

## ⚙️ Tecnologias Utilizadas

| Categoria | Ferramenta |
|------------|-------------|
| Framework | [Vue 3](https://vuejs.org/) |
| UI Library | [Vuetify 3](https://vuetifyjs.com/) |
| Router | [vue-router 4](https://router.vuejs.org/) |
| Estado | [Pinia](https://pinia.vuejs.org/) |
| Autenticação | [Firebase Auth (Google)](https://firebase.google.com/) |
| Persistência | localStorage |
| Ícones | [Material Design Icons](https://pictogrammers.com/library/mdi/) |


---

## 🌐 Estrutura de Rotas

| Rota | Componente | Descrição |
|------|-------------|-----------|
| `/login` | `Login.vue` | Tela de login com botão Google |
| `/` | `Home.vue` | Catálogo de receitas com filtro e busca |
| `/receitas` | `RecipesCrud.vue` | CRUD completo de receitas |
| `/sobre` | `About.vue` | Dicas gerais e versão do sistema |

> 🔒 As rotas são protegidas: o usuário precisa estar logado para acessar o sistema.

---

## 🧠 Estrutura de Componentes

| Componente | Função |
|-------------|--------|
| `RecipeCard.vue` | Exibe receita em card, com botões de editar/remover/avaliar |
| `LoginButton.vue` | Botão de login com Google (usado no AppBar e Login.vue) |
| `FilterPanel.vue` | (opcional) Exibe filtros avançados no catálogo |
| `App.vue` | Layout principal: AppBar, Drawer, troca de tema e navegação |
| `vuetify.js` | Define tema escuro e claro (caramelo/areia) |

---

## 🧾 Requisitos Atendidos

| Critério | Implementado |
|-----------|--------------|
| R1. 3+ páginas/rotas | ✅ Home, CRUD, Sobre, Login |
| R2. Router | ✅ vue-router configurado |
| R3. Componentização | ✅ RecipeCard, LoginButton, FilterPanel |
| R4. Diretivas v-for / v-if / v-bind / v-model | ✅ amplamente utilizadas |
| R5. UI Vuetify | ✅ AppBar, Drawer, Cards, Buttons, Dialogs, Snackbars |
| R6. Persistência localStorage | ✅ receitas persistem entre recargas |
| R7. CRUD funcional | ✅ criar, editar, remover, listar receitas |
| R8. Projeto executável via `npm run dev` | ✅ |
| Bônus | ✅ Dark mode, snackbar, diálogos de confirmação, foco acessível |

---

## 💻 Instalação e Execução

### 📦 Pré-requisitos

- **Node.js 20.x** ou superior  
  (testado com Node 20.11.0)  
- **npm 9.x** ou **bun/pnpm** (opcional)

---

### 🚀 Passos para rodar localmente

```bash
# 1️⃣ Clonar o repositório
git clone https://github.com/<SEU-USUARIO>/<SEU-REPOSITORIO>.git
cd <SEU-REPOSITORIO>

# 2️⃣ Instalar dependências
npm install
# ou
pnpm install
# ou
bun install

# 3️⃣ Configurar variáveis do Firebase
# Crie um arquivo .env na raiz com:
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...

# 4️⃣ Rodar o servidor de desenvolvimento
npm run dev

A aplicação será executada em:
👉 http://localhost:3000
```

---


### 🔐 Login com Google

A autenticação é implementada com Firebase Auth (GoogleProvider).
Ao logar, o sistema armazena nome e foto do usuário no Pinia Store (auth.js) e exibe no AppBar.

### 🪶 Persistência

As receitas são salvas automaticamente no localStorage sob a chave recipes-v1.
Há opções na página Sobre para exportar/importar backup em JSON ou limpar os dados.

### 🧁 Interface e Tema

O tema principal é escuro caramelo, com foco dourado acessível:

```js
const coresDark = {
  dark: true,
  colors: {
    background: '#12100E',
    surface: '#1E1B18',
    primary: '#8B4513',
    secondary: '#C08A5C',
    info: '#CAA472'
  }
}
```

Inclui modo claro alternável pelo ícone de tema na AppBar.
