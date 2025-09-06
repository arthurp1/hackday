import React from 'react';
import { Building2, Lock, ChevronRight } from 'lucide-react';
import { useHackathon, User } from '../contexts/HackathonContext';
import { useState } from 'react';

interface SponsorLoginProps {
  formData: any;
  setFormData: (data: any) => void;
  onLogin: (user: any) => void;
  uiState: string;
  onNavigate: (screen: string, data?: any) => void;
}

const SponsorLogin: React.FC<SponsorLoginProps> = ({ formData: _formData, setFormData: _setFormData, onLogin, uiState: _uiState, onNavigate: _onNavigate }) => {
  const { login } = useHackathon();
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleEmailSubmit = () => {
    if (email) {
      setStep('password');
    }
  };
  
  const sponsorAccounts = [
    { id: 'sponsor-featherless',  name: 'Darin (Featherless.ai)',      email: 'darin@featherless.ai',       company: 'Featherless.ai',  password: 'Aj9SD#jxopIQWF-F' },
    { id: 'sponsor-activepieces', name: 'Kareem (ActivePieces.com)',   email: 'kareem@activepieces.com',    company: 'ActivePieces.com', password: 'Aj9SD#jxopIQWF-AP' },
    { id: 'sponsor-aibuilders',   name: 'Arthur (AIBuilders.com)',     email: 'arthur@aibuilders.club',     company: 'AIBuilders.club',  password: 'Aj9SD#jxopIQWF-AB' }
  ];
  
  const handleLogin = (pwOverride?: string) => {
    const effectivePw = (pwOverride ?? password) || '';
    const selectedSponsor = sponsorAccounts.find(s => s.email === email && s.password);
    if (!selectedSponsor) return;
    if (effectivePw !== selectedSponsor.password) return;
    // Mock sponsor login
    const sponsorUser: User = {
      id: selectedSponsor?.id || `sponsor-${Date.now()}`,
      type: 'sponsor',
      name: selectedSponsor?.company || 'Sponsor',
      email: email,
      avatar: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      onboardingCompleted: true
    };
    login(sponsorUser);
    onLogin(sponsorUser);
  };

  // Support URL param ?pw=... to prefill and auto-login sponsor
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const pw = params.get('pw');
      if (pw) {
        setPassword(pw);
        const match = sponsorAccounts.find(s => s.password === pw);
        if (match) {
          setEmail(match.email);
          setStep('password');
          setTimeout(() => handleLogin(pw), 0);
        }
      }
    } catch {}
  }, []);

  const renderEmailStep = () => (
    <>
      <div className="question-container">
        <h3 className="question-text">
          Select your sponsor account
        </h3>
      </div>

      <div className="space-y-3 mb-6">
        {sponsorAccounts.map((sponsor) => (
          <button
            key={sponsor.email}
            onClick={() => setEmail(sponsor.email)}
            className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-colors text-left ${
              email === sponsor.email
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                : 'bg-black/20 border-white/10 text-gray-300 hover:border-purple-500/30'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <div>
              <div className="font-medium text-white">{sponsor.name}</div>
              <div className="text-sm text-gray-400">{sponsor.email}</div>
              <div className="text-xs text-purple-400">{sponsor.company}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="quiz-actions">
        <button 
          onClick={handleEmailSubmit}
          disabled={!email}
          className="quiz-btn primary"
        >
          <ChevronRight className="w-5 h-5" />
          Continue
        </button>
      </div>
    </>
  );

  const renderPasswordStep = () => (
    <>
      <div className="question-container">
        <h3 className="question-text">
          Welcome, {sponsorAccounts.find(s => s.email === email)?.company}!
        </h3>
        <p className="text-sm text-gray-400 mt-2">Enter your password to continue</p>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Lock className="w-4 h-4 inline mr-2" />
            Password
          </label>
          <input
            type="password"
            className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      <div className="quiz-actions">
        <button 
          onClick={() => handleLogin()}
          className="quiz-btn primary"
        >
          <Building2 className="w-5 h-5" />
          Login as Sponsor
        </button>
      </div>
    </>
  );

  return (
    <div className="quiz-panel max-w-[400px] w-full mx-auto">

      <div className="quiz-header">
        <div className="flex items-center gap-3">
          <Building2 className="w-10 h-10 text-purple-400" />
          <div>
            <h2 className="text-lg font-bold text-white">Sponsor Portal</h2>
          </div>
        </div>
      </div>

      {step === 'email' && renderEmailStep()}
      {step === 'password' && renderPasswordStep()}
    </div>
  );
};

export default SponsorLogin;