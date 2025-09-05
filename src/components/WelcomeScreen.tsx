import React from 'react';
import { Users, Building2, Code, ChevronRight } from 'lucide-react';

interface WelcomeScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  uiState: string;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNavigate, uiState }) => {
  return (
    <div className="quiz-panel max-w-[400px] w-full mx-auto">
      <div className="quiz-header">
        <div className="flex items-center gap-3">
          <Code className="w-10 h-10 text-cyan-400" />
          <div>
            <h2 className="text-lg font-bold text-white">AI Hackathon Portal</h2>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="text-center mb-6">
          <p className="text-gray-300 leading-relaxed">
            Manage your AI Hackday team, project, and enroll for challenges & prizes.
          </p>
        </div>

        {/* Main Hacker Button */}
        <div className="mb-4">
          <button
            onClick={() => onNavigate('hackerSignup')}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/40 rounded-lg text-white hover:bg-gradient-to-r hover:from-green-500/30 hover:to-emerald-500/30 hover:border-green-500/60 transition-all duration-300 font-semibold text-lg"
          >
            <Code className="w-6 h-6" />
            Hacker
          </button>
        </div>

        {/* Secondary Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate('hostLogin')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-gray-300 hover:bg-white/10 hover:border-white/30 hover:text-white transition-all duration-300"
          >
            <Users className="w-5 h-5" />
            Host
          </button>

          <button
            onClick={() => onNavigate('sponsorLogin')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-gray-300 hover:bg-white/10 hover:border-white/30 hover:text-white transition-all duration-300"
          >
            <Building2 className="w-5 h-5" />
            Sponsor
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;