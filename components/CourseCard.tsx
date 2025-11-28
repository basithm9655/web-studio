import React from 'react';
import { Course } from '../types';
import { calculateStatus } from '../services/calculations';
import { Plus, Minus, AlertCircle, Coffee, History } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  threshold: number;
  index: number;
  manualAdjustment: { attended: number; bunked: number };
  onUpdateManual: (type: 'attended' | 'bunked', val: number) => void;
  isTrackingMode: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({ 
  course, 
  threshold, 
  index, 
  manualAdjustment, 
  onUpdateManual,
  isTrackingMode 
}) => {
  
  // Calculate stats incorporating manual adjustments (The "What-If" logic)
  const totalAdjusted = course.totalHours + manualAdjustment.attended + manualAdjustment.bunked;
  const presentAdjusted = course.presentHours + manualAdjustment.attended;
  
  // Using the helper from services
  const stats = calculateStatus(totalAdjusted, presentAdjusted, threshold);
  
  const currentPercent = totalAdjusted > 0 ? (presentAdjusted / totalAdjusted) * 100 : 0;
  const officialPercent = course.percentage;

  const getProgressColor = () => {
    if (currentPercent >= threshold + 5) return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]';
    if (currentPercent >= threshold) return 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]';
    return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]';
  };

  const getBorderColor = () => {
    if (stats.status === 'danger') return 'border-red-500/20';
    if (stats.status === 'success') return 'border-emerald-500/20';
    return 'border-yellow-500/20';
  };

  return (
    <div 
      className={`glass-card rounded-2xl p-5 border transition-all duration-300 hover:transform hover:scale-[1.01] ${getBorderColor()} ${isTrackingMode ? 'ring-1 ring-cyan-500/30' : ''}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md tracking-wide">
              {course.code}
            </span>
            {(manualAdjustment.attended > 0 || manualAdjustment.bunked > 0) && (
              <span className="text-[9px] font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-md flex items-center gap-1.5 border border-cyan-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> Live
              </span>
            )}
          </div>
          <h3 className="text-white font-bold text-base leading-snug">{course.name}</h3>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className={`text-2xl font-bold tracking-tight ${currentPercent < threshold ? 'text-red-400' : 'text-emerald-400'}`}>
            {currentPercent.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-3 bg-slate-800/50 rounded-full overflow-hidden mb-4 box-border border border-white/5">
        {Math.abs(currentPercent - officialPercent) > 0.1 && (
          <div 
            className="absolute top-0 left-0 h-full bg-slate-600/30 transition-all duration-700" 
            style={{ width: `${Math.min(officialPercent, 100)}%` }} 
          />
        )}
        <div 
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor()}`} 
          style={{ width: `${Math.min(currentPercent, 100)}%` }} 
        />
      </div>

      {isTrackingMode ? (
        <div className="animate-fade-in">
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5 mb-1">
            {/* Attend Controls */}
            <div className="bg-emerald-500/5 rounded-xl p-2 border border-emerald-500/10 flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-400 uppercase">Attend</span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => onUpdateManual('attended', -1)}
                  className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 flex items-center justify-center transition"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm font-bold text-white">{manualAdjustment.attended}</span>
                <button 
                  onClick={() => onUpdateManual('attended', 1)}
                  className="w-8 h-8 rounded-lg bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 flex items-center justify-center transition"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Bunk Controls */}
            <div className="bg-red-500/5 rounded-xl p-2 border border-red-500/10 flex items-center justify-between">
              <span className="text-[10px] font-bold text-red-400 uppercase">Bunk</span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => onUpdateManual('bunked', -1)}
                  className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm font-bold text-white">{manualAdjustment.bunked}</span>
                <button 
                  onClick={() => onUpdateManual('bunked', 1)}
                  className="w-8 h-8 rounded-lg bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-400 flex items-center justify-center transition"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between mt-2">
          <div className="text-slate-500 text-xs font-medium">
            {presentAdjusted} / {totalAdjusted} Hours
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${
            stats.type === 'bunk' 
              ? (stats.count > 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400')
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {stats.type === 'bunk' ? <Coffee size={12} /> : <AlertCircle size={12} />}
            {stats.message}
          </div>
        </div>
      )}
    </div>
  );
};
