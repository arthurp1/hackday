import React from 'react';
import { Code, ChevronRight, Mail, User } from 'lucide-react';
import { Search } from 'lucide-react';
import { useHackathon, User as UserType } from '../contexts/HackathonContext';

interface HackerSignupProps {
  formData: any;
  setFormData: (data: any) => void;
  onNavigate: (screen: string, data?: any) => void;
  onLogin: (user: UserType) => void;
  uiState: string;
}

const HackerSignup: React.FC<HackerSignupProps> = ({ formData: _formData, setFormData: _setFormData, onNavigate, onLogin, uiState: _uiState }) => {
  const { state, login } = useHackathon();
  const { attendees } = state;
  const [step, setStep] = React.useState<'select' | 'email'>('select');
  const [selectedAccount, setSelectedAccount] = React.useState<any>(null);
  const [email, setEmail] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [attempts, setAttempts] = React.useState(0);
  const [lockUntil, setLockUntil] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string>('');
  
  // Build account list from global attendees (exclude sponsors/hosts/teams)
  const visibleAttendees = attendees.filter(a => {
    const team = (a as any).team ? String((a as any).team).toLowerCase() : '';
    const role = (a as any).type ? String((a as any).type).toLowerCase() : '';
    return !(
      team.includes('sponsor') || team === 'host' || team === 'hosts' ||
      role === 'sponsor' || role === 'host'
    );
  });

  const premadeAccounts = visibleAttendees.map(a => ({
    firstName: a.firstName || a.name?.split(' ')[0] || 'Hacker',
    lastName: a.lastName || a.name?.split(' ').slice(1).join(' ') || '',
    email: a.email,
    company: a.profile?.city || (a.skills?.slice(0,2).join(' • ') || '')
  }));

  const getDisplayName = (account: any) => {
    const lastInitial = account.lastName ? account.lastName.charAt(0).toUpperCase() : '';
    return `${account.firstName}${lastInitial ? ' ' + lastInitial + '.' : ''}`;
  };

  const filteredAccounts = premadeAccounts.filter(account =>
    getDisplayName(account).toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAccountSelect = (account: any) => {
    setSelectedAccount(account);
    // Do not prefill email in production
    if (import.meta.env.MODE !== 'production') {
      setEmail(account.email);
    } else {
      setEmail('');
    }
    setStep('email');
  };

  const normalize = (s: string) => (s || '').trim().toLowerCase();
  const maskEmail = (e: string) => {
    const [user, domain] = e.split('@');
    if (!user || !domain) return e;
    const maskedUser = user.length <= 1 ? user : `${user[0]}${'*'.repeat(Math.max(0, user.length - 1))}`;
    const domainParts = domain.split('.');
    const domainName = domainParts[0] || '';
    const tld = domainParts.slice(1).join('.') || '';
    const maskedDomainName = domainName.length <= 1 ? domainName : `${domainName[0]}${'*'.repeat(Math.max(0, domainName.length - 1))}`;
    const maskedTld = tld ? tld.replace(/\w/g, '*') : '';
    return `${maskedUser}@${maskedDomainName}${maskedTld ? '.' + maskedTld : ''}`;
  };

  React.useEffect(() => {
    if (lockUntil === null) return;
    const id = setInterval(() => {
      if (Date.now() >= lockUntil) {
        setLockUntil(null);
        setAttempts(0);
        setError('');
      }
    }, 250);
    return () => clearInterval(id);
  }, [lockUntil]);

  const handleEmailSubmit = async () => {
    if (!selectedAccount) return;
    if (!email.trim()) return;
    if (lockUntil && Date.now() < lockUntil) return;

    const target = normalize(selectedAccount.email);
    const input = normalize(email);
    if (input !== target) {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      if (nextAttempts >= 3) {
        setLockUntil(Date.now() + 5000); // 5s lockout
        setError('Too many tries. Please wait 5 seconds and try again.');
      } else {
        setError('Email does not match our records for this registration.');
      }
      return;
    }

    // Matched: create hacker user and login based on selected attendee
    const hackerUser: UserType = {
      id: `hacker-${Date.now()}`,
      type: 'hacker',
      name: `${selectedAccount.firstName} ${selectedAccount.lastName}`.trim(),
      email: selectedAccount.email,
      onboardingCompleted: false,
      onboardingData: {}
    };

    await login(hackerUser);
    onLogin(hackerUser);
    onNavigate('projectQuestions', {});
  };
  
  const renderAccountSelection = () => (
    <>
      <div className="mb-4">
        <div className="flex items-center gap-4 mb-3">
          <h3 className="text-white font-medium flex-shrink-0">
            Select your account
          </h3>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/30 border border-green-500/30 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none text-sm"
              placeholder="Search by name or company..."
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6 max-h-96 overflow-y-auto">
        {filteredAccounts.sort((a, b) => a.firstName.localeCompare(b.firstName)).map((account, index) => (
          <button
            key={index}
            onClick={() => handleAccountSelect(account)}
            className="flex items-center gap-2 p-3 rounded-lg border transition-colors text-left bg-black/20 border-white/10 text-gray-300 hover:border-green-500/30 hover:bg-green-500/10"
          >
            <User className="w-5 h-5 text-green-400 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="font-medium text-white text-sm truncate">{getDisplayName(account)}</div>
              {account.company && (
                <div className="text-xs text-green-400 truncate mt-1">{account.company}</div>
              )}
            </div>
          </button>
        ))}
      </div>
      
      {filteredAccounts.length === 0 && searchTerm && (
        <div className="text-center py-6 text-gray-400">
          No accounts found matching "{searchTerm}"
        </div>
      )}
    </>
  );
  
  const renderEmailStep = () => (
    <>
      <div className="question-container flex flex-col gap-1">
        <h3 className="question-text">
          Fill in your Luma email for verification
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          No email will be sent. Please enter the same email you used to register. Expected: <span className="text-green-400">{maskEmail(selectedAccount.email)}</span>
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-black/30 border border-green-500/30 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
            placeholder="your.email@example.com"
            autoFocus
          />
        </div>
        {error && (
          <div className="text-xs text-red-300">{error}</div>
        )}
      </div>

      <div className="quiz-actions">
        <button 
          onClick={handleEmailSubmit}
          disabled={!email.trim() || (lockUntil !== null && Date.now() < lockUntil)}
          className="quiz-btn primary"
        >
          <ChevronRight className="w-5 h-5" />
          {lockUntil && Date.now() < lockUntil ? `Retry in ${Math.ceil((lockUntil - Date.now())/1000)}s` : 'Continue'}
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
            <h2 className="text-lg font-bold text-white">Hacker Registration</h2>
          </div>
        </div>
      </div>

      {step === 'select' && renderAccountSelection()}
      {step === 'email' && renderEmailStep()}
    </div>
  );
};

export default HackerSignup;