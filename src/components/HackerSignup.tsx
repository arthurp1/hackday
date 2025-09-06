import React from 'react';
import { Code, ChevronRight } from 'lucide-react';
import { useHackathon, User as UserType } from '../contexts/HackathonContext';

interface HackerSignupProps {
  formData: any;
  setFormData: (data: any) => void;
  onNavigate: (screen: string, data?: any) => void;
  onLogin: (user: UserType) => void;
  uiState: string;
}

const HackerSignup: React.FC<HackerSignupProps> = ({ formData: _formData, setFormData: _setFormData, onNavigate, onLogin, uiState: _uiState }) => {
  const { createAttendee, login } = useHackathon();
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string>('');
  
  const handleRegister = async () => {
    const name = (fullName || '').trim();
    if (!name) { setError('Please enter your full name'); return; }
    setError('');
    setSaving(true);
    try {
      const parts = name.split(/\s+/);
      const firstName = parts[0] || name;
      const lastName = parts.slice(1).join(' ');
      const res = await createAttendee({
        name,
        firstName,
        lastName,
        email: (email || '').trim(),
        checkedIn: false,
        skills: [],
        teamStatus: 'needsTeam'
      });
      if (!res.success) { setError('Failed to register. Please try again.'); return; }
      const hackerUser: UserType = {
        id: `hacker-${Date.now()}`,
        type: 'hacker',
        name,
        email: (email || '').trim(),
        onboardingCompleted: false,
        onboardingData: {}
      };
      await login(hackerUser);
      onLogin(hackerUser);
      onNavigate('hackerProject', {});
    } finally {
      setSaving(false);
    }
  };
  
  const renderRegister = () => (
    <>
      <div className="question-container flex flex-col gap-1">
        <h3 className="question-text">Register your details</h3>
        <p className="text-sm text-gray-400 mt-1">Full name is required. Email is optional.</p>
      </div>
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 bg-black/30 border border-green-500/30 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
            placeholder="e.g., Ada Lovelace"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email (optional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-black/30 border border-green-500/30 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
            placeholder="your.email@example.com"
          />
        </div>
        {error && <div className="text-xs text-red-300">{error}</div>}
      </div>
      <div className="quiz-actions">
        <button
          onClick={handleRegister}
          disabled={saving || !fullName.trim()}
          className="quiz-btn primary"
        >
          <ChevronRight className="w-5 h-5" />
          {saving ? 'Registering...' : 'Register & Continue'}
        </button>
      </div>
    </>
  );
  
  return (
    <div className="quiz-panel w-[90vw] max-w-[1200px] mx-auto">

      <div className="quiz-header">
        <div className="flex items-center gap-3">
          <Code className="w-8 h-8 text-green-400" />
          <div>
            <h2 className="text-lg font-bold max-w-[300px] text-white">Hacker Registration</h2>
          </div>
        </div>
      </div>

      {renderRegister()}
    </div>
  );
};

export default HackerSignup;