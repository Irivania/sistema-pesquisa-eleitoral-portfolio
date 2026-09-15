import { useState, useEffect } from 'react';
import {
  ClipboardList, BarChart3, User, Shield, ArrowRight, Landmark,
  ArrowLeft, LogIn, AlertCircle, Search, Eye, EyeOff, Hash,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Session, Interviewer } from '@/types/survey';

interface LoginScreenProps {
  onLogin: (session: Session) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [profile, setProfile] = useState<'entrevistador' | 'admin' | null>(null);

  // Entrevistador state
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingInterviewers, setLoadingInterviewers] = useState(true);
  
  // Selected interviewer for code verification
  const [selectedInterviewer, setSelectedInterviewer] = useState<Interviewer | null>(null);
  const [interviewerCodeInput, setInterviewerCodeInput] = useState('');
  const [interviewerError, setInterviewerError] = useState('');

  // Admin auth state (pré-preenchido para acesso rápido no portfólio)
  const [email, setEmail] = useState('admin@portifolio.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    loadInterviewers();
  }, []);

  const loadInterviewers = async () => {
    try {
      const res = await supabase.from('interviewers').select() as unknown as { data: Interviewer[] | null; error: unknown };
      if (res.error) throw res.error;
      setInterviewers((res.data || []) as Interviewer[]);
    } catch {
      // non-critical — show empty list
    } finally {
      setLoadingInterviewers(false);
    }
  };

  const filteredInterviewers = interviewers.filter((i) =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInterviewerLogin = () => {
    setInterviewerError('');
    if (!selectedInterviewer) return;

    if (!interviewerCodeInput.trim()) {
      setInterviewerError('Por favor, informe o seu código de acesso.');
      return;
    }

    if (interviewerCodeInput.trim().toUpperCase() !== (selectedInterviewer.code || '').toUpperCase()) {
      setInterviewerError('Código de acesso incorreto. Verifique suas credenciais.');
      return;
    }

    onLogin({
      profile: 'entrevistador',
      name: selectedInterviewer.name,
      interviewerId: selectedInterviewer.id,
    });
  };

  const handleAdminAuth = async () => {
    setAuthError('');

    if (!email.trim()) { setAuthError('Por favor, informe seu email.'); return; }
    if (!password) { setAuthError('Por favor, informe sua senha.'); return; }

    setAuthLoading(true);
    try {
      // Acesso livre garantido como Master para fins de portfólio
      onLogin({ 
        profile: 'admin', 
        name: 'Administrador Master', 
        role: 'master' 
      });
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : 'Erro ao autenticar. Verifique se seu email e senha estão corretos.'
      );
    } finally {
      setAuthLoading(false);
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
          {/* Profile selection */}
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

          {/* Entrevistador selection */}
          {profile === 'entrevistador' && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => { 
                    if (selectedInterviewer) {
                      setSelectedInterviewer(null);
                      setInterviewerCodeInput('');
                      setInterviewerError('');
                    } else {
                      setProfile(null); 
                      setSearchTerm(''); 
                    }
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
              </div>

              {!selectedInterviewer ? (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-gray-900 text-lg font-semibold">Acesso de Entrevistador</h2>
                      <p className="text-gray-500 text-sm">Selecione seu nome na lista</p>
                    </div>
                  </div>

                  {interviewers.length === 0 && !loadingInterviewers ? (
                    <div className="text-center py-8 px-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                      <p className="text-sm text-amber-800 font-medium mb-1">
                        Nenhum entrevistador cadastrado
                      </p>
                      <p className="text-xs text-amber-600">
                        Solicite ao administrador que faça seu cadastro no painel de gestão de equipe.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="relative mb-4">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Buscar entrevistador..."
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      </div>

                      {loadingInterviewers ? (
                        <div className="text-center py-6">
                          <div className="inline-block w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-72 overflow-y-auto">
                          {filteredInterviewers.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">
                              Nenhum entrevistador encontrado para "{searchTerm}"
                            </p>
                          ) : (
                            filteredInterviewers.map((intv) => (
                              <button
                                key={intv.id}
                                type="button"
                                onClick={() => {
                                  setSelectedInterviewer(intv);
                                  setInterviewerCodeInput('');
                                  setInterviewerError('');
                                }}
                                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                              >
                                <div className="flex items-center justify-center w-9 h-9 bg-blue-50 rounded-lg group-hover:bg-blue-600 transition-colors">
                                  <User className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="font-medium text-gray-800 block">{intv.name}</span>
                                  <span className="text-xs text-gray-400">Toque para selecionar</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleInterviewerLogin();
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
                      <Hash className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-gray-900 text-lg font-semibold">{selectedInterviewer.name}</h2>
                      <p className="text-gray-500 text-sm">Digite seu código de acesso para entrar</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Código de Acesso Secreto</label>
                    <input
                      type="password"
                      value={interviewerCodeInput}
                      onChange={(e) => setInterviewerCodeInput(e.target.value)}
                      placeholder="Digite seu código..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>

                  {interviewerError && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {interviewerError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm"
                  >
                    <LogIn className="w-4 h-4" /> Entrar no Sistema
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Admin auth */}
          {profile === 'admin' && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => { setProfile(null); setAuthError(''); }}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl">
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-gray-900 text-lg font-semibold">Acesso do Administrador</h2>
                  <p className="text-gray-500 text-sm">Acesso rápido para demonstração</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAdminAuth()}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {authError && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {authError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAdminAuth}
                  disabled={authLoading}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {authLoading ? 'Aguarde...' : 'Entrar no Painel'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}