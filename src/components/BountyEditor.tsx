import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, FileText, Video, Link, Github } from 'lucide-react';
import { useHackathon, Bounty } from '../contexts/HackathonContext';
import PrizeInput from './PrizeInput';
import TagInput from './TagInput';

interface BountyEditorProps {
  onNavigate: (screen: string, data?: any) => void;
  uiState: string;
  formData: any;
  isInline?: boolean;
  onCancel?: () => void;
}

const BountyEditor: React.FC<BountyEditorProps> = ({ 
  onNavigate, 
  uiState, 
  formData,
  isInline = false,
  onCancel
}) => {
  const { state, updateBounty, createBounty } = useHackathon();
  const { bounties, currentUser } = state;
  const [bounty, setBounty] = useState<Partial<Bounty>>({
    title: '',
    description: '',
    conditions: [''],
    requirements: [''],
    prizes: [{ type: 'cash', amount: 100, currency: '€', details: '€100 cash prize' }],
    githubUrl: '',
    repoUrl: '',
    bountyPageUrl: '',
    status: 'active',
    sponsorId: currentUser?.id || '',
    tags: [],
    maxTeams: 1,
    claimedTeams: [],
    projectTemplate: {
      name: '',
      description: '',
      tags: [],
      type: 'bounty'
    }
  });
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (formData?.bountyId) {
      const existingBounty = bounties.find(b => b.id === formData.bountyId);
      if (existingBounty) {
        setBounty(existingBounty);
        setIsEditing(true);
      }
    }
  }, [formData?.bountyId, bounties]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isEditing && bounty.id) {
        await updateBounty(bounty.id, bounty);
      } else {
        await createBounty({
          ...bounty,
          sponsorId: currentUser?.id || '',
          requirements: bounty.requirements?.filter(r => r.trim()) || [],
          prizes: bounty.prizes || [],
          status: bounty.status || 'active'
        } as Omit<Bounty, 'id'>);
      }
      if (isInline && onCancel) {
        onCancel();
      } else {
        onNavigate('sponsorDashboard');
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isInline && onCancel) {
      onCancel();
    } else {
      onNavigate('sponsorDashboard', {}, true);
    }
  };

  const addRequirement = () => {
    setBounty(prev => ({
      ...prev,
      requirements: [...(prev.requirements || []), '']
    }));
  };

  const updateRequirement = (index: number, requirement: string) => {
    setBounty(prev => ({
      ...prev,
      requirements: prev.requirements?.map((r, i) => i === index ? requirement : r) || []
    }));
  };

  const removeRequirement = (index: number) => {
    setBounty(prev => ({
      ...prev,
      requirements: prev.requirements?.filter((_, i) => i !== index) || []
    }));
  };

  const handleTagsChange = (tags: string[]) => {
    setBounty(prev => ({ ...prev, tags }));
  };

  const handleTemplateChange = (field: string, value: any) => {
    setBounty(prev => ({
      ...prev,
      projectTemplate: {
        ...prev.projectTemplate,
        [field]: value
      }
    }));
  };

  return (
    <div className={isInline ? "space-y-6" : "quiz-panel"}>
      {!isInline && <div className="quiz-header">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="p-2 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white">
              {isEditing ? 'Edit Bounty' : 'New Bounty'}
            </h2>
          </div>
        </div>
      </div>}

      {isInline && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            {isEditing ? 'Edit Bounty' : 'New Bounty'}
          </h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="space-y-6 flex-1 overflow-y-auto">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Bounty Title
          </label>
          <input
            type="text"
            value={bounty.title || ''}
            onChange={(e) => setBounty(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            placeholder="Enter bounty title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={bounty.description || ''}
            onChange={(e) => setBounty(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            placeholder="Describe the bounty requirements"
            rows={3}
          />
        </div>

        <div>
          <PrizeInput
            prizes={bounty.prizes || []}
            onChange={(prizes) => setBounty(prev => ({ ...prev, prizes }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bounty Tags
          </label>
          <TagInput
            tags={bounty.tags || []}
            onChange={handleTagsChange}
            placeholder="Add tags to describe the bounty..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Teams
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={bounty.maxTeams || 1}
              onChange={(e) => setBounty(prev => ({ ...prev, maxTeams: parseInt(e.target.value) || 1 }))}
              className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Project Template */}
        <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <h4 className="text-purple-400 font-semibold mb-3">Project Template</h4>
          <p className="text-sm text-gray-400 mb-3">
            This template will be used when teams start working on this bounty
          </p>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Template Project Name
              </label>
              <input
                type="text"
                value={bounty.projectTemplate?.name || ''}
                onChange={(e) => handleTemplateChange('name', e.target.value)}
                className="w-full px-3 py-2 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none text-sm"
                placeholder="Default project name for teams"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Template Description
              </label>
              <textarea
                value={bounty.projectTemplate?.description || ''}
                onChange={(e) => handleTemplateChange('description', e.target.value)}
                className="w-full px-3 py-2 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none text-sm"
                placeholder="Default description for teams"
                rows={2}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Requirements
          </label>
          <div className="space-y-2">
            {bounty.requirements?.map((requirement, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={requirement}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                  className="flex-1 px-4 py-2 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  placeholder="Enter requirement"
                />
                {bounty.requirements && bounty.requirements.length > 1 && (
                  <button
                    onClick={() => removeRequirement(index)}
                    className="px-3 py-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addRequirement}
              className="px-4 py-2 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors"
            >
              + Add Requirement
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Github className="w-4 h-4 inline mr-2" />
              GitHub Issue URL
            </label>
            <input
              type="url"
              value={bounty.githubUrl || ''}
              onChange={(e) => setBounty(prev => ({ ...prev, githubUrl: e.target.value }))}
              className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              placeholder="https://github.com/owner/repo/issues/123"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Video className="w-4 h-4 inline mr-2" />
              Video Instructions URL (Optional)
            </label>
            <input
              type="url"
              value={bounty.videoInstructions || ''}
              onChange={(e) => setBounty(prev => ({ ...prev, videoInstructions: e.target.value }))}
              className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Link className="w-4 h-4 inline mr-2" />
              Repository URL (Optional)
            </label>
            <input
              type="url"
              value={bounty.repoUrl || ''}
              onChange={(e) => setBounty(prev => ({ ...prev, repoUrl: e.target.value }))}
              className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              placeholder="https://github.com/owner/repo"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Link className="w-4 h-4 inline mr-2" />
              Bounty Page URL (Optional)
            </label>
            <input
              type="url"
              value={bounty.bountyPageUrl || ''}
              onChange={(e) => setBounty(prev => ({ ...prev, bountyPageUrl: e.target.value }))}
              className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              placeholder="https://bounty-platform.com/bounty/123"
            />
          </div>
        </div>
      </div>

      <div className={isInline ? "flex gap-2 justify-end" : "quiz-actions"}>
        {isInline && (
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-500/20 border border-gray-500/30 rounded-lg text-gray-400 hover:bg-gray-500/30 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving || !bounty.title}
          className={isInline ? "px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/30 transition-colors disabled:opacity-50" : "quiz-btn primary"}
        >
          {!isInline && <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : 'Save Bounty'}
        </button>
      </div>
    </div>
  );
};

export default BountyEditor;