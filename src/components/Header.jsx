import React from 'react';
import Bell from 'lucide-react/dist/esm/icons/bell';
import User from 'lucide-react/dist/esm/icons/user';
import Search from 'lucide-react/dist/esm/icons/search';
import Menu from 'lucide-react/dist/esm/icons/menu';

const Header = ({ onToggleSidebar }) => {
  return (
    <header className="h-14 glass-strong border-b border-obsidian-border/30 flex items-center justify-between px-4 md:px-6 z-10 shrink-0">
      {/* Left side */}
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-obsidian-hover transition-colors cursor-pointer"
          aria-label="Menüyü aç"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div className="relative w-56 hidden sm:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search size={15} className="text-text-muted" />
          </span>
          <input
            type="text"
            placeholder="Ara..."
            className="w-full py-2 pl-9 pr-4 bg-obsidian-card/60 border border-obsidian-border/40 rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-cyan-glow/40 focus:border-cyan-glow/30 transition-all font-display"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-obsidian-hover cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-glow/50">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-glow rounded-full border border-obsidian" />
        </button>

        <div className="h-6 w-px bg-obsidian-border/40" />

        <button className="flex items-center gap-2.5 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-glow/50 rounded-lg p-1 pr-2 hover:bg-obsidian-hover transition-colors">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-glow to-purple-glow rounded-lg flex items-center justify-center text-white shadow-lg shadow-cyan-glow/10">
            <User size={15} strokeWidth={2.2} />
          </div>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-xs font-semibold text-text-primary leading-tight">Misafir</span>
            <span className="text-[10px] text-text-muted font-mono">Görüntüleme</span>
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;