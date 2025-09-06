import React from 'react';
import { Users, Lock } from 'lucide-react';
import { useHackathon, User } from '../contexts/HackathonContext';
import { useState } from 'react';

interface HostLoginProps {
  formData: any;
  setFormData: (data: any) => void;
  onLogin: (user: User) => void;
  uiState: string;
}

const HostLogin: React.FC<HostLoginProps> = ({ formData: _formData, setFormData: _setFormData, onLogin, uiState: _uiState }) => {
  const { login } = useHackathon();
  const [step, setStep] = useState<'select' | 'password'>('select');
  const [password, setPassword] = useState('');
  const [selectedHost, setSelectedHost] = useState<string | null>(null);
  
  // Unique host passwords
  const hostAccounts = [
    { name: 'Miguel',    password: 'Aj9SD#jxopIQWF1' },
    { name: 'Arthur P',  password: 'Aj9SD#jxopIQWF2' },
    { name: 'Swatantra', password: 'Aj9SD#jxopIQWF3' },
    { name: 'Arthur Z',  password: 'Aj9SD#jxopIQWF4' }
  ];
  
  const handleLogin = (pwOverride?: string) => {
    const effectivePw = (pwOverride ?? password) || '';
    const host = hostAccounts.find(h => h.name === selectedHost);
    if (!host) return; // must select a host first
    if (effectivePw !== host.password) return; // require exact match
    // Mock host login
    const hostUser: User = {
      id: `host-${Date.now()}`,
      type: 'host',
      name: host.name,
      email: '',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      onboardingCompleted: true
    };
    login(hostUser);
    onLogin(hostUser);
  };

  // Support URL param ?pw=... to prefill and auto-login
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const pw = params.get('pw');
      if (pw) {
        setPassword(pw);
        const match = hostAccounts.find(h => h.password === pw);
        if (match) {
          setSelectedHost(match.name);
          setStep('password');
          // Delay to ensure state updates if needed
          setTimeout(() => handleLogin(pw), 0);
        }
        // Consume the pw parameter so it doesn't affect future in-app navigations
        const url = new URL(window.location.href);
        url.searchParams.delete('pw');
        window.history.replaceState({}, '', url.pathname + url.search + url.hash);
      }
    } catch {}
  }, []);

  const renderSelectStep = () => (
    <>
      <div className="question-container">
        <h3 className="question-text">Select a host account</h3>
      </div>
      <div className="space-y-3 mb-6">
        {hostAccounts.map((h) => (
          <button
            key={h.name}
            onClick={() => { setSelectedHost(h.name); setStep('password'); }}
            className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-colors text-left ${
              selectedHost === h.name
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                : 'bg-black/20 border-white/10 text-gray-300 hover:border-cyan-500/30'
            }`}
          >
            <Users className="w-5 h-5" />
            <div>
              <div className="font-medium text-white">{h.name}</div>
              <div className="text-sm text-gray-400">Host</div>
            </div>
          </button>
        ))}
      </div>
    </>
  );

  const renderPasswordStep = () => (
    <>
      <div className="question-container">
        <h3 className="question-text">
          Welcome back, {selectedHost || 'Host'}!
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
            className="w-full px-4 py-3 bg-black/30 border border-cyan-500/30 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
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
          <Users className="w-5 h-5" />
          Login as Host
        </button>
      </div>
    </>
  );

  return (
    <div className="quiz-panel max-w-[400px] w-full mx-auto">

      <div className="quiz-header">
        <div className="flex items-center gap-3">
          <Users className="w-10 h-10 text-cyan-400" />
          <div>
            <h2 className="text-lg font-bold text-white">Host Login</h2>
          </div>
        </div>
      </div>

      {step === 'select' && renderSelectStep()}
      {step === 'password' && renderPasswordStep()}
    </div>
  );
};

export default HostLogin;