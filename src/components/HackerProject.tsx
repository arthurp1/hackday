import React, { useState, useEffect, useRef } from 'react';
import { Save, Users, Rocket, Building2, Trophy, Zap, Workflow, Brain, User, Gift, Ticket, Package } from 'lucide-react';
import { useHackathon, Project, ProjectType, ChallengeType } from '../contexts/HackathonContext';
import TagInput from './TagInput';
import EmailAutocomplete from './EmailAutocomplete';
import ProjectBrowser from './ProjectBrowser';
import FaqPanel from './FaqPanel';
import ProfileEditor from './ProfileEditor';
import ChallengeEnrollmentModal from './ChallengeEnrollmentModal';

interface HackerProjectProps {
  onNavigate: (screen: string, data?: any, skipAnimation?: boolean) => void;
  uiState: string;
  formData: any;
  setFormData: (data: any) => void;
}

const HackerProject: React.FC<HackerProjectProps> = ({ 
  onNavigate, 
  uiState: _uiState, 
  formData,
  setFormData: _setFormData
}) => {
  const { state, updateProject, createProject, claimBounty, importStateJson } = useHackathon();
  const { projects, challenges, bounties, goodies, currentUser } = state;
  
  // Initialize project from questionnaire data or existing project
  const [project, setProject] = useState<Partial<Project>>({
    name: '',
    teamName: '',
    teamMembers: [currentUser?.email || ''],
    description: '',
    demoUrl: '',
    videoDemo: '',
    slides: '',
    githubUrl: '',
    challengesEnrolled: [],
    bountyId: undefined,
    type: formData?.projectType || 'newProject',
    status: 'draft'
  });
  
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBounty, setSelectedBounty] = useState<string>('');
  // Tabs now control browsing and profile editing; no separate modals needed
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeType | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'links' | 'team' | 'challenges' | 'goodies' | 'browse' | 'profile' | 'faq'>('basic');
  const [showBestPractices, setShowBestPractices] = useState<boolean>(false);
  const lastSaved = useRef<string>('');
  const [enrollmentLocked, setEnrollmentLocked] = useState<boolean>(() => {
    try {
      const key = `enrollment-committed-${formData?.projectId || currentUser?.email || 'anon'}`;
      return localStorage.getItem(key) === 'true';
    } catch { return false; }
  });
  const [enrollError, setEnrollError] = useState<string>('');

  // Load existing project if user has one
  useEffect(() => {
    const userProject = projects.find(p => 
      p.teamMembers.includes(currentUser?.email || '')
    );
    
    if (userProject) {
      setProject(userProject);
      setSelectedBounty(userProject.bountyId || '');
      setIsEditing(true);
      // Refresh lock state using a key that prefers project id if available
      try {
        const key = `enrollment-committed-${userProject.id || currentUser?.email || 'anon'}`;
        setEnrollmentLocked(localStorage.getItem(key) === 'true');
      } catch {}
    } else if (formData?.projectType) {
      // Prefill from questionnaire
      const projectName = formData.projectType === 'bounty' ? 'Bounty Challenge Project' :
                          formData.projectType === 'existingTeam' ? `${currentUser?.name || 'Team'} Project` :
                          'New Hackathon Project';
                          
      setProject(prev => ({
        ...prev,
        type: formData.projectType,
        name: projectName,
        teamName: formData.projectType === 'existingTeam' ? `${currentUser?.name || 'Team'} Squad` : '',
        teamMembers: [currentUser?.email || '']
      }));
    }
  }, [projects, currentUser, formData]);

  // Listen for global requests to open the profile editor
  useEffect(() => {
    const handler = () => setActiveTab('profile');
    window.addEventListener('open-profile-editor', handler as EventListener);
    return () => window.removeEventListener('open-profile-editor', handler as EventListener);
  }, []);

  // Reload global state on tab switches (no autosave)
  const reloadGlobalState = async () => {
    try {
      const res = await fetch('/src/contexts/state.json');
      if (res.ok) {
        const json = await res.text();
        await importStateJson(json);
      }
    } catch (e) {
      console.warn('Failed to reload state.json', e);
    }
  };

  const handleTabChange = async (key: typeof activeTab) => {
    // Skip reload on read-only tabs to avoid unnecessary fetches
    if (key !== 'browse' && key !== 'faq') {
      await reloadGlobalState();
    }
    setActiveTab(key);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const projectData = {
        ...project,
        teamMembers: project.teamMembers?.filter(email => email.trim()) || [currentUser?.email || ''],
        challengesEnrolled: project.challengesEnrolled || [],
        bountyId: project.type === 'bounty' ? selectedBounty : undefined,
        type: project.type || 'newProject',
        status: project.status || 'draft'
      };

      // If selecting a bounty, claim it
      if (project.type === 'bounty' && selectedBounty && !isEditing) {
        await claimBounty(selectedBounty, currentUser?.email || '');
      }

      if (isEditing && project.id) {
        await updateProject(project.id, projectData);
      } else {
        await createProject(projectData as Omit<Project, 'id'>);
      }
      // Update last saved snapshot
      const snapshot = JSON.stringify({
        name: projectData.name,
        teamName: projectData.teamName,
        teamMembers: projectData.teamMembers,
        description: projectData.description,
        demoUrl: projectData.demoUrl,
        githubUrl: projectData.githubUrl,
        videoDemo: projectData.videoDemo,
        slides: projectData.slides,
        tags: projectData.tags,
        challengesEnrolled: projectData.challengesEnrolled,
        type: projectData.type,
        bountyId: projectData.bountyId,
        status: projectData.status
      });
      lastSaved.current = snapshot;
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  // Remove autosave: saving only occurs on explicit Save click

  // Removed unused handleEnrollChallenge to satisfy lints

  const handleConfirmEnrollment = () => {
    if (selectedChallenge) {
      toggleChallenge(selectedChallenge);
      setShowEnrollmentModal(false);
      setSelectedChallenge(null);
    }
  };

  const updateField = (field: keyof Project, value: any) => {
    setProject(prev => ({ ...prev, [field]: value }));
  };

  const handleTagsChange = (tags: string[]) => {
    setProject(prev => ({ ...prev, tags }));
  };

  const addTeamMember = () => {
    setProject(prev => ({
      ...prev,
      teamMembers: [...(prev.teamMembers || []), '']
    }));
  };

  const updateTeamMember = (index: number, email: string) => {
    setProject(prev => ({
      ...prev,
      teamMembers: prev.teamMembers?.map((member, i) => i === index ? email : member) || []
    }));
  };

  const removeTeamMember = (index: number) => {
    if (project.teamMembers && project.teamMembers.length > 1) {
      setProject(prev => ({
        ...prev,
        teamMembers: prev.teamMembers?.filter((_, i) => i !== index) || []
      }));
    }
  };

  const toggleChallenge = (challenge: ChallengeType) => {
    if (enrollmentLocked) return;
    setProject(prev => ({
      ...prev,
      challengesEnrolled: prev.challengesEnrolled?.includes(challenge)
        ? prev.challengesEnrolled.filter(c => c !== challenge)
        : [...(prev.challengesEnrolled || []), challenge]
    }));
  };

  const getProjectTypeIcon = (type: ProjectType) => {
    switch (type) {
      case 'bounty': return Building2;
      case 'existingTeam': return Users;
      default: return Rocket;
    }
  };

  const getChallengeIcon = (type: ChallengeType) => {
    switch (type) {
      case 'featherless': return Zap;
      case 'activepieces': return Workflow;
      case 'aibuilders': return Brain;
      default: return Trophy;
    }
  };

  const availableBounties = bounties.filter(b => b.status === 'open');
  const claimedBounties = bounties.filter(b => b.status === 'claimed');

  const ProjectTypeIcon = getProjectTypeIcon(project.type || 'newProject');

  const enrollmentKey = `enrollment-committed-${project.id || currentUser?.email || 'anon'}`;
  const commitEnrollment = async () => {
    // Require at least one selection
    const hasChallenge = Array.isArray(project.challengesEnrolled) && project.challengesEnrolled.length > 0;
    const hasBounty = project.type === 'bounty' && !!selectedBounty;
    if (!hasChallenge && !hasBounty) {
      setEnrollError('Please enroll in at least one challenge or select a bounty before enrolling.');
      return;
    }
    setEnrollError('');
    // Save current project then lock
    await handleSave();
    try {
      localStorage.setItem(enrollmentKey, 'true');
    } catch {}
    setEnrollmentLocked(true);
  };
  const unlockEnrollment = () => {
    try {
      localStorage.setItem(enrollmentKey, 'false');
    } catch {}
    setEnrollmentLocked(false);
  };

  return (
    <div className="quiz-panel h-[70vh] justify-start overflow-hidden bg-black/90">
      {/* Profile Notification (clickable, dismissible) */}
      {currentUser && (!currentUser.profile?.city || !currentUser.profile?.linkedin) && (() => {
        const dismissedKey = `profile-banner-dismissed-${currentUser.email}`;
        const isDismissed = typeof window !== 'undefined' && localStorage.getItem(dismissedKey) === 'true';
        if (isDismissed) return null;
        return (
          <div 
            className="fixed top-4 right-4 z-20 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg backdrop-blur-md cursor-pointer group"
            onClick={() => setActiveTab('profile')}
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
          <ProjectTypeIcon className="w-10 h-10 text-green-400" />
          <div>
            <h2 className="text-base font-bold text-white">Hackday Project</h2>
          </div>
        </div>
      </div>

      {/* Solo Guidance moved to Team tab */}

      {/* Action Buttons removed in favor of tabs */}

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-4">
        {([
            { key: 'basic', label: 'Basic Info' },
            { key: 'team', label: 'Team' },
            { key: 'challenges', label: 'Challenges' },
            ...(goodies && goodies.length > 0 ? ([{ key: 'goodies', label: 'Goodies' }] as const) : ([] as const)),
            { key: 'browse', label: 'Browse Projects' },
            { key: 'faq', label: 'FAQ' }
          ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              activeTab === key
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'basic' && (
          <div className="space-y-4">
            {/* Project Type Switcher */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Project Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'newProject', label: 'Hackday Project', icon: Rocket },
                  { key: 'bounty', label: 'Bounty Challenge', icon: Building2 }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => updateField('type', key as ProjectType)}
                    className={`p-3 rounded-lg border text-sm flex flex-col items-center gap-2 transition-colors ${
                      project.type === key
                        ? 'bg-green-500/20 border-green-500/50 text-green-400'
                        : 'bg-black/20 border-white/10 text-gray-400 hover:border-green-500/30'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bounty Selection */}
            {project.type === 'bounty' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Bounty</label>
                <select
                  value={selectedBounty}
                  onChange={(e) => setSelectedBounty(e.target.value)}
                  disabled={enrollmentLocked}
                  className={`w-full px-3 py-2 bg-black/30 border border-green-500/30 rounded-lg text-white focus:border-green-500 focus:outline-none text-sm ${enrollmentLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <option value="">Choose a bounty...</option>
                  <optgroup label="AI Builders (€100)">
                    {availableBounties.filter(b => b.category === 'aibuilders').map(bounty => (
                      <option key={bounty.id} value={bounty.id}>
                        {bounty.title} - €{bounty.prizes?.[0]?.amount || 'TBD'}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="ActivePieces ($30-$100)">
                    {availableBounties.filter(b => b.category === 'activepieces').map(bounty => (
                      <option key={bounty.id} value={bounty.id}>
                        {bounty.title} - ${bounty.prizes?.[0]?.amount || 'TBD'}
                      </option>
                    ))}
                  </optgroup>
                </select>
                
                {/* Show selected bounty details */}
                {selectedBounty && (
                  <div className="mt-2 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    {(() => {
                      const bounty = bounties.find(b => b.id === selectedBounty);
                      return bounty ? (
                        <div>
                          <h4 className="font-semibold text-purple-400 mb-1">{bounty.title}</h4>
                          <p className="text-sm text-gray-300 mb-2">{bounty.description}</p>
                          <div className="text-sm text-green-400 mb-2">
                            Prize: {bounty.prizes?.filter(p => p).map(p => 
                              p.currency && p.amount ? `${p.currency}${p.amount}` : p.details || 'Prize available'
                            ).join(' + ') || 'Prize available'}
                          </div>
                          {bounty.githubUrl && (
                            <a 
                              href={bounty.githubUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline text-sm"
                            >
                              View on GitHub
                            </a>
                          )}
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
                
                {/* Show claimed bounties */}
                {claimedBounties.length > 0 && (
                  <div className="mt-2 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                    <p className="text-xs text-yellow-400">
                      Claimed bounties: {claimedBounties.map(b => b.title).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Project Name</label>
                <input
                  type="text"
                  value={project.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-3 py-2 bg-black/30 border border-green-500/30 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none text-sm"
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Team Name</label>
                <input
                  type="text"
                  value={project.teamName || ''}
                  onChange={(e) => updateField('teamName', e.target.value)}
                  className="w-full px-3 py-2 bg-black/30 border border-green-500/30 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none text-sm"
                  placeholder="Enter team name"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                value={project.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full px-3 py-2 bg-black/30 border border-green-500/30 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none text-sm"
                placeholder="Describe your project"
                rows={2}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Project Tags</label>
              <TagInput
                tags={project.tags || []}
                onChange={handleTagsChange}
                placeholder="Add tags to describe your project..."
              />
            </div>

            {/* Started From */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">When did you start the project?</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { key: 'company', label: "It's my company" },
                  { key: 'some_code', label: 'Some code existed' },
                  { key: 'idea', label: 'Idea existed' },
                  { key: 'scratch', label: 'From scratch' }
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => updateField('startedFrom', opt.key)}
                    className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                      (project as any).startedFrom === opt.key
                        ? 'bg-green-500/20 border-green-500/50 text-green-400'
                        : 'bg-black/20 border-white/10 text-gray-400 hover:border-green-500/30'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Links</label>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Demo URL</label>
                  <input
                    type="url"
                    value={project.demoUrl || ''}
                    onChange={(e) => updateField('demoUrl', e.target.value)}
                    className="w-full px-3 py-2 bg-black/30 border border-green-500/30 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none text-sm"
                    placeholder="https://your-demo.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Demo Video URL (optional)</label>
                  <input
                    type="url"
                    value={project.videoDemo || ''}
                    onChange={(e) => updateField('videoDemo', e.target.value)}
                    className="w-full px-3 py-2 bg-black/30 border border-green-500/30 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none text-sm"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Slides URL (optional)</label>
                  <input
                    type="url"
                    value={project.slides || ''}
                    onChange={(e) => updateField('slides', e.target.value)}
                    className="w-full px-3 py-2 bg-black/30 border border-green-500/30 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none text-sm"
                    placeholder="https://slides.com/presentation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={project.githubUrl || ''}
                    onChange={(e) => updateField('githubUrl', e.target.value)}
                    className="w-full px-3 py-2 bg-black/30 border border-green-500/30 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none text-sm"
                    placeholder="https://github.com/org/repo"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'goodies' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Available Goodies</label>
              {(!goodies || goodies.length === 0) ? (
                <div className="p-3 bg-black/20 rounded-lg border border-white/10 text-sm text-gray-400">
                  Goodies are free gifts to every participant in the hackathon (Free Swag or Free Trials/Credits etc.)
                </div>
              ) : (
                <div className="space-y-2">
                  {goodies.map(g => {
                    const Icon = ((type: any) => {
                      switch (type) {
                        case 'coupon': return Ticket;
                        case 'swag': return Package;
                        case 'shirt_pickup': return Package;
                        default: return Gift;
                      }
                    })(g.type);
                    // Simple URL detection in details
                    const urlMatch = typeof g.details === 'string' && g.details.match(/https?:\/\/[^\s]+/);
                    return (
                      <div key={g.id} className="p-3 bg-black/20 rounded-lg border border-white/10">
                        <div className="flex items-start gap-3">
                          <Icon className="w-5 h-5 text-purple-400 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-white">{g.title}</span>
                              {g.forEveryone && (
                                <span className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded-full text-2xs">For Everyone</span>
                              )}
                              {g.quantity && (
                                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded-full text-2xs">Qty: {g.quantity}</span>
                              )}
                            </div>
                            {g.description && (
                              <p className="text-sm text-gray-300 mb-2">{g.description}</p>
                            )}
                            {(g.details || urlMatch) && (
                              <div className="text-xs text-gray-300 space-y-1">
                                {urlMatch ? (
                                  <>
                                    <span className="mr-2">Instructions:</span>
                                    <a href={urlMatch[0]} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 underline">{urlMatch[0]}</a>
                                  </>
                                ) : (
                                  <span>Instructions: {g.details}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-4">
            {project.teamMembers && project.teamMembers.filter(e => e && e.trim()).length <= 1 && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-blue-300">
                You’re currently the only team member. You can add teammates by entering their email below, or join another project by asking that project’s creator to add your email to their team.
              </div>
            )}
            {/* Team Members */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Team Members</label>
              <div className="space-y-2">
                {project.teamMembers?.map((member, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <EmailAutocomplete
                      value={member}
                      onChange={(email) => updateTeamMember(index, email)}
                      placeholder="team.member@example.com"
                      autoFocus={!member}
                      className="flex-1"
                    />
                    {project.teamMembers && project.teamMembers.length > 1 && (
                      <button
                        onClick={() => removeTeamMember(index)}
                        className="px-2 py-2 text-red-400 hover:bg-red-500/20 rounded text-sm"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addTeamMember}
                  className="px-3 py-1 text-green-400 hover:bg-green-500/20 rounded text-sm"
                >
                  + Add Member
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="space-y-4">
            {/* Challenges */}
            {project.type !== 'bounty' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Enroll in Challenges</label>
                
                <div className="space-y-3">
                  {challenges.map(challenge => {
                    const Icon = getChallengeIcon(challenge.type);
                    const isRecommended = (challenge.type === 'featherless' && formData?.usesLLM) || 
                                          (challenge.type === 'activepieces' && formData?.usesIntegrations);
                    return (
                      <div key={challenge.id} className={`p-3 rounded-lg border ${
                        isRecommended 
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/40' 
                          : 'bg-black/20 border-white/10'
                      }`}>
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={project.challengesEnrolled?.includes(challenge.type) || false}
                            onChange={() => toggleChallenge(challenge.type)}
                            disabled={enrollmentLocked}
                            className={`w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500 mt-1 ${enrollmentLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className="w-4 h-4 text-green-400" />
                              <span className="font-medium text-white">{challenge.title}</span>
                              <span className="text-green-400 font-bold">
                                {challenge.prizes?.[0]?.currency}{challenge.prizes?.[0]?.amount}
                              </span>
                              {isRecommended && (
                                <span className="px-2 py-1 bg-purple-500/30 text-purple-300 rounded-full text-xs">
                                  Recommended
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-300 mb-2">{challenge.description}</p>
                            <div className="text-xs text-gray-300 space-y-1">
                              {challenge.requirements.map((req, idx) => (
                                <div key={idx}>• {req}</div>
                              ))}
                            </div>
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Show challenges for bounty projects too (unified layout) */}
            {project.type === 'bounty' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Additional Challenges (optional)</label>
                <div className="space-y-3">
                  {challenges.map(challenge => {
                    const Icon = getChallengeIcon(challenge.type);
                    const isRecommended = (challenge.type === 'featherless' && formData?.usesLLM) || 
                                          (challenge.type === 'activepieces' && formData?.usesIntegrations);
                    return (
                      <div key={challenge.id} className={`p-3 rounded-lg border ${
                        isRecommended 
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/40' 
                          : 'bg-black/20 border-white/10'
                      }`}>
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={project.challengesEnrolled?.includes(challenge.type) || false}
                            onChange={() => toggleChallenge(challenge.type)}
                            className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500 mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className="w-4 h-4 text-green-400" />
                              <span className="font-medium text-white">{challenge.title}</span>
                              <span className="text-green-400 font-bold">
                                {challenge.prizes?.[0]?.currency}{challenge.prizes?.[0]?.amount}
                              </span>
                              {isRecommended && (
                                <span className="px-2 py-1 bg-purple-500/30 text-purple-300 rounded-full text-xs">
                                  Recommended
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-300 mb-2">{challenge.description}</p>
                            <div className="text-xs text-gray-300 space-y-1">
                              {challenge.requirements.map((req, idx) => (
                                <div key={idx}>• {req}</div>
                              ))}
                            </div>
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'browse' && (
          <div className="space-y-4">
            <ProjectBrowser />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-4">
            <ProfileEditor isInline={true} />
          </div>
        )}
        {activeTab === 'faq' && (
          <div className="space-y-4">
            {/* Demo Best Practices (moved from Links) */}
            <div className="mt-2 border border-white/10 rounded-lg p-3 bg-black/30">
              <button
                onClick={() => setShowBestPractices(v => !v)}
                className="text-cyan-400 hover:text-cyan-300 text-sm underline"
              >
                {showBestPractices ? 'Hide' : 'Show'} Demo Best Practices
              </button>
              {showBestPractices && (
                <div className="mt-2 text-sm text-gray-200 space-y-2">
                  <div>
                    <span className="font-semibold">Best practices:</span> 5 min demo + 5 min slides
                  </div>
                  <div>
                    ⚡💻 <span className="font-semibold">Hackday Demo (10 min)</span> Show HOW it’s built, especially how you implemented AI features, Stack, admin
                  </div>
                  <div>
                    ✅ Demo your most advanced AI feature + Challenges and solutions. ✅ <span className="font-semibold">IDEAL FORMAT:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    <li>1x Personal intro slide</li>
                    <li>1x Problem/Solution slide</li>
                    <li>|💻DEMO💻|</li>
                    <li>5 slides: Personal Intro, AI challenge/solution slides, Stack / architecture diagram</li>
                    <li>And, interesting code snippets, prompts, or insights/challenges along the way</li>
                  </ul>
                  <div className="font-semibold">🚀 PRO TIPS:</div>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    <li>Use Fullscreen mode (fn + F)</li>
                    <li>Add many visuals/memes</li>
                    <li>Readability is key: big fonts (20pt+) and simplify code/diagrams/prompts</li>
                    <li>End with an unsolved challenge or request!</li>
                  </ul>
                  <div className="text-xs text-gray-400">
                    Next meetup dates: <a href="https://lu.ma/ai-builders" target="_blank" rel="noreferrer" className="text-cyan-400 underline">lu.ma/ai-builders</a>
                    {' '}•{' '}
                    Got 2 challenges in mind? Book a call: <a href="https://aib.club/call-arthurp" target="_blank" rel="noreferrer" className="text-cyan-400 underline">aib.club/call-arthurp</a>
                  </div>
                </div>
              )}
            </div>

            {/* Editable FAQ list */}
            <FaqPanel isHost={state.currentUser?.type === 'host'} />
          </div>
        )}
      </div>

      {!(activeTab === 'profile' || activeTab === 'browse' || activeTab === 'faq') && (
        <div className="quiz-actions">
          {activeTab === 'challenges' ? (
            enrollmentLocked ? (
              <button
                onClick={unlockEnrollment}
                className="quiz-btn"
              >
                Edit Enrollment
              </button>
            ) : (
              <div className="flex flex-col gap-2 w-full">
                {enrollError && (
                  <div className="text-xs text-red-300">{enrollError}</div>
                )}
                <button
                  onClick={commitEnrollment}
                  disabled={!project.name}
                  className="quiz-btn primary"
                >
                  Enroll
                </button>
              </div>
            )
          ) : (
            <button
              onClick={handleSave}
              disabled={saving || !project.name || (project.type === 'bounty' && !selectedBounty)}
              className="quiz-btn primary"
            >
              <Save className="w-5 h-5" />
              Save Project
            </button>
          )}
        </div>
      )}

      {/* Modals removed; browse and profile are tabs now */}

      {/* Challenge Enrollment Modal */}
      {showEnrollmentModal && selectedChallenge && (
        <ChallengeEnrollmentModal
          challenge={challenges.find(c => c.type === selectedChallenge)!}
          onConfirm={handleConfirmEnrollment}
          onCancel={() => {
            setShowEnrollmentModal(false);
            setSelectedChallenge(null);
          }}
        />
      )}
    </div>
  );
};

export default HackerProject;