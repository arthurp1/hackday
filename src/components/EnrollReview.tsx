import React, { useState } from 'react';
import { Trophy, CheckCircle, XCircle, Clock, Save, ArrowLeft, Star, Medal } from 'lucide-react';
import { useHackathon } from '../contexts/HackathonContext';

interface EnrollReviewProps {
  onNavigate: (screen: string, data?: any) => void;
  uiState: string;
}

const EnrollReview: React.FC<EnrollReviewProps> = ({ onNavigate, uiState }) => {
  const { state, updateProject } = useHackathon();
  const { projects, challenges, bounties, attendees, currentUser } = state;
  const [judgments, setJudgments] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  // Filter projects for current sponsor
  const myChallenges = challenges.filter(c => c.sponsorId === currentUser?.id);
  const myBounties = bounties.filter(b => b.sponsorId === currentUser?.id);
  
  const relevantProjects = projects.filter(p => 
    p.challengesEnrolled.some(c => myChallenges.some(mc => mc.type === c)) ||
    myBounties.some(b => b.id === p.bountyId)
  );

  const handleJudgmentChange = (projectId: string, field: string, value: any) => {
    setJudgments(prev => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        [field]: value
      }
    }));
  };

  const handleSave = async (projectId: string) => {
    setSaving(prev => ({ ...prev, [projectId]: true }));
    try {
      const judgment = judgments[projectId] || {};
      await updateProject(projectId, {
        judging: judgment
      });
    } catch (error) {
      console.error('Failed to save judgment:', error);
    } finally {
      setSaving(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const getProjectTeamMembers = (project: any) => {
    return attendees.filter(attendee => 
      project.teamMembers.includes(attendee.email)
    );
  };

  return (
    <div className="quiz-panel">
      <button
        onClick={() => onNavigate('sponsorDashboard')}
        className="modal-back-button-bottom-left p-2 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="quiz-header">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-purple-400" />
          <div>
            <h2 className="text-lg font-bold text-white">Project Review & Judging</h2>
          </div>
        </div>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto">
        {relevantProjects.map(project => {
          const teamMembers = getProjectTeamMembers(project);
          const bounty = myBounties.find(b => b.id === project.bountyId);
          const projectJudgment = judgments[project.id] || {};
          
          return (
            <div key={project.id} className="p-4 bg-black/20 rounded-lg border border-white/10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white text-lg">{project.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      project.status === 'submitted' ? 'bg-green-500/20 text-green-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-3">{project.description}</p>
                  
                  <div className="text-sm text-gray-400 mb-3">
                    Team: {project.teamName} ({teamMembers.length} members)
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {teamMembers.map(member => (
                      <div key={member.id} className="flex items-center gap-2 px-2 py-1 bg-blue-500/10 rounded text-xs">
                        <span className="text-blue-400">{member.firstName} {member.lastName}</span>
                      </div>
                    ))}
                  </div>

                  {/* Project Links */}
                  <div className="flex gap-2 mb-4">
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded text-green-400 hover:bg-green-500/30 transition-colors text-xs"
                      >
                        Demo
                      </a>
                    )}
                    {project.videoDemo && (
                      <a
                        href={project.videoDemo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-400 hover:bg-red-500/30 transition-colors text-xs"
                      >
                        Video
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Challenge Judging */}
              {project.challengesEnrolled
                .filter(c => myChallenges.some(mc => mc.type === c))
                .map(challengeType => {
                  const challenge = myChallenges.find(c => c.type === challengeType);
                  return (
                    <div key={challengeType} className="mb-4 p-3 bg-purple-500/10 rounded border border-purple-500/20">
                      <h4 className="text-purple-400 font-medium mb-2">
                        Challenge: {challenge?.title}
                      </h4>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {['winner', 'runner-up', 'not-selected'].map(status => (
                          <button
                            key={status}
                            onClick={() => handleJudgmentChange(project.id, `challenge_${challengeType}`, status)}
                            className={`p-2 rounded text-sm transition-colors ${
                              projectJudgment[`challenge_${challengeType}`] === status
                                ? status === 'winner' ? 'bg-yellow-500/30 text-yellow-400 border border-yellow-500/50' :
                                  status === 'runner-up' ? 'bg-gray-500/30 text-gray-400 border border-gray-500/50' :
                                  'bg-red-500/30 text-red-400 border border-red-500/50'
                                : 'bg-black/20 text-gray-400 hover:bg-white/10'
                            }`}
                          >
                            {status === 'winner' && <Star className="w-4 h-4 inline mr-1" />}
                            {status === 'runner-up' && <Medal className="w-4 h-4 inline mr-1" />}
                            {status === 'not-selected' && <XCircle className="w-4 h-4 inline mr-1" />}
                            {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={projectJudgment[`challenge_${challengeType}_note`] || ''}
                        onChange={(e) => handleJudgmentChange(project.id, `challenge_${challengeType}_note`, e.target.value)}
                        className="w-full px-3 py-2 bg-black/30 border border-purple-500/30 rounded text-white placeholder-gray-400 text-sm"
                        placeholder="Optional notes..."
                        rows={2}
                      />
                    </div>
                  );
                })}

              {/* Bounty Judging */}
              {bounty && (
                <div className="mb-4 p-3 bg-blue-500/10 rounded border border-blue-500/20">
                  <h4 className="text-blue-400 font-medium mb-2">
                    Bounty: {bounty.title}
                  </h4>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {['pass', 'pending', 'fail'].map(status => (
                      <button
                        key={status}
                        onClick={() => handleJudgmentChange(project.id, 'bounty_status', status)}
                        className={`p-2 rounded text-sm transition-colors ${
                          projectJudgment.bounty_status === status
                            ? status === 'pass' ? 'bg-green-500/30 text-green-400 border border-green-500/50' :
                              status === 'pending' ? 'bg-yellow-500/30 text-yellow-400 border border-yellow-500/50' :
                              'bg-red-500/30 text-red-400 border border-red-500/50'
                            : 'bg-black/20 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {status === 'pass' && <CheckCircle className="w-4 h-4 inline mr-1" />}
                        {status === 'pending' && <Clock className="w-4 h-4 inline mr-1" />}
                        {status === 'fail' && <XCircle className="w-4 h-4 inline mr-1" />}
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={projectJudgment.bounty_note || ''}
                    onChange={(e) => handleJudgmentChange(project.id, 'bounty_note', e.target.value)}
                    className="w-full px-3 py-2 bg-black/30 border border-blue-500/30 rounded text-white placeholder-gray-400 text-sm"
                    placeholder="Optional notes..."
                    rows={2}
                  />
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => handleSave(project.id)}
                  disabled={saving[project.id]}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded text-purple-400 hover:bg-purple-500/30 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving[project.id] ? 'Saving...' : 'Save Judgment'}
                </button>
              </div>
            </div>
          );
        })}

        {relevantProjects.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No projects found for your challenges or bounties.
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrollReview;