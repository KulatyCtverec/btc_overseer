import { X } from 'lucide-react';

interface SideNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SideNav({ isOpen, onClose }: SideNavProps) {
  const menuItems = [
    { label: 'Hero', href: '#hero' },
    { label: 'Fear & Greed', href: '#fear-greed' },
    { label: '4 Year Cycle', href: '#cycle' },
    { label: 'Party Index', href: '#party-index' },
  ];

  const handleItemClick = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-[#0a0a0a] border-l border-[#1a1a1a] z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-xl text-white">Navigation</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleItemClick(item.href)}
                className="w-full text-left px-4 py-3 text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-all"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
