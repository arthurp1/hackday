import React, { useState } from 'react';
import { Lightbulb, ChevronRight, Zap, Workflow, ArrowLeft, FileText } from 'lucide-react';

interface ProjectQuestionsProps {
  formData: any;
  setFormData: (data: any) => void;
  onNavigate: (screen: string, data?: any, skipAnimation?: boolean) => void;
  uiState: string;
}

const ProjectQuestions: React.FC<ProjectQuestionsProps> = ({ formData, setFormData: _setFormData, onNavigate, uiState: _uiState }) => {
  const [answers, setAnswers] = useState<{ usesLLM?: boolean; usesIntegrations?: boolean; willingToShareSource?: boolean }>({
    usesLLM: true, // Auto-select "Yes"
    usesIntegrations: true, // Auto-select "Yes"
    willingToShareSource: true // Auto-select "Yes"
  });

  const handleAnswerChange = (field: string, value: boolean) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const handleContinue = () => {
    if (answers.usesLLM === undefined || answers.usesIntegrations === undefined || answers.willingToShareSource === undefined) {
      return; // Don't continue if not all questions are answered
    }
    
    // Determine project type based on original answer
    let projectType = 'newProject';
    if (formData.hasProject === 'yesTeam') {
      projectType = 'existingTeam';
    } else if (formData.hasProject === 'yesNeedPeople') {
      projectType = 'existingTeam';
    }
    
    onNavigate('hackerProject', { 
      projectType,
      hasProject: formData.hasProject,
      usesLLM: answers.usesLLM,
      usesIntegrations: answers.usesIntegrations,
      willingToShareSource: answers.willingToShareSource
    }, true);
  };

  return (
    <div className="quiz-panel">
      {/* Modal Back Button */}
      <button
        onClick={() => onNavigate('hackerSignup')}
        className="modal-back-button-right p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="quiz-header">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-10 h-10 text-green-400" />
          <div>
            <h2 className="text-lg font-bold text-white">About Your Project</h2>
          </div>
        </div>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto">
        {/* Question 1: LLM Usage */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-white">
            Do you think it will use a LLM? (AI text, multimodal, AI agent)
          </h3>
          <div className="flex gap-3">
            <button
              onClick={() => handleAnswerChange('usesLLM', true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                answers.usesLLM === true
                  ? 'bg-green-500/20 border-green-500/50 text-green-400'
                  : 'bg-black/20 border-white/10 text-gray-400 hover:border-green-500/30'
              }`}
            >
              <Zap className="w-4 h-4" />
              Yes
            </button>
            <button
              onClick={() => handleAnswerChange('usesLLM', false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                answers.usesLLM === false
                  ? 'bg-green-500/20 border-green-500/50 text-green-400'
                  : 'bg-black/20 border-white/10 text-gray-400 hover:border-green-500/30'
              }`}
            >
              No
            </button>
          </div>
        </div>

        {/* Question 2: Integrations */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-white">
            Do you think you will use many integrations?
          </h3>
          <p className="text-xs text-gray-400">eg. Notion, Gmail, Documents, Social Media, Database etc.</p>
          <div className="flex gap-3">
            <button
              onClick={() => handleAnswerChange('usesIntegrations', true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                answers.usesIntegrations === true
                  ? 'bg-green-500/20 border-green-500/50 text-green-400'
                  : 'bg-black/20 border-white/10 text-gray-400 hover:border-green-500/30'
              }`}
            >
              <Workflow className="w-4 h-4" />
              Yes
            </button>
            <button
              onClick={() => handleAnswerChange('usesIntegrations', false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                answers.usesIntegrations === false
                  ? 'bg-green-500/20 border-green-500/50 text-green-400'
                  : 'bg-black/20 border-white/10 text-gray-400 hover:border-green-500/30'
              }`}
            >
              No
            </button>
          </div>
        </div>

        {/* Question 3: Open Source Agreement */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-white">
            Are you willing to make your project open source for judging?
          </h3>
          <p className="text-xs text-gray-400">
            Required for challenge enrollment and prize eligibility
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => handleAnswerChange('willingToShareSource', true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                answers.willingToShareSource === true
                  ? 'bg-green-500/20 border-green-500/50 text-green-400'
                  : 'bg-black/20 border-white/10 text-gray-400 hover:border-green-500/30'
              }`}
            >
              <FileText className="w-4 h-4" />
              Yes, I agree to open source
            </button>
            <button
              onClick={() => handleAnswerChange('willingToShareSource', false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                answers.willingToShareSource === false
                  ? 'bg-green-500/20 border-green-500/50 text-green-400'
                  : 'bg-black/20 border-white/10 text-gray-400 hover:border-green-500/30'
              }`}
            >
              No, keep it private
            </button>
          </div>
        </div>

        {/* Open Source Info removed per request */}
      </div>

      <div className="quiz-actions">
        <button
          onClick={handleContinue}
          disabled={answers.usesLLM === undefined || answers.usesIntegrations === undefined || answers.willingToShareSource === undefined}
          className="quiz-btn primary"
        >
          <ChevronRight className="w-5 h-5" />
          Continue to Project Setup
        </button>
      </div>
    </div>
  );
};

export default ProjectQuestions;