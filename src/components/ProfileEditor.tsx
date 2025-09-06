import React, { useState, useRef } from 'react';
import { Save, User, MapPin, Linkedin, Twitter, FileText } from 'lucide-react';
import { useHackathon } from '../contexts/HackathonContext';
import TagInput from './TagInput';

interface ProfileEditorProps {
  onClose?: () => void;
  isInline?: boolean;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ onClose, isInline = false }) => {
  const { state, updateUserProfile } = useHackathon();
  const { currentUser, attendees } = state;
  
  // Derive first/last from attendees or split current user name
  const attendeeRecord = attendees.find(a => a.email === currentUser?.email);
  const initialFirstName = attendeeRecord?.firstName || (currentUser?.name?.split(' ')[0] || '');
  const initialLastName = attendeeRecord?.lastName || (currentUser?.name?.split(' ').slice(1).join(' ') || '');

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);

  const [profile, setProfile] = useState({
    city: '',
    linkedin: '',
    twitter: '',
    otherProjects: [] as string[],
    bio: '',
    skills: [] as string[],
    ...currentUser?.profile
  });
  
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!currentUser) return;
    
    setSaving(true);
    try {
      await updateUserProfile(currentUser.id, {
        profile,
        name: `${firstName} ${lastName}`.trim(),
        firstName,
        lastName
      });
      if (onClose) onClose();
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  // Removed: handleProjectsChange for deprecated 'Add Tags' section

  if (!currentUser) return null;

  const panelRef = useRef<HTMLDivElement>(null);

  const panelContent = (
    <div ref={panelRef} className={isInline ? "space-y-4" : "relative w-full max-w-2xl p-6 bg-black border border-cyan-500/30 rounded-lg shadow-xl opacity-100"}>
      {!isInline && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xl font-semibold text-white">Edit Profile</h3>
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
      )}
      {isInline && (
        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Edit Profile</h3>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 bg-black/30 border border-gray-500/30 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
              placeholder="First name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 bg-black/30 border border-gray-500/30 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
              placeholder="Last name"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              City
            </label>
            <input
              type="text"
              value={profile.city || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
              className="w-full px-3 py-2 bg-black/30 border border-gray-500/30 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
              placeholder="Amsterdam, Netherlands"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Linkedin className="w-4 h-4 inline mr-2" />
              LinkedIn Profile
            </label>
            <input
              type="url"
              value={profile.linkedin || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, linkedin: e.target.value }))}
              className="w-full px-3 py-2 bg-black/30 border border-gray-500/30 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
              placeholder="https://linkedin.com/in/yourname"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Twitter className="w-4 h-4 inline mr-2" />
            Twitter/X Profile
          </label>
          <input
            type="url"
            value={profile.twitter || ''}
            onChange={(e) => setProfile(prev => ({ ...prev, twitter: e.target.value }))}
            className="w-full px-3 py-2 bg-black/30 border border-gray-500/30 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
            placeholder="https://twitter.com/yourhandle"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Bio
          </label>
          <textarea
            value={profile.bio || ''}
            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
            className="w-full px-3 py-2 bg-black/30 border border-gray-500/30 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
            placeholder="Tell us about yourself..."
            rows={3}
          />
        </div>

        {/* Removed 'Add Tags' section per request */}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Skills
          </label>
          <TagInput
            tags={profile.skills || []}
            onChange={(skills) => setProfile(prev => ({ ...prev, skills }))}
            placeholder="Add skills (e.g. React, Python, LLM, UX)"
            suggestions={['React','TypeScript','Node.js','Python','LLM','UI/UX','DevOps','SQL','NoSQL','Vision','NLP']}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500/20 border border-gray-500/30 rounded-lg text-gray-400 hover:bg-gray-500/30 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );

  if (isInline) return panelContent;

  // Modal wrapper: top-most overlay with backdrop
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => {
          if (onClose) onClose();
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 mt-8" onClick={(e) => e.stopPropagation()}>
        {panelContent}
      </div>
    </div>
  );
};

export default ProfileEditor;