import React, { useState } from 'react';
import { Users, Trophy, Settings, Eye, Edit3, CheckCircle, Clock, AlertCircle, Plus, Building2, Gift, User } from 'lucide-react';
import { useHackathon, TeamStatus } from '../contexts/HackathonContext';
import ProfileEditor from './ProfileEditor';

interface HostDashboardProps {
  hostDashboardData: any;
  setHostDashboardData: (data: any) => void;
  onNavigate: (screen: string, data?: any) => void;
  uiState: string;
}

const HostDashboard: React.FC<HostDashboardProps> = ({ 
  hostDashboardData,
  setHostDashboardData,
  onNavigate, 
  uiState
}) => {
  const { state, updateProject, updateAttendee, assignAttendeeToTeam, removeAttendeeFromTeam, updateAttendeeTeamStatus } = useHackathon();
  const { currentUser, projects, bounties, attendees, challenges, goodies } = state;
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'attendees' | 'sponsors'>(
    hostDashboardData?.activeTab || 'dashboard'
  );
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  // Calculate statistics
  const stats = {
    totalProjects: projects.length,
    submittedProjects: projects.filter(p => p.status === 'submitted').length,
    totalAttendees: attendees.length,
    checkedInAttendees: attendees.filter(a => a.checkedIn).length,
    soloAttendees: attendees.filter(a => !a.projectId && !a.team?.includes('Sponsors')).length,
    challengeEnrollments: {
      featherless: projects.filter(p => p.challengesEnrolled.includes('featherless')).length,
      activepieces: projects.filter(p => p.challengesEnrolled.includes('activepieces')).length,
      aibuilders: projects.filter(p => p.challengesEnrolled.includes('aibuilders')).length
    }
  };

  const handleTabChange = (tab: 'dashboard' | 'projects' | 'attendees' | 'sponsors') => {
    setActiveTab(tab);
    setHostDashboardData({ ...hostDashboardData, activeTab: tab });
  };

  const handleTeamStatusUpdate = async (attendeeId: string, status: TeamStatus) => {
    await updateAttendeeTeamStatus(attendeeId, status);
  };

  const handleAssignToTeam = async (attendeeId: string, teamName: string, projectId?: string) => {
    await assignAttendeeToTeam(attendeeId, teamName, projectId);
  };

  const handleRemoveFromTeam = async (attendeeId: string) => {
    await removeAttendeeFromTeam(attendeeId);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/20">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-cyan-400" />
            <div>
              <div className="text-xl font-bold text-white">{stats.submittedProjects}/{stats.totalProjects}</div>
              <div className="text-sm text-cyan-400">Projects Submitted</div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-green-400" />
            <div>
              <div className="text-xl font-bold text-white">{stats.checkedInAttendees}/{stats.totalAttendees}</div>
              <div className="text-sm text-green-400">Attendees Checked In</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-purple-400" />
            <div>
              <div className="text-xl font-bold text-white">{stats.soloAttendees}</div>
              <div className="text-sm text-purple-400">Solo Attendees</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <div>
              <div className="text-xl font-bold text-white">
                {Math.round((stats.submittedProjects / stats.totalProjects) * 100)}%
              </div>
              <div className="text-sm text-yellow-400">Submission Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Challenge Enrollment Stats */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Challenge Enrollments</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-black/20 rounded-lg border border-white/10">
            <div className="text-lg font-bold text-purple-400">{stats.challengeEnrollments.featherless}</div>
            <div className="text-sm text-gray-300">Featherless Challenge</div>
            <div className="text-xs text-gray-400">
              {Math.round((stats.challengeEnrollments.featherless / stats.totalProjects) * 100)}% of projects
            </div>
          </div>
          <div className="p-3 bg-black/20 rounded-lg border border-white/10">
            <div className="text-lg font-bold text-blue-400">{stats.challengeEnrollments.activepieces}</div>
            <div className="text-sm text-gray-300">ActivePieces Challenge</div>
            <div className="text-xs text-gray-400">
              {Math.round((stats.challengeEnrollments.activepieces / stats.totalProjects) * 100)}% of projects
            </div>
          </div>
          <div className="p-3 bg-black/20 rounded-lg border border-white/10">
            <div className="text-lg font-bold text-green-400">{stats.challengeEnrollments.aibuilders}</div>
            <div className="text-sm text-gray-300">AI Builders Challenge</div>
            <div className="text-xs text-gray-400">
              {Math.round((stats.challengeEnrollments.aibuilders / stats.totalProjects) * 100)}% of projects
            </div>
          </div>
        </div>
      </div>

      {/* Solo Attendees List */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Team Management</h3>
        <div className="space-y-2">
          {attendees.filter(a => !a.team?.includes('Sponsors')).map(attendee => (
            <div key={attendee.id} className="p-3 bg-black/20 rounded-lg border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">{attendee.firstName} {attendee.lastName}</div>
                  <div className="text-sm text-gray-400">{attendee.email}</div>
                  {attendee.profile?.city && (
                    <div className="text-xs text-blue-400">📍 {attendee.profile.city}</div>
                  )}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {attendee.skills.slice(0, 3).map(skill => (
                      <span key={skill} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!attendee.teamStatus || attendee.teamStatus === 'needsTeam' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTeamStatusUpdate(attendee.id, 'solo')}
                        className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded text-green-400 hover:bg-green-500/30 transition-colors text-sm"
                      >
                        Confirm Solo
                      </button>
                      <button
                        onClick={() => handleTeamStatusUpdate(attendee.id, 'hasTeam')}
                        className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-blue-400 hover:bg-blue-500/30 transition-colors text-sm"
                      >
                        Has Team
                      </button>
                    </div>
                  ) : attendee.teamStatus === 'hasTeam' && attendee.team ? (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                        Team: {attendee.team}
                      </span>
                      <button
                        onClick={() => handleRemoveFromTeam(attendee.id)}
                        className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-400 hover:bg-red-500/30 transition-colors text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      attendee.teamStatus === 'solo'
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {attendee.teamStatus === 'solo' ? 'Solo Confirmed' : 'Has Team'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {attendees.filter(a => !a.team?.includes('Sponsors')).length === 0 && (
            <div className="p-4 text-center text-gray-400">
              No attendees to manage at the moment
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Projects Overview</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-3 text-gray-300">Project Name</th>
              <th className="text-left p-3 text-gray-300">Team</th>
              <th className="text-left p-3 text-gray-300">Challenges</th>
              <th className="text-left p-3 text-gray-300">Attendees</th>
              <th className="text-left p-3 text-gray-300">Status</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => {
              const projectAttendees = attendees.filter(a => a.projectId === project.id);
              return (
                <tr key={project.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3">
                    <div className="font-medium text-white">{project.name}</div>
                    <div className="text-xs text-gray-400">{project.description}</div>
                  </td>
                  <td className="p-3">
                    <div className="text-white">{project.teamName}</div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {project.challengesEnrolled.map(challenge => (
                        <span key={challenge} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                          {challenge}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-white">{projectAttendees.length} members</div>
                    <div className="text-xs text-gray-400">
                      {projectAttendees.map(a => `${a.firstName} ${a.lastName}`).join(', ')}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      project.status === 'submitted' ? 'bg-green-500/20 text-green-400' :
                      project.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAttendees = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Attendees Overview</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-3 text-gray-300">Name</th>
              <th className="text-left p-3 text-gray-300">Email</th>
              <th className="text-left p-3 text-gray-300">Project</th>
              <th className="text-left p-3 text-gray-300">Checked In</th>
              <th className="text-left p-3 text-gray-300">Skills</th>
            </tr>
          </thead>
          <tbody>
            {attendees.map(attendee => {
              const project = projects.find(p => p.id === attendee.projectId);
              return (
                <tr key={attendee.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3">
                    <div className="font-medium text-white">{attendee.firstName} {attendee.lastName}</div>
                  </td>
                  <td className="p-3">
                    <div className="text-gray-300">{attendee.email}</div>
                  </td>
                  <td className="p-3">
                    {project ? (
                      <div className="text-white">{project.name}</div>
                    ) : (
                      <div className="text-gray-400 italic">No project</div>
                    )}
                  </td>
                  <td className="p-3">
                    {attendee.checkedIn ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-400" />
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {attendee.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                      {attendee.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
                          +{attendee.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSponsors = () => {
    const sponsorData = [
      {
        id: 'sponsor-featherless',
        name: 'Featherless.ai',
        email: 'darin@featherless.ai',
        challenges: challenges.filter(c => c.sponsorId === 'sponsor-featherless'),
        bounties: bounties.filter(b => b.sponsorId === 'sponsor-featherless'),
        goodies: goodies.filter(g => g.sponsorId === 'sponsor-featherless')
      },
      {
        id: 'sponsor-activepieces',
        name: 'ActivePieces.com',
        email: 'kareem@activepieces.com',
        challenges: challenges.filter(c => c.sponsorId === 'sponsor-activepieces'),
        bounties: bounties.filter(b => b.sponsorId === 'sponsor-activepieces'),
        goodies: goodies.filter(g => g.sponsorId === 'sponsor-activepieces')
      },
      {
        id: 'sponsor-aibuilders',
        name: 'AIBuilders.club',
        email: 'arthur@aibuilders.club',
        challenges: challenges.filter(c => c.sponsorId === 'sponsor-aibuilders'),
        bounties: bounties.filter(b => b.sponsorId === 'sponsor-aibuilders'),
        goodies: goodies.filter(g => g.sponsorId === 'sponsor-aibuilders')
      }
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white">Sponsors Overview</h3>
        
        {sponsorData.map(sponsor => (
          <div key={sponsor.id} className="p-4 bg-black/20 rounded-lg border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-6 h-6 text-purple-400" />
              <div>
                <h4 className="font-semibold text-white">{sponsor.name}</h4>
                <div className="text-sm text-gray-400">{sponsor.email}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Challenges */}
              <div>
                <h5 className="font-medium text-cyan-400 mb-2">Challenges ({sponsor.challenges.length})</h5>
                {sponsor.challenges.map(challenge => {
                  const enrolledCount = projects.filter(p => p.challengesEnrolled.includes(challenge.type)).length;
                  return (
                    <div key={challenge.id} className="p-2 bg-cyan-500/10 rounded border border-cyan-500/20 mb-2">
                      <div className="text-sm font-medium text-white">{challenge.title}</div>
                      <div className="text-xs text-cyan-400">{enrolledCount} projects enrolled</div>
                      <div className="text-xs text-gray-400">
                        Prize: {challenge.prizes.map(p => p.details).join(', ')}
                      </div>
                    </div>
                  );
                })}
                {sponsor.challenges.length === 0 && (
                  <div className="text-xs text-gray-400">No challenges</div>
                )}
              </div>

              {/* Bounties */}
              <div>
                <h5 className="font-medium text-purple-400 mb-2">Bounties ({sponsor.bounties.length})</h5>
                {sponsor.bounties.map(bounty => {
                  const claimedProjects = projects.filter(p => p.bountyId === bounty.id).length;
                  return (
                    <div key={bounty.id} className="p-2 bg-purple-500/10 rounded border border-purple-500/20 mb-2">
                      <div className="text-sm font-medium text-white">{bounty.title}</div>
                      <div className="text-xs text-purple-400">
                        Status: {bounty.status} {claimedProjects > 0 ? `(${claimedProjects} working)` : ''}
                      </div>
                      <div className="text-xs text-gray-400">
                        Prize: {bounty.prizes.map(p => p.details).join(', ')}
                      </div>
                    </div>
                  );
                })}
                {sponsor.bounties.length === 0 && (
                  <div className="text-xs text-gray-400">No bounties</div>
                )}
              </div>

              {/* Goodies */}
              <div>
                <h5 className="font-medium text-pink-400 mb-2">Goodies ({sponsor.goodies.length})</h5>
                {sponsor.goodies.map(goodie => (
                  <div key={goodie.id} className="p-2 bg-pink-500/10 rounded border border-pink-500/20 mb-2">
                    <div className="text-sm font-medium text-white">{goodie.title}</div>
                    <div className="text-xs text-pink-400">
                      {goodie.forEveryone ? 'For everyone' : `Limited: ${goodie.quantity || 'N/A'}`}
                    </div>
                    <div className="text-xs text-gray-400">{goodie.details}</div>
                  </div>
                ))}
                {sponsor.goodies.length === 0 && (
                  <div className="text-xs text-gray-400">No goodies</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="quiz-panel">
      {/* Profile Notification (clickable, dismissible) */}
      {currentUser && (!currentUser.profile?.city || !currentUser.profile?.linkedin) && (() => {
        const dismissedKey = `profile-banner-dismissed-${currentUser.email}`;
        const isDismissed = typeof window !== 'undefined' && localStorage.getItem(dismissedKey) === 'true';
        if (isDismissed) return null;
        return (
          <div 
            className="fixed top-4 right-4 z-20 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg backdrop-blur-md cursor-pointer group"
            onClick={() => setShowProfileEditor(true)}
            role="button"
            aria-label="Complete your profile"
          >
            <div className="flex items-center gap-2 text-yellow-400 text-sm">
              <User className="w-4 h-4" />
              <span className="group-hover:text-yellow-200">Complete your profile</span>
              <button
                onClick={(e) => { e.stopPropagation(); localStorage.setItem(dismissedKey, 'true'); (document.activeElement as HTMLElement)?.blur(); }}
                className="ml-2 text-yellow-300 hover:text-yellow-100"
                aria-label="Dismiss"
                title="Dismiss"
              >
                ×
              </button>
            </div>
          </div>
        );
      })()}

      <div className="quiz-header">
        <div className="flex items-center gap-3">
          <Users className="w-10 h-10 text-cyan-400" />
          <div>
            <h2 className="text-lg font-bold text-white">Host Dashboard</h2>
          </div>
        </div>
      </div>

      <div className="flex gap-1 mb-4">
        {[
          { key: 'dashboard', label: 'Dashboard', icon: Settings },
          { key: 'projects', label: 'Projects', icon: Trophy },
          { key: 'attendees', label: 'Attendees', icon: Users },
          { key: 'sponsors', label: 'Sponsors', icon: Building2 }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key as any)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              activeTab === key
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'projects' && renderProjects()}
        {activeTab === 'attendees' && renderAttendees()}
        {activeTab === 'sponsors' && renderSponsors()}
      </div>

      {/* Profile Editor Modal */}
      {showProfileEditor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <ProfileEditor onClose={() => setShowProfileEditor(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HostDashboard;