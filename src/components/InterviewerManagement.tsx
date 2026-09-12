import { useState, useEffect, useCallback } from 'react';
import {
  UserPlus, Trash2, Search, AlertCircle, UserCheck, UserX,
  User, X, Hash, ChevronDown, ChevronUp, Filter,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Interviewer } from '@/types/survey';
import { formatDate } from '@/lib/analytics';

interface InterviewerManagementProps {
  adminName: string;
}

type SortField = 'name' | 'code' | 'created_at' | 'is_active';
type SortDir = 'asc' | 'desc';
type StatusFilter = 'all' | 'active' | 'inactive';

export default function InterviewerManagement({ adminName }: InterviewerManagementProps) {
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [adding, setAdding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Interviewer | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('interviewers')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setInterviewers((data || []) as Interviewer[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar entrevistadores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'ENT-';
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  };

  const handleAdd = async () => {
    if (!newName.trim()) {
      setError('Informe o nome do entrevistador.');
      return;
    }
    if (!newCode.trim()) {
      setError('Informe o ID/Código do entrevistador.');
      return;
    }

    setAdding(true);
    setError('');
    try {
      const { error } = await supabase.from('interviewers').insert([{
        name: newName.trim(),
        code: newCode.trim().toUpperCase(),
        phone: newPhone.trim() || null,
        created_by: adminName,
      }]);
      if (error) {
        if (error.code === '23505') {
          setError('Já existe um entrevistador com este código. Use um código diferente.');
        } else {
          throw error;
        }
        return;
      }
      setNewName('');
      setNewCode('');
      setNewPhone('');
      setShowAddForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleActive = async (intv: Interviewer) => {
    try {
      const { error } = await supabase
        .from('interviewers')
        .update({ is_active: !intv.is_active })
        .eq('id', intv.id);
      if (error) throw error;
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar');
    }
  };

  const handleDelete = async (intv: Interviewer) => {
    try {
      const { error } = await supabase.from('interviewers').delete().eq('id', intv.id);
      if (error) throw error;
      setDeleteConfirm(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortedAndFiltered = interviewers
    .filter((i) => {
      if (statusFilter === 'active' && !i.is_active) return false;
      if (statusFilter === 'inactive' && i.is_active) return false;
      return true;
    })
    .filter((i) => {
      const term = searchTerm.toLowerCase();
      return (
        i.name.toLowerCase().includes(term) ||
        (i.code || '').toLowerCase().includes(term) ||
        (i.phone || '').toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortField === 'code') cmp = (a.code || '').localeCompare(b.code || '');
      else if (sortField === 'created_at') {
        cmp = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      } else if (sortField === 'is_active') {
        cmp = (a.is_active === b.is_active) ? 0 : a.is_active ? -1 : 1;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const activeCount = interviewers.filter((i) => i.is_active).length;
  const inactiveCount = interviewers.length - activeCount;

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-0" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3" />
      : <ChevronDown className="w-3 h-3" />;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {error && (
        <div className="card p-3 border-red-200 bg-red-50 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          <button onClick={() => setError('')} className="ml-auto p-0.5 hover:bg-red-100 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-gray-900 font-semibold">Gerenciar Equipe / Entrevistadores</h2>
          <p className="text-sm text-gray-500">
            {interviewers.length} no total · {activeCount} ativos · {inactiveCount} inativos
          </p>
        </div>
        <button
          onClick={() => {
            setNewCode(generateCode());
            setShowAddForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Adicionar Entrevistador
        </button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, código ou telefone..."
            className="input-field pl-9"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-2.5 rounded-lg border-2 flex items-center gap-2 text-sm font-medium transition-colors ${
            showFilters || statusFilter !== 'all'
              ? 'border-blue-500 bg-blue-50 text-blue-600'
              : 'border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          <Filter className="w-4 h-4" /> Filtrar
        </button>
      </div>

      {showFilters && (
        <div className="card p-3 flex items-center gap-2 animate-fade-in">
          <span className="text-sm text-gray-500">Status:</span>
          {(['all', 'active', 'inactive'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'all' ? 'Todos' : s === 'active' ? 'Ativos' : 'Inativos'}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="card p-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
          <p className="text-gray-500">Carregando...</p>
        </div>
      ) : interviewers.length === 0 ? (
        <div className="card p-12 text-center">
          <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Nenhum entrevistador cadastrado</p>
          <p className="text-gray-400 text-sm">Clique em "Adicionar Entrevistador" para começar</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th
                    className="text-left py-3 px-4 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('name')}
                  >
                    <span className="flex items-center gap-1">Nome <SortIcon field="name" /></span>
                  </th>
                  <th
                    className="text-left py-3 px-4 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('code')}
                  >
                    <span className="flex items-center gap-1">ID/Código <SortIcon field="code" /></span>
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 hidden sm:table-cell">Telefone</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 hidden md:table-cell">Cadastrado por</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 hidden lg:table-cell">Data</th>
                  <th
                    className="text-center py-3 px-4 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('is_active')}
                  >
                    <span className="flex items-center justify-center gap-1">Status <SortIcon field="is_active" /></span>
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600 no-print">Ações</th>
                </tr>
              </thead>
              <tbody>
                {sortedAndFiltered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      Nenhum entrevistador encontrado
                    </td>
                  </tr>
                ) : sortedAndFiltered.map((intv) => (
                  <tr key={intv.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                          intv.is_active ? 'bg-blue-50' : 'bg-gray-100'
                        }`}>
                          <User className={`w-4 h-4 ${intv.is_active ? 'text-blue-600' : 'text-gray-400'}`} />
                        </div>
                        <span className="font-medium text-gray-800">{intv.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded font-mono text-xs font-bold text-gray-700">
                        <Hash className="w-3 h-3 text-gray-400" />
                        {intv.code || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 hidden sm:table-cell">
                      {intv.phone || '—'}
                    </td>
                    <td className="py-3 px-4 text-gray-500 hidden md:table-cell">{intv.created_by || '—'}</td>
                    <td className="py-3 px-4 text-gray-500 hidden lg:table-cell">
                      {intv.created_at ? formatDate(intv.created_at) : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        intv.is_active
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {intv.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 no-print">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(intv)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            intv.is_active
                              ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                              : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={intv.is_active ? 'Desativar acesso' : 'Ativar acesso'}
                        >
                          {intv.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(intv)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddForm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setShowAddForm(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Adicionar Entrevistador</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label-text">Nome *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder="Ex: Maria Silva"
                  className="input-field"
                  autoFocus
                />
              </div>
              <div>
                <label className="label-text">ID / Código *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder="Ex: ENT-AB12"
                    className="input-field font-mono uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => setNewCode(generateCode())}
                    className="px-3 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    Gerar
                  </button>
                </div>
              </div>

              <div>
                <label className="label-text">Telefone (opcional)</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder="Ex: (81) 99999-9999"
                  className="input-field"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">Cancelar</button>
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={adding}
                  className="btn-primary flex items-center gap-2"
                >
                  {adding ? 'Salvando...' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <h3 className="font-semibold text-gray-900 mb-2">Confirmar Exclusão</h3>
              <p className="text-gray-600 mb-6">
                Deseja realmente excluir <strong>{deleteConfirm.name}</strong>?
              </p>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancelar</button>
                <button
                  type="button"
                  onClick={() => handleDelete(deleteConfirm)}
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