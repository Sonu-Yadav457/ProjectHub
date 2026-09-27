import { CheckCircle2, Sparkles } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3 text-indigo-400 mb-4">
          <Sparkles className="w-6 h-6 animate-pulse" />
          <span className="text-sm font-semibold uppercase tracking-wider">ProjectHub Setup</span>
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Tailwind CSS is Live!
        </h1>
        <p className="text-slate-400 text-sm mb-6">
          Vite + React + Tailwind v4 + Lucide Icons are properly configured and operational.
        </p>

        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Zero manual CSS. Ready for production-grade UI.</span>
        </div>
      </div>
    </div>
  );
}

export default App;