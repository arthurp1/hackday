import React, { useState, useRef, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  className?: string;
}

const TagInput: React.FC<TagInputProps> = ({ 
  tags, 
  onChange, 
  suggestions = [], 
  placeholder = "Add tags...",
  className = ""
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Default suggestions for common hackathon tags
  const defaultSuggestions = [
    'AI', 'Machine Learning', 'Web Development', 'Mobile App', 'Blockchain',
    'IoT', 'Data Science', 'Frontend', 'Backend', 'Full Stack', 'API',
    'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'Database',
    'Cloud', 'DevOps', 'Security', 'Automation', 'Integration', 'Workflow',
    'Social Media', 'E-commerce', 'Healthcare', 'Education', 'Finance',
    'Gaming', 'AR/VR', 'Productivity', 'Communication', 'Analytics'
  ];

  const allSuggestions = [...suggestions, ...defaultSuggestions];

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = allSuggestions.filter(
        suggestion => 
          suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
          !tags.includes(suggestion)
      );
      setFilteredSuggestions(filtered.slice(0, 8)); // Limit to 8 suggestions
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue, tags, allSuggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Handle comma-separated input
    if (value.includes(',')) {
      const newTags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
      newTags.forEach(tag => {
        if (!tags.includes(tag)) {
          onChange([...tags, tag]);
        }
      });
      setInputValue('');
      return;
    }
    
    setInputValue(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const getTagColor = (index: number) => {
    const colors = [
      'bg-blue-500/20 border-blue-500/50 text-blue-400',
      'bg-purple-500/20 border-purple-500/50 text-purple-400',
      'bg-green-500/20 border-green-500/50 text-green-400',
      'bg-pink-500/20 border-pink-500/50 text-pink-400',
      'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
      'bg-cyan-500/20 border-cyan-500/50 text-cyan-400',
      'bg-red-500/20 border-red-500/50 text-red-400',
      'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="flex flex-wrap gap-2 p-3 bg-black/30 border border-gray-500/30 rounded-lg min-h-[48px] focus-within:border-cyan-500">
        {tags.map((tag, index) => (
          <span
            key={tag}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getTagColor(index)} transition-all hover:scale-105`}
            style={{ borderWidth: '3px' }}
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue && setShowSuggestions(true)}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent text-white placeholder-gray-400 outline-none text-sm"
        />
      </div>

      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-black/90 backdrop-blur-xl border border-gray-500/30 rounded-lg shadow-2xl z-50 max-h-48 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              onClick={() => addTag(suggestion)}
              className="w-full px-3 py-2 text-left text-white hover:bg-cyan-500/20 transition-colors text-sm border-b border-gray-700/30 last:border-b-0"
            >
              <Plus className="w-3 h-3 inline mr-2 text-cyan-400" />
              {suggestion}
            </button>
          ))}
        </div>
      )}
      
      <div className="text-xs text-gray-400 mt-1">
        Separate tags with commas or press Enter
      </div>
    </div>
  );
};

export default TagInput;