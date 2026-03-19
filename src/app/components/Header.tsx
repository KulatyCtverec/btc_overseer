import { Bitcoin, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-surface-base/95 backdrop-blur-sm shadow-[var(--shadow-depth-1)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between min-w-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-b from-[#F7931A] to-[#e88510] flex items-center justify-center shadow-[0_2px_8px_rgba(247,147,26,0.3)]">
          <Bitcoin className="w-6 h-6 text-black" />
        </div>

        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-surface-recessed hover:shadow-[var(--shadow-depth-2)] rounded-lg transition-all"
        >
          <Menu className="w-6 h-6 text-foreground" />
        </button>
      </div>
    </header>
  );
}
