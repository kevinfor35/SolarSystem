import { useState, useCallback } from 'react';
import SolarSystem from './components/SolarSystem';
import ControlPanel from './components/ControlPanel';
import InfoPanel from './components/InfoPanel';
import type { PlanetData } from './data/planets';

function App() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    setAnimationSpeed(speed);
  }, []);

  const handleResetView = useCallback(() => {
    window.location.reload();
  }, []);

  const handlePlanetSelect = useCallback((planet: PlanetData | null) => {
    setSelectedPlanet(planet);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-950">
      <SolarSystem
        isPlaying={isPlaying}
        animationSpeed={animationSpeed}
        onPlanetSelect={handlePlanetSelect}
      />

      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10">
        <h1 className="text-white text-3xl font-bold tracking-wider bg-black/40 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-700/50">
          🪐 太阳系探索
        </h1>
      </div>

      <ControlPanel
        isPlaying={isPlaying}
        animationSpeed={animationSpeed}
        onTogglePlay={handleTogglePlay}
        onSpeedChange={handleSpeedChange}
        onResetView={handleResetView}
      />

      <InfoPanel
        planet={selectedPlanet}
        onClose={() => setSelectedPlanet(null)}
      />

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-gray-500 text-xs">
        点击行星查看详细信息
      </div>
    </div>
  );
}

export default App;
