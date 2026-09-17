import { RodadaId } from '@/data/surveyOptions';

export interface SurveyData {
  id?: string;
  interviewer_name: string;
  rodada?: RodadaId;
  estado?: string; // Novo campo para suportar qualquer estado do Brasil
  cidade: string;
  /** Mantido para compatibilidade com relatórios antigos. */
  bairro?: string;
  sexo: string;
  faixa_etaria: string;
  escolaridade: string;
  area: string;
  aval_prefeta: string;
  aval_governadora: string;
  presidente: string;
  prefeito?: string; // Adicionado para suportar candidaturas a prefeito por município
  governador: string;
  problema_principal: string;
  problema_principal_outro?: string;
  senado_espontanea: string[];
  senado_estimulada: string[];
  rejeicao_senado: string;
  dep_federal: string;
  dep_estadual: string;
  influencia_apoio: string;
  peso_escolha: string;
  peso_escolha_outro?: string;
  veiculo_comunicacao: string;
  created_at?: string;
  latitude?: number;  // Suporte a geolocalização (GPS)
  longitude?: number; // Suporte a geolocalização (GPS)
  segundo_turno?: string; // Suporte à simulação de 2º turno (Confronto Direto)
  respostas_json?: Record<string, unknown> | null;
}

export type UserProfile = 'entrevistador' | 'admin';

export interface Session {
  profile: UserProfile;
  name: string;
  interviewerId?: string;
  role?: 'master' | 'secondary'; // Papel do administrador (Master ou Secundário)
  allowed_state?: string; // Escopo opcional para restringir o admin a um estado específico se desejado
}

export interface Interviewer {
  id: string;
  name: string;
  code?: string | null;
  phone?: string | null;
  is_active: boolean;
  created_by?: string | null;
  created_at?: string;
}