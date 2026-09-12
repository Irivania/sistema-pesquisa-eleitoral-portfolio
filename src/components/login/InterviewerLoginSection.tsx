import { useState } from 'react';
import { User, ArrowRight, ArrowLeft, LogIn, AlertCircle, Search, Hash } from 'lucide-react';
import type { Interviewer, Session } from '@/types/survey';

interface InterviewerLoginSectionProps {
  interviewers: Interviewer[];
  loadingInterviewers: boolean;
  selectedInterviewer: Interviewer | null;
  setSelectedInterviewer: (intv: Interviewer | null) => void;
  onLogin: (session: Session) => void;
  onBack: () => void;
}

export default function InterviewerLoginSection({
  interviewers,
  loadingInterviewers,
  selectedInterviewer,
  setSelectedInterviewer,
  onLogin,
  onBack,
}: InterviewerLoginSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [interviewerCodeInput, setInterviewerCodeInput] = useState('');
  const [interviewerError, setInterviewerError] = useState('');

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

  return (
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
              onBack(); 
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
  );
}