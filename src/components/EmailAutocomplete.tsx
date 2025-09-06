import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useHackathon, Attendee, User as UserType } from '../contexts/HackathonContext';
import { Search } from 'lucide-react';

interface EmailAutocompleteProps {
  value: string;
  onChange: (email: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

const normalize = (s: string) => (s || '').toLowerCase();

interface Suggestion {
  email: string;
  label: string;
  short: string;
  city: string;
}

const EmailAutocomplete: React.FC<EmailAutocompleteProps> = ({ value, onChange, placeholder, className, autoFocus }) => {
  const { state } = useHackathon();
  const attendees: Attendee[] = (state.attendees || []) as Attendee[];
  const currentUser = state.currentUser as UserType | null;
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    if (autoFocus) {
      // Give React a tick to mount then focus
      setTimeout(() => {
        inputRef.current?.focus();
        setOpen(true);
      }, 0);
    }
  }, [autoFocus]);

  const suggestions: Suggestion[] = useMemo(() => {
    const q = normalize(query).trim();
    if (!q) return [] as Suggestion[];
    const items = attendees
      .filter((a: Attendee) => {
        const team = (a.team || '').toLowerCase();
        return !(team.includes('sponsors') || team === 'host' || team === 'hosts');
      })
      .map((a: Attendee): Suggestion => {
        const first = (a.firstName || a.name || '').trim();
        const last = (a.lastName || '').trim();
        const label = `${first} ${last}`.trim() || a.email;
        const short = `${first} ${last.slice(0,1)}`.trim();
        return {
          email: a.email,
          label,
          short,
          city: a.profile?.city || ''
        };
      })
      .filter((item: Suggestion) => {
        const nq = q.toLowerCase();
        return (
          item.short.toLowerCase().startsWith(nq) ||
          item.label.toLowerCase().includes(nq) ||
          item.city.toLowerCase().includes(nq)
        );
      })
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

  const commit = (email: string, label?: string) => {
    onChange(email);
    setQuery(label || email);
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
          type="text"
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActiveIndex(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="flex-1 px-4 py-2 bg-black/30 border border-green-500/30 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none text-sm"
          placeholder={placeholder || 'Search by name (e.g., Ranga B)'}
        />
        <Search className="w-4 h-4 text-gray-500" />
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-black/90 border border-white/10 rounded-lg max-h-56 overflow-auto shadow-xl">
          {suggestions.map((s: Suggestion, idx: number) => (
            <button
              key={`${s.email}-${idx}`}
              onMouseDown={(e) => { e.preventDefault(); commit(s.email, s.label); }}
              className={`w-full text-left px-3 py-2 text-sm ${
                idx === activeIndex ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-green-400">{s.label}</span>
                {currentUser?.type === 'hacker' ? (
                  s.city ? <span className="text-xs text-gray-400 ml-2">{s.city}</span> : <span className="text-xs text-gray-500 ml-2">&nbsp;</span>
                ) : (
                  <span className="text-xs text-gray-400 ml-2">{s.email}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmailAutocomplete;
