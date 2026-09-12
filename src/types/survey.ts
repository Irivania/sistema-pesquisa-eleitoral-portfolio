import { RodadaId } from '@/data/surveyOptions';

export interface SurveyData {
  id?: string;
  interviewer_name: string;
  rodada?: RodadaId;
  bairro: string;
  sexo: string;
  faixa_etaria: string;
  escolaridade: string;
  area: string;
  aval_prefeta: string;
  aval_governadora: string;
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
}

export type UserProfile = 'entrevistador' | 'admin';

export interface Session {
  profile: UserProfile;
  name: string;
  interviewerId?: string;
  role?: 'master' | 'secondary'; // <-- Papel do administrador (Master ou Secundário)
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