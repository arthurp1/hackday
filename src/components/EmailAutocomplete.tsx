import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useHackathon } from '../contexts/HackathonContext';
import { Search } from 'lucide-react';

interface EmailAutocompleteProps {
  value: string;
  onChange: (email: string) => void;
  placeholder?: string;
  className?: string;
}

const normalize = (s: string) => (s || '').toLowerCase();

const EmailAutocomplete: React.FC<EmailAutocompleteProps> = ({ value, onChange, placeholder, className }) => {
  const { state } = useHackathon();
  const { attendees } = state;
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const suggestions = useMemo(() => {
    const q = normalize(query).trim();
    if (!q) return [] as { email: string; label: string }[];
    const items = attendees
      .map(a => ({
        email: a.email,
        label: `${a.firstName || a.name || ''} ${a.lastName || ''}`.trim() || a.email,
        city: a.profile?.city || '',
      }))
      .filter(item => normalize(item.email).includes(q) || normalize(item.label).includes(q) || normalize(item.city).includes(q))
      .slice(0, 8);
    return items;
  }, [attendees, query]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const commit = (email: string) => {
    onChange(email);
    setQuery(email);
    setOpen(false);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, Math.max(0, suggestions.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = suggestions[activeIndex];
      if (item) commit(item.email);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className || ''}`}>
      <div className="flex items-center gap-2">
        <input
          type="email"
          value={query}
          onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); setActiveIndex(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="flex-1 px-4 py-2 bg-black/30 border border-green-500/30 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none text-sm"
          placeholder={placeholder || 'team.member@example.com'}
        />
        <Search className="w-4 h-4 text-gray-500" />
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-black/90 border border-white/10 rounded-lg max-h-56 overflow-auto shadow-xl">
          {suggestions.map((s, idx) => (
            <button
              key={`${s.email}-${idx}`}
              onMouseDown={(e) => { e.preventDefault(); commit(s.email); }}
              className={`w-full text-left px-3 py-2 text-sm ${
                idx === activeIndex ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-green-400">{s.email}</span>
                <span className="text-xs text-gray-400 ml-2">{s.label}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmailAutocomplete;
