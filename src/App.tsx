import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import LoginScreen from '@/components/LoginScreen';
import InterviewerView from '@/components/InterviewerView';
import AdminDashboard from '@/components/AdminDashboard';
import type { Session } from '@/types/survey';

const SESSION_KEY = 'bezerros_survey_session';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check for existing Supabase auth session (admin)
    supabase.auth.getSession().then(({ data: { session: authSession } }) => {
      if (authSession) {
        const name =
          authSession.user?.user_metadata?.name ||
          authSession.user?.email ||
          'Administrador';
        const role = authSession.user?.user_metadata?.role || 'master';
        setSession({ profile: 'admin', name, role });
      } else {
        // Fall back to localStorage (interviewer session)
        try {
          const stored = localStorage.getItem(SESSION_KEY);
          if (stored) setSession(JSON.parse(stored));
        } catch {
          // ignore
        }
      }
      setCheckingAuth(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, authSession) => {
      if (authSession) {
        const name =
          authSession.user?.user_metadata?.name ||
          authSession.user?.email ||
          'Administrador';
        const role = authSession.user?.user_metadata?.role || 'master';
        setSession({ profile: 'admin', name, role });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (s: Session) => {
    setSession(s);
    if (s.profile === 'entrevistador') {
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(s));
      } catch {
        // ignore
      }
    }
  };

  const handleLogout = async () => {
    // Sign out from Supabase (admin)
    await supabase.auth.signOut();
    // Clear local interviewer session
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
    setSession(null);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (session.profile === 'admin') {
    return <AdminDashboard session={session} onLogout={handleLogout} />;
  }

  return <InterviewerView name={session.name} onLogout={handleLogout} />;
}