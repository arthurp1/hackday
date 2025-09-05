import React, { useState } from 'react';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';

export interface SpeedSettings {
  portalIntroSpeed: number;
  portalIntroTime: number;
  portalAccelSpeed: number;
  portalAccelTime: number;
  portalIdleSpeed: number;
}

interface SpeedControllerProps {
  settings: SpeedSettings;
  onSettingsChange: (settings: SpeedSettings) => void;
}

const SpeedController: React.FC<SpeedControllerProps> = ({ settings, onSettingsChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateSetting = (key: keyof SpeedSettings, value: number) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-black/50 backdrop-blur-md border border-cyan-500/30 rounded-lg flex items-center justify-center text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300"
      >
        <Settings className="w-5 h-5" />
      </button>
      
      {isOpen && (
        <div className="mt-2 w-80 bg-black/80 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-4 text-white text-sm">
          <h3 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Portal Speed Controls
          </h3>
          
          <div className="space-y-4">
            {/* Portal Intro */}
            <div className="space-y-2">
              <h4 className="text-cyan-300 font-semibold">1. Portal Intro</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-300 mb-1">Speed</label>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateSetting('portalIntroSpeed', Math.max(0.01, settings.portalIntroSpeed - 0.01))}
                      className="w-6 h-6 bg-cyan-500/20 rounded flex items-center justify-center hover:bg-cyan-500/30"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <span className="flex-1 text-center text-xs bg-black/50 rounded px-2 py-1">
                      {settings.portalIntroSpeed.toFixed(2)}
                    </span>
                    <button
                      onClick={() => updateSetting('portalIntroSpeed', Math.min(0.5, settings.portalIntroSpeed + 0.01))}
                      className="w-6 h-6 bg-cyan-500/20 rounded flex items-center justify-center hover:bg-cyan-500/30"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-300 mb-1">Time (s)</label>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateSetting('portalIntroTime', Math.max(1, settings.portalIntroTime - 0.5))}
                      className="w-6 h-6 bg-cyan-500/20 rounded flex items-center justify-center hover:bg-cyan-500/30"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <span className="flex-1 text-center text-xs bg-black/50 rounded px-2 py-1">
                      {settings.portalIntroTime.toFixed(1)}
                    </span>
                    <button
                      onClick={() => updateSetting('portalIntroTime', Math.min(10, settings.portalIntroTime + 0.5))}
                      className="w-6 h-6 bg-cyan-500/20 rounded flex items-center justify-center hover:bg-cyan-500/30"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Portal Acceleration */}
            <div className="space-y-2">
              <h4 className="text-cyan-300 font-semibold">2. Portal Acceleration</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-300 mb-1">Speed</label>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateSetting('portalAccelSpeed', Math.max(0.1, settings.portalAccelSpeed - 0.05))}
                      className="w-6 h-6 bg-cyan-500/20 rounded flex items-center justify-center hover:bg-cyan-500/30"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <span className="flex-1 text-center text-xs bg-black/50 rounded px-2 py-1">
                      {settings.portalAccelSpeed.toFixed(2)}
                    </span>
                    <button
                      onClick={() => updateSetting('portalAccelSpeed', Math.min(1.0, settings.portalAccelSpeed + 0.05))}
                      className="w-6 h-6 bg-cyan-500/20 rounded flex items-center justify-center hover:bg-cyan-500/30"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-300 mb-1">Time (s)</label>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateSetting('portalAccelTime', Math.max(1, settings.portalAccelTime - 0.5))}
                      className="w-6 h-6 bg-cyan-500/20 rounded flex items-center justify-center hover:bg-cyan-500/30"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <span className="flex-1 text-center text-xs bg-black/50 rounded px-2 py-1">
                      {settings.portalAccelTime.toFixed(1)}
                    </span>
                    <button
                      onClick={() => updateSetting('portalAccelTime', Math.min(8, settings.portalAccelTime + 0.5))}
                      className="w-6 h-6 bg-cyan-500/20 rounded flex items-center justify-center hover:bg-cyan-500/30"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Portal Idle */}
            <div className="space-y-2">
              <h4 className="text-cyan-300 font-semibold">3. Portal Idle</h4>
              <div>
                <label className="block text-xs text-gray-300 mb-1">Speed</label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateSetting('portalIdleSpeed', Math.max(0.005, settings.portalIdleSpeed - 0.005))}
                    className="w-6 h-6 bg-cyan-500/20 rounded flex items-center justify-center hover:bg-cyan-500/30"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <span className="flex-1 text-center text-xs bg-black/50 rounded px-2 py-1">
                    {settings.portalIdleSpeed.toFixed(3)}
                  </span>
                  <button
                    onClick={() => updateSetting('portalIdleSpeed', Math.min(0.1, settings.portalIdleSpeed + 0.005))}
                    className="w-6 h-6 bg-cyan-500/20 rounded flex items-center justify-center hover:bg-cyan-500/30"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeedController;