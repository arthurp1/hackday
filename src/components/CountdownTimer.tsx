import React, { useState, useEffect } from 'react';
import { Clock, ChevronUp } from 'lucide-react';

const CountdownTimer: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMinimized, setIsMinimized] = useState(false);
  const [showAgenda, setShowAgenda] = useState(false);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Hackathon schedule for tomorrow in Amsterdam (GMT+2)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const schedule = [
    { time: '10:00', event: 'Doors open', emoji: '🚪' },
    { time: '10:20', event: 'Sponsors', emoji: '🎯' },
    { time: '10:30', event: 'Workshop', emoji: '🛠️' },
    { time: '11:00', event: 'Hack Start', emoji: '🚀' },
    { time: '12:00', event: 'Lunch', emoji: '🌯' },
    { time: '17:30', event: 'Demos', emoji: '🎤' },
    { time: '18:00', event: 'Food', emoji: '🍛' },
    { time: '18:30', event: 'Winner', emoji: '🏆' }
  ];

  // Find next event
  const getNextEvent = () => {
    const now = currentTime;
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
            timeDisplay = `${hoursLeft}.5h left`;
          } else if (minutesLeft === 0) {
            timeDisplay = `${hoursLeft}h left`;
          } else {
            timeDisplay = `${hoursLeft}h ${minutesLeft}m left`;
          }
        } else {
          timeDisplay = `${minutesLeft}m left`;
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

  if (isMinimized) {
    return (
      <div className="fixed top-4 left-4 z-40">
        <button
          onClick={() => setIsMinimized(false)}
          className="w-8 h-8 bg-black/70 backdrop-blur-md border border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300"
        >
          <Clock className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="fixed top-4 left-4 z-40"
      onMouseEnter={() => setShowAgenda(true)}
      onMouseLeave={() => setShowAgenda(false)}
    >
      <div className="bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded-lg p-3 text-white text-xs max-w-48 relative">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span className="text-cyan-400 font-medium">{nextEvent.timeLeft}</span>
          </div>
          <button
            onClick={() => setIsMinimized(true)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
        </div>
        
        <div className="text-white font-medium mb-1">
          {nextEvent.time} {nextEvent.emoji} {nextEvent.event}
        </div>

        {showAgenda && (
          <div className="absolute mt-2 left-0 right-0 bg-black/95 border border-cyan-500/20 rounded-lg p-2 text-xs text-gray-300 shadow-lg min-w-250">
            <div className="text-cyan-300 font-semibold mb-1">Full Agenda</div>
            <div className="space-y-1">
              {schedule.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-gray-400 w-10">{item.time}</span>
                  <span className="text-gray-300">{item.emoji} {item.event}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountdownTimer;