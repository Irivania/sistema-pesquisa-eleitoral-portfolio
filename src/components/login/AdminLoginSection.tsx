import { useState } from 'react';
import { Shield, ArrowLeft, AlertCircle, KeyRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Session } from '@/types/survey';
import MasterSignupForm from '../MasterSignupForm';

interface AdminLoginSectionProps {
  onLogin: (session: Session) => void;
  onBack: () => void;
}

type AdminView = 'signin' | 'signup' | 'master-signup';

export default function AdminLoginSection({ onLogin, onBack }: AdminLoginSectionProps) {
  const [adminView, setAdminView] = useState<AdminView>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [secretCodeInput, setSecretCodeInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

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
              onClick={() => { onBack(); setAuthError(''); }}
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
  );
}