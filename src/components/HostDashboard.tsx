import React, { useState } from 'react';
import { Users, Trophy, Settings, CheckCircle, Clock, AlertCircle, Plus, Building2, User, MapPin, Linkedin, ExternalLink, Video, FileText } from 'lucide-react';
import { useHackathon, TeamStatus } from '../contexts/HackathonContext';
import ProfileEditor from './ProfileEditor';
import EmailAutocomplete from './EmailAutocomplete';

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
  const isHacker = (a: any) => a && typeof a.id === 'string' && a.id.startsWith('att-') && !((a.team || '').toLowerCase().includes('sponsors') || (a.team || '').toLowerCase() === 'host' || (a.team || '').toLowerCase() === 'hosts');
  const hackerAttendees = attendees.filter(isHacker);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'attendees' | 'sponsors'>(
    hostDashboardData?.activeTab || 'dashboard'
  );
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [assignEmail, setAssignEmail] = useState('');
  const [assignProjectId, setAssignProjectId] = useState('');

  // Calculate statistics
  const stats = {
    totalProjects: projects.length,
    submittedProjects: projects.filter(p => p.status === 'submitted').length,
    totalAttendees: hackerAttendees.length,
    checkedInAttendees: hackerAttendees.filter(a => a.checkedIn).length,
    soloAttendees: hackerAttendees.filter(a => !a.projectId).length,
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
                {stats.totalProjects > 0 ? Math.round((stats.submittedProjects / stats.totalProjects) * 100) : 0}%
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
              {stats.totalProjects > 0 ? Math.round((stats.challengeEnrollments.activepieces / stats.totalProjects) * 100) : 0}% of projects
            </div>
          </div>
          <div className="p-3 bg-black/20 rounded-lg border border-white/10">
            <div className="text-lg font-bold text-green-400">{stats.challengeEnrollments.aibuilders}</div>
            <div className="text-sm text-gray-300">AI Builders Challenge</div>
            <div className="text-xs text-gray-400">
              {stats.totalProjects > 0 ? Math.round((stats.challengeEnrollments.aibuilders / stats.totalProjects) * 100) : 0}% of projects
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard stays analytics-only */}
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-4">
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-3 text-gray-300">Name</th>
              <th className="text-left p-3 text-gray-300">Team</th>
              <th className="text-left p-3 text-gray-300">Status</th>
              <th className="text-left p-3 text-gray-300">Challenges</th>
              <th className="text-left p-3 text-gray-300">Links</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <tr key={project.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-3">
                  <div className="text-white">{project.name}</div>
                  {project.tags && project.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {project.tags.map((tag: string, idx: number) => (
                        <span key={tag+idx} className="px-2 py-0.5 rounded-full text-xs font-medium border border-white/10 text-gray-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="p-3">
                  <div className="text-xs text-gray-400 mb-1">{project.teamName || '—'}</div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {hackerAttendees
                      .filter(a => a.projectId === project.id)
                      .map(member => (
                        <span key={member.id} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 rounded">
                          <span className="text-blue-300">{member.firstName} {member.lastName}</span>
                          {member.profile?.city && (
                            <span className="inline-flex items-center gap-1 text-gray-400">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>
                              {member.profile.city}
                            </span>
                          )}
                          {member.profile?.linkedin && (
                            <a href={member.profile.linkedin} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300" title="LinkedIn">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.15c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.79 1.75-1.75 1.75zm13.5 11.15h-3v-5.5c0-1.31-.02-3-1.83-3-1.83 0-2.11 1.43-2.11 2.91v5.59h-3v-10h2.88v1.37h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v5.58z"/></svg>
                            </a>
                          )}
                        </span>
                      ))}
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
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {project.challengesEnrolled.map(ch => (
                      <span key={ch} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs capitalize">{ch}</span>
                    ))}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    {project.demoUrl && (
                      <a href={project.demoUrl} target="_blank" rel="noreferrer" className="p-1 text-green-400 hover:bg-green-500/20 rounded" title="Demo URL">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {project.videoDemo && (
                      <a href={project.videoDemo} target="_blank" rel="noreferrer" className="p-1 text-red-400 hover:bg-red-500/20 rounded" title="Video Demo">
                        <Video className="w-4 h-4" />
                      </a>
                    )}
                    {project.slides && (
                      <a href={project.slides} target="_blank" rel="noreferrer" className="p-1 text-blue-400 hover:bg-blue-500/20 rounded" title="Slides">
                        <FileText className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAttendees = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowAddTeamModal(true)}
          className="flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/30 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Team
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-3 text-gray-300">Name</th>
              <th className="text-left p-3 text-gray-300">Project</th>
              <th className="text-left p-3 text-gray-300">Checked In</th>
              <th className="text-left p-3 text-gray-300">Skills</th>
              <th className="text-left p-3 text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {hackerAttendees.map(attendee => {
              const project = projects.find(p => p.id === attendee.projectId);
              return (
                <tr key={attendee.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3">
                    <div className="font-medium text-white group inline-block relative">
                      {attendee.firstName} {attendee.lastName}
                      <span className="absolute top-full left-0 mt-1 hidden group-hover:block text-xs text-gray-300 bg-black/70 border border-white/10 rounded px-2 py-1">
                        {attendee.email}
                      </span>
                      <span className="ml-2 inline-flex items-center gap-1 text-xs text-gray-400">
                        {attendee.profile?.city && (
                          <>
                            <MapPin className="w-3 h-3" /> {attendee.profile.city}
                          </>
                        )}
                        {attendee.profile?.linkedin && (
                          <a href={attendee.profile.linkedin} target="_blank" rel="noreferrer" className="ml-2 text-cyan-400 hover:text-cyan-300" title="LinkedIn">
                            <Linkedin className="w-3 h-3 inline" />
                          </a>
                        )}
                      </span>
                    </div>
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
                      {(attendee.skills || []).slice(0, 3).map(skill => (
                        <span key={skill} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                      {(attendee.skills?.length ?? 0) > 3 && (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
                          +{(attendee.skills?.length ?? 0) - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    {!attendee.teamStatus || attendee.teamStatus === 'needsTeam' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTeamStatusUpdate(attendee.id, 'solo')}
                          className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded text-green-400 hover:bg-green-500/30 transition-colors text-xs"
                        >
                          Wants Solo
                        </button>
                        <button
                          onClick={() => { setAssignEmail(attendee.email); setShowAddTeamModal(true); }}
                          className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-blue-400 hover:bg-blue-500/30 transition-colors text-xs"
                        >
                          Add Team
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
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Solo Confirmed</span>
                    )}
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
    <div className="quiz-panel h-[70vh] justify-start overflow-hidden">
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

      {/* Add Team Modal */}
      {showAddTeamModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-black/80 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Add Member to Project</h3>
              <button onClick={() => setShowAddTeamModal(false)} className="text-gray-400 hover:text-white">×</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Attendee Email</label>
                <EmailAutocomplete
                  value={assignEmail}
                  onChange={setAssignEmail}
                  placeholder="attendee@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Project</label>
                <select
                  value={assignProjectId}
                  onChange={(e) => setAssignProjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-black/30 border border-green-500/30 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none text-sm"
                >
                  <option value="">Select a project…</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} {p.teamName ? `– ${p.teamName}` : ''}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={() => setShowAddTeamModal(false)} className="px-3 py-2 text-gray-300 hover:text-white">Cancel</button>
                <button
                  onClick={async () => {
                    const attendee = attendees.find(a => a.email === assignEmail);
                    const project = projects.find(p => p.id === assignProjectId);
                    if (!attendee || !project) return;
                    const teamName = project.teamName || project.name;
                    await handleAssignToTeam(attendee.id, teamName, project.id);
                    setShowAddTeamModal(false);
                    setAssignEmail('');
                    setAssignProjectId('');
                  }}
                  disabled={!assignEmail || !assignProjectId}
                  className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded text-green-400 hover:bg-green-500/30 transition-colors text-sm disabled:opacity-50"
                >
                  Add to Team
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostDashboard;