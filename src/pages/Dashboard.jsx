import React from 'react';
import { useData } from '@/context/DataContext';
import Users from 'lucide-react/dist/esm/icons/users';
import Activity from 'lucide-react/dist/esm/icons/activity';
import Target from 'lucide-react/dist/esm/icons/target';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import Clock from 'lucide-react/dist/esm/icons/clock';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const DONUT_COLORS = ['#10b981', '#f43f5e'];

const SkeletonCard = () => (
  <div className="glass rounded-2xl p-6 space-y-3">
    <div className="skeleton h-4 w-24" />
    <div className="skeleton h-8 w-16" />
  </div>
);

const StatCard = ({ icon: Icon, label, value, accent, glowClass, delay }) => (
  <div className={`glass rounded-2xl p-5 flex items-center gap-4 card-interactive animate-fade-in-up ${delay} ${glowClass}`}>
    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center shadow-lg shrink-0`}>
      <Icon size={20} className="text-white" strokeWidth={2} />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wider font-mono">{label}</p>
      <p className="text-2xl font-bold text-text-heading font-display animate-count-up mt-0.5">{value}</p>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 shadow-xl border border-obsidian-border/60 text-xs">
      <p className="text-text-primary font-medium mb-1">{payload[0]?.payload?.fullName || label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="font-mono">
          {entry.name}: <span className="font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const { stats, loading, error, retry } = useData();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-6"><div className="skeleton h-64 w-full" /></div>
          <div className="glass rounded-2xl p-6"><div className="skeleton h-64 w-full" /></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-rose-glow/10 flex items-center justify-center">
          <Activity size={28} className="text-rose-glow" />
        </div>
        <h3 className="text-lg font-semibold text-text-heading">Bağlantı Hatası</h3>
        <p className="text-sm text-text-muted text-center max-w-sm">
          Firebase veritabanına bağlanırken hata oluştu. Lütfen Rules ayarlarınızı kontrol edin.
        </p>
        <code className="text-xs font-mono text-rose-glow/70 bg-rose-glow/5 px-3 py-1.5 rounded-lg">{error}</code>
        <button 
          onClick={retry}
          className="mt-2 px-4 py-2 bg-cyan-glow/10 text-cyan-glow text-sm rounded-lg hover:bg-cyan-glow/20 transition-colors cursor-pointer font-medium"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Title */}
      <div className="animate-fade-in-up">
        <h2 className="text-2xl font-bold text-text-heading font-display">Genel Bakış</h2>
        <p className="text-sm text-text-muted mt-1">Eğitim performans istatistikleri ve analiz</p>
      </div>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Kursiyer"
          value={stats.totalUsers}
          accent="from-cyan-glow to-cyan-dim"
          glowClass="glow-cyan"
          delay="stagger-1"
        />
        <StatCard
          icon={Target}
          label="Başarı Oranı"
          value={`%${stats.successRate}`}
          accent="from-emerald-glow to-emerald-700"
          glowClass="glow-emerald"
          delay="stagger-2"
        />
        <StatCard
          icon={BookOpen}
          label="Quiz Sayısı"
          value={stats.totalQuizzes}
          accent="from-amber-glow to-amber-600"
          glowClass="glow-amber"
          delay="stagger-3"
        />
        <StatCard
          icon={Activity}
          label="VR Oturumu"
          value={stats.totalVRSessions}
          accent="from-purple-glow to-purple-600"
          glowClass="glow-purple"
          delay="stagger-4"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart — Module Sessions */}
        <div className="lg:col-span-2 glass rounded-2xl p-5 animate-fade-in-up stagger-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-text-heading">Modül Bazlı Oturumlar</h3>
              <p className="text-xs text-text-muted mt-0.5">Her modülün toplam tamamlanma sayısı</p>
            </div>
            <TrendingUp size={16} className="text-cyan-glow/40" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(42,52,68,0.6)" />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  axisLine={{ stroke: 'rgba(42,52,68,0.6)' }}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(34,211,238,0.04)' }} />
                <Bar 
                  dataKey="tamamlayan" 
                  name="Oturum"
                  fill="url(#barGradient)" 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#0e7490" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart — Quiz Distribution */}
        <div className="glass rounded-2xl p-5 animate-fade-in-up stagger-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-text-heading">Soru Dağılımı</h3>
            <p className="text-xs text-text-muted mt-0.5">Doğru / Yanlış oranı</p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={72}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs text-text-secondary font-mono">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Center stat */}
          <div className="text-center -mt-2">
            <span className="text-2xl font-bold text-text-heading font-mono">%{stats.successRate}</span>
            <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">başarı</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {stats.recentActivity.length > 0 && (
        <div className="glass rounded-2xl p-5 animate-fade-in-up stagger-7">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-text-heading">Son Aktiviteler</h3>
              <p className="text-xs text-text-muted mt-0.5">En son gerçekleştirilen oturumlar</p>
            </div>
            <Clock size={16} className="text-text-muted" />
          </div>
          <div className="space-y-2">
            {stats.recentActivity.map((session, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-obsidian-card/40 hover:bg-obsidian-hover transition-colors">
                <div className={`w-2 h-2 rounded-full shrink-0 ${session.FinalPuan !== undefined ? 'bg-amber-glow' : 'bg-purple-glow'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">
                    <span className="font-medium">{session.KullaniciAdi || 'İsimsiz'}</span>
                    <span className="text-text-muted mx-1.5">—</span>
                    <span className="text-text-secondary">{session.ModulAdi || 'Bilinmeyen Modül'}</span>
                  </p>
                </div>
                <span className="text-[10px] font-mono text-text-muted shrink-0">
                  {session.Tarih || session.BaslangicZamani || '-'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;