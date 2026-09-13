import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, KeyRound, Eye, EyeOff, AlertCircle } from 'lucide-react';
import type { Session } from '@/types/survey';

interface MasterSignupFormProps {
  onBack: () => void;
  onLogin: (session: Session) => void;
}

export default function MasterSignupForm({ onBack, onLogin }: MasterSignupFormProps) {
  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleMasterSignup = async () => {
    setAuthError('');
    if (!adminName.trim()) { setAuthError('Por favor, informe seu nome completo.'); return; }
    if (!email.trim()) { setAuthError('Por favor, informe um endereço de email válido.'); return; }
    if (password.length < 6) { setAuthError('A senha é muito curta. Ela deve ter no mínimo 6 caracteres.'); return; }

    setAuthLoading(true);
    try {
      const roleType = 'master';
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

      if (data.user) {
        onLogin({ profile: 'admin', name: adminName.trim(), role: roleType });
      }
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : 'Erro ao cadastrar administrador master.'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
          <KeyRound className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-gray-900 text-lg font-semibold">Cadastro de Administrador Master</h2>
          <p className="text-gray-500 text-sm">Crie o primeiro acesso principal do sistema</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Nome completo</label>
          <input
            type="text"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            placeholder="Ex: Seu Nome"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="exemplo@email.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              onKeyDown={(e) => e.key === 'Enter' && handleMasterSignup()}
              placeholder="••••••••"
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          onClick={handleMasterSignup}
          disabled={authLoading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm disabled:opacity-50"
        >
          {authLoading ? 'Aguarde...' : 'Concluir Cadastro Master'}
        </button>
      </div>
    </div>
  );
}