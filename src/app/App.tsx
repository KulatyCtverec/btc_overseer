import { lazy, Suspense, useState } from "react";
import { ChartDataProvider } from "./context/ChartDataContext";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { SideNav } from "./components/SideNav";

const FearGreedSection = lazy(() =>
  import("./components/FearGreedSection").then((m) => ({ default: m.FearGreedSection }))
);
const FourYearCycleSection = lazy(() =>
  import("./components/FourYearCycleSection").then((m) => ({ default: m.FourYearCycleSection }))
);
const PartyIndexSection = lazy(() =>
  import("./components/PartyIndexSection").then((m) => ({ default: m.PartyIndexSection }))
);

function SectionFallback() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-16 min-h-[320px] flex items-center justify-center">
      <div className="bg-[#1a1a1a] rounded animate-pulse w-full max-w-2xl h-64" aria-hidden />
    </div>
  );
}

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
            <Suspense fallback={<SectionFallback />}>
              <FearGreedSection />
            </Suspense>
          </div>

          <div id="cycle">
            <Suspense fallback={<SectionFallback />}>
              <FourYearCycleSection />
            </Suspense>
          </div>

          <div id="party-index">
            <Suspense fallback={<SectionFallback />}>
              <PartyIndexSection />
            </Suspense>
          </div>
        </main>

        <SideNav isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      </div>
    </ChartDataProvider>
  );
}
