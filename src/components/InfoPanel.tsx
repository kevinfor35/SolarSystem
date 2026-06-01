import { X, Circle } from 'lucide-react';
import type { PlanetData } from '../data/planets';
import { formatNumber, formatScientific } from '../data/planets';

interface InfoPanelProps {
  planet: PlanetData | null;
  onClose: () => void;
}

export default function InfoPanel({ planet, onClose }: InfoPanelProps) {
  if (!planet) return null;

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 bg-gray-900/80 backdrop-blur-md rounded-xl p-6 w-80 border border-gray-700/50 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-xl font-bold">{planet.nameCN}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: planet.color }}
        >
          <Circle size={32} className="text-white/30" />
        </div>
        <div>
          <p className="text-gray-400 text-sm">{planet.name}</p>
          {planet.hasRings && (
            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
              有光环
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
          <span className="text-gray-400 text-sm">直径</span>
          <span className="text-white font-mono">
            {formatNumber(planet.diameter)} km
          </span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
          <span className="text-gray-400 text-sm">质量</span>
          <span className="text-white font-mono">
            {formatScientific(planet.mass)} kg
          </span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
          <span className="text-gray-400 text-sm">与太阳距离</span>
          <span className="text-white font-mono">
            {planet.distanceFromSun.toFixed(2)} AU
          </span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
          <span className="text-gray-400 text-sm">公转周期</span>
          <span className="text-white font-mono">
            {formatNumber(planet.orbitalPeriod)} 天
          </span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
          <span className="text-gray-400 text-sm">自转周期</span>
          <span className="text-white font-mono">
            {planet.rotationPeriod.toFixed(1)} 小时
          </span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
          <span className="text-gray-400 text-sm">轨道偏心率</span>
          <span className="text-white font-mono">
            {planet.eccentricity.toFixed(4)}
          </span>
        </div>

        <div className="flex justify-between items-center py-2">
          <span className="text-gray-400 text-sm">轨道倾角</span>
          <span className="text-white font-mono">
            {planet.inclination.toFixed(3)}°
          </span>
        </div>
      </div>
    </div>
  );
}