import { X } from "lucide-react";

interface SideNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SideNav({ isOpen, onClose }: SideNavProps) {
  const menuItems = [
    { label: "Hero", href: "#hero" },
    { label: "Fear & Greed", href: "#fear-greed" },
    { label: "4 Year Cycle", href: "#cycle" },
    { label: "Volatility", href: "#volatility" },
  ];

  const handleItemClick = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-surface-overlay shadow-[var(--shadow-depth-3)] z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-xl text-foreground">Navigation</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-recessed hover:shadow-[var(--shadow-depth-2)] rounded-lg transition-all"
            >
              <X className="w-6 h-6 text-foreground" />
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleItemClick(item.href)}
                className="w-full text-left px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-surface-recessed hover:shadow-[var(--shadow-depth-2)] rounded-lg transition-all"
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
