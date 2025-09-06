import React, { useState } from 'react';
import { Building2, Trophy, Plus, Edit3, Eye, Gift, User, Target } from 'lucide-react';
import { useHackathon } from '../contexts/HackathonContext';
import BountyEditor from './BountyEditor';
import ChallengeEditor from './ChallengeEditor';
import GoodieEditor from './GoodieEditor';
import ProfileEditor from './ProfileEditor';
import Enrollment from './Enrollment';

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
  const { currentUser, bounties, challenges, goodies, projects } = state;
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
  
  // Stats removed as counters are no longer displayed

  const handleTabChange = (tab: 'overview' | 'challenges' | 'bounties' | 'goodies') => {
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

  // Removed unused export and voting helper functions to reduce clutter

  const renderOverview = () => (
    <div className="space-y-6">
      <Enrollment mode="sponsor" />
    </div>
  );

  const renderChallenges = () => (
    <div className="space-y-4">
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
      
      {myChallenges.length === 0 ? (
        <div className="p-6 bg-black/30 rounded-lg border border-white/10 text-gray-300">
          <p className="text-sm">
            A <span className="text-cyan-300">challenge</span> is a one-day competition with <span className="text-white">prizes</span>, clear <span className="text-white">requirements</span>, and a selected <span className="text-white">winner</span>.
          </p>
        </div>
      ) : (
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
      )}
    </div>
  );

  const renderBounties = () => (
    <div className="space-y-4">
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
      
      {myBounties.length === 0 ? (
        <div className="p-6 bg-black/30 rounded-lg border border-white/10 text-gray-300">
          <p className="text-sm">
            <span className="text-purple-300">Bounties</span> let you get help with specific GitHub issues or features. Only <span className="text-white">one team</span> can claim a bounty.
          </p>
        </div>
      ) : (
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
      )}
    </div>
  );

  const renderGoodies = () => (
    <div className="space-y-4">
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
      
      {myGoodies.length === 0 ? (
        <div className="p-6 bg-black/30 rounded-lg border border-white/10 text-gray-300">
          <p className="text-sm">
            A <span className="text-pink-300">goodie</span> is available for <span className="text-white">all hackday participants</span> — think swag, coupons, or free trials.
          </p>
        </div>
      ) : (
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
      )}
    </div>
  );

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
          <Building2 className="w-10 h-10 text-purple-400" />
          <div>
            <h2 className="text-lg font-bold text-white">Sponsor Dashboard</h2>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 gap-3">
        <div className="flex gap-1">
        {[
          { key: 'overview', label: 'Enrollments', icon: Building2 },
          { key: 'challenges', label: 'Challenges', icon: Trophy },
          { key: 'bounties', label: 'Bounties', icon: Target },
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
        <div className="flex items-center gap-2">
          {activeTab === 'challenges' && (
            <button
              onClick={() => handleEditItem('challenge', 'new')}
              className="flex items-center gap-2 px-3 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Challenge
            </button>
          )}
          {activeTab === 'bounties' && (
            <button
              onClick={() => handleEditItem('bounty', 'new')}
              className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Bounty
            </button>
          )}
          {activeTab === 'goodies' && (
            <button
              onClick={() => handleEditItem('goodie', 'new')}
              className="flex items-center gap-2 px-3 py-2 bg-pink-500/20 border border-pink-500/30 rounded-lg text-pink-400 hover:bg-pink-500/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Goodie
            </button>
          )}
        </div>
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