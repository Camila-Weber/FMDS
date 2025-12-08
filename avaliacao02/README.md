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

## 🎨 2. Instalar dependências

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

## 🔥 4. Configuração do login com Google
A aplicação utiliza **Login com Google**, portanto é obrigatório criar o arquivo `.env`.

---

### ➤ 4.1 Instalar o Supabase JavaScript Client
```bash
npm install @supabase/supabase-js
```

---

### ➤ 4.2 Criar credenciais no Google Cloud (OAuth)

1. Acesse **Google Cloud Console** → crie/abra um projeto.
2. Vá em **APIs & Services → OAuth consent screen** → escolha **External** → salve.
3. Vá em **Credentials → Create Credentials → OAuth Client ID**.
4. Tipo: **Web application**.
5. Adicione em **Authorized JavaScript origins**:
   * `http://localhost:[PORTA_USADA]`
6. Adicione em **Authorized redirect URIs**:

   * `https://<SEU-PROJETO>.supabase.co/auth/v1/callback`
7. Copie **Client ID** e **Client Secret**.

---

### ➤ 4.3 Ativar Google no Supabase

1. Supabase Dashboard → **Authentication → Sign in / Providers → Google**
2. Cole **Client ID** e **Client Secret**
3. Ative o provider.

---

### ➤ 4.4 Criar o arquivo `.env`

```env
VITE_SUPABASE_URL=https://<SEU-PROJETO>.supabase.co
VITE_SUPABASE_ANON_KEY=<SUA-ANON-KEY>
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET="<CLIENT-SECRET>"
```

---

### ➤ 4.5 Código do login (frontend)

```js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

await supabase.auth.signInWithOAuth({ provider: 'google' })
```


## 🗄️ 5. Configuração do Supabase

### 5.1 Criando o Banco de dados
Execute o SQL para criar as tabelas:

```sql
-- =================================================
-- SCRIPT COMPLETO — CRIAÇÃO DO BANCO + INSERTS
-- 100% SEGURO PARA EXECUTAR NO SUPABASE
-- =================================================

CREATE SCHEMA IF NOT EXISTS public;
SET search_path TO public;

-- =========================
-- 1) books
-- =========================
CREATE TABLE IF NOT EXISTS public.books (
  id              BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title           VARCHAR(255) NOT NULL,
  author          VARCHAR(255) NOT NULL,
  avg_rating      DECIMAL(3,1) DEFAULT 0.0,
  available       BOOLEAN NOT NULL DEFAULT TRUE
);

-- =========================
-- 2) genres
-- =========================
CREATE TABLE IF NOT EXISTS public.genres (
  id          BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

-- =========================
-- 3) book_genres (N:N)
-- =========================
CREATE TABLE IF NOT EXISTS public.book_genres (
  book_id  BIGINT NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  genre_id BIGINT NOT NULL REFERENCES public.genres(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, genre_id)
);

-- =========================
-- 4) reservations
-- =========================
CREATE TABLE IF NOT EXISTS public.reservations (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  book_id       BIGINT NOT NULL,
  status        VARCHAR NOT NULL,
  reserved_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  borrowed_at   TIMESTAMP,
  due_date      TIMESTAMP,
  returned_at   TIMESTAMP,
  cancelled_at  TIMESTAMP,
  notes         TEXT,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW(),
  user_id       UUID DEFAULT auth.uid(),

  CONSTRAINT reservations_book_id_fkey
    FOREIGN KEY (book_id) REFERENCES public.books(id),
  CONSTRAINT reservations_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id)
);


-- =========================
-- 5) reviews
-- =========================
CREATE TABLE IF NOT EXISTS public.reviews (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  rating      SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title       VARCHAR,
  body        TEXT NOT NULL,
  is_public   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW(),
  user_id     UUID DEFAULT auth.uid(),
  book_id     BIGINT,

  CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT reviews_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id),

  -- evita que um mesmo usuário tenha múltiplas reviews para o mesmo livro
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

### 5.2 Crie as funções auxiliares que rodarão no banco
Execute o SQL no Banco:
```sql
DROP FUNCTION IF EXISTS public.update_book_genres(bigint, text, text, boolean, numeric, bigint[]);
DROP FUNCTION IF EXISTS public.insert_book_genres(text, text, boolean, numeric, bigint[]);

CREATE OR REPLACE FUNCTION public.update_book_genres(
  _book_id bigint,
  _title text,
  _author text,
  _genre_ids bigint[]
)

RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Verifica se livro existe
  IF NOT EXISTS (SELECT 1 FROM public.books WHERE id = _book_id) THEN
    RAISE EXCEPTION 'Livro não encontrado' USING ERRCODE = 'P0002';
  END IF;

  -- Atualiza somente os campos não nulos (permite partial update)
  UPDATE public.books
  SET
    title = COALESCE(_title, title),
    author = COALESCE(_author, author)
  WHERE id = _book_id;

  -- Substitui associações de gênero (se array fornecido)
  IF _genre_ids IS NOT NULL THEN
    -- remove associações atuais
    DELETE FROM public.book_genres WHERE book_id = _book_id;

    -- insere novas associações (se array não vazio)
    IF array_length(_genre_ids,1) > 0 THEN
      INSERT INTO public.book_genres (book_id, genre_id)
      SELECT _book_id, unnest(_genre_ids);
    END IF;
  END IF;

  -- Monta e retorna o JSONB com o livro e seus gêneros
  SELECT row_to_json(b)::jsonb
         || jsonb_build_object(
              'genres',
              COALESCE(
                (SELECT jsonb_agg(jsonb_build_object('id', g.id, 'name', g.name))
                 FROM public.genres g
                 JOIN public.book_genres bg ON g.id = bg.genre_id
                 WHERE bg.book_id = b.id),
                '[]'::jsonb
              )
            )
  INTO result
  FROM public.books b
  WHERE b.id = _book_id;

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- propaga erro com mensagem para o cliente via RPC
    RAISE;
END;
$$;

CREATE OR REPLACE FUNCTION public.insert_book_genres(
  _title       text,
  _author      text,
  _available   boolean,
  _avg_rating  numeric,
  _genre_ids   bigint[] DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  created_book_id bigint;
  result jsonb;
BEGIN
  -- Insere o livro e recebe o id
  INSERT INTO public.books (title, author, available, avg_rating)
  VALUES (_title, _author, _available, _avg_rating)
  RETURNING id INTO created_book_id;

  -- Insere associações em book_genres (se houver genre_ids)
  IF _genre_ids IS NOT NULL AND array_length(_genre_ids, 1) > 0 THEN
    INSERT INTO public.book_genres (book_id, genre_id)
    SELECT created_book_id, unnest(_genre_ids);
  END IF;

  -- Monta o JSONB de retorno: dados do livro + array de gêneros (id + name)
  SELECT row_to_json(b)::jsonb
         || jsonb_build_object(
              'genres',
              COALESCE(
                (SELECT jsonb_agg(jsonb_build_object('id', g.id, 'name', g.name))
                 FROM public.genres g
                 JOIN public.book_genres bg ON g.id = bg.genre_id
                 WHERE bg.book_id = created_book_id),
                '[]'::jsonb
              )
            )
  INTO result
  FROM public.books b
  WHERE b.id = created_book_id;

  RETURN result;
END;
$$;

```

### 5.3 Criar política de acesso
Defina a tabela **reservations** como acesso RLS e defina a política
executando:

```sql
create policy "usuario pode criar sua propria reserva"
on reservations
for insert
with check (auth.uid() = user_id);

create policy "usuario pode ver suas reservas"
on reservations
for select
using (auth.uid() = user_id);

create policy "usuario pode atualizar suas reservas"
on reservations
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "usuario pode deletar suas reservas"
on reservations
for delete
using (auth.uid() = user_id);

-- Bloquear usuários anônimos
create policy "bloquear anon"
on reservations
as restrictive
for all
to anon
using (false)
with check (false);
```

Crie o arquivo .env na raiz do projeto:
# URL da API 
VITE_API_BASE_URL=http://localhost:3001

# Supabase configuration
VITE_SUPABASE_URL=xxxxxxxxxxxxxxxxxxxxx
VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxxx

SUPABASE_URL=xxxxxxxxxxxxxxxxxxxxx
SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxxxxxxxxxxxxxx
SUPABASE_PROJECT_ID=xxxxxxxxxxxxxxxxxxxxx


##

## ▶️ 6. Executar o projeto

###  6.1 Executar o FrontEnd
Para rodar o front end:
```bash
npm run dev
```

###  6.2 Executar o BackEnd
Para rodar o back end:
```bash
npm run serve
```

## 🗂 Estrutura do Projeto

src/
├── assets/
├── components/
├── controllers/
│ └── GenreController.js
├── db/
│ ├── db.js
├── docs/
│ ├── books.yaml
│ ├── genre.yaml
│ ├── reservation.yaml
│ ├── review.yaml
│ ├── swagger.js
├── stores/
│ ├── auth.js
│ └── books.js
├── router/
│ └── index.js
├── routes/
│ └── BookRoutes.js
│ └── GenreRoutes.js
├── views/
│ ├── DashboardView.vue
│ ├── BooksListView.vue
│ ├── BookFormView.vue
│ ├── ReservationsView.vue
│ ├── ReviewsView.vue ← nova página
│ └── PublicHomeView.vue ← página pública (não autenticada)
├── firebase.js
├── App.vue
├── index.js
└── main.js