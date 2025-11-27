# 📚 Sistema de Biblioteca — Gestão de Livros, Reservas e Avaliações

## 👥 Integrantes do Grupo
- **Nome 1 – Matrícula XXXXX**
- **Nome 2 – Matrícula XXXXX**
- **Nome 3 – Matrícula XXXXX**

---

## 📌 Sobre o Sistema

O sistema é uma aplicação web para **gestão de biblioteca**, permitindo:

- ✔ Cadastro, edição e remoção de livros  
- ✔ Controle de disponibilidade e reservas  
- ✔ Busca simples e avançada  
- ✔ Login com Google (Firebase Auth)  
- ✔ Dashboard dinâmico com visão geral da biblioteca  
- ✔ Avaliação e resenhas (módulo configurado para expansão)  
- ✔ Suporte aos temas claro e escuro  
- ✔ Interface responsiva com Vuetify 3 e Vue 3  

A proposta visa simplificar o gerenciamento interno de acervo, oferecendo uma experiência moderna e intuitiva para bibliotecários e administradores.

---

## 🚀 Tecnologias Utilizadas

- **Vue 3 (Composition API)**
- **Vite**
- **Vuetify 3**
- **Pinia (gerenciamento de estado)**
- **Firebase Authentication (Google Login)**
- **Material Design Icons (MDI)**

---

# 📦 Instalação e Execução

## 🔧 1. Clonar o repositório

```bash
git clone https://github.com/usuario/repositorio.git
cd repositorio
```

## 🎨 2. Instalar dependências do frontend

```bash
npm install
```

## 🔤 3. Instalação de fontes e ícones (necessário!)

O projeto usa **Material Design Icons (MDI)**.  
Caso não sejam instalados, os ícones **não aparecerão**.

Instalar:

```bash
npm install @mdi/font
```

## 🔥 4. Configuração do Firebase

A aplicação utiliza **Login com Google**, portanto é obrigatório criar o arquivo `.env`.

---

### ➤ 4.1 Instalar o Firebase

```bash
npm install firebase
```
Crie o arquivo na raiz do projeto:

VITE_FIREBASE_API_KEY=xxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=xxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_PROJECT_ID=xxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_STORAGE_BUCKET=xxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_APP_ID=xxxxxxxxxxxxxxxxxxxxx


## ▶️ 5. Executar o projeto

```bash
npm run dev
```

## 🗂 Estrutura do Projeto

src/
├── assets/
├── components/
├── stores/
│ ├── auth.js
│ └── books.js
├── router/
│ └── index.js
├── views/
│ ├── DashboardView.vue
│ ├── BooksListView.vue
│ ├── BookFormView.vue
│ ├── ReservationsView.vue
│ ├── ReviewsView.vue ← nova página
│ └── PublicHomeView.vue ← página pública (não autenticada)
├── firebase.js
├── App.vue
└── main.js