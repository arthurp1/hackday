import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Trophy, Link, FileText } from 'lucide-react';
import { useHackathon, Challenge, ChallengeType } from '../contexts/HackathonContext';
import PrizeInput from './PrizeInput';

interface ChallengeEditorProps {
  onNavigate: (screen: string, data?: any) => void;
  uiState: string;
  formData: any;
  isInline?: boolean;
  onCancel?: () => void;
}

const ChallengeEditor: React.FC<ChallengeEditorProps> = ({ 
  onNavigate, 
  uiState, 
  formData,
  isInline = false,
  onCancel
}) => {
  const { state, updateChallenge, createChallenge } = useHackathon();
  const { challenges, currentUser } = state;
  const [challenge, setChallenge] = useState<Partial<Challenge>>({
    type: 'featherless',
    title: '',
    description: '',
    prizes: [{ type: 'cash', amount: 50, currency: '€', details: '€50 cash prize' }],
    requirements: [''],
    sponsorId: currentUser?.id || ''
  });
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (formData?.challengeId) {
      const existingChallenge = challenges.find(c => c.id === formData.challengeId);
      if (existingChallenge) {
        setChallenge(existingChallenge);
        setIsEditing(true);
      }
    }
  }, [formData?.challengeId, challenges]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isEditing && challenge.id) {
        await updateChallenge(challenge.id, challenge);
      } else {
        await createChallenge({
          ...challenge,
          sponsorId: currentUser?.id || '',
          requirements: challenge.requirements?.filter(r => r.trim()) || [],
          prizes: challenge.prizes || []
        } as Omit<Challenge, 'id'>);
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
      onNavigate('sponsorDashboard');
    }
  };

  const addRequirement = () => {
    setChallenge(prev => ({
      ...prev,
      requirements: [...(prev.requirements || []), '']
    }));
  };

  const updateRequirement = (index: number, requirement: string) => {
    setChallenge(prev => ({
      ...prev,
      requirements: prev.requirements?.map((r, i) => i === index ? requirement : r) || []
    }));
  };

  const removeRequirement = (index: number) => {
    setChallenge(prev => ({
      ...prev,
      requirements: prev.requirements?.filter((_, i) => i !== index) || []
    }));
  };

  const challengeTypes: { value: ChallengeType; label: string }[] = [
    { value: 'featherless', label: 'Featherless AI' },
    { value: 'activepieces', label: 'ActivePieces' },
    { value: 'aibuilders', label: 'AI Builders' }
  ];

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
              {isEditing ? 'Edit Challenge' : 'New Challenge'}
            </h2>
          </div>
        </div>
      </div>}

      {isInline && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            {isEditing ? 'Edit Challenge' : 'New Challenge'}
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Trophy className="w-4 h-4 inline mr-2" />
              Challenge Type
            </label>
            <select
              value={challenge.type || 'featherless'}
              onChange={(e) => setChallenge(prev => ({ ...prev, type: e.target.value as ChallengeType }))}
              className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            >
              {challengeTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Challenge Title
            </label>
            <input
              type="text"
              value={challenge.title || ''}
              onChange={(e) => setChallenge(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              placeholder="Enter challenge title"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={challenge.description || ''}
            onChange={(e) => setChallenge(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            placeholder="Describe the challenge"
            rows={3}
          />
        </div>

        <PrizeInput
          prizes={challenge.prizes || []}
          onChange={(prizes) => setChallenge(prev => ({ ...prev, prizes }))}
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Requirements
          </label>
          <div className="space-y-2">
            {challenge.requirements?.map((requirement, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={requirement}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                  className="flex-1 px-4 py-2 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  placeholder="Enter requirement"
                />
                {challenge.requirements && challenge.requirements.length > 1 && (
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
          disabled={saving || !challenge.title}
          className={isInline ? "px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/30 transition-colors disabled:opacity-50" : "quiz-btn primary"}
        >
          {!isInline && <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : 'Save Challenge'}
        </button>
      </div>
    </div>
  );
};

export default ChallengeEditor;