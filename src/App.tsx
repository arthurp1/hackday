import React, { useState, useCallback } from 'react';
import TriangleTunnel from './components/TriangleTunnel';
import { SpeedSettings } from './components/TriangleTunnel';
import HackathonInterface from './components/HackathonInterface';

function App() {
  const [isAccelerating, setIsAccelerating] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0.02);
  const [speedSettings, setSpeedSettings] = useState<SpeedSettings>({
    portalIntroSpeed: 0.02,
    portalIntroTime: 4.0,
    portalAccelSpeed: 0.4,
    portalAccelTime: 4.0,
    portalIdleSpeed: 0.02
  });

  const handleAccelerate = useCallback((accelerating: boolean) => {
    setIsAccelerating(accelerating);
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    setCurrentSpeed(speed);
  }, []);
  
  const handleSettingsChange = useCallback((settings: SpeedSettings) => {
    setSpeedSettings(settings);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black" style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}>
      {/* Three.js Tunnel Background */}
      <TriangleTunnel 
        isAccelerating={isAccelerating}
        onSpeedChange={handleSpeedChange}
        speedSettings={speedSettings}
      />
      
      {/* Hackathon Interface Overlay */}
      <HackathonInterface 
        onAccelerate={handleAccelerate}
        speedSettings={speedSettings}
      />
    </div>
  );
}

export default App;