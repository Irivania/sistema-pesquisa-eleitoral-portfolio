import { useState, useEffect, useCallback } from 'react';
import {
  ToggleLeft, ToggleRight, Clock, KeyRound, Plus, Trash2, AlertCircle,
  Check, Copy, X, Shield, ShieldCheck,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDate, formatTime } from '@/lib/analytics';

interface AccessControlProps {
  adminName: string;
}

interface AppSettings {
  override_active: boolean;
  override_expires_at: string | null;
  updated_at?: string;
  updated_by?: string | null;
}

interface ExceptionCode {
  id: string;
  code: string;
  used: boolean;
  created_by?: string | null;
  created_at?: string;
  used_at?: string | null;
}

const START_HOUR = 8;
const END_HOUR = 16;

function isWithinAllowedHours(): boolean {
  const hour = new Date().getHours();
  return hour >= START_HOUR && hour < END_HOUR;
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'LIB-';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function AccessControl({ adminName }: AccessControlProps) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [codes, setCodes] = useState<ExceptionCode[]>([]);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [duration, setDuration] = useState('60');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ExceptionCode | null>(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const [settingsRes, codesRes] = await Promise.all([
        supabase.from('app_settings').select('*').eq('id', 1).maybeSingle(),
        supabase.from('exception_codes').select('*').order('created_at', { ascending: false }),
      ]);

      if (settingsRes.error) throw settingsRes.error;
      if (codesRes.error) throw codesRes.error;

      setSettings(settingsRes.data as AppSettings | null);
      setCodes((codesRes.data || []) as unknown as ExceptionCode[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar configurações');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggleOverride = async () => {
    if (!settings) return;
    setActionLoading(true);
    setError('');

    const newState = !settings.override_active;
    let expiresAt: string | null = null;

    if (newState && duration !== '0') {
      const expiry = new Date(Date.now() + parseInt(duration) * 60 * 1000);
      expiresAt = expiry.toISOString();
    }

    try {
      const { error } = await supabase
        .from('app_settings')
        .update({
          override_active: newState,
          override_expires_at: expiresAt,
          updated_at: new Date().toISOString(),
          updated_by: adminName,
        })
        .eq('id', 1);

      if (error) throw error;
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar liberação');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    setActionLoading(true);
    setError('');
    try {
      const newCode = generateCode();
      const { error } = await supabase.from('exception_codes').insert([{
        code: newCode,
        created_by: adminName,
      }]);
      if (error) throw error;
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar código');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCode = async (code: ExceptionCode) => {
    try {
      const { error } = await supabase.from('exception_codes').delete().eq('id', code.id);
      if (error) throw error;
      setDeleteConfirm(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir código');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const isOverrideValid = (): boolean => {
    if (!settings?.override_active) return false;
    if (settings.override_expires_at) {
      return Date.now() < new Date(settings.override_expires_at).getTime();
    }
    return true;
  };

  const activeCodes = codes.filter((c) => !c.used);
  const usedCodes = codes.filter((c) => c.used);
  const withinHours = isWithinAllowedHours();
  const overrideValid = isOverrideValid();

  return (
    <div className="space-y-6 animate-fade-in">
      {error && (
        <div className="card p-3 border-red-200 bg-red-50 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Time status banner */}
      <div className={`card p-5 ${withinHours ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${
            withinHours ? 'bg-emerald-100' : 'bg-amber-100'
          }`}>
            <Clock className={`w-5 h-5 ${withinHours ? 'text-emerald-600' : 'text-amber-600'}`} />
          </div>
          <div>
            <p className={`font-semibold ${withinHours ? 'text-emerald-900' : 'text-amber-900'}`}>
              {withinHours ? 'Dentro do horário de coleta' : 'Fora do horário de coleta'}
            </p>
            <p className={`text-sm ${withinHours ? 'text-emerald-700' : 'text-amber-700'}`}>
              Janela padrão: {String(START_HOUR).padStart(2, '0')}h às {String(END_HOUR).padStart(2, '0')}h ·
              Agora: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>

      {/* Global override toggle */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Liberação Temporária Global</h3>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          Ative para permitir que <strong>todos os entrevistadores</strong> coletem dados fora do
          horário padrão (08h às 16h). Pode ser por tempo determinado ou indefinido.
        </p>

        <div className="space-y-4">
          {/* Duration selector */}
          <div>
            <label className="label-text">Duração da liberação</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: '30', label: '30 minutos' },
                { value: '60', label: '1 hora' },
                { value: '120', label: '2 horas' },
                { value: '240', label: '4 horas' },
                { value: '0', label: 'Indefinido' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDuration(opt.value)}
                  disabled={overrideValid}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all duration-150 ${
                    duration === opt.value
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  } ${overrideValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle */}
          <button
            onClick={handleToggleOverride}
            disabled={actionLoading}
            className="w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200"
            style={{
              borderColor: overrideValid ? '#059669' : '#e5e7eb',
              backgroundColor: overrideValid ? '#ecfdf5' : '#f9fafb',
            }}
          >
            <div className="flex items-center gap-3">
              {overrideValid ? (
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              ) : (
                <Shield className="w-6 h-6 text-gray-400" />
              )}
              <div className="text-left">
                <p className={`font-semibold ${overrideValid ? 'text-emerald-900' : 'text-gray-700'}`}>
                  {overrideValid ? 'Liberação Ativa' : 'Liberação Inativa'}
                </p>
                {settings?.override_expires_at && overrideValid && (
                  <p className="text-xs text-emerald-600">
                    Expira em: {formatDate(settings.override_expires_at)} às {formatTime(settings.override_expires_at)}
                  </p>
                )}
                {settings?.override_active && !overrideValid && (
                  <p className="text-xs text-gray-400">Liberação expirada</p>
                )}
              </div>
            </div>
            <div className={`flex items-center gap-2 ${actionLoading ? 'opacity-50' : ''}`}>
              {actionLoading && (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
              )}
              {overrideValid ? (
                <ToggleRight className="w-10 h-10 text-emerald-600" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-gray-400" />
              )}
            </div>
          </button>

          {overrideValid && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5 animate-fade-in">
              <Check className="w-4 h-4 shrink-0" />
              Os entrevistadores podem coletar dados agora, mesmo fora do horário padrão.
            </div>
          )}
        </div>
      </div>

      {/* Exception codes */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Códigos de Liberação Individuais</h3>
          </div>
          <button
            onClick={handleGenerateCode}
            disabled={actionLoading}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Gerar Código
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          Gere códigos únicos e entregue individualmente aos entrevistadores. Cada código pode ser
          usado <strong>apenas uma vez</strong> para liberar o acesso fora do horário.
        </p>

        {codes.length === 0 ? (
          <div className="text-center py-8">
            <KeyRound className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Nenhum código gerado ainda</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Active codes */}
            {activeCodes.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Disponíveis ({activeCodes.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeCodes.map((code) => (
                    <div
                      key={code.id}
                      className="flex items-center gap-3 p-3 border-2 border-emerald-200 bg-emerald-50 rounded-xl"
                    >
                      <div className="flex items-center justify-center w-9 h-9 bg-emerald-100 rounded-lg">
                        <KeyRound className="w-4.5 h-4.5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono font-bold text-emerald-900 text-sm tracking-wider">
                          {code.code}
                        </p>
                        <p className="text-xs text-emerald-600">
                          Gerado em {code.created_at ? formatDate(code.created_at) : '—'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleCopyCode(code.code)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                          title="Copiar código"
                        >
                          {copiedCode === code.code ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(code)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Used codes */}
            {usedCodes.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Utilizados ({usedCodes.length})
                </p>
                <div className="space-y-2">
                  {usedCodes.map((code) => (
                    <div
                      key={code.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
                        <Check className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-mono text-gray-400 text-sm tracking-wider line-through">
                          {code.code}
                        </p>
                        <p className="text-xs text-gray-400">
                          Usado em {code.used_at ? formatDate(code.used_at) : '—'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Excluir Código</h3>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Deseja excluir o código <strong className="font-mono">{deleteConfirm.code}</strong>?
                Se ainda não foi utilizado, o entrevistador não poderá mais usá-lo.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancelar</button>
                <button
                  onClick={() => handleDeleteCode(deleteConfirm)}
                  className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}