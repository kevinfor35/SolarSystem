import { Play, Pause, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface ControlPanelProps {
  isPlaying: boolean;
  animationSpeed: number;
  onTogglePlay: () => void;
  onSpeedChange: (speed: number) => void;
  onResetView: () => void;
}

export default function ControlPanel({
  isPlaying,
  animationSpeed,
  onTogglePlay,
  onSpeedChange,
  onResetView,
}: ControlPanelProps) {
  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 bg-gray-900/80 backdrop-blur-md rounded-xl p-4 w-64 border border-gray-700/50 shadow-xl">
      <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
        控制面板
      </h3>

      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={onTogglePlay}
            className="flex-1 flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white py-2 px-4 rounded-lg transition-colors"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            {isPlaying ? '暂停' : '播放'}
          </button>
          <button
            onClick={onResetView}
            className="flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white p-2 px-4 rounded-lg transition-colors"
            title="重置视角"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        <div>
          <label className="text-gray-400 text-sm mb-2 block">
            动画速度: {animationSpeed.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={animationSpeed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.1x</span>
            <span>5x</span>
          </div>
        </div>

        <div className="border-t border-gray-700/50 pt-4">
          <p className="text-gray-400 text-xs mb-2">操作提示</p>
          <ul className="text-gray-500 text-xs space-y-1">
            <li>🖱️ 拖拽旋转视角</li>
            <li>🔍 滚轮缩放</li>
            <li>👆 点击行星查看详情</li>
          </ul>
        </div>
      </div>
    </div>
  );
}