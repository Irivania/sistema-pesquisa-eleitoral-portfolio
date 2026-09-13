import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldCheck, ArrowLeft, Mail, Lock, User } from 'lucide-react';

interface MasterRegisterProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function MasterRegister({ onBack, onSuccess }: MasterRegisterProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'master',
          },
        },
      });

      if (authError) throw authError;

      alert('Administrador Master cadastrado com sucesso! Faça login com suas credenciais.');
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar administrador.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <button 
        onClick={onBack}
        className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao Login
      </button>

      <div className="text-center mb-6">
        <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-full mb-2">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Novo Administrador Master</h2>
        <p className="text-sm text-gray-500">Cadastre a conta principal do sistema</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
          <div className="relative">
            <User className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex: Seu Nome"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
          <div className="relative">
            <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@exemplo.com"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
          <div className="relative">
            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-md shadow transition-colors disabled:opacity-50"
        >
          {loading ? 'Cadastrando...' : 'Concluir Cadastro Master'}
        </button>
      </form>
    </div>
  );
}