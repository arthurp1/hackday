import React, { useState } from 'react';
import { Trophy, X, FileText, AlertCircle } from 'lucide-react';
import { Challenge } from '../contexts/HackathonContext';

interface ChallengeEnrollmentModalProps {
  challenge: Challenge;
  onConfirm: () => void;
  onCancel: () => void;
}

const ChallengeEnrollmentModal: React.FC<ChallengeEnrollmentModalProps> = ({
  challenge,
  onConfirm,
  onCancel
}) => {
  const [agreed, setAgreed] = useState(false);

  const handleConfirm = () => {
    if (agreed) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Enroll in Challenge</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-white mb-2">{challenge.title}</h4>
          <p className="text-sm text-gray-300 mb-3">{challenge.description}</p>
          
          <div className="text-sm text-green-400 mb-3">
            Prize: {challenge.prizes.map(p => p.details).join(' + ')}
          </div>

          <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-yellow-300 font-medium mb-1">Open Source Requirement</p>
                <p className="text-xs text-gray-300">
                  To enroll for the €50 prize (per team), your code must be open source and accessible to sponsors until 1 day after the event.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 mb-4">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-300 font-medium mb-1">Judging Criteria</p>
                <p className="text-xs text-gray-300">
                  Projects will be judged on <strong>innovative use</strong> or <strong>exceptional usability</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500 mt-0.5"
            />
            <span className="text-sm text-gray-300">
              I agree that the repository should be public and accessible to the sponsors until 1 day after the event
            </span>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-500/20 border border-gray-500/30 rounded-lg text-gray-400 hover:bg-gray-500/30 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!agreed}
            className="flex-1 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enroll in Challenge
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeEnrollmentModal;