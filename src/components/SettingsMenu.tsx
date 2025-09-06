import React, { useState, useRef, useEffect } from 'react';
import { Settings, LogOut, Zap, ZapOff, User, Shield, Clock } from 'lucide-react';
import { useHackathon } from '../contexts/HackathonContext';

interface SettingsMenuProps {
  portalAnimationsEnabled: boolean;
  onTogglePortalAnimations: (enabled: boolean) => void;
  onLogout?: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ 
  portalAnimationsEnabled, 
  onTogglePortalAnimations,
  onLogout
}) => {
  const { state, logout, downloadStateJson, setPhase } = useHackathon();
  const { currentUser, phase } = state as any;
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    // Use the callback to handle navigation properly
    if (onLogout) {
      onLogout();
    }
  };

  if (!currentUser) return null;

  // Hackathon schedule for tomorrow in Amsterdam (GMT+2)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const schedule = [
    { time: '10:00', event: 'Doors open', emoji: '🚪' },
    { time: '10:30', event: 'Sponsor demos + optional workshop', emoji: '🎯' },
    { time: '10:45', event: 'Hack Start', emoji: '🚀' },
    { time: '12:00', event: 'Lunch (sponsored)', emoji: '🌯' },
    { time: '17:30', event: 'Demos begin', emoji: '🎤' },
    { time: '18:00', event: 'Dinner (donation based)', emoji: '🍛' }
  ];

  // Find next event
  const getNextEvent = () => {
    const now = new Date();
    const amsterdamOffset = 2; // GMT+2
    
    for (const item of schedule) {
      const [hours, minutes] = item.time.split(':').map(Number);
      const eventTime = new Date(tomorrow);
      eventTime.setHours(hours - amsterdamOffset, minutes, 0, 0); // Convert to local time
      
      if (eventTime > now) {
        const timeDiff = eventTime.getTime() - now.getTime();
        const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        
        let timeDisplay;
        if (hoursLeft >= 1) {
          if (minutesLeft === 30) {
            timeDisplay = `${hoursLeft}.5 hour${hoursLeft > 1 ? 's' : ''} left`;
          } else if (minutesLeft === 0) {
            timeDisplay = `${hoursLeft} hour${hoursLeft > 1 ? 's' : ''} left`;
          } else {
            timeDisplay = `${hoursLeft}h ${minutesLeft}m left`;
          }
        } else {
          timeDisplay = `${minutesLeft} min left`;
        }
        
        return {
          ...item,
          timeLeft: timeDisplay,
          eventTime: eventTime
        };
      }
    }
    
    // If no events today, show first event of tomorrow
    return {
      ...schedule[0],
      timeLeft: 'Tomorrow',
      eventTime: null
    };
  };

  const nextEvent = getNextEvent();

  return (
    <div className="fixed top-4 right-4 z-50" ref={menuRef}>
      {/* Settings Dot Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
          isOpen 
            ? 'bg-cyan-500/30 border-2 border-cyan-400/50' 
            : 'bg-black/50 border-2 border-cyan-500/20 hover:border-cyan-400/40'
        } backdrop-blur-md`}
      >
        <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
          isOpen ? 'bg-cyan-400' : 'bg-cyan-500/70'
        }`} />
      </button>

      {/* Settings Menu */}
      {isOpen && (
        <div className="absolute top-12 right-0 w-80 bg-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-lg shadow-2xl overflow-hidden">

          {/* Schedule */}
          <div className="p-3 border-b border-cyan-500/20 bg-black/30">
            <div className="text-xs text-cyan-400 font-semibold mb-2">FULL SCHEDULE</div>
            <div className="space-y-1">
              {schedule.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <span className="text-gray-400 w-10">{item.time}</span>
                  <span className="text-gray-300">{item.emoji} {item.event}</span>
                </div>
              ))}
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-cyan-500/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                {currentUser.type === 'host' ? (
                  <Shield className="w-4 h-4 text-white" />
                ) : currentUser.type === 'sponsor' ? (
                  <Settings className="w-4 h-4 text-white" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <div>
                <div className="text-white font-medium text-sm">{currentUser.name}</div>
                <div className="text-cyan-400 text-xs capitalize">{currentUser.type}</div>
              </div>
            </div>
          </div>

          {/* Settings Options */}
          <div className="p-2">
            {/* Public Debug Controls: Phase toggles */}
            <div className="mb-2 p-2 rounded bg-black/40 border border-yellow-500/20">
              <div className="text-xs text-yellow-300 mb-1">Debug: Phase Controls</div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => downloadStateJson()}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/10 rounded"
                  >
                    Download State (JSON)
                  </button>
                  <button
                    onClick={async () => {
                      const next = { votingOpen: !((phase && phase.votingOpen) || false), announce: !!(phase && phase.announce) };
                      await setPhase(next);
                      window.dispatchEvent(new Event('phase-updated'));
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-cyan-300 hover:bg-cyan-500/10 rounded"
                  >
                    {phase?.votingOpen ? 'Close Sponsor Voting' : 'Open Sponsor Voting'}
                  </button>
                  <button
                    onClick={async () => {
                      const next = { votingOpen: !!(phase && phase.votingOpen), announce: !((phase && phase.announce) || false) };
                      await setPhase(next);
                      window.dispatchEvent(new Event('phase-updated'));
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-green-300 hover:bg-green-500/10 rounded"
                  >
                    {phase?.announce ? 'Unset Winner Announced' : 'Set Winner Announced'}
                  </button>
                  <button
                    onClick={async () => {
                      await setPhase({ votingOpen: false, announce: false });
                      window.dispatchEvent(new Event('phase-updated'));
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-300 hover:bg-red-500/10 rounded"
                  >
                    Reset Phases (Editing/Normal)
                  </button>
                </div>
            </div>

            {/* Portal Animations Toggle */}
            <button
              onClick={() => onTogglePortalAnimations(!portalAnimationsEnabled)}
              className="w-full flex items-center gap-3 px-3 py-2 text-white hover:bg-cyan-500/10 rounded-lg transition-colors"
            >
              {portalAnimationsEnabled ? (
                <Zap className="w-4 h-4 text-cyan-400" />
              ) : (
                <ZapOff className="w-4 h-4 text-gray-400" />
              )}
              <span className="flex-1 text-left text-sm">Portal Animations</span>
              <div className={`w-8 h-4 rounded-full transition-colors ${
                portalAnimationsEnabled ? 'bg-cyan-500' : 'bg-gray-600'
              }`}>
                <div className={`w-3 h-3 bg-white rounded-full mt-0.5 transition-transform ${
                  portalAnimationsEnabled ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </div>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-1"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-cyan-500/20 bg-black/50">
            <div className="text-xs text-gray-400">
              Session auto-saves • Updates every minute
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsMenu;