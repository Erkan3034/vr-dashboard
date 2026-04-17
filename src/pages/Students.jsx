import React, { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { useNavigate } from 'react-router-dom';
import Search from 'lucide-react/dist/esm/icons/search';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import UserIcon from 'lucide-react/dist/esm/icons/user';
import Users from 'lucide-react/dist/esm/icons/users';

const AVATAR_GRADIENTS = [
  'from-cyan-glow to-blue-600',
  'from-purple-glow to-pink-600',
  'from-emerald-glow to-teal-600',
  'from-amber-glow to-orange-600',
  'from-rose-glow to-red-600',
  'from-blue-400 to-indigo-600',
];

const getGradient = (name) => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
};

const SkeletonCard = () => (
  <div className="glass rounded-2xl p-5">
    <div className="flex items-center gap-3 mb-4">
      <div className="skeleton w-11 h-11 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-28" />
        <div className="skeleton h-3 w-20" />
      </div>
    </div>
    <div className="skeleton h-2 w-full rounded-full" />
  </div>
);

const Students = () => {
  const { studentList, loading, error } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!searchTerm) return studentList;
    const term = searchTerm.toLowerCase();
    return studentList.filter(student => 
      student.name.toLowerCase().includes(term) || 
      student.id.toLowerCase().includes(term)
    );
  }, [studentList, searchTerm]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (error) return <div className="text-rose-glow p-4 bg-rose-glow/5 rounded-xl text-sm">Hata: {error}</div>;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h2 className="text-2xl font-bold text-text-heading font-display">Kursiyerler</h2>
          <p className="text-sm text-text-muted mt-1">{studentList.length} kayıtlı kursiyer</p>
        </div>
        <div className="relative w-full sm:w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search size={15} className="text-text-muted" />
          </span>
          <input 
            type="text" 
            placeholder="İsim veya ID ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2.5 pl-9 pr-4 bg-obsidian-card/60 border border-obsidian-border/40 rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-cyan-glow/40 focus:border-cyan-glow/30 transition-all font-display"
          />
        </div>
      </div>

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-obsidian-card flex items-center justify-center mb-4">
            <Users size={28} className="text-text-muted" />
          </div>
          <h3 className="text-base font-semibold text-text-heading mb-1">Kursiyer bulunamadı</h3>
          <p className="text-sm text-text-muted">
            {searchTerm ? `"${searchTerm}" ile eşleşen sonuç yok` : 'Henüz kayıtlı kursiyer bulunmuyor'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((student, i) => {
            const gradient = getGradient(student.name);
            const scoreColor = student.avgScore >= 70 
              ? 'text-emerald-glow'
              : student.avgScore >= 40 
                ? 'text-amber-glow'
                : 'text-rose-glow';
            const barColor = student.avgScore >= 70 
              ? 'bg-emerald-glow'
              : student.avgScore >= 40 
                ? 'bg-amber-glow'
                : 'bg-rose-glow';

            return (
              <button
                key={student.id}
                onClick={() => navigate(`/students/${student.id}`)}
                className={`glass rounded-2xl p-5 text-left card-interactive cursor-pointer animate-fade-in-up stagger-${Math.min(i + 1, 8)} group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-glow/50`}
              >
                {/* Top row */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0`}>
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-heading truncate">{student.name}</p>
                    <p className="text-[11px] font-mono text-text-muted truncate">{student.id}</p>
                  </div>
                  <ChevronRight size={16} className="text-text-muted group-hover:text-cyan-glow transition-colors shrink-0" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-text-heading font-mono">{student.sessionCount}</p>
                    <p className="text-[10px] text-text-muted uppercase tracking-wider font-mono">Oturum</p>
                  </div>
                  <div>
                    <p className={`text-lg font-bold font-mono ${scoreColor}`}>{student.avgScore}</p>
                    <p className="text-[10px] text-text-muted uppercase tracking-wider font-mono">Ort. Puan</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-text-heading font-mono">{student.quizCount}</p>
                    <p className="text-[10px] text-text-muted uppercase tracking-wider font-mono">Quiz</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider">Performans</span>
                    <span className={`text-[10px] font-mono font-semibold ${scoreColor}`}>{student.avgScore}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-obsidian-card rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${barColor} transition-all duration-700 ease-out`}
                      style={{ width: `${Math.min(100, student.avgScore)}%` }}
                    />
                  </div>
                </div>

                {/* Footer info */}
                <div className="mt-3 pt-3 border-t border-obsidian-border/20 flex justify-between items-center">
                  <span className="text-[10px] text-text-muted truncate max-w-[60%]">{student.lastModule}</span>
                  <span className="text-[10px] font-mono text-text-muted shrink-0">{student.time}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Students;