# 📚 Sistema de Biblioteca — Gestão de Livros, Reservas e Avaliações

## 👥 Integrantes do Grupo
- **CAMILA WEBER – Matrícula 20230006577 – camila.weber@unemat.br (front-end)**
- **VITOR EMANUEL SILVA SAUZEN  – Matrícula 20230013295 – vitor.sauzen@unemat.br (api)**
- **WILLEN SILVA DE SOUZA – Matrícula 20230020039 – willen.silva@unemat.br (banco)**

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
- **Supabase — armazena todos os dados da aplicação (usuários, livros, reservas e avaliações)**
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

## 🗄️ 5. Configuração do Supabase

```sql
-- =================================================
-- SCRIPT COMPLETO — CRIAÇÃO DO BANCO + INSERTS
-- 100% SEGURO PARA EXECUTAR NO SUPABASE
-- =================================================

CREATE SCHEMA IF NOT EXISTS public;
SET search_path TO public;

-- =========================
-- 1) users
-- =========================
CREATE TABLE IF NOT EXISTS public.users (
  id           BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  google_sub   VARCHAR(64) UNIQUE,
  name         VARCHAR(150) NOT NULL,
  email        VARCHAR(150) NOT NULL UNIQUE,
  photo_url    VARCHAR(255),
  role         VARCHAR(20) DEFAULT 'user',
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- =========================
-- 2) books
-- =========================
CREATE TABLE IF NOT EXISTS public.books (
  id              BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title           VARCHAR(255) NOT NULL,
  author          VARCHAR(255) NOT NULL,
  synopsis        TEXT,
  published_year  INT,
  isbn            VARCHAR(20) UNIQUE,
  pages           INT,
  cover_url       VARCHAR(255),

  available       BOOLEAN NOT NULL DEFAULT TRUE,

  avg_rating      DECIMAL(3,1) DEFAULT 0.0,
  reviews_count   INT DEFAULT 0,

  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- =========================
-- 3) genres
-- =========================
CREATE TABLE IF NOT EXISTS public.genres (
  id          BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

-- =========================
-- 4) book_genres (N:N)
-- =========================
CREATE TABLE IF NOT EXISTS public.book_genres (
  book_id  BIGINT NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  genre_id BIGINT NOT NULL REFERENCES public.genres(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, genre_id)
);

-- =========================
-- 5) reservations
-- =========================
CREATE TABLE IF NOT EXISTS public.reservations (
  id            BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id       BIGINT NOT NULL REFERENCES public.users(id),
  book_id       BIGINT NOT NULL REFERENCES public.books(id),

  status        VARCHAR(20) NOT NULL, -- reserved, borrowed, returned, cancelled
  reserved_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  borrowed_at   TIMESTAMP,
  due_date      TIMESTAMP,
  returned_at   TIMESTAMP,
  cancelled_at  TIMESTAMP,
  notes         TEXT,

  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- =========================
-- 6) reviews
-- =========================
CREATE TABLE IF NOT EXISTS public.reviews (
  id          BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id     BIGINT NOT NULL REFERENCES public.users(id),
  book_id     BIGINT NOT NULL REFERENCES public.books(id),

  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title       VARCHAR(255),
  body        TEXT NOT NULL,
  is_public   BOOLEAN NOT NULL DEFAULT TRUE,

  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW(),

  CONSTRAINT uq_reviews_user_book UNIQUE (user_id, book_id)
);

-- =========================
-- Índices úteis
-- =========================
CREATE INDEX IF NOT EXISTS idx_books_title ON public.books (title);
CREATE INDEX IF NOT EXISTS idx_books_author ON public.books (author);
CREATE INDEX IF NOT EXISTS idx_reviews_book_id ON public.reviews (book_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON public.reservations (user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_book_id ON public.reservations (book_id);

-- =========================
-- INSERT — GÊNEROS LITERÁRIOS
-- =========================
INSERT INTO genres (name, description) VALUES
('Romance', 'Narrativas focadas em relações humanas, emoções e desenvolvimento dos personagens.'),
('Ficção Científica', 'Histórias baseadas em avanços científicos, tecnologia e cenários futuristas.'),
('Fantasia', 'Narrativas que envolvem elementos mágicos, criaturas imaginárias e mundos fictícios.'),
('Aventura', 'Enredos centrados em jornadas, desafios e exploração de ambientes desconhecidos.'),
('Terror', 'Textos que buscam causar medo, tensão e desconforto no leitor.'),
('Suspense', 'Histórias com clima de tensão crescente e expectativa pelo desfecho.'),
('Mistério', 'Obras envolvendo enigmas, investigação e revelação de segredos.'),
('Drama', 'Narrativas focadas em conflitos emocionais e situações intensas da vida humana.'),
('Comédia', 'Textos voltados ao humor e à diversão, com situações engraçadas e leves.'),
('Poesia', 'Gênero que utiliza linguagem artística, ritmo e métrica para expressão literária.'),
('Biografia', 'Relatos sobre a vida de uma pessoa real escritos por outro autor.'),
('Autobiografia', 'Relato da vida de uma pessoa escrito por ela mesma.'),
('História', 'Livros que analisam, explicam ou narram fatos e eventos históricos reais.'),
('Filosofia', 'Textos que abordam questões existenciais, éticas, lógicas e de pensamento humano.'),
('Autoajuda', 'Obras destinadas ao desenvolvimento pessoal e bem-estar emocional.'),
('Religião', 'Livros que tratam de doutrinas, crenças e práticas religiosas.'),
('Ciências Humanas', 'Obras relacionadas a áreas como sociologia, psicologia, antropologia e educação.'),
('Ciências Exatas', 'Livros sobre matemática, física, química e áreas correlatas.'),
('Crônicas', 'Textos curtos que comentam situações cotidianas com linguagem leve.'),
('Conto', 'Narrativas curtas e objetivas, geralmente com poucos personagens.'),
('Infantil', 'Livros destinados ao público infantil, com linguagem acessível e temas lúdicos.'),
('Jovem Adulto', 'Obras voltadas ao público jovem, abordando temas de amadurecimento.'),
('Distopia', 'Histórias que apresentam sociedades opressoras ou futuros decadentes.'),
('Cyberpunk', 'Subgênero futurista com foco em tecnologia avançada e cenários urbanos decadentes.'),
('Steampunk', 'Obras ambientadas em realidades alternativas com tecnologia movida a vapor.'),
('Chick-lit', 'Narrativas leves voltadas ao público feminino, envolvendo humor e cotidiano.'),
('Policial', 'Livros focados em crimes, investigações e resolução de casos.'),
('Thriller', 'Enredos acelerados e tensos, geralmente envolvendo perseguições e perigos.'),
('Clássicos', 'Livros consagrados pela crítica e pela história da literatura.');

```
Crie o arquivo na raiz do projeto:

VITE_FIREBASE_API_KEY=xxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=xxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_PROJECT_ID=xxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_STORAGE_BUCKET=xxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_APP_ID=xxxxxxxxxxxxxxxxxxxxx


## ▶️ 6. Executar o projeto

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