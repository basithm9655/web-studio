import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Planner } from './components/Planner';
import { Course, Timetable } from './types';
import { fetchData, loginUser } from './services/api';
import { Home, Calendar, Settings, LogOut, Trash } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  
  // Data State
  const [courses, setCourses] = useState<Course[]>([]);
  const [timetable, setTimetable] = useState<Timetable>({});
  const [lastUpdated, setLastUpdated] = useState('');
  
  // UI State
  const [view, setView] = useState<'dashboard' | 'planner' | 'settings'>('dashboard');
  const [threshold, setThreshold] = useState(75);

  // Manual Tracking State (Persisted)
  const [manualData, setManualData] = useState<Record<string, { attended: number; bunked: number }>>({});

  useEffect(() => {
    // Load persisted data
    const savedUser = localStorage.getItem('currentUser');
    const savedManual = localStorage.getItem('manualData');
    if (savedUser) setUsername(savedUser);
    if (savedManual) setManualData(JSON.parse(savedManual));
  }, []);

  useEffect(() => {
    if (Object.keys(manualData).length > 0) {
      localStorage.setItem('manualData', JSON.stringify(manualData));
    }
  }, [manualData]);

  const handleLogin = async (u: string, p: string) => {
    setLoading(true);
    
    try {
        // Step 1: Basic validation (optional)
        await loginUser(u, p);
        
        // Step 2: Real Data Scraping
        // We pass credentials because the backend requires them to scrape
        const data = await fetchData(u, p);
        
        if (data.courses.length > 0) {
            localStorage.setItem('currentUser', u);
            setUsername(u);
            setCourses(data.courses);
            setTimetable(data.timetable);
            setLastUpdated(data.lastUpdated);
            setIsLoggedIn(true);
        } else {
            alert("No data found. Please check your credentials.");
        }
    } catch (error: any) {
        console.error(error);
        alert(error.message || "Login failed. Please check your credentials or network.");
    } finally {
        setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setCourses([]);
    setManualData({});
    setView('dashboard');
    localStorage.removeItem('currentUser');
  };

  const handleManualUpdate = (code: string, type: 'attended' | 'bunked', val: number) => {
    setManualData(prev => {
      const current = prev[code] || { attended: 0, bunked: 0 };
      const newValue = current[type] + val;
      if (newValue < 0) return prev; // Prevent negative
      
      return {
        ...prev,
        [code]: { ...current, [type]: newValue }
      };
    });
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} isLoading={loading} />;
  }

  return (
    <div className="min-h-screen relative bg-[#0b1121]">
       {/* Background Effects */}
       <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_15%_50%,rgba(6,182,212,0.08),transparent_25%),radial-gradient(circle_at_85%_30%,rgba(59,130,246,0.08),transparent_25%)]"></div>

      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-white/10">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">Attendance Manager</h1>
            <p className="text-[10px] text-slate-400 font-medium">Target: <span className="text-cyan-400">{threshold}%</span></p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-2xl px-4 py-6 relative z-10">
        {view === 'dashboard' && (
          <Dashboard 
            courses={courses} 
            threshold={threshold} 
            lastUpdated={lastUpdated}
            manualData={manualData}
            updateManualData={handleManualUpdate}
          />
        )}
        
        {view === 'planner' && (
          <Planner 
            courses={courses} 
            timetable={timetable} 
            threshold={threshold} 
          />
        )}

        {view === 'settings' && (
           <div className="animate-fade-in space-y-6">
              <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
              
              <div className="glass-card p-6 rounded-2xl">
                <label className="block text-sm font-medium text-slate-300 mb-6">Attendance Threshold</label>
                <div className="relative pt-2">
                  <input 
                    type="range" 
                    min="50" 
                    max="90" 
                    value={threshold} 
                    onChange={(e) => setThreshold(Number(e.target.value))} 
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
                  />
                  <div className="flex justify-between mt-2 text-xs text-slate-500 font-bold">
                    <span>50%</span>
                    <span className="text-cyan-400">{threshold}%</span>
                    <span>90%</span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-sm font-bold text-white mb-4">Data Management</h3>
                <button 
                  onClick={() => { setManualData({}); localStorage.removeItem('manualData'); }} 
                  className="w-full py-3 rounded-xl bg-slate-800 text-red-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition"
                >
                  <Trash size={16} /> Reset Live Tracking
                </button>
              </div>

              <button 
                onClick={handleLogout} 
                className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition"
              >
                <LogOut size={18} /> Log Out
              </button>
           </div>
        )}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full glass z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-2xl mx-auto flex justify-around items-center h-16">
          <NavButton 
            icon={<Home size={22} />} 
            label="Home" 
            active={view === 'dashboard'} 
            onClick={() => setView('dashboard')} 
          />
          <NavButton 
            icon={<Calendar size={22} />} 
            label="Planner" 
            active={view === 'planner'} 
            onClick={() => setView('planner')} 
          />
          <NavButton 
            icon={<Settings size={22} />} 
            label="Settings" 
            active={view === 'settings'} 
            onClick={() => setView('settings')} 
          />
        </div>
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${active ? 'text-cyan-400 -translate-y-1' : 'text-slate-500 hover:text-slate-300'}`}
  >
    <div className={`${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'scale-100'} transition-transform duration-300`}>
      {icon}
    </div>
    <span className="text-[10px] font-semibold tracking-wide">{label}</span>
  </button>
);

export default App;