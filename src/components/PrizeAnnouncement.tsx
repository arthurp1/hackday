import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, Clock, ExternalLink, Github, Video, ArrowLeft } from 'lucide-react';
import { useHackathon } from '../contexts/HackathonContext';

interface PrizeAnnouncementProps {
  onNavigate: (screen: string, data?: any) => void;
  uiState: string;
}

const PrizeAnnouncement: React.FC<PrizeAnnouncementProps> = ({ onNavigate, uiState }) => {
  const { state } = useHackathon();
  const { projects, challenges, bounties, attendees } = state;
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Check if it's after 18:30 (winner announcement time)
  const announcementTime = new Date();
  announcementTime.setHours(18, 30, 0, 0);
  const showWinners = currentTime >= announcementTime;

  const getProjectTeamMembers = (project: any) => {
    return attendees.filter(attendee => 
      project.teamMembers.includes(attendee.email)
    );
  };

  const getWinners = () => {
    const challengeWinners: any[] = [];
    const bountyWinners: any[] = [];

    projects.forEach(project => {
      if (project.judging) {
        // Check challenge winners
        challenges.forEach(challenge => {
          const judgmentKey = `challenge_${challenge.type}`;
          if (project.judging[judgmentKey] === 'winner') {
            challengeWinners.push({
              project,
              challenge,
              teamMembers: getProjectTeamMembers(project)
            });
          }
        });

        // Check bounty winners
        if (project.judging.bounty_status === 'pass') {
          const bounty = bounties.find(b => b.id === project.bountyId);
          if (bounty) {
            bountyWinners.push({
              project,
              bounty,
              teamMembers: getProjectTeamMembers(project)
            });
          }
        }
      }
    });

    return { challengeWinners, bountyWinners };
  };

  const { challengeWinners, bountyWinners } = getWinners();

  const renderCountdown = () => {
    const timeUntilAnnouncement = announcementTime.getTime() - currentTime.getTime();
    const hours = Math.floor(timeUntilAnnouncement / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilAnnouncement % (1000 * 60 * 60)) / (1000 * 60));

    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white mb-4">Winners Announcement</h2>
        <p className="text-gray-300 mb-6">
          The winners will be announced at 18:30
        </p>
        <div className="text-4xl font-bold text-cyan-400">
          {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`} remaining
        </div>
      </div>
    );
  };

  const renderWinners = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white">🎉 Hackathon Winners! 🎉</h2>
      </div>

      {/* Challenge Winners */}
      {challengeWinners.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Challenge Winners
          </h3>
          <div className="space-y-4">
            {challengeWinners.map(({ project, challenge, teamMembers }, index) => (
              <div key={`${project.id}-${challenge.id}`} className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border-2 border-yellow-500/30">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Crown className="w-6 h-6 text-yellow-400" />
                      <h4 className="font-bold text-white text-lg">{project.name}</h4>
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                        {challenge.title}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-3">{project.description}</p>
                    <div className="text-green-400 font-medium mb-3">
                      Prize: {challenge.prizes.map(p => p.details).join(' + ')}
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-400 mb-2">Team Members:</h5>
                  <div className="flex flex-wrap gap-2">
                    {teamMembers.map(member => (
                      <div key={member.id} className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full">
                        {member.avatar && (
                          <img 
                            src={member.avatar} 
                            alt={member.firstName}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <span className="text-blue-400 text-sm font-medium">
                          {member.firstName} {member.lastName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Project Links */}
                <div className="flex gap-2">
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded text-green-400 hover:bg-green-500/30 transition-colors text-sm"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Demo
                    </a>
                  )}
                  {project.videoDemo && (
                    <a
                      href={project.videoDemo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-400 hover:bg-red-500/30 transition-colors text-sm"
                    >
                      <Video className="w-3 h-3" />
                      Video
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bounty Winners */}
      {bountyWinners.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
            <Medal className="w-6 h-6" />
            Bounty Completions
          </h3>
          <div className="space-y-4">
            {bountyWinners.map(({ project, bounty, teamMembers }, index) => (
              <div key={`${project.id}-${bounty.id}`} className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border-2 border-blue-500/30">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Medal className="w-6 h-6 text-blue-400" />
                      <h4 className="font-bold text-white text-lg">{project.name}</h4>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                        {bounty.title}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-3">{project.description}</p>
                    <div className="text-green-400 font-medium mb-3">
                      Prize: {bounty.prizes.map(p => p.details).join(' + ')}
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-400 mb-2">Team Members:</h5>
                  <div className="flex flex-wrap gap-2">
                    {teamMembers.map(member => (
                      <div key={member.id} className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full">
                        {member.avatar && (
                          <img 
                            src={member.avatar} 
                            alt={member.firstName}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <span className="text-purple-400 text-sm font-medium">
                          {member.firstName} {member.lastName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Project Links */}
                <div className="flex gap-2">
                  {bounty.githubUrl && (
                    <a
                      href={bounty.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1 bg-gray-500/20 border border-gray-500/30 rounded text-gray-400 hover:bg-gray-500/30 transition-colors text-sm"
                    >
                      <Github className="w-3 h-3" />
                      GitHub Issue
                    </a>
                  )}
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded text-green-400 hover:bg-green-500/30 transition-colors text-sm"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Demo
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {challengeWinners.length === 0 && bountyWinners.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No winners have been announced yet.
        </div>
      )}
    </div>
  );

  return (
    <div className="quiz-panel">
      <button
        onClick={() => onNavigate('welcome')}
        className="modal-back-button-bottom-left p-2 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="quiz-header">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <div>
            <h2 className="text-lg font-bold text-white">Prize Announcement</h2>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {showWinners ? renderWinners() : renderCountdown()}
      </div>
    </div>
  );
};

export default PrizeAnnouncement;