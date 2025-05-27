# Sistema de Gerenciamento e Montagem de Recortes de Produtos

Este é o frontend para o Sistema de Criação de Modelos com Montagem de Imagens. Ele permite gerenciar recortes de um produto, visualizar esses recortes em camadas que, combinadas, formam uma única imagem final, e realizar operações de CRUD sobre esses recortes.

### Autenticação

- Login com Google utilizando NextAuth.js.
- Logout.
- Proteção de rotas para garantir que apenas usuários autenticados acessem o sistema principal.
- Propagação de `idToken` para chamadas seguras à API backend.

### Dashboard (`/dashboard`)

- Listagem paginada de todos os recortes do usuário.
- Tabela de recortes (`CutsTable`) com informações como Título (Nome do Modelo), SKU, Tipo de Produto, Ordem e Status.
- Busca textual local (client-side) para filtrar os recortes exibidos na página atual da tabela.
- Dropdown para ordenação dos recortes (ex: por Nome do Modelo, Ordem de Exibição), que interage com o backend.
- Linhas da tabela clicáveis, levando para a página de edição do recorte selecionado.
- Melhorias de responsividade na tabela para melhor visualização em dispositivos móveis (ocultando colunas menos críticas).
- Botão "Adicionar Peça" para navegar para a página de criação.

### Gerenciamento de Recortes (CRUD)

- **Página de Criação (`/dashboard/cuts/new`)**:
  - Formulário completo para cadastrar novos recortes com todos os campos detalhados (SKU, Nome do Modelo, Tipo do Recorte, Posição, Tipo do Produto, Material, Cor do Material, Ordem de Exibição, Status).
  - Validação de formulário utilizando React Hook Form e Zod.
  - Funcionalidade de upload de imagem com preview.
  - Barra "Alterações não salvas" que aparece dinamicamente.
  - Submissão dos dados e da imagem para a API backend (`POST /cuts`).
  - Feedback visual durante a submissão e mensagens de sucesso/erro.
  - Componente `ProductDataCard` exibe um placeholder para a "Chave key gerada".
- **Página de Edição (`/dashboard/cuts/edit/[id]`)**:
  - Busca os dados do recorte existente da API ao carregar.
  - Preenche o formulário com os dados existentes.
  - Permite a atualização de todos os campos e a substituição opcional da imagem.
  - Submissão dos dados atualizados para a API backend (`PUT /cuts/[id]`).
  - Botão "Excluir Peça" com diálogo de confirmação, que chama a API backend (`DELETE /cuts/[id]`).
  - Botão "Descartar" para reverter o formulário aos dados originalmente carregados.
  - Exibição da "Chave key gerada" (extraída da `imageUrl` do recorte) no `ProductDataCard`.

### Visualização e Montagem de Imagens

- **Página de Seleção de Peças (`/visualization`)**:
  - Tabela (`VisualizationTable`) listando recortes com checkboxes para seleção.
  - Lógica para permitir a seleção de **exatamente 3 peças**.
  - Coluna "Key" exibindo a chave extraída da `imageUrl`.
  - Paginação e ordenação (similar ao Dashboard).
  - Busca textual local.
  - Botão "GERAR IMAGEM" habilitado apenas com 3 peças selecionadas, que navega para a página de montagem.
  - Responsividade da tabela aprimorada para dispositivos móveis.
- **Página de Montagem de Imagem (`/visualization/assembly`)**:
  - Recebe os IDs das 3 peças selecionadas via parâmetros de URL.
  * Busca os dados completos das 3 peças da API.
  * Exibe à esquerda uma lista com as "Keys" e a "Ordem de Exibição" das peças (coluna "Ordem" oculta no mobile).
  * Renderiza à direita as 3 imagens sobrepostas, respeitando o `displayOrder` para o correto empilhamento visual.
  * Layout responsivo, incluindo truncamento de título.

### Outras Funcionalidades e Melhorias

- **Layout Responsivo Global:** Uso de Route Groups (`(main)`) para um layout consistente com `Sidebar` e `Header`.
- **Sidebar (`Sidebar.tsx`):** Responsiva, com menu "hamburger" para mobile, links de navegação e indicação de rota ativa.
- **Página 404 Personalizada:** Exibida para rotas não encontradas.
- **Testes:** Configuração do Jest e React Testing Library, com testes unitários e de integração para diversos componentes e páginas.

## Tecnologias Utilizadas

- **Next.js 14+** (App Router)
- **React 18+**
- **TypeScript**
- **Tailwind CSS** (para estilização)
- **NextAuth.js** (para autenticação com Google Provider)
- **React Hook Form** (para gerenciamento de formulários)
- **Zod** (para validação de schemas)
- **Jest** (para testes)
- **React Testing Library** (para testes de componentes React)

## Pré-requisitos

- Node.js (v18.x ou superior recomendado)
- npm ou yarn
- Um backend correspondente rodando e acessível (configurar a URL no `.env.local`).

## Configuração do Ambiente de Desenvolvimento

1.  **Clone o repositório (se aplicável):**

    ```bash
    git clone https://github.com/FellipeMiguel/recortes-frontend.git
    cd recortes-frontend
    ```

2.  **Instale as dependências:**

    ```bash
    npm install
    ```

    ou

    ```bash
    yarn install
    ```

3.  **Configure as Variáveis de Ambiente:**
    Crie um arquivo `.env.local` na raiz do projeto frontend e adicione as seguintes variáveis (substitua pelos seus valores reais):
    ```env
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=gere_um_secret_aqui # Ex: openssl rand -hex 32
    GOOGLE_CLIENT_ID=SEU_GOOGLE_CLIENT_ID
    GOOGLE_CLIENT_SECRET=SEU_GOOGLE_CLIENT_SECRET
    NEXT_PUBLIC_API_URL=http://localhost:3001 # URL do seu backend
    ```

## Rodando o Projeto

1.  **Modo de Desenvolvimento:**

    ```bash
    npm run dev
    ```

    ou

    ```bash
    yarn dev
    ```

    Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## Rodando os Testes

Para rodar todos os testes unitários e de integração configurados com Jest e React Testing Library:

```bash
npm test
```

````

ou

```bash
yarn test
```

Para rodar os testes em modo de observação (watch mode):

```bash
npm run test:watch
```

ou

```bash
yarn test:watch
```

## Estrutura de Pastas Principal (Simplificada)

```
/
├── public/                 # Arquivos estáticos (imagens, fontes, etc.)
├── src/
│   ├── app/                # Rotas principais (App Router)
│   │   ├── (main)/         # Route group para layout compartilhado
│   │   │   ├── dashboard/
│   │   │   │   ├── cuts/
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── edit/
│   │   │   │   │       └── [id]/
│   │   │   │   │           └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── visualization/
│   │   │   │   ├── assembly/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx    # Layout com Sidebar e Header
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── layout.tsx      # Layout Raiz Global
│   │   └── not-found.tsx   # Página 404
│   ├── components/         # Componentes React reutilizáveis
│   │   ├── cuts/           # Componentes específicos para "Recortes"
│   │   ├── ui/             # Componentes de UI genéricos (ex: StatusPill)
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── types/              # Definições de tipos TypeScript
│   │   └── index.ts
│   ├── utils/              # Funções utilitárias
│   │   └── stringUtils.ts
│   └── middleware.ts       # Middleware de autenticação
├── .env.local              # Variáveis de ambiente (não versionar)
├── next.config.js          # Configuração do Next.js
├── jest.config.js          # Configuração do Jest
├── jest.setup.js           # Setup para Jest (ex: import @testing-library/jest-dom)
├── package.json
└── tsconfig.json
```


````

## Deploy

Para testar o app acesse o [link](http://localhost:3000)
