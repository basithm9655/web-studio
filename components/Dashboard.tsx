import React, { useState } from 'react';
import { Course } from '../types';
import { CourseCard } from './CourseCard';
import { RefreshCw, Zap } from 'lucide-react';

interface DashboardProps {
  courses: Course[];
  threshold: number;
  lastUpdated: string;
  // manualData maps CourseCode -> { attended: 0, bunked: 0 }
  manualData: Record<string, { attended: number; bunked: number }>;
  updateManualData: (code: string, type: 'attended' | 'bunked', val: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  courses, 
  threshold, 
  lastUpdated, 
  manualData, 
  updateManualData 
}) => {
  const [isTrackingMode, setIsTrackingMode] = useState(false);

  return (
    <div className="animate-fade-in space-y-6 pb-24">
      {/* Header Info */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-white/5">
          <span className="text-cyan-400 animate-spin-slow">
            <RefreshCw size={12} />
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            Official Data: {lastUpdated}
          </span>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="relative">
        <div className={`transition-all duration-500 ease-in-out border rounded-2xl p-1 flex items-center justify-between ${isTrackingMode ? 'bg-cyan-900/20 border-cyan-500/30' : 'bg-slate-800/40 border-slate-700/50'}`}>
          <div className="px-4 py-2 flex-1">
            <div className={`text-xs font-bold uppercase tracking-wider mb-0.5 flex items-center gap-2 ${isTrackingMode ? 'text-cyan-400' : 'text-slate-400'}`}>
              <Zap size={14} /> {isTrackingMode ? 'Live Tracking Active' : 'Live Tracking Off'}
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-tight">
              {isTrackingMode ? 'Tap +/- to adjust classes' : 'Enable to add manual classes'}
            </p>
          </div>
          <button 
            onClick={() => setIsTrackingMode(!isTrackingMode)} 
            className={`h-10 px-5 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 ${isTrackingMode ? 'bg-cyan-500 text-white shadow-cyan-500/20' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            {isTrackingMode ? 'Done' : 'Enable'}
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {courses.map((course, idx) => (
          <CourseCard 
            key={course.code} 
            course={course} 
            threshold={threshold} 
            index={idx}
            isTrackingMode={isTrackingMode}
            manualAdjustment={manualData[course.code] || { attended: 0, bunked: 0 }}
            onUpdateManual={(type, val) => updateManualData(course.code, type, val)}
          />
        ))}
      </div>
    </div>
  );
};
