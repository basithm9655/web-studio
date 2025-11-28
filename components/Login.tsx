import React, { useState } from 'react';
import { User, Lock, GraduationCap, Loader } from 'lucide-react';

interface LoginProps {
  onLogin: (u: string, p: string) => void;
  isLoading: boolean;
}

export const Login: React.FC<LoginProps> = ({ onLogin, isLoading }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      onLogin(username, password);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden bg-[#0b1121]">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-pulse-slow"></div>

      <div className="w-full max-w-sm z-10 animate-fade-in">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-8 shadow-2xl shadow-cyan-500/20 rotate-6 transform hover:rotate-0 transition-all duration-500 text-white">
            <GraduationCap size={40} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">PSG eCampus</h1>
          <p className="text-slate-400 font-medium">Attendance & Planner Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 rounded-3xl space-y-6 border border-white/5 shadow-2xl">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Roll Number</label>
            <div className="relative text-white">
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-4 pl-11 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
                placeholder="e.g. 19Z205"
                required
              />
              <div className="absolute left-4 top-4 text-slate-500"><User size={20} /></div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Password</label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-4 pl-11 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
                placeholder="••••••••"
                required
              />
              <div className="absolute left-4 top-4 text-slate-500"><Lock size={20} /></div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/25 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? <><Loader className="animate-spin" size={20} /> <span>Syncing...</span></> : <span>Access Portal</span>}
          </button>
        </form>
      </div>
    </div>
  );
};
