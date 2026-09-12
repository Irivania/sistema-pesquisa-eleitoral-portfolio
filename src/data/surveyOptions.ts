export const BAIRROS = [
  'Centro',
  'Cruzeiro',
  'São José',
  'São Pedro',
  'Santo Amaro',
  'Rosário',
  'Mororó',
  'Encruzilhada de São João',
  'Gameleira',
  'Retiro',
  'São Sebastião',
  'São Rafael',
  'Irmã Júlia',
  'Francisco de Moraés Araújo',
  'Queimadas D\'Àntas',
  'Nossa Senhora Aparecida',
  'Residencial Bezerros',
  'Residencial Campestre',
  'Areias',
  'Cajazeiras',
  'Boas Novas',
  'Sapucarana',
  'Serra Negra',
];

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
  'Segurança',
  'Emprego',
  'Limpeza/lixo',
  'Calçamento/infraestrutura',
  'Água/abastecimento',
  'Educação',
  'Estradas',
  'Iluminação',
  'Outra',
  'NS/NR',
];

export const CANDIDATOS_SENADO = [
  'Carlos Sant\'Anna',
  'Eduardo da Fonte',
  'Gorett Bitu',
  'Humberto Costa',
  'Mailson da Silva Neto',
  'Mariano Macedo',
  'Marília Arraes',
  'Mendonça Filho',
  'Pastor Gilvan Costa',
  'Paulo Rubem Santiago',
  'Samuel Timóteo',
  'Túlio Gadelha',
  'Outro',
  'Nenhum/Branco/Nulo',
  'NS/NR',
];

export const CANDIDATOS_FEDERAL = [
  'Ricardo Teobaldo',
  'Juliana de Chaparral',
  'Queiroz Coutinho',
  'Felipe Carreras',
  'Zé Augusto',
  'Pedro Campos',
  'Outro',
  'Nenhum/Branco/Nulo',
  'NS/NR',
];

export const CANDIDATOS_ESTADUAL = [
  'Joãozinho Tenório',
  'Natan do Projeto',
  'Luisinho do Sindicato',
  'Renato Antunes',
  'Lara Santana',
  'Coronel Feitosa',
  'Outro',
  'Nenhum/Branco/Nulo',
  'NS/NR',
];

export const INFLUENCIA_OPCOES = ['Aumenta', 'Diminui', 'Não interfere', 'NS/NR'];

export const PESO_ESCOLHA = [
  'Trabalho realizado',
  'Propostas',
  'Confiança/caráter',
  'Partido',
  'Apoio político',
  'Experiência',
  'Conhecer o candidato',
  'Outra',
  'NS/NR',
];

export const RODADAS_PESQUISA = [
  { id: 'p1_1t', name: 'Pesquisa 1 — 1º Turno' },
  { id: 'p2_1t', name: 'Pesquisa 2 — 1º Turno' },
  { id: 'p3_1t', name: 'Pesquisa 3 — 1º Turno' },
  { id: 'p1_2t', name: 'Pesquisa 1 — 2º Turno' },
  { id: 'p2_2t', name: 'Pesquisa 2 — 2º Turno' },
] as const;

export type RodadaId = typeof RODADAS_PESQUISA[number]['id'];

export const META_ENTREVISTAS = 400;