import React from 'react';
import { Users, Lock, ChevronRight } from 'lucide-react';
import { useHackathon, User } from '../contexts/HackathonContext';
import { useState } from 'react';

interface HostLoginProps {
  formData: any;
  setFormData: (data: any) => void;
  onLogin: (user: User) => void;
  uiState: string;
}

const HostLogin: React.FC<HostLoginProps> = ({ formData, setFormData, onLogin, uiState }) => {
  const { login } = useHackathon();
  const [step, setStep] = useState<'password'>('password');
  const [password, setPassword] = useState('');
  
  const hostAccounts = [
    { name: 'Miguel', password: 'hello1' },
    { name: 'Arthur P', password: 'hello2' },
    { name: 'Swatantra', password: 'hello3' },
    { name: 'Arthur Z', password: 'hello4' }
  ];
  
  const handleLogin = () => {
    const selectedHost = hostAccounts.find(h => h.password === password);
    // Mock host login
    const hostUser: User = {
      id: `host-${Date.now()}`,
      type: 'host',
      name: selectedHost?.name || 'Host User',
      email: '',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      onboardingCompleted: true
    };
    login(hostUser);
    onLogin(hostUser);
  };

  const renderPasswordStep = () => (
    <>
      <div className="question-container">
        <h3 className="question-text">
          Welcome back, {hostAccounts.find(h => h.password === password)?.name}!
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
          onClick={handleLogin}
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

      {step === 'password' && renderPasswordStep()}
    </div>
  );
};

export default HostLogin;