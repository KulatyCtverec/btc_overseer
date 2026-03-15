import { Bitcoin, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-[#1a1a1a]">
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F7931A] to-[#FF8C00] flex items-center justify-center">
          <Bitcoin className="w-6 h-6 text-black" />
        </div>

        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
      </div>
    </header>
  );
}
