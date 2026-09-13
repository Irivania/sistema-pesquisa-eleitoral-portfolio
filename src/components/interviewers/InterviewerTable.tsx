import { User, Hash, Copy, Check, Edit2, UserX, UserCheck, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { Interviewer } from '@/types/survey';
import { formatDate } from '@/lib/analytics';

type SortField = 'name' | 'code' | 'created_at' | 'is_active';
type SortDir = 'asc' | 'desc';

interface InterviewerTableProps {
  interviewers: Interviewer[];
  loading: boolean;
  copiedId: string | null;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (field: SortField) => void;
  onCopyLink: (intv: Interviewer) => void;
  onEdit: (intv: Interviewer) => void;
  onToggleActive: (intv: Interviewer) => void;
  onDeleteConfirm: (intv: Interviewer) => void;
}

export default function InterviewerTable({
  interviewers,
  loading,
  copiedId,
  sortField,
  sortDir,
  onSort,
  onCopyLink,
  onEdit,
  onToggleActive,
  onDeleteConfirm,
}: InterviewerTableProps) {
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-0" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  if (loading) {
    return (
      <div className="card p-12 text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (interviewers.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-gray-500 font-medium">Nenhum entrevistador encontrado</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 select-none" onClick={() => onSort('name')}>
                <span className="flex items-center gap-1">Nome <SortIcon field="name" /></span>
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 select-none" onClick={() => onSort('code')}>
                <span className="flex items-center gap-1">ID/Código <SortIcon field="code" /></span>
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600 hidden sm:table-cell">Telefone</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600 hidden md:table-cell">Cadastrado por</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600 hidden lg:table-cell">Data</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 select-none" onClick={() => onSort('is_active')}>
                <span className="flex items-center justify-center gap-1">Status <SortIcon field="is_active" /></span>
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-600 no-print">Ações</th>
            </tr>
          </thead>
          <tbody>
            {interviewers.map((intv) => (
              <tr key={intv.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${intv.is_active ? 'bg-blue-50' : 'bg-gray-100'}`}>
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
                <td className="py-3 px-4 text-gray-600 hidden sm:table-cell">{intv.phone || '—'}</td>
                <td className="py-3 px-4 text-gray-500 hidden md:table-cell">{intv.created_by || '—'}</td>
                <td className="py-3 px-4 text-gray-500 hidden lg:table-cell">{intv.created_at ? formatDate(intv.created_at) : '—'}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${intv.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {intv.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="py-3 px-4 no-print">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onCopyLink(intv)}
                      className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium ${
                        copiedId === intv.id ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                      title="Copiar link de acesso direto"
                    >
                      {copiedId === intv.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span className="hidden xl:inline">{copiedId === intv.id ? 'Copiado!' : 'Link'}</span>
                    </button>
                    <button type="button" onClick={() => onEdit(intv)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar dados">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleActive(intv)}
                      className={`p-1.5 rounded-lg transition-colors ${intv.is_active ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50' : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                      title={intv.is_active ? 'Desativar acesso' : 'Ativar acesso'}
                    >
                      {intv.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>
                    <button type="button" onClick={() => onDeleteConfirm(intv)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
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
  );
}