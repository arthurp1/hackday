import React, { useState } from 'react';
import { Building2, Trophy, Plus, Edit3, Eye, DollarSign, Gift, Zap, User, Download, Users, FileText } from 'lucide-react';
import { useHackathon } from '../contexts/HackathonContext';
import BountyEditor from './BountyEditor';
import ChallengeEditor from './ChallengeEditor';
import GoodieEditor from './GoodieEditor';
import ProfileEditor from './ProfileEditor';

interface SponsorDashboardProps {
  hostDashboardData?: any;
  setHostDashboardData?: (data: any) => void;
  onNavigate: (screen: string, data?: any) => void;
  uiState: string;
}

const SponsorDashboard: React.FC<SponsorDashboardProps> = ({ 
  hostDashboardData = {},
  setHostDashboardData = () => {},
  onNavigate: _onNavigate, 
  uiState
}) => {
  const { state } = useHackathon();
  const { currentUser, bounties, challenges, goodies, projects, attendees } = state;
  const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'bounties' | 'goodies'>(
    hostDashboardData?.activeTab || 'overview'
  );
  const [editingItem, setEditingItem] = useState<{ type: string; id: string } | null>(
    hostDashboardData?.editingItem || null
  );
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  const myBounties = bounties.filter(b => b.sponsorId === currentUser?.id);
  const myChallenges = challenges.filter(c => c.sponsorId === currentUser?.id);
  const myGoodies = goodies.filter(g => g.sponsorId === currentUser?.id);
  
  const stats = {
    totalChallenges: myChallenges.length,
    totalBounties: myBounties.length,
    activeBounties: myBounties.filter(b => b.status === 'open').length,
    claimedBounties: myBounties.filter(b => b.status === 'claimed').length,
    totalGoodies: myGoodies.length,
    totalPrizeValue: [
      ...myBounties.flatMap(b => b.prizes),
      ...myChallenges.flatMap(c => c.prizes)
    ].reduce((sum, p) => sum + (p.amount || 0), 0)
  };

  // CSV Export Functions
  const exportAttendeesCSV = () => {
    const myProjectIds = projects
      .filter(p => p.challengesEnrolled.some(c => myChallenges.some(mc => mc.type === c)) || 
                   myBounties.some(b => b.id === p.bountyId))
      .map(p => p.id);
    
    const relevantAttendees = attendees.filter(a => 
      a.projectId && myProjectIds.includes(a.projectId)
    );
    
    const csvContent = [
      ['Name', 'Email', 'Project', 'Team', 'Skills', 'City', 'LinkedIn', 'Checked In'].join(','),
      ...relevantAttendees.map(a => {
        const project = projects.find(p => p.id === a.projectId);
        return [
          `"${a.firstName} ${a.lastName}"`,
          a.email,
          `"${project?.name || 'N/A'}"`,
          `"${a.team || 'N/A'}"`,
          `"${a.skills.join('; ')}"`,
          `"${a.profile?.city || 'N/A'}"`,
          `"${a.profile?.linkedin || 'N/A'}"`,
          a.checkedIn ? 'Yes' : 'No'
        ].join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentUser?.name || 'sponsor'}-attendees.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportProjectsCSV = () => {
    const myProjects = projects.filter(p => 
      p.challengesEnrolled.some(c => myChallenges.some(mc => mc.type === c)) || 
      myBounties.some(b => b.id === p.bountyId)
    );
    
    const csvContent = [
      ['Project Name', 'Team Name', 'Status', 'Challenges', 'Bounty', 'Team Members', 'Demo URL', 'Tags'].join(','),
      ...myProjects.map(p => {
        const bounty = myBounties.find(b => b.id === p.bountyId);
        const projectAttendees = attendees.filter(a => a.projectId === p.id);
        return [
          `"${p.name}"`,
          `"${p.teamName || 'N/A'}"`,
          p.status,
          `"${p.challengesEnrolled.join('; ')}"`,
          `"${bounty?.title || 'N/A'}"`,
          `"${projectAttendees.map(a => `${a.firstName} ${a.lastName}`).join('; ')}"`,
          `"${p.demoUrl || 'N/A'}"`,
          `"${p.tags?.join('; ') || 'N/A'}"`
        ].join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentUser?.name || 'sponsor'}-projects.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleTabChange = (tab: 'overview' | 'bounties') => {
    setActiveTab(tab);
    setHostDashboardData({ ...hostDashboardData, activeTab: tab });
  };

  const handleEditItem = (type: string, id: string) => {
    const editingItem = { type, id };
    setEditingItem(editingItem);
    setHostDashboardData({ ...hostDashboardData, editingItem, activeTab });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setHostDashboardData({ ...hostDashboardData, editingItem: null });
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Export Section */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Overview & Exports</h3>
        <div className="flex gap-2">
          <button
            onClick={exportAttendeesCSV}
            className="flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/30 transition-colors text-sm"
            title="Export attendees grouped by project to CSV"
          >
            <Users className="w-4 h-4" />
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={exportProjectsCSV}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors text-sm"
            title="Export projects grouped by challenges to CSV"
          >
            <FileText className="w-4 h-4" />
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/20">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-cyan-400" />
            <div>
              <div className="text-lg font-bold text-white">{stats.totalChallenges}</div>
              <div className="text-xs text-cyan-400">Challenges</div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-purple-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.activeBounties}/{stats.totalBounties}</div>
              <div className="text-sm text-purple-400">Active Bounties</div>
            </div>
          </div>
        </div>
        
        <div className="p-3 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-lg border border-pink-500/20">
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-pink-400" />
            <div>
              <div className="text-lg font-bold text-white">{stats.totalGoodies}</div>
              <div className="text-xs text-pink-400">Goodies</div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-white">${stats.totalPrizeValue.toLocaleString()}</div>
              <div className="text-sm text-green-400">Total Prize Value</div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Overview */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Projects Using Your Challenges/Bounties</h3>
        <div className="space-y-2">
          {projects
            .filter(p => 
              p.challengesEnrolled.some(c => myChallenges.some(mc => mc.type === c)) || 
              myBounties.some(b => b.id === p.bountyId)
            )
            .map(project => {
              const projectAttendees = attendees.filter(a => a.projectId === project.id);
              const bounty = myBounties.find(b => b.id === project.bountyId);
              return (
                <div key={project.id} className="p-3 bg-black/20 rounded-lg border border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium text-white">{project.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          project.status === 'submitted' ? 'bg-green-500/20 text-green-400' :
                          project.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-400 mb-2">
                        Team: {project.teamName} ({projectAttendees.length} members)
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {project.challengesEnrolled
                          .filter(c => myChallenges.some(mc => mc.type === c))
                          .map(challenge => (
                            <span key={challenge} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                              {challenge}
                            </span>
                          ))}
                        {bounty && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                            Bounty: {bounty.title}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Members: {projectAttendees.map(a => `${a.firstName} ${a.lastName}`).join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        <div className="space-y-2">
          {myChallenges.slice(0, 2).map(challenge => (
            <div key={challenge.id} className="p-3 bg-black/20 rounded-lg border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">{challenge.title}</div>
                  <div className="text-sm text-cyan-400">Challenge</div>
                </div>
                <div className="text-sm text-green-400">
                  {challenge.prizes.map(p => `${p.currency}${p.amount}`).join(' + ')}
                </div>
              </div>
            </div>
          ))}
          {myBounties.slice(0, 3).map(bounty => (
            <div key={bounty.id} className="p-3 bg-black/20 rounded-lg border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">{bounty.title}</div>
                  <div className="text-sm text-gray-400">Bounty</div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  bounty.status === 'open' ? 'bg-green-500/20 text-green-400' :
                  bounty.status === 'claimed' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {bounty.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderChallenges = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">My Challenges ({myChallenges.length})</h3>
        <button
          onClick={() => handleEditItem('challenge', 'new')}
          className="flex items-center gap-2 px-3 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Challenge
        </button>
      </div>
      
      {editingItem?.type === 'challenge' && (
        <div className="p-4 bg-black/40 rounded-lg border border-cyan-500/30">
          <ChallengeEditor 
            formData={{ challengeId: editingItem.id === 'new' ? null : editingItem.id }}
            onNavigate={handleCancelEdit}
            uiState={uiState}
            isInline={true}
            onCancel={handleCancelEdit}
          />
        </div>
      )}
      
      <div className="space-y-3">
        {myChallenges.map(challenge => (
          <div key={challenge.id} className="p-4 bg-black/20 rounded-lg border border-white/10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-white">{challenge.title}</h4>
                  <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs">
                    {challenge.type}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-3">{challenge.description}</p>
                <div className="text-sm mb-2">
                  <span className="text-gray-400">Prizes: </span>
                  <span className="text-green-400 font-medium">
                    {challenge.prizes.map(p => p.details).join(', ')}
                  </span>
                </div>
                <div className="text-sm mb-2">
                  <span className="text-gray-400">Enrolled Projects: </span>
                  <span className="text-cyan-400 font-medium">
                    {projects.filter(p => p.challengesEnrolled.includes(challenge.type)).length}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-gray-400 text-sm">Requirements: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {challenge.requirements.map((req, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditItem('challenge', challenge.id)}
                  className="p-2 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBounties = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">My Bounties ({myBounties.length})</h3>
        <button
          onClick={() => handleEditItem('bounty', 'new')}
          className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Bounty
        </button>
      </div>
      
      {editingItem?.type === 'bounty' && (
        <div className="p-4 bg-black/40 rounded-lg border border-purple-500/30">
          <BountyEditor 
            formData={{ bountyId: editingItem.id === 'new' ? null : editingItem.id }}
            onNavigate={handleCancelEdit}
            uiState={uiState}
            isInline={true}
            onCancel={handleCancelEdit}
          />
        </div>
      )}
      
      <div className="space-y-3">
        {myBounties.map(bounty => (
          <div key={bounty.id} className="p-4 bg-black/20 rounded-lg border border-white/10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-white">{bounty.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    bounty.status === 'open' ? 'bg-green-500/20 text-green-400' :
                    bounty.status === 'claimed' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {bounty.status}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-3">{bounty.description}</p>
                <div className="text-sm">
                  <span className="text-gray-400">Prize: </span>
                  <span className="text-green-400 font-medium">
                    {bounty.prizes.map(p => p.details).join(', ')}
                  </span>
                </div>
                <div className="text-sm mb-2">
                  <span className="text-gray-400">Projects Working: </span>
                  <span className="text-purple-400 font-medium">
                    {projects.filter(p => p.bountyId === bounty.id).length}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-gray-400 text-sm">Requirements: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {bounty.requirements.map((req, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditItem('bounty', bounty.id)}
                  className="p-2 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                {bounty.githubUrl && (
                  <button
                    onClick={() => window.open(bounty.githubUrl, '_blank')}
                    className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGoodies = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">My Goodies ({myGoodies.length})</h3>
        <button
          onClick={() => handleEditItem('goodie', 'new')}
          className="flex items-center gap-2 px-3 py-2 bg-pink-500/20 border border-pink-500/30 rounded-lg text-pink-400 hover:bg-pink-500/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Goodie
        </button>
      </div>
      
      {editingItem?.type === 'goodie' && (
        <div className="p-4 bg-black/40 rounded-lg border border-pink-500/30">
          <GoodieEditor 
            formData={{ goodieId: editingItem.id === 'new' ? null : editingItem.id }}
            onNavigate={handleCancelEdit}
            uiState={uiState}
            isInline={true}
            onCancel={handleCancelEdit}
          />
        </div>
      )}
      
      <div className="space-y-3">
        {myGoodies.map(goodie => (
          <div key={goodie.id} className="p-4 bg-black/20 rounded-lg border border-white/10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-white">{goodie.title}</h4>
                  <span className="px-2 py-1 bg-pink-500/20 text-pink-400 rounded-full text-xs capitalize">
                    {goodie.type.replace('_', ' ')}
                  </span>
                  {goodie.forEveryone && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                      For Everyone
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-300 mb-2">{goodie.description}</p>
                <div className="text-sm text-gray-400 mb-2">{goodie.details}</div>
                {goodie.quantity && (
                  <div className="text-sm text-yellow-400">
                    Quantity: {goodie.quantity}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditItem('goodie', goodie.id)}
                  className="p-2 text-pink-400 hover:bg-pink-500/20 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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
          <Building2 className="w-10 h-10 text-purple-400" />
          <div>
            <h2 className="text-lg font-bold text-white">Sponsor Dashboard</h2>
          </div>
        </div>
      </div>

      <div className="flex gap-1 mb-6">
        {[
          { key: 'overview', label: 'Overview', icon: Building2 },
          { key: 'challenges', label: 'Challenges', icon: Zap },
          { key: 'bounties', label: 'Bounties', icon: Trophy },
          { key: 'goodies', label: 'Goodies', icon: Gift }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key as any)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              activeTab === key
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'challenges' && renderChallenges()}
        {activeTab === 'bounties' && renderBounties()}
        {activeTab === 'goodies' && renderGoodies()}
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

export default SponsorDashboard;