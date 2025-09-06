import React from 'react';
import { Sparkles } from 'lucide-react';

interface HelloWelcomeProps {
  uiState: string;
}

const HelloWelcome: React.FC<HelloWelcomeProps> = ({ uiState }) => {
  return (
    <div className="quiz-panel max-w-[560px] w-full mx-auto text-center">
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="relative">
          <div className="absolute inset-0 blur-2xl bg-cyan-500/20 rounded-full animate-pulse" />
          <Sparkles className="w-14 h-14 text-cyan-300 relative" />
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-wide">
          Welcome to the AI Hackathon Portal
        </h2>
        <p className="text-cyan-200/80">
          Buckle up. We\'re taking you through the portal.
        </p>
        <div className="mt-4 text-sm text-gray-400">Preparing experience…</div>
      </div>
    </div>
  );
};

export default HelloWelcome;
