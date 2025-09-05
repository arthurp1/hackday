import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Link, Video, FileText, Users, Tag } from 'lucide-react';
import { useHackathon, Project } from '../contexts/HackathonContext';
import TagInput from './TagInput';

interface ProjectEditorProps {
  onNavigate: (screen: string, data?: any) => void;
  uiState: string;
  formData: any;
  isInline?: boolean;
  onCancel?: () => void;
}

const ProjectEditor: React.FC<ProjectEditorProps> = ({ 
  onNavigate, 
  uiState, 
  formData,
  isInline = false,
  onCancel
}) => {
  const { state, updateProject, createProject } = useHackathon();
  const { projects } = state;
  const [project, setProject] = useState<Partial<Project>>({
    name: '',
    teamName: '',
    teamMembers: [''],
    description: '',
    demoUrl: '',
    videoDemo: '',
    slides: '',
    challengesEnrolled: [],
    type: 'newProject',
    status: 'draft',
    tags: [],
    collaborators: []
  });
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (formData?.projectId) {
      const existingProject = projects.find(p => p.id === formData.projectId);
      if (existingProject) {
        setProject(existingProject);
        setIsEditing(true);
      }
    }
  }, [formData?.projectId, projects]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isEditing && project.id) {
        await updateProject(project.id, project);
      } else {
        await createProject({
          ...project,
          submittedAt: project.status === 'submitted' ? new Date() : undefined,
          teamMembers: project.teamMembers || [''],
          challengesEnrolled: project.challengesEnrolled || [],
          type: project.type || 'newProject',
          status: project.status || 'draft'
        } as Omit<Project, 'id'>);
      }
      if (isInline && onCancel) {
        onCancel();
      } else {
        onNavigate('hostDashboard');
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isInline && onCancel) {
      onCancel();
    } else {
      onNavigate('hostDashboard');
    }
  };

  const handleTagsChange = (tags: string[]) => {
    setProject(prev => ({ ...prev, tags }));
  };

  const addTeamMember = () => {
    setProject(prev => ({
      ...prev,
      teamMembers: [...(prev.teamMembers || []), '']
    }));
  };

  const updateTeamMember = (index: number, email: string) => {
    setProject(prev => ({
      ...prev,
      teamMembers: prev.teamMembers?.map((member, i) => i === index ? email : member) || []
    }));
  };

  const removeTeamMember = (index: number) => {
    setProject(prev => ({
      ...prev,
      teamMembers: prev.teamMembers?.filter((_, i) => i !== index) || []
    }));
  };

  const toggleChallenge = (challenge: string) => {
    setProject(prev => ({
      ...prev,
      challengesEnrolled: prev.challengesEnrolled?.includes(challenge)
        ? prev.challengesEnrolled.filter(c => c !== challenge)
        : [...(prev.challengesEnrolled || []), challenge]
    }));
  };

  return (
    <div className={isInline ? "space-y-6" : "quiz-panel"}>
      {!isInline && <div className="quiz-header">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="p-2 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white">
              {isEditing ? 'Edit Project' : 'New Project'}
            </h2>
          </div>
        </div>
      </div>}

      {isInline && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            {isEditing ? 'Edit Project' : 'New Project'}
          </h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="space-y-6 flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Project Name
            </label>
            <input
              type="text"
              value={project.name || ''}
              onChange={(e) => setProject(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 bg-black/30 border border-cyan-500/30 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Team Name
            </label>
            <input
              type="text"
              value={project.teamName || ''}
              onChange={(e) => setProject(prev => ({ ...prev, teamName: e.target.value }))}
              className="w-full px-4 py-3 bg-black/30 border border-cyan-500/30 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
              placeholder="Enter team name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={project.description || ''}
            onChange={(e) => setProject(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-3 bg-black/30 border border-cyan-500/30 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
            placeholder="Describe your project"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Team Members
          </label>
          <div className="space-y-2">
            {project.teamMembers?.map((member, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="email"
                  value={member}
                  onChange={(e) => updateTeamMember(index, e.target.value)}
                  className="flex-1 px-4 py-2 bg-black/30 border border-cyan-500/30 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
                  placeholder="team.member@example.com"
                />
                {project.teamMembers && project.teamMembers.length > 1 && (
                  <button
                    onClick={() => removeTeamMember(index)}
                    className="px-3 py-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addTeamMember}
              className="px-4 py-2 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-colors"
            >
              + Add Team Member
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Tag className="w-4 h-4 inline mr-2" />
            Project Tags
          </label>
          <TagInput
            tags={project.tags || []}
            onChange={handleTagsChange}
            placeholder="Add tags to describe the project..."
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Link className="w-4 h-4 inline mr-2" />
              Demo URL
            </label>
            <input
              type="url"
              value={project.demoUrl || ''}
              onChange={(e) => setProject(prev => ({ ...prev, demoUrl: e.target.value }))}
              className="w-full px-4 py-3 bg-black/30 border border-cyan-500/30 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
              placeholder="https://your-demo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Video className="w-4 h-4 inline mr-2" />
              Video Demo URL
            </label>
            <input
              type="url"
              value={project.videoDemo || ''}
              onChange={(e) => setProject(prev => ({ ...prev, videoDemo: e.target.value }))}
              className="w-full px-4 py-3 bg-black/30 border border-cyan-500/30 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Slides URL
            </label>
            <input
              type="url"
              value={project.slides || ''}
              onChange={(e) => setProject(prev => ({ ...prev, slides: e.target.value }))}
              className="w-full px-4 py-3 bg-black/30 border border-cyan-500/30 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
              placeholder="https://slides.com/presentation"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Tag className="w-4 h-4 inline mr-2" />
            Challenges Enrolled
          </label>
          <div className="space-y-2">
            {['featherless', 'aibuilders', 'blockchain', 'sustainability'].map(challenge => (
              <label key={challenge} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={project.challengesEnrolled?.includes(challenge) || false}
                  onChange={() => toggleChallenge(challenge)}
                  className="w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500"
                />
                <span className="text-white capitalize">{challenge}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Project Status
          </label>
          <select
            value={project.status || 'draft'}
            onChange={(e) => setProject(prev => ({ ...prev, status: e.target.value as any }))}
            className="w-full px-4 py-3 bg-black/30 border border-cyan-500/30 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="judging">Under Judging</option>
            <option value="winner">Winner</option>
          </select>
        </div>
      </div>

      <div className={isInline ? "flex gap-2 justify-end" : "quiz-actions"}>
        {isInline && (
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-500/20 border border-gray-500/30 rounded-lg text-gray-400 hover:bg-gray-500/30 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving || !project.name}
          className={isInline ? "px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-colors disabled:opacity-50" : "quiz-btn primary"}
        >
          {!isInline && <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : 'Save Project'}
        </button>
      </div>
    </div>
  );
};

export default ProjectEditor;