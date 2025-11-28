import React, { useMemo, useState } from 'react';
import { Course, Timetable, PlannerSimulation, ProjectedStat } from '../types';
import { calculateProjectedPercentage } from '../services/calculations';
import { Check, X, Zap, Calendar, Flashlight } from 'lucide-react';

interface PlannerProps {
  courses: Course[];
  timetable: Timetable;
  threshold: number;
}

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export const Planner: React.FC<PlannerProps> = ({ courses, timetable, threshold }) => {
  const [selectedDays, setSelectedDays] = useState<string[]>(["Mon"]);
  const [simulations, setSimulations] = useState<PlannerSimulation>({});

  const toggleDay = (day: string) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const selectNext3Days = () => {
    const todayIndex = new Date().getDay() - 1; // 0=Mon (approx)
    const validIdx = todayIndex < 0 || todayIndex > 4 ? 0 : todayIndex;
    const next3 = [];
    for(let i = 0; i < 3; i++) {
        next3.push(DAYS_OF_WEEK[(validIdx + i) % 5]);
    }
    setSelectedDays([...new Set(next3)]);
  };

  const selectFullWeek = () => setSelectedDays([...DAYS_OF_WEEK]);
  const clearSelection = () => { setSelectedDays([]); setSimulations({}); };

  // Determine which classes are displayed based on selected days
  const activeClasses = useMemo(() => {
    const list: Array<{ uniqueId: string, day: string, code: string, name: string, period: number }> = [];
    
    // Sort days based on standard week
    const sortedDays = selectedDays.sort((a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b));

    sortedDays.forEach(day => {
      const subjects = timetable[day] || [];
      const courseCounts: Record<string, number> = {};

      subjects.forEach((code, idx) => {
        if (code === "Free") return;
        
        courseCounts[code] = (courseCounts[code] || 0) + 1;
        const course = courses.find(c => c.code === code);
        
        if (course) {
          list.push({
            uniqueId: `${day}-${code}-${idx}`,
            day,
            code,
            name: course.name,
            period: courseCounts[code]
          });
        }
      });
    });
    return list;
  }, [selectedDays, timetable, courses]);

  // Bulk action for a day
  const bunkDay = (day: string) => {
    const idsToBunk = activeClasses.filter(c => c.day === day).map(c => c.uniqueId);
    setSimulations(prev => {
      const next = { ...prev };
      idsToBunk.forEach(id => next[id] = 'bunk');
      return next;
    });
  };

  // Calculate the impact of simulations
  const projectedStats = useMemo<ProjectedStat[]>(() => {
    const impact: Record<string, { attended: number, bunked: number }> = {};
    
    Object.entries(simulations).forEach(([id, action]) => {
      if (!action) return;
      // Extract code from ID format: Day-Code-Idx
      const parts = id.split('-');
      const code = parts[1]; // simplified extraction
      
      if (!impact[code]) impact[code] = { attended: 0, bunked: 0 };
      if (action === 'attend') impact[code].attended++;
      if (action === 'bunk') impact[code].bunked++;
    });

    const results: ProjectedStat[] = [];
    courses.forEach(c => {
      const imp = impact[c.code];
      if (imp && (imp.attended > 0 || imp.bunked > 0)) {
        const oldPercent = c.percentage;
        const newPercent = calculateProjectedPercentage(c, imp.attended, imp.bunked);
        results.push({
          code: c.code,
          name: c.name,
          oldPercent,
          newPercent,
          diff: newPercent - oldPercent
        });
      }
    });
    
    return results;
  }, [simulations, courses]);

  const handleSimulate = (id: string, action: 'attend' | 'bunk') => {
    setSimulations(prev => ({
      ...prev,
      [id]: prev[id] === action ? null : action
    }));
  };

  return (
    <div className="animate-fade-in pb-24 relative">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-cyan-400" /> Weekly Planner
      </h2>

      {/* Impact Summary - Sticky */}
      <div className="mb-6 animate-slide-up sticky top-0 z-20 -mx-4 px-4 bg-[#0b1121]/95 backdrop-blur-sm pb-2 pt-2 border-b border-white/5">
        {projectedStats.length > 0 ? (
          <div className="glass-card bg-cyan-900/20 border border-cyan-500/20 p-4 rounded-2xl shadow-xl">
            <h3 className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
              <Zap size={14} /> Projected Changes
            </h3>
            <div className="space-y-2">
              {projectedStats.map(stat => (
                <div key={stat.code} className="flex justify-between items-center text-sm">
                  <span className="text-slate-300 truncate w-2/3">{stat.name}</span>
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <span className="text-slate-500">{stat.oldPercent.toFixed(1)}%</span>
                    <span className="text-slate-600">→</span>
                    <span className={`${stat.newPercent < threshold ? 'text-red-400' : 'text-emerald-400'}`}>
                      {stat.newPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="glass-card border-dashed border-slate-700/50 p-4 rounded-2xl text-center">
            <p className="text-xs text-slate-500">Select days & mark classes to see impact.</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mb-4 space-y-3">
        <div className="flex gap-2">
          <button onClick={selectNext3Days} className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-400 hover:text-white transition">Next 3 Days</button>
          <button onClick={selectFullWeek} className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-400 hover:text-white transition">Full Week</button>
          <button onClick={clearSelection} className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-bold text-red-400 hover:bg-red-500/10 transition">Clear</button>
        </div>
        
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {DAYS_OF_WEEK.map(day => (
            <button 
              key={day} 
              onClick={() => toggleDay(day)} 
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                selectedDays.includes(day) 
                  ? 'bg-cyan-500 text-white border-cyan-400 shadow-lg shadow-cyan-500/20' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Classes List */}
      <div className="space-y-6">
        {activeClasses.length === 0 ? (
          <div className="text-center py-12 text-slate-600 text-sm">Select days above to load your timetable.</div>
        ) : (
          DAYS_OF_WEEK.filter(d => selectedDays.includes(d)).map(day => {
            const dayClasses = activeClasses.filter(c => c.day === day);
            if (dayClasses.length === 0) return null;

            return (
              <div key={day} className="animate-slide-up">
                 <div className="flex justify-between items-center mb-2 px-1">
                    <h3 className="text-cyan-400 text-xs font-bold uppercase tracking-widest">{day}</h3>
                    <button 
                      onClick={() => bunkDay(day)} 
                      className="text-[10px] font-bold text-red-400 hover:text-red-300 bg-red-500/10 px-2 py-1 rounded flex items-center gap-1"
                    >
                      <Flashlight size={12} /> Bunk All
                    </button>
                </div>
                <div className="space-y-2">
                  {dayClasses.map(cls => (
                    <div 
                      key={cls.uniqueId} 
                      className={`glass-card p-3 rounded-xl border transition-all ${
                        simulations[cls.uniqueId] ? 'border-cyan-500/30 bg-cyan-900/10' : 'border-slate-700/50'
                      }`}
                    >
                      <div className="flex justify-between items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-white font-semibold text-xs truncate">{cls.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-slate-500">{cls.code}</span>
                            {cls.period > 1 && (
                              <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 px-1.5 rounded">Period {cls.period}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button 
                            onClick={() => handleSimulate(cls.uniqueId, 'attend')} 
                            className={`w-10 h-9 rounded-lg flex items-center justify-center transition ${
                              simulations[cls.uniqueId] === 'attend' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                            }`}
                          >
                            <Check size={16} />
                          </button>
                          <button 
                            onClick={() => handleSimulate(cls.uniqueId, 'bunk')} 
                            className={`w-10 h-9 rounded-lg flex items-center justify-center transition ${
                              simulations[cls.uniqueId] === 'bunk' ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                            }`}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
