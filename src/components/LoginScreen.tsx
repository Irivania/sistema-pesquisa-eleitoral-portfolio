import { useState, useEffect } from 'react';
import { ClipboardList, BarChart3, ArrowRight, Landmark } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Session, Interviewer } from '@/types/survey';
import InterviewerLoginSection from './login/InterviewerLoginSection';
import AdminLoginSection from './login/AdminLoginSection';

interface LoginScreenProps {
  onLogin: (session: Session) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [profile, setProfile] = useState<'entrevistador' | 'admin' | null>(null);

  // Entrevistador state
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [loadingInterviewers, setLoadingInterviewers] = useState(true);
  const [selectedInterviewer, setSelectedInterviewer] = useState<Interviewer | null>(null);

  useEffect(() => {
    loadInterviewers();
  }, []);

  const loadInterviewers = async () => {
    try {
      const { data, error } = await supabase
        .from('interviewers')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      const list = (data || []) as Interviewer[];
      setInterviewers(list);

      // Suporte a link direto individual com perfil (ex: ?profile=entrevistador&entrevistador=ID)
      const params = new URLSearchParams(window.location.search);
      const profileParam = params.get('profile');
      const targetParam = params.get('entrevistador');

      if (profileParam === 'entrevistador' && targetParam && list.length > 0) {
        const found = list.find(
          (i) => i.id === targetParam || i.name.toLowerCase() === decodeURIComponent(targetParam).toLowerCase()
        );
        if (found) {
          setProfile('entrevistador');
          setSelectedInterviewer(found);
        }
      }
    } catch {
      // non-critical
    } finally {
      setLoadingInterviewers(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 border border-white/20">
            <Landmark className="w-8 h-8 text-blue-300" />
          </div>
          <h1 className="text-white text-2xl font-bold mb-1">Levantamento Interno de Opinião</h1>
          <p className="text-blue-200/80 text-sm">Sistema de Apuração Eleitoral</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Seleção de Perfil Inicial */}
          {!profile && (
            <div>
              <h2 className="text-gray-900 text-lg font-semibold mb-1">Selecione seu perfil</h2>
              <p className="text-gray-500 text-sm mb-6">Escolha como deseja acessar o sistema</p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setProfile('entrevistador')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl group-hover:bg-blue-600 transition-colors">
                    <ClipboardList className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Entrevistador</p>
                    <p className="text-sm text-gray-500">Coletar dados no campo</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </button>

                <button
                  type="button"
                  onClick={() => setProfile('admin')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left group"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl group-hover:bg-emerald-600 transition-colors">
                    <BarChart3 className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Administrador / Coordenador</p>
                    <p className="text-sm text-gray-500">Acessar painel e relatórios</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                </button>
              </div>
            </div>
          )}

          {/* Seção de Entrevistador Isolada */}
          {profile === 'entrevistador' && (
            <InterviewerLoginSection
              interviewers={interviewers}
              loadingInterviewers={loadingInterviewers}
              selectedInterviewer={selectedInterviewer}
              setSelectedInterviewer={setSelectedInterviewer}
              onLogin={onLogin}
              onBack={() => {
                setProfile(null);
                setSelectedInterviewer(null);
                // Limpa os parâmetros da URL ao voltar para evitar reabrir automaticamente
                window.history.replaceState({}, document.title, window.location.pathname);
              }}
            />
          )}

          {/* Seção de Administrador Isolada */}
          {profile === 'admin' && (
            <AdminLoginSection
              onLogin={onLogin}
              onBack={() => setProfile(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}