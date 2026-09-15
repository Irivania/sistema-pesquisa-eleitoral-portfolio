export interface MunicipioSchema {
  cidade: string;
  candidatosPrefeito?: string[];
  candidatosVereador?: string[];
  perguntasExtras?: string[];
}

export interface EstadoConfig {
  estado: string;
  nomeEstado: string;
  cargosGov: string[];
  avaliacoes: {
    id: string;
    labelPrefeitura: string;
    labelGoverno: string;
  };
  municipios: Record<string, MunicipioSchema>;
}

export const estadosBrasil = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' }
];

// Sobrescritas específicas por município (Ex: Bezerros em Pernambuco)
const customMunicipios: Record<string, Record<string, MunicipioSchema>> = {
  PE: {
    Bezerros: {
      cidade: 'Bezerros',
      candidatosPrefeito: ['Candidato X', 'Candidato Y', 'Candidato Z'],
    },
  },
  // Você pode adicionar regras de outras cidades aqui conforme fechar novas pesquisas
};

export function getElectoralConfig(uf: string): EstadoConfig {
  const estadoObj = estadosBrasil.find((e) => e.sigla === uf) || { sigla: 'SP', nome: 'São Paulo' };

  return {
    estado: estadoObj.sigla,
    nomeEstado: estadoObj.nome,
    cargosGov: [`Governador de ${estadoObj.nome}`, 'Prefeito'],
    avaliacoes: {
      id: 'aval_prefeta',
      labelPrefeitura: `Avaliação da Gestão da Prefeitura (${estadoObj.nome})`,
      labelGoverno: `Avaliação da Gestão do Governo Estadual (${estadoObj.nome})`
    },
    municipios: customMunicipios[estadoObj.sigla] || {}
  };
}

// Objeto mapeado globalmente para o sistema
export const electoralConfigs: Record<string, EstadoConfig> = 
  estadosBrasil.reduce((acc, curr) => {
    acc[curr.sigla] = getElectoralConfig(curr.sigla);
    return acc;
  }, {} as Record<string, EstadoConfig>);