import { useState, useEffect } from 'react';
import {
  ClipboardList, BarChart3, User, Shield, ArrowRight, Landmark,
  ArrowLeft, LogIn, AlertCircle, Search, Hash, KeyRound,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Session, Interviewer } from '@/types/survey';
import MasterSignupForm from './MasterSignupForm';

interface LoginScreenProps {
  onLogin: (session: Session) => void;
}

type AdminView = 'signin' | 'signup' | 'master-signup';

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [profile, setProfile] = useState<'entrevistador' | 'admin' | null>(null);

  // Entrevistador state
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingInterviewers, setLoadingInterviewers] = useState(true);
  
  const [selectedInterviewer, setSelectedInterviewer] = useState<Interviewer | null>(null);
  const [interviewerCodeInput, setInterviewerCodeInput] = useState('');
  const [interviewerError, setInterviewerError] = useState('');

  // Admin auth state
  const [adminView, setAdminView] = useState<AdminView>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [secretCodeInput, setSecretCodeInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

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
      setInterviewers((data || []) as Interviewer[]);
    } catch {
      // non-critical
    } finally {
      setLoadingInterviewers(false);
    }
  };

  const filteredInterviewers = interviewers.filter((i) =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.code || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInterviewerLogin = () => {
    setInterviewerError('');
    if (!selectedInterviewer) return;

    if (!interviewerCodeInput.trim()) {
      setInterviewerError('Por favor, informe o seu código de acesso.');
      return;
    }

    if (interviewerCodeInput.trim().toUpperCase() !== (selectedInterviewer.code || '').toUpperCase()) {
      setInterviewerError('Código de acesso incorreto. Verifique seu crachá.');
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

    if (adminView === 'signup') {
      if (!adminName.trim()) { setAuthError('Por favor, informe seu nome completo.'); return; }
      if (!email.trim()) { setAuthError('Por favor, informe um endereço de email válido.'); return; }
      if (password.length < 6) { setAuthError('A senha é muito curta. Ela deve ter no mínimo 6 caracteres.'); return; }
      if (!secretCodeInput.trim()) { setAuthError('Por favor, informe o código de convite fornecido pela conta mestre.'); return; }
    } else {
      if (!email.trim()) { setAuthError('Por favor, informe seu email.'); return; }
      if (!password) { setAuthError('Por favor, informe sua senha.'); return; }
    }

    setAuthLoading(true);
    try {
      if (adminView === 'signup') {
        const trimmedCode = secretCodeInput.trim().toUpperCase();

        const { data: tokenData, error: tokenFetchError } = await supabase
          .from('invite_tokens')
          .select('*')
          .eq('code', trimmedCode)
          .eq('is_used', false)
          .single();

        if (tokenFetchError || !tokenData) {
          setAuthError('Código de convite inválido ou já utilizado.');
          setAuthLoading(false);
          return;
        }

        if (new Date(tokenData.expires_at) < new Date()) {
          setAuthError('Este código de convite expirou (validade de 15 minutos). Solicite um novo ao administrador mestre.');
          setAuthLoading(false);
          return;
        }

        const roleType = 'secondary';

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { 
            data: { 
              name: adminName.trim(),
              role: roleType 
            } 
          },
        });
        if (error) throw error;

        await supabase
          .from('invite_tokens')
          .update({ is_used: true })
          .eq('id', tokenData.id);

        if (data.user) {
          onLogin({ profile: 'admin', name: adminName.trim(), role: roleType });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        
        const name = data.user?.user_metadata?.name || data.user?.email || 'Administrador';
        const role = data.user?.user_metadata?.role || 'master';

        onLogin({ profile: 'admin', name, role });
      }
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
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
                      <Hash className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-gray-900 text-lg font-semibold">{selectedInterviewer.name}</h2>
                      <p className="text-gray-500 text-sm">Digite sua senha de acesso para entrar</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Código de Acesso (Senha)</label>
                    <input
                      type="password"
                      value={interviewerCodeInput}
                      onChange={(e) => setInterviewerCodeInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleInterviewerLogin()}
                      placeholder="Digite sua senha de acesso..."
                      className={`w-full px-3 py-2 border rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 transition-all ${
                        interviewerError 
                          ? 'border-red-500 bg-red-50/30 focus:ring-red-400 animate-bounce' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      autoFocus
                    />
                  </div>

                  {interviewerError && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" /> 
                      <span>{interviewerError}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleInterviewerLogin}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm"
                  >
                    <LogIn className="w-4 h-4" /> Entrar no Sistema
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Admin auth */}
          {profile === 'admin' && (
            <div>
              {adminView === 'master-signup' ? (
                <MasterSignupForm 
                  onBack={() => setAdminView('signin')} 
                  onLogin={onLogin} 
                />
              ) : (
                <>
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
                      <h2 className="text-gray-900 text-lg font-semibold">
                        {adminView === 'signin' ? 'Acesso do Administrador' : 'Cadastro de Conta Secundária'}
                      </h2>
                      <p className="text-gray-500 text-sm">
                        {adminView === 'signin' ? 'Entre com email e senha' : 'Requer código de convite mestre (válido por 15 min)'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {adminView === 'signup' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Nome completo</label>
                          <input
                            type="text"
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
                            placeholder="Ex: Coordenador Secundário"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-emerald-700 mb-1 flex items-center gap-1">
                            <KeyRound className="w-3.5 h-3.5" /> Código de Convite Temporário *
                          </label>
                          <input
                            type="text"
                            value={secretCodeInput}
                            onChange={(e) => setSecretCodeInput(e.target.value)}
                            placeholder="Ex: KEY-XXXXXX"
                            className="w-full px-3 py-2 border border-emerald-300 bg-emerald-50/50 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <p className="text-[11px] text-gray-400 mt-1">Solicite o código gerado no painel mestre (expira em 15 min).</p>
                        </div>
                      </>
                    )}

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
                          {showPassword ? <span className="text-xs">Ocultar</span> : <span className="text-xs">Ver</span>}
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
                      {authLoading ? 'Aguarde...' : adminView === 'signup' ? 'Concluir Cadastro' : 'Entrar'}
                    </button>

                    <div className="text-center pt-2 space-y-1.5">
                      {adminView === 'signin' && (
                        <>
                          <p className="text-sm text-gray-500">
                            Possui um código de convite mestre?{' '}
                            <button
                              type="button"
                              onClick={() => { setAdminView('signup'); setAuthError(''); }}
                              className="text-emerald-600 font-medium hover:text-emerald-700"
                            >
                              Cadastrar conta secundária
                            </button>
                          </p>
                          <p className="text-sm text-gray-500">
                            Banco zerado?{' '}
                            <button
                              type="button"
                              onClick={() => { setAdminView('master-signup'); setAuthError(''); }}
                              className="text-blue-600 font-medium hover:text-blue-700 underline"
                            >
                              Criar Administrador Master
                            </button>
                          </p>
                        </>
                      )}

                      {adminView === 'signup' && (
                        <p className="text-sm text-gray-500">
                          Já tem conta cadastrada?{' '}
                          <button
                            type="button"
                            onClick={() => { setAdminView('signin'); setAuthError(''); }}
                            className="text-emerald-600 font-medium hover:text-emerald-700"
                          >
                            Fazer login
                          </button>
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}