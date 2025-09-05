import React from 'react';
import { Rocket, ChevronRight } from 'lucide-react';

interface ProjectSetupProps {
  formData: any;
  setFormData: (data: any) => void;
  onNavigate: (screen: string, data?: any) => void;
  uiState: string;
}

const ProjectSetup: React.FC<ProjectSetupProps> = ({ formData, setFormData, onNavigate, uiState }) => {
  return (
    <div className="quiz-panel">
      <div className="quiz-header">
        <div className="flex items-center gap-3">
          <Rocket className="w-10 h-10 text-purple-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Project Setup</h2>
            <p className="text-purple-400">Tell us about your project</p>
          </div>
        </div>
      </div>

      <div className="question-container">
        <h3 className="question-text">
          What type of project are you working on?
        </h3>
      </div>

      <div className="options-container">
        <button
          onClick={() => onNavigate('sourceCodeAgreement', { projectType: 'existingTeam' })}
          className="option-btn"
        >
          <div className="option-indicator">A</div>
          <span className="option-text">
            Continuing work on an existing project with my team
          </span>
        </button>
        
        <button
          onClick={() => onNavigate('sourceCodeAgreement', { projectType: 'newProject' })}
          className="option-btn"
        >
          <div className="option-indicator">B</div>
          <span className="option-text">
            Starting a completely new project for this hackathon
          </span>
        </button>
        
        <button
          onClick={() => onNavigate('sourceCodeAgreement', { projectType: 'bounty' })}
          className="option-btn"
        >
          <div className="option-indicator">C</div>
          <span className="option-text">
            Working on a specific sponsor bounty or challenge
          </span>
        </button>
      </div>
    </div>
  );
};

export default ProjectSetup;