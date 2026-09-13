export const CIDADES_SP = [
  'São Paulo',
  'Guarulhos',
  'Campinas',
  'São Bernardo do Campo',
  'Santo André',
  'Osasco',
  'Ribeirão Preto',
  'Sorocaba',
  'Mauá',
  'São José dos Campos',
  'Mogi das Cruzes',
  'Diadema',
  'Jundiaí',
  'Piracicaba',
  'Carapicuíba',
  'Bauru',
  'Itaquaquecetuba',
  'São Vicente',
  'Franca',
  'Praia Grande',
  'Outra Região',
];

// Compatibilidade para componentes ou painéis administrativos que ainda importam BAIRROS
export const BAIRROS = CIDADES_SP;

export const SEXOS = ['Masculino', 'Feminino', 'Outro', 'NS/NR'];

export const FAIXAS_ETARIAS = [
  '16 a 24 anos',
  '25 a 34 anos',
  '35 a 44 anos',
  '45 a 59 anos',
  '60 anos ou mais',
  'NS/NR',
];

export const ESCOLARIDADES = [
  'Ensino Fundamental Incompleto',
  'Ensino Fundamental Completo',
  'Ensino Médio Incompleto',
  'Ensino Médio Completo',
  'Ensino Superior Incompleto',
  'Ensino Superior Completo',
  'Pós-graduação',
  'NS/NR',
];

export const AREAS = ['Urbana', 'Rural'];

export const AVALIACOES = ['Ótima', 'Boa', 'Regular', 'Ruim', 'Péssima', 'NS/NR'];

export const PROBLEMAS = [
  'Saúde',
  'Segurança Pública',
  'Emprego e Renda',
  'Educação',
  'Transporte Público',
  'Custo de Vida / Inflação',
  'Moradia / Habitação',
  'Saneamento Básico',
  'Outro',
  'NS/NR',
];

export const CANDIDATOS_PRESIDENTE = [
  'Luiz Inácio Lula da Silva',
  'Tarcísio de Freitas',
  'Ciro Gomes',
  'Romeu Zema',
  'Outro',
  'Branco / Nulo',
  'NS/NR',
];

export const CANDIDATOS_GOVERNADOR = [
  'Tarcísio de Freitas',
  'Fernando Haddad',
  'Márcio França',
  'Outro',
  'Branco / Nulo',
  'NS/NR',
];

export const CANDIDATOS_SENADO = [
  'Candidato Senador SP 1',
  'Candidato Senador SP 2',
  'Candidato Senador SP 3',
  'Candidato Senador SP 4',
  'Outro',
  'Nenhum/Branco/Nulo',
  'NS/NR',
];

// Listas estruturadas para suportar a busca inteligente por Nome, Número ou Partido em SP
export const DEPUTADOS_FEDERAIS_SP = [
  { name: 'Exemplo Federal SP 1', number: '1234', party: 'PL' },
  { name: 'Exemplo Federal SP 2', number: '1313', party: 'PT' },
  { name: 'Exemplo Federal SP 3', number: '4500', party: 'PSDB' },
  { name: 'Exemplo Federal SP 4', number: '5511', party: 'UNIÃO' },
];

export const DEPUTADOS_ESTADUAIS_SP = [
  { name: 'Exemplo Estadual SP 1', number: '10123', party: 'REPUBLICANOS' },
  { name: 'Exemplo Estadual SP 2', number: '13456', party: 'PT' },
  { name: 'Exemplo Estadual SP 3', number: '22222', party: 'PL' },
  { name: 'Exemplo Estadual SP 4', number: '45111', party: 'PSDB' },
];

// Variáveis de compatibilidade para evitar erros de importação legada
export const CANDIDATOS_FEDERAL = [
  'Exemplo Federal SP 1',
  'Exemplo Federal SP 2',
  'Outro',
  'Branco / Nulo',
  'NS/NR',
];

export const CANDIDATOS_ESTADUAL = [
  'Exemplo Estadual SP 1',
  'Exemplo Estadual SP 2',
  'Outro',
  'Branco / Nulo',
  'NS/NR',
];

export const INFLUENCIA_OPCOES = ['Aumenta', 'Diminui', 'Não interfere', 'NS/NR'];

export const PESO_ESCOLHA = [
  'Trabalho realizado',
  'Propostas / Plano de governo',
  'Confiança / Caráter',
  'Partido político',
  'Apoio de lideranças',
  'Experiência administrativa',
  'Outra',
  'NS/NR',
];

export const RODADAS_PESQUISA = [
  { id: 'p1_1t', name: 'Pesquisa SP — 1º Turno' },
  { id: 'p2_1t', name: 'Pesquisa SP — 2º Turno' },
  { id: 'p3_1t', name: 'Pesquisa SP — 3º Levantamento' },
] as const;

export type RodadaId = typeof RODADAS_PESQUISA[number]['id'];

export const META_ENTREVISTAS = 1000;