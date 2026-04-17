import React from 'react';
import { NavLink } from 'react-router-dom';
import LayoutDashboard from 'lucide-react/dist/esm/icons/layout-dashboard';
import Users from 'lucide-react/dist/esm/icons/users';
import Settings from 'lucide-react/dist/esm/icons/settings';
import X from 'lucide-react/dist/esm/icons/x';
import Shield from 'lucide-react/dist/esm/icons/shield';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Kursiyerler', path: '/students', icon: Users },
];

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <aside
      className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 flex flex-col
        glass-strong
        transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-obsidian-border/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-glow to-cyan-dim flex items-center justify-center shadow-lg shadow-cyan-glow/20">
            <Shield className="text-white" size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-base font-bold text-text-heading tracking-tight leading-none">VR Olay Yeri</h1>
            <span className="text-[10px] font-mono text-cyan-glow/60 uppercase tracking-widest">Analiz Paneli</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-obsidian-hover transition-colors cursor-pointer"
          aria-label="Menüyü kapat"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <p className="px-3 text-[10px] font-semibold text-text-muted uppercase tracking-[0.2em] mb-3 font-mono">
          Gezinme
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer relative ${isActive
                  ? 'bg-cyan-glow/8 text-cyan-glow'
                  : 'text-text-secondary hover:bg-obsidian-hover hover:text-text-primary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-cyan-glow rounded-r-full shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
                  )}
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span className="text-sm font-medium">{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4">
        <NavLink
          to="/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-muted hover:bg-obsidian-hover hover:text-text-secondary transition-all duration-200 cursor-pointer"
        >
          <Settings size={18} strokeWidth={1.8} />
          <span className="text-sm font-medium">Ayarlar</span>
        </NavLink>
        <div className="mt-3 mx-3 pt-3 border-t border-obsidian-border/30">
          <p className="text-[10px] text-text-muted font-mono">v1.0-geliştirme aşamasında.</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;