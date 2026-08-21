import React, { useState } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  CheckCircle2, 
  BookOpen, 
  CalendarCheck, 
  HeartHandshake, 
  ShieldCheck, 
  ArrowRight, 
  Users,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginView: React.FC = () => {
  const { signInWithGoogle, signInAsDemoTeacher } = useAuth();
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setLoadingGoogle(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Unable to sign in with Google. You can try the Demo Mode below.');
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-between text-slate-100 selection:bg-blue-500 selection:text-white">
      
      {/* Top Header */}
      <header className="px-6 py-5 max-w-7xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white">
              TeacherStudent <span className="text-blue-400">Hub</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              Progress, Grades & Parent Dossier Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Classroom Ready 2025–2026
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-6 my-4">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Value Prop */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Teacher Workspace & Parent Meeting Hub
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Empower Every Student with Clarity, Care & Data.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Log grades with automated GPA calculations, track daily attendance streaks, monitor positive behavior milestones, maintain student photos, and prepare comprehensive historical conference dossiers for parents in seconds.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Full Subject Gradebook</h3>
                  <p className="text-[11px] text-slate-400">Weighted scores, term trends & letter grade scales</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">1-Click Attendance Roll Call</h3>
                  <p className="text-[11px] text-slate-400">Present, tardy, excused & 30-day heatmap tracking</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Behavior & Merits</h3>
                  <p className="text-[11px] text-slate-400">Positive praises, support logs & parent updates</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Parent Conference Dossier</h3>
                  <p className="text-[11px] text-slate-400">Historical performance reports & talking points</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sign In Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
              
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-xl font-bold text-white">Teacher Portal Sign In</h3>
                <p className="text-xs text-slate-400">
                  Access your classroom records and student portfolios
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs leading-relaxed">
                  {authError}
                </div>
              )}

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loadingGoogle}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl text-sm transition-all shadow-md active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{loadingGoogle ? 'Connecting...' : 'Sign in with Google (Gmail)'}</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-700 w-full" />
                <span className="bg-slate-900 px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider absolute">
                  or instant preview
                </span>
              </div>

              {/* Demo Mode Button */}
              <button
                type="button"
                onClick={signInAsDemoTeacher}
                className="w-full flex items-center justify-between px-4 py-3 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-200 font-semibold rounded-xl text-xs sm:text-sm transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Explore Demo Classroom</div>
                    <div className="text-[11px] text-blue-300/80">Mrs. Evelyn Davis (Grade 5A - 6 Students)</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Protected with secure teacher-scoped Firestore security rules</span>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-white/5 text-center text-xs text-slate-500">
        Teacher Student Progress & Performance Hub • Designed for modern educators
      </footer>
    </div>
  );
};
