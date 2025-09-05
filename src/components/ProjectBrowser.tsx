import React, { useState } from 'react';
import { Eye, Users, Trophy, Tag, ExternalLink, Github } from 'lucide-react';
import { useHackathon } from '../contexts/HackathonContext';

interface ProjectBrowserProps {
  onClose?: () => void;
}

const ProjectBrowser: React.FC<ProjectBrowserProps> = ({ onClose }) => {
  const { state } = useHackathon();
  const { projects, attendees, challenges, currentUser } = state;
  const [filter, setFilter] = useState<'all' | 'submitted' | 'bounty' | 'challenge'>('all');

  // Filter out current user's projects
  const otherProjects = projects.filter(project => 
    !project.teamMembers.includes(currentUser?.email || '')
  );

  const filteredProjects = otherProjects.filter(project => {
    switch (filter) {
      case 'submitted':
        return project.status === 'submitted';
      case 'bounty':
        return project.type === 'bounty';
      case 'challenge':
        return project.challengesEnrolled.length > 0;
      default:
        return true;
    }
  });

  const getProjectTeamMembers = (project: any) => {
    return attendees.filter(attendee => 
      project.teamMembers.includes(attendee.email)
    );
  };

  const getChallengeInfo = (challengeType: string) => {
    const challenge = challenges.find(c => c.type === challengeType);
    return challenge ? {
      name: challenge.type,
      prize: challenge.prizes[0]?.details || 'Prize available'
    } : null;
  };

  const getTagColor = (index: number) => {
    const colors = [
      'bg-blue-500/20 border-blue-500/50 text-blue-400',
      'bg-purple-500/20 border-purple-500/50 text-purple-400',
      'bg-green-500/20 border-green-500/50 text-green-400',
      'bg-pink-500/20 border-pink-500/50 text-pink-400',
      'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
      'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="p-6 bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-lg max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Eye className="w-6 h-6 text-cyan-400" />
          <h3 className="text-xl font-semibold text-white">Browse Projects</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: 'All Projects' },
          { key: 'submitted', label: 'Submitted' },
          { key: 'bounty', label: 'Bounties' },
          { key: 'challenge', label: 'Challenges' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              filter === key
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="space-y-4">
        {filteredProjects.map(project => {
          const teamMembers = getProjectTeamMembers(project);
          
          return (
            <div key={project.id} className="p-4 bg-black/20 rounded-lg border border-white/10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-white">{project.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      project.status === 'submitted' ? 'bg-green-500/20 text-green-400' :
                      project.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {project.status}
                    </span>
                    {project.type === 'bounty' && (
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                        Bounty
                      </span>
                    )}
                  </div>
                  
                  {project.teamName && (
                    <div className="text-sm text-gray-400 mb-2">
                      Team: {project.teamName}
                    </div>
                  )}
                  
                  {project.description && (
                    <p className="text-sm text-gray-300 mb-3">{project.description}</p>
                  )}
                </div>
              </div>

              {/* Team Members */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Team ({teamMembers.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {teamMembers.map(member => (
                    <div key={member.id} className="flex items-center gap-2 px-2 py-1 bg-blue-500/10 rounded text-xs">
                      <span className="text-blue-400">{member.firstName} {member.lastName}</span>
                      {member.profile?.city && (
                        <span className="text-gray-400">• {member.profile.city}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Challenges */}
              {project.challengesEnrolled.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-gray-400">Challenges</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.challengesEnrolled.map(challengeType => {
                      const challengeInfo = getChallengeInfo(challengeType);
                      return challengeInfo ? (
                        <div key={challengeType} className="px-2 py-1 bg-yellow-500/10 rounded text-xs">
                          <span className="text-yellow-400 capitalize">{challengeInfo.name}</span>
                          <span className="text-gray-400 ml-1">• {challengeInfo.prize}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {project.tags.map((tag, index) => (
                      <span
                        key={tag}
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getTagColor(index)}`}
                        style={{ borderWidth: '3px' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="flex gap-2">
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded text-green-400 hover:bg-green-500/30 transition-colors text-xs"
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
                    className="flex items-center gap-1 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-400 hover:bg-red-500/30 transition-colors text-xs"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Video
                  </a>
                )}
                {project.slides && (
                  <a
                    href={project.slides}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-blue-400 hover:bg-blue-500/30 transition-colors text-xs"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Slides
                  </a>
                )}
              </div>
            </div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No projects found matching the current filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectBrowser;