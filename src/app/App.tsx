import { useState } from "react";
import { ChartDataProvider } from "./context/ChartDataContext";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { FearGreedSection } from "./components/FearGreedSection";
import { FourYearCycleSection } from "./components/FourYearCycleSection";
import { PartyIndexSection } from "./components/PartyIndexSection";
import { SideNav } from "./components/SideNav";

export default function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <ChartDataProvider>
      <div className="min-h-screen bg-black text-white">
        <Header onMenuClick={() => setIsNavOpen(true)} />

        <main>
          <div id="hero">
            <HeroSection />
          </div>

          <div id="fear-greed">
            <FearGreedSection />
          </div>

          <div id="cycle">
            <FourYearCycleSection />
          </div>

          <div id="party-index">
            <PartyIndexSection />
          </div>
        </main>

        <SideNav isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      </div>
    </ChartDataProvider>
  );
}
