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
	|     +-- Supabase Auth (administradores)
	|     +-- Supabase PostgREST (dados e configurações)
	|     +-- localStorage (sessão do entrevistador)
	|
	+-- Supabase PostgreSQL
```

### Tecnologias e bibliotecas

- **React 18:** construção da interface por componentes e gerenciamento de estado.
- **TypeScript 5:** tipagem estática dos dados, sessões e propriedades dos componentes.
- **Vite 5:** servidor de desenvolvimento, resolução de módulos e build de produção.
- **Tailwind CSS 3:** estilização utilitária e responsividade.
- **PostCSS e Autoprefixer:** processamento e compatibilidade do CSS.
- **Supabase JS:** integração com PostgreSQL via PostgREST e Supabase Auth.
- **Supabase Auth:** login por email e senha para administradores.
- **Lucide React:** biblioteca de ícones usada nos controles e painéis.
- **ESLint 9 e typescript-eslint:** análise estática do código TypeScript/React.
- **Node.js e npm:** instalação de dependências e execução dos scripts do projeto.

### Configurações relevantes

- Alias `@/*` aponta para `src/*`.
- O código-fonte da aplicação está em `src/`.
- O build de produção é gerado em `dist/`.
- Não há roteamento React; as telas são controladas pelo estado da aplicação.
- Não há framework de testes automatizados configurado atualmente.

## 3. Estruturação do Banco de Dados

As migrações ficam em `supabase/migrations/` e devem ser executadas no projeto Supabase na ordem cronológica dos nomes dos arquivos.

### Tabela `surveys`

Armazena cada questionário enviado. Contém:

- Identificação: `id`, `interviewer_name`, `created_at`.
- Classificação: `bairro`, `sexo`, `faixa_etaria`, `escolaridade`, `area`.
- Opinião: `aval_prefeta`, `aval_governadora`, `problema_principal` e campo livre para outra resposta.
- Intenção de voto: listas `senado_espontanea` e `senado_estimulada`, com até duas escolhas, além de rejeição, deputado federal e deputado estadual.
- Perfil político: `influencia_apoio`, `peso_escolha`, campo livre complementar e `veiculo_comunicacao`.
- A aplicação também utiliza o campo `rodada` para identificar uma das rodadas da pesquisa.

Há índices para entrevistador, bairro, área e data de criação. O painel lê os registros, aplica filtros no cliente, calcula percentuais e gera exportações CSV no navegador.

### Tabela `interviewers`

Mantém a equipe cadastrada:

- `id`: identificador UUID.
- `name`: nome exibido ao entrevistador.
- `code`: código/ID individual, com índice único parcial.
- `phone`: telefone opcional.
- `is_active`: define se o cadastro aparece no login de entrevistador.
- `created_by` e `created_at`: auditoria básica do cadastro.

O administrador Master pode cadastrar, listar, pesquisar, filtrar, ativar, desativar e excluir entrevistadores.

### Tabela `app_settings`

Tabela singleton, limitada ao registro `id = 1`, usada para armazenar a liberação global fora do horário padrão:

- `override_active`;
- `override_expires_at`;
- `updated_at`;
- `updated_by`.

### Tabela `exception_codes`

Armazena códigos de liberação individual de uso único:

- `code`: valor único informado ao entrevistador;
- `used`: indica se já foi consumido;
- `created_by`, `created_at` e `used_at`.

O administrador Master gera, copia e exclui códigos. O entrevistador valida um código disponível e, em seguida, ele é marcado como usado.

### Fluxo de dados

1. O administrador configura a equipe e, quando necessário, uma liberação de horário.
2. O entrevistador escolhe um cadastro ativo e informa o código individual.
3. Dentro do horário de coleta, o formulário fica disponível automaticamente. Fora dele, é necessário um override global ou código de exceção.
4. O formulário envia uma linha para `surveys` após a quarta etapa.
5. O painel consulta os dados, filtra e calcula os indicadores no cliente.

### Segurança e pré-requisitos do schema

As migrações atuais liberam `SELECT`, `INSERT`, `UPDATE` e, em alguns casos, `DELETE` para `anon` e `authenticated`. A separação Master/Secundário é aplicada principalmente no frontend e não está representada por policies específicas no banco. Portanto, essa configuração deve ser considerada adequada apenas para ambiente controlado ou protótipo até que as policies sejam endurecidas.

Há duas verificações importantes antes da implantação:

- O frontend usa `surveys.rodada`, mas a migração inicial de `surveys` não declara essa coluna. Crie uma migração complementar ou ajuste o schema antes de usar filtros e comparativos por rodada.
- O cadastro de administradores secundários consulta `invite_tokens`, mas não existe migração dessa tabela neste repositório. O fluxo de convite secundário exige que essa tabela e suas policies sejam criadas no Supabase.

## 4. Funcionalidades Principais

### Modo Entrevistador

O acesso começa na tela de login, que lista apenas entrevistadores ativos. Após selecionar o nome, o usuário precisa informar o código correspondente ao cadastro.

#### Controle de coleta

- Horário padrão: das **08h às 16h**, conforme o relógio local do navegador.
- Fora do horário, o acesso ao formulário é bloqueado.
- Um administrador pode liberar todos os entrevistadores por duração determinada ou indefinida.
- Um código individual de uso único também pode liberar a coleta fora do horário.
- A tela apresenta contadores de entrevistas próprias, total geral e quantidade restante para a meta de 400 entrevistas.

#### Formulário em quatro etapas

1. **Classificação:** rodada, bairro/localidade, sexo, faixa etária, escolaridade e área urbana/rural.
2. **Opinião:** avaliação da prefeita, avaliação da governadora e principal problema de Bezerros.
3. **Candidatos:** Senado espontâneo e estimulado, com até duas escolhas, e rejeição para o Senado.
4. **Perfil político:** deputado federal, deputado estadual, influência do apoio da prefeita, fator de escolha e veículo de comunicação.

A primeira etapa possui validações para os campos de classificação. As respostas são enviadas ao Supabase ao clicar em **Salvar Questionário** e o formulário é preparado para a próxima entrevista.

### Painel Administrativo / Coordenador

Após o login com Supabase Auth, o administrador acessa um painel com:

- **Visão Geral:** distribuição por bairro, área, sexo, faixa etária, escolaridade e produtividade por entrevistador.
- **Opinião:** avaliações de gestão, problemas principais, influência de apoio e fatores de escolha.
- **Candidatos:** intenções espontâneas e estimuladas para o Senado, rejeição e escolhas para deputados.
- **Comparativo / Cruzamento:** comparação da intenção de voto entre duas rodadas.
- **Entrevistas:** tabela de registros com filtros, visualização de detalhes e exclusão protegida por senha para Master.
- **Relatório Individual:** entrevistas, bairros cobertos, dias de coleta e envios detalhados por entrevistador.
- **Exportação e impressão:** geração de CSV dos dados filtrados e impressão do painel.

#### Recursos exclusivos do Administrador Master

- Gerenciamento da equipe de entrevistadores.
- Ativação e desativação de acessos.
- Controle de liberação global de horário.
- Geração, cópia e exclusão de códigos de exceção.
- Exclusão de entrevistas mediante confirmação da senha do Supabase Auth.

Administradores Secundários visualizam os dados e relatórios, mas não recebem as abas de gestão da equipe e controle de acessos na interface.

## 5. Guia de Instalação e Execução Local

### Pré-requisitos

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

O Vite exibirá a URL local, normalmente `http://localhost:5173`.

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
npm run dev        # servidor de desenvolvimento
npm run build      # build de produção em dist/
npm run preview    # servir o build localmente
npm run typecheck  # verificação TypeScript
npm run lint       # análise estática ESLint
```

### Simulação de dados

O arquivo `simulate.js` realiza inserções sintéticas diretamente na tabela `surveys`, com 20 registros simultâneos por padrão. Ele não autentica usuários e pode poluir a base com dados falsos. Execute somente em um projeto Supabase de teste e revise as credenciais embutidas no arquivo antes de usar:

```bash
node simulate.js
```

O script não substitui testes automatizados e não deve ser executado contra produção.

## Deploy

O frontend gera uma SPA estática:

```bash
npm run build
```

O diretório gerado para publicação é `dist/`.

### Deploy contínuo na Vercel

Para configurar o deploy contínuo:

1. Importe o repositório no painel da Vercel.
2. Configure o framework como **Vite** ou deixe a detecção automática identificar o projeto.
3. Defina o comando de build como `npm run build`.
4. Defina o diretório de saída como `dist`.
5. Cadastre `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nas variáveis de ambiente da Vercel para os ambientes desejados.
6. Faça um deploy de preview e valide login, leitura do banco, cadastro de entrevistador e envio de questionário.
7. Promova o deploy para produção após confirmar a configuração do Supabase Auth e as URLs permitidas.

Cada push para a branch conectada pode gerar um novo build automaticamente. O repositório não possui configuração específica de Vercel, portanto as migrações do Supabase precisam ser aplicadas separadamente, manualmente ou por um pipeline próprio.

### Checklist de produção

- Confirmar que todas as migrações foram aplicadas no projeto Supabase correto.
- Criar as estruturas ausentes de `rodada` e `invite_tokens`, se os respectivos fluxos forem utilizados.
- Configurar URLs de redirecionamento e confirmação de email no Supabase Auth.
- Revisar as policies RLS e restringir operações administrativas a usuários autorizados.
- Nunca expor chaves secretas no frontend ou nas variáveis `VITE_*`.
- Testar o fluxo de entrevistador em dispositivos móveis.
- Validar horário, fuso local e comportamento de códigos de exceção.
- Evitar executar `simulate.js` contra a base de produção.

## Estrutura de Pastas

```text
.
├── src/
│   ├── components/       # Telas, abas, formulário e componentes visuais
│   ├── data/             # Opções da pesquisa e meta de entrevistas
│   ├── lib/              # Cliente Supabase e funções analíticas/exportação
│   └── types/            # Tipos TypeScript do domínio
├── supabase/
│   └── migrations/       # Schema, policies e índices do banco
├── index.html            # Documento HTML de entrada
├── simulate.js           # Inserção sintética para testes controlados
├── package.json          # Dependências e scripts
├── tailwind.config.js    # Configuração do Tailwind CSS
├── vite.config.ts        # Configuração do Vite e alias @
└── README.md             # Documentação do projeto
```

## Limitações Conhecidas

- Não há testes automatizados configurados.
- O painel carrega as entrevistas sem paginação, o que pode impactar grandes volumes.
- A autorização Master/Secundário não é reforçada integralmente pelas policies do banco.
- Códigos de entrevistador são carregados no navegador para validação client-side.
- O horário depende do relógio local do dispositivo.
- A sessão do entrevistador é armazenada no `localStorage` e não usa Supabase Auth.
- Entrevistas identificam o autor por texto em `interviewer_name`, sem vínculo com uma identidade autenticada.
- O CSV é produzido no navegador e pode conter informações sensíveis.
