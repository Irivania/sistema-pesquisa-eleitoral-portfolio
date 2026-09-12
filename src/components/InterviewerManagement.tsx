import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Search, AlertCircle, Filter, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Interviewer } from '@/types/survey';
import InterviewerTable from './interviewers/InterviewerTable';
import InterviewerFormModal from './interviewers/InterviewerFormModal';
import InterviewerDeleteModal from './interviewers/InterviewerDeleteModal';

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
  const [editingInterviewer, setEditingInterviewer] = useState<Interviewer | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Interviewer | null>(null);

  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const handleCopyLink = (intv: Interviewer) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/?profile=entrevistador&entrevistador=${encodeURIComponent(intv.id)}`;
    navigator.clipboard.writeText(link);
    setCopiedId(intv.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSave = async () => {
    if (!newName.trim()) {
      setError('Informe o nome do entrevistador.');
      return;
    }
    if (!newCode.trim()) {
      setError('Informe o ID/Código do entrevistador.');
      return;
    }

    setProcessing(true);
    setError('');
    try {
      if (editingInterviewer) {
        const { error } = await supabase
          .from('interviewers')
          .update({
            name: newName.trim(),
            code: newCode.trim().toUpperCase(),
            phone: newPhone.trim() || null,
          })
          .eq('id', editingInterviewer.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('interviewers').insert([{
          name: newName.trim(),
          code: newCode.trim().toUpperCase(),
          phone: newPhone.trim() || null,
          created_by: adminName,
        }]);
        if (error) {
          if (error.code === '23505') {
            setError('Já existe um entrevistador com este código. Use um código diferente.');
            setProcessing(false);
            return;
          }
          throw error;
        }
      }

      setNewName('');
      setNewCode('');
      setNewPhone('');
      setShowAddForm(false);
      setEditingInterviewer(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar dados');
    } finally {
      setProcessing(false);
    }
  };

  const openEditModal = (intv: Interviewer) => {
    setEditingInterviewer(intv);
    setNewName(intv.name);
    setNewCode(intv.code || '');
    setNewPhone(intv.phone || '');
    setError('');
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
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status');
    }
  };

  const handleDelete = async (intv: Interviewer) => {
    try {
      const { error } = await supabase.from('interviewers').delete().eq('id', intv.id);
      if (error) throw error;
      setDeleteConfirm(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir entrevistador');
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
            setNewName('');
            setNewCode(generateCode());
            setNewPhone('');
            setError('');
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
                statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'all' ? 'Todos' : s === 'active' ? 'Ativos' : 'Inativos'}
            </button>
          ))}
        </div>
      )}

      <InterviewerTable
        interviewers={sortedAndFiltered}
        loading={loading}
        copiedId={copiedId}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        onCopyLink={handleCopyLink}
        onEdit={openEditModal}
        onToggleActive={handleToggleActive}
        onDeleteConfirm={setDeleteConfirm}
      />

      {(showAddForm || editingInterviewer) && (
        <InterviewerFormModal
          editingInterviewer={editingInterviewer}
          newName={newName}
          setNewName={setNewName}
          newCode={newCode}
          setNewCode={setNewCode}
          newPhone={newPhone}
          setNewPhone={setNewPhone}
          processing={processing}
          onClose={() => { setShowAddForm(false); setEditingInterviewer(null); }}
          onSave={handleSave}
          onGenerateCode={() => setNewCode(generateCode())}
        />
      )}

      {deleteConfirm && (
        <InterviewerDeleteModal
          deleteConfirm={deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => handleDelete(deleteConfirm)}
        />
      )}
    </div>
  );
}