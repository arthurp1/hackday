import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useHackathon, Attendee } from '../contexts/HackathonContext';

interface NameAutocompleteProps {
  onSelect: (email: string, label?: string) => void; // commit underlying email, label optional
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

const normalize = (s: string) => (s || '').toLowerCase();

interface Suggestion {
  email: string;
  label: string; // FirstName + LastInitial.
  full: string;  // Full name
}

const NameAutocomplete: React.FC<NameAutocompleteProps> = ({ onSelect, placeholder, className, autoFocus }) => {
  const { state } = useHackathon();
  const attendees: Attendee[] = (state.attendees || []) as Attendee[];

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        inputRef.current?.focus();
        setOpen(true);
      }, 0);
    }
  }, [autoFocus]);

  const suggestions: Suggestion[] = useMemo(() => {
    const q = normalize(query).trim();
    const base = attendees
      // Only hackers (case-insensitive contains to be resilient to seed variants)
      .filter((a: Attendee) => (a.team || '').toLowerCase().includes('hacker'))
      .map((a: Attendee): Suggestion => {
        const first = (a.firstName || a.name || '').trim();
        const last = (a.lastName || '').trim();
        const label = `${first}${last ? ' ' + last.charAt(0).toUpperCase() + '.' : ''}`.trim();
        const full = `${first}${last ? ' ' + last : ''}`.trim();
        return { email: a.email, label, full };
      })
      .sort((a, b) => a.label.localeCompare(b.label));

    const filtered = q
      ? base.filter((s: Suggestion) => s.label.toLowerCase().includes(q) || s.full.toLowerCase().includes(q))
      : base;

    return filtered.slice(0, 8);
  }, [attendees, query]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const s = suggestions[activeIndex];
      if (s) {
        onSelect(s.email, s.label);
        setQuery('');
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className={`relative ${className || ''}`} ref={containerRef}>
      <div className="flex items-center gap-2">
        <input
          type="text"
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActiveIndex(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="flex-1 px-4 py-2 bg-black/30 border border-green-500/30 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none text-sm"
          placeholder={placeholder || 'Type a first name (e.g., Ranga B.)'}
        />
        <Search className="w-4 h-4 text-gray-500" />
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-black/90 border border-white/10 rounded-lg max-h-56 overflow-auto shadow-xl">
          {suggestions.map((s: Suggestion, idx: number) => (
            <button
              key={`${s.email}-${idx}`}
              onMouseDown={(e) => { e.preventDefault(); onSelect(s.email, s.label); setQuery(''); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm ${
                idx === activeIndex ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-green-400">{s.label}</span>
                {/* Do not show emails anywhere for hackers */}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NameAutocomplete;
