import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  const [uiHidden, setUiHidden] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // Background press starts acceleration and fades UI; release restores
  const handleBackgroundPress = useCallback((ev: React.MouseEvent | React.TouchEvent) => {
    const target = ev.target as Node;
    if (overlayRef.current && overlayRef.current.contains(target)) {
      return; // Ignore presses inside UI overlay
    }
    setUiHidden(true);
    setIsAccelerating(true);
  }, []);

  const handleRelease = useCallback(() => {
    setUiHidden(false);
    setIsAccelerating(false);
  }, []);

  const handleAccelerate = useCallback((accelerating: boolean) => {
    setIsAccelerating(accelerating);
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    setCurrentSpeed(speed);
  }, []);
  
  const handleSettingsChange = useCallback((settings: SpeedSettings) => {
    setSpeedSettings(settings);
  }, []);

  // Global listeners so release outside root also restores UI
  useEffect(() => {
    const onUp = () => handleRelease();
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    window.addEventListener('touchcancel', onUp);
    return () => {
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
      window.removeEventListener('touchcancel', onUp);
    };
  }, [handleRelease]);

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-black"
      style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      onMouseDown={handleBackgroundPress}
      onTouchStart={handleBackgroundPress}
    >
      {/* Three.js Tunnel Background */}
      <TriangleTunnel 
        isAccelerating={isAccelerating}
        onSpeedChange={handleSpeedChange}
        speedSettings={speedSettings}
      />
      
      {/* Hackathon Interface Overlay */}
      <div
        ref={overlayRef}
        style={{
          opacity: uiHidden ? 0 : 1,
          transition: 'opacity 1s ease',
          pointerEvents: uiHidden ? 'none' : 'auto'
        }}
        className="absolute inset-0"
      >
        <HackathonInterface 
          onAccelerate={handleAccelerate}
          speedSettings={speedSettings}
        />
      </div>
    </div>
  );
}

export default App;