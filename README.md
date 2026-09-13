# Sistema de Pesquisa Eleitoral

Aplicação web para coleta, acompanhamento e análise de pesquisas de opinião eleitoral. O sistema possui uma experiência otimizada para entrevistadores em campo e um painel administrativo para coordenação da operação.

> **Status:** projeto de portfólio em desenvolvimento. O frontend está funcional, mas a configuração atual de autenticação, autorização e persistência deve ser revisada antes de qualquer uso com dados reais.

## Visão geral

O sistema atende dois fluxos principais:

- **Entrevistador:** seleciona seu cadastro, informa o código de acesso, preenche o questionário em etapas e acompanha sua produtividade.
- **Administrador:** acessa indicadores, filtros, relatórios, comparação de rodadas, exportação CSV e gestão operacional.

### Recursos

- Formulário de pesquisa dividido em quatro etapas.
- Coleta de dados demográficos, avaliação de gestão, problemas prioritários e intenção de voto.
- Controle de horário de coleta entre 08:00 e 16:00.
- Liberação excepcional por configuração global ou código individual.
- Dashboard com visão geral, opinião, candidatos, comparação e relatórios individuais.
- Gerenciamento de entrevistadores e permissões de administrador Master/Secundário na interface.
- Exportação de dados filtrados para CSV e impressão do painel.

## Stack

- React 18
- TypeScript 5
- Vite 5
- Tailwind CSS 3
- Lucide React
- Neon Serverless Driver
- ESLint 9

## Arquitetura atual

O projeto executado a partir da raiz é uma SPA React sem backend próprio. O módulo [src/lib/supabase.ts](src/lib/supabase.ts) mantém uma API compatível com chamadas semelhantes às do Supabase, mas a persistência atual é feita por SQL através do driver `@neondatabase/serverless`.

```text
Navegador
  |
  +-- React + TypeScript + Tailwind CSS
  |     |
  |     +-- Fluxo de entrevistador
  |     +-- Painel administrativo
  |     +-- localStorage para sessão local do entrevistador
  |
  +-- src/lib/supabase.ts
        |
        +-- @neondatabase/serverless
              |
              +-- Banco PostgreSQL compatível com Neon
```

### Atenção sobre Supabase

Existe uma implementação anterior em `sistema-pesquisa-eleitoral/` que usa o SDK oficial do Supabase, além das migrações em `supabase/migrations/`. Essa pasta é uma cópia legada/paralela e não corresponde integralmente ao fluxo executado pela raiz.

Antes de publicar o projeto, escolha uma única estratégia de persistência:

1. manter o adaptador Neon e alinhar o schema SQL, autenticação e operações CRUD ao Neon; ou
2. migrar a raiz de volta para o Supabase oficial e usar as migrações e policies como base.

Não misture as variáveis e os contratos das duas integrações no mesmo ambiente.

## Pré-requisitos

- Node.js 18 ou superior.
- npm.
- Um banco PostgreSQL acessível pelo driver Neon.
- Schema compatível com as consultas usadas em `src/lib/supabase.ts`.

## Configuração local

Na raiz do projeto, instale as dependências:

```bash
npm install
```

Crie um arquivo `.env`:

```env
VITE_NEON_DATABASE_URL=postgresql://usuario:senha@host/banco?sslmode=require
```

Como essa variável começa com `VITE_`, seu valor pode ser incluído no bundle do navegador. Não use uma string de conexão com privilégios administrativos em uma aplicação client-side. Para produção, mova as operações de banco para uma API ou função server-side e exponha ao frontend apenas credenciais públicas apropriadas.

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

O Vite normalmente disponibiliza a aplicação em `http://localhost:5173`.

## Scripts

```bash
npm run dev        # inicia o servidor de desenvolvimento
npm run typecheck  # verifica os tipos TypeScript
npm run lint       # executa o ESLint
npm run build      # gera o build de produção em dist/
npm run preview    # serve o build localmente
```

Antes de abrir um pull request, execute pelo menos:

```bash
npm run typecheck
npm run lint
npm run build
```

## Fluxos da aplicação

### Entrevistador

1. Escolhe o perfil de entrevistador.
2. Seleciona um cadastro e informa seu código.
3. Aguarda o horário permitido ou utiliza uma liberação válida.
4. Preenche as etapas de classificação, opinião, candidatos e perfil político.
5. Salva a entrevista e retorna ao fluxo de coleta.

A sessão local do entrevistador é armazenada em `localStorage`. Esse mecanismo é adequado para demonstração, mas não substitui autenticação e autorização no servidor.

### Administrador

O painel oferece:

- indicadores gerais e produtividade por entrevistador;
- filtros por rodada, localidade, área e entrevistador;
- análises de opinião e intenção de voto;
- comparação entre rodadas;
- consulta, detalhamento e exclusão de entrevistas;
- relatório individual por entrevistador;
- gestão de entrevistadores e liberações operacionais;
- exportação CSV e impressão.

O perfil Master recebe controles adicionais na interface. Essa distinção precisa ser reforçada no backend antes de uso em produção.

## Banco de dados

O código ativo consulta principalmente estas entidades:

- `surveys`: respostas das entrevistas;
- `interviewers`: cadastros e códigos dos entrevistadores;
- `app_settings`: configuração de liberação global;
- `exception_codes`: códigos de exceção de uso único;
- `invite_tokens`: tokens relacionados ao fluxo de convites administrativos.

As migrações disponíveis em [supabase/migrations](supabase/migrations) documentam uma versão anterior do schema. Elas devem ser tratadas como referência até que sejam revisadas para o banco escolhido e para os nomes de campos usados pelo código atual.

### Pontos para alinhar antes da produção

- O frontend atual utiliza `cidade` em partes do fluxo, enquanto migrações legadas utilizam `bairro`.
- O campo `rodada` é usado pelo frontend e precisa existir no schema final.
- O adaptador atual não substitui uma camada segura de autenticação.
- As operações SQL devem ser executadas no servidor, nunca com uma string de conexão privilegiada exposta ao navegador.
- O schema deve incluir índices para consultas por data, entrevistador e rodada quando o volume crescer.

## Estrutura do projeto

```text
.
├── src/
│   ├── components/       # Login, coleta, dashboard e componentes visuais
│   ├── data/             # Opções da pesquisa e metas
│   ├── lib/              # Persistência, consultas e análises
│   ├── types/            # Tipos do domínio
│   ├── App.tsx           # Controle dos fluxos principais
│   └── main.tsx          # Ponto de entrada React
├── supabase/
│   └── migrations/       # Migrações legadas/referenciais
├── sistema-pesquisa-eleitoral/ # Cópia paralela com integração Supabase
├── simulate.js           # Gerador de dados sintéticos
├── index.html             # Documento de entrada
├── package.json           # Dependências e scripts
├── tailwind.config.js     # Configuração do Tailwind
├── vite.config.ts         # Configuração do Vite e alias @
└── README.md              # Documentação
```

## Dados de demonstração

O arquivo `simulate.js` pode inserir dados sintéticos para testes controlados. Execute apenas contra um banco descartável e revise o arquivo antes de usar:

```bash
node simulate.js
```

O script não substitui testes automatizados e não deve ser executado contra produção.

## Deploy

O frontend gera uma SPA estática:

```bash
npm run build
```

Publique o diretório `dist/` em um serviço compatível com Vite, como Vercel, Netlify ou Cloudflare Pages. Configure a variável de ambiente no provedor e valide o comportamento da aplicação em uma prévia antes de promover para produção.

Checklist mínimo:

- confirmar a estratégia de banco e aplicar o schema final;
- remover credenciais privilegiadas do bundle do navegador;
- implementar autenticação e autorização server-side;
- configurar HTTPS e políticas de origem;
- validar o fluxo em celular e desktop;
- testar criação, leitura, atualização e exclusão de dados;
- configurar backup, observabilidade e tratamento de erros;
- revisar a proteção de dados pessoais e o período de retenção.

## Limitações conhecidas

- Não há suíte de testes automatizados configurada.
- A autorização de perfis ainda depende de lógica de frontend.
- A sessão de entrevistador usa `localStorage`.
- O código do entrevistador é validado no cliente.
- O horário permitido depende do relógio local do dispositivo.
- O dashboard trabalha com os dados carregados no cliente, sem paginação implementada.
- O CSV pode conter dados pessoais e deve ser tratado como informação sensível.

## Licença

Este repositório não declara uma licença de distribuição. Defina uma licença antes de disponibilizar o código para uso ou redistribuição.
