import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { hasNeon, loadStateFromDB, saveStateToDB } from '../lib/neonStore';
import { hasSupabase, supabase } from '../lib/supabaseClient';

// Types
export type UserType = 'host' | 'sponsor' | 'hacker';
export type ProjectType = 'existingTeam' | 'newProject' | 'bounty';
export type PrizeType = 'cash' | 'credits' | 'free_plan' | 'coupon' | 'voucher' | 'swag' | 'shirt';
export type ChallengeType = 'featherless' | 'activepieces' | 'aibuilders';
export type BountyStatus = 'open' | 'claimed' | 'completed';
export type GoodieType = 'free_trial' | 'coupon' | 'swag' | 'shirt_pickup';
export type TeamStatus = 'solo' | 'needsTeam' | 'hasTeam';

export interface Prize {
  type: PrizeType;
  amount?: number;
  currency?: string;
  details: string;
}

// FAQ
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface Goodie {
  id: string;
  sponsorId: string;
  type: GoodieType;
  title: string;
  description: string;
  details: string;
  quantity?: number;
  forEveryone: boolean;
  url?: string;
}

export interface User {
  id: string;
  type: UserType;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  onboardingCompleted?: boolean;
  onboardingData?: {
    hasProject?: string;
    usesLLM?: boolean;
    usesIntegrations?: boolean;
    willingToShareSource?: boolean;
    teamStatus?: TeamStatus;
  };
  profile?: {
    city?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
    otherProjects?: string[];
    bio?: string;
  };
}

export interface Challenge {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  prizes: Prize[];
  requirements: string[];
  sponsorId: string;
  tags?: string[];
  getStartedUrl?: string;
}

export interface Project {
  id: string;
  type: ProjectType;
  name: string;
  teamName?: string;
  teamMembers: string[];
  demoUrl?: string;
  videoDemo?: string;
  slides?: string;
  githubUrl?: string;
  challengesEnrolled: ChallengeType[];
  bountyId?: string;
  submittedAt?: Date;
  status: 'draft' | 'submitted' | 'judging' | 'winner';
  description?: string;
  tags?: string[];
  collaborators?: string[]; // User IDs who can edit
  isTemplate?: boolean; // For bounty templates
  templateBountyId?: string; // Reference to original bounty
  startedFrom?: 'company' | 'some_code' | 'idea' | 'scratch';
}

export interface Bounty {
  id: string;
  sponsorId: string;
  title: string;
  description: string;
  requirements: string[];
  prizes: Prize[];
  githubUrl?: string;
  repoUrl?: string;
  bountyPageUrl?: string;
  videoInstructions?: string;
  status: BountyStatus;
  claimedBy?: string;
  category: 'aibuilders' | 'activepieces';
  tags?: string[];
  maxTeams?: number; // Usually 1 for exclusive bounties
  claimedTeams?: string[]; // Array of team/project IDs
  projectTemplate?: Partial<Project>; // Template for teams to start with
}

export interface Attendee {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  checkedIn: boolean;
  registeredAt: Date;
  team?: string;
  projectId?: string;
  wantsSolo?: boolean;
  sponsorId?: string;
  skills: string[];
  teamStatus?: TeamStatus;
  profile?: {
    city?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
    otherProjects?: string[];
    bio?: string;
  };
}

// State interface
interface HackathonState {
  currentUser: User | null;
  projects: Project[];
  challenges: Challenge[];
  bounties: Bounty[];
  goodies: Goodie[];
  attendees: Attendee[];
  faq?: FaqItem[];
  phase?: { votingOpen: boolean; announce: boolean };
  winners?: { challenge: Partial<Record<ChallengeType, string>>; bounty: Record<string, string> };
  loading: boolean;
  error: string | null;
}

// Action types
type HackathonAction =
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: { id: string; updates: Partial<Project> } }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_CHALLENGES'; payload: Challenge[] }
  | { type: 'SET_BOUNTIES'; payload: Bounty[] }
  | { type: 'ADD_BOUNTY'; payload: Bounty }
  | { type: 'UPDATE_BOUNTY'; payload: { id: string; updates: Partial<Bounty> } }
  | { type: 'DELETE_BOUNTY'; payload: string }
  | { type: 'SET_GOODIES'; payload: Goodie[] }
  | { type: 'ADD_GOODIE'; payload: Goodie }
  | { type: 'UPDATE_GOODIE'; payload: { id: string; updates: Partial<Goodie> } }
  | { type: 'DELETE_GOODIE'; payload: string }
  | { type: 'ADD_CHALLENGE'; payload: Challenge }
  | { type: 'UPDATE_CHALLENGE'; payload: { id: string; updates: Partial<Challenge> } }
  | { type: 'DELETE_CHALLENGE'; payload: string }
  | { type: 'SET_ATTENDEES'; payload: Attendee[] }
  | { type: 'ADD_ATTENDEE'; payload: Attendee }
  | { type: 'UPDATE_ATTENDEE'; payload: { id: string; updates: Partial<Attendee> } }
  | { type: 'DELETE_ATTENDEE'; payload: string }
  | { type: 'SET_FAQ'; payload: FaqItem[] }
  | { type: 'UPSERT_FAQ'; payload: FaqItem }
  | { type: 'DELETE_FAQ'; payload: string }
  | { type: 'SET_PHASE'; payload: { votingOpen: boolean; announce: boolean } }
  | { type: 'SET_WINNER_CHALLENGE'; payload: { type: ChallengeType; projectId: string } }
  | { type: 'SET_WINNER_BOUNTY'; payload: { bountyId: string; projectId: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Helpers to revive Date fields from JSON
const reviveDates = (s: any): any => {
  const parseDate = (v: any) => (typeof v === 'string' || typeof v === 'number') ? new Date(v) : v;
  return {
    ...s,
    projects: (s.projects || []).map((p: any) => ({
      ...p,
      submittedAt: p.submittedAt ? parseDate(p.submittedAt) : undefined,
    })),
    attendees: (s.attendees || []).map((a: any) => ({
      ...a,
      registeredAt: a.registeredAt ? parseDate(a.registeredAt) : undefined,
    })),
    challenges: (s.challenges || []).map((c: any) => ({
      ...c,
      // Respect the stored value; do not overwrite with hardcoded defaults
      getStartedUrl: c.getStartedUrl || undefined
    })),
    faq: s.faq || [],
    phase: s.phase || { votingOpen: false, announce: false },
    winners: s.winners || { challenge: {}, bounty: {} },
  } as HackathonState;
};

// Try to synchronously read currentUser from localStorage so auth persists across refresh instantly
const readSessionUser = (): User | null => {
  try {
    const saved = localStorage.getItem('hackathon-session');
    if (!saved) return null;
    const session = JSON.parse(saved);
    const age = Date.now() - new Date(session.timestamp).getTime();
    if (session.currentUser && age < 24 * 60 * 60 * 1000) return session.currentUser as User;
  } catch {}
  return null;
};

// Initial empty state; hydrated from Neon/localStorage (or one-time seed migration)
const initialState: HackathonState = {
  currentUser: readSessionUser(),
  projects: [],
  challenges: [],
  bounties: [],
  goodies: [],
  attendees: [],
  faq: [],
  phase: { votingOpen: false, announce: false },
  winners: { challenge: {}, bounty: {} },
  loading: false,
  error: null,
};

// Reducer
const hackathonReducer = (state: HackathonState, action: HackathonAction): HackathonState => {
  switch (action.type) {
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };

    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };

    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };

    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id
            ? { ...project, ...action.payload.updates }
            : project
        )
      };

    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload)
      };

    case 'SET_CHALLENGES':
      return { ...state, challenges: action.payload };

    case 'SET_BOUNTIES':
      return { ...state, bounties: action.payload };

    case 'ADD_BOUNTY':
      return { ...state, bounties: [...state.bounties, action.payload] };

    case 'UPDATE_BOUNTY':
      return {
        ...state,
        bounties: state.bounties.map(bounty =>
          bounty.id === action.payload.id
            ? { ...bounty, ...action.payload.updates }
            : bounty
        )
      };

    case 'DELETE_BOUNTY':
      return {
        ...state,
        bounties: state.bounties.filter(bounty => bounty.id !== action.payload)
      };

    case 'SET_GOODIES':
      return { ...state, goodies: action.payload };

    case 'ADD_GOODIE':
      return { ...state, goodies: [...state.goodies, action.payload] };

    case 'UPDATE_GOODIE':
      return {
        ...state,
        goodies: state.goodies.map(goodie =>
          goodie.id === action.payload.id
            ? { ...goodie, ...action.payload.updates }
            : goodie
        )
      };

    case 'DELETE_GOODIE':
      return {
        ...state,
        goodies: state.goodies.filter(goodie => goodie.id !== action.payload)
      };

    case 'ADD_CHALLENGE':
      return { ...state, challenges: [...state.challenges, action.payload] };

    case 'UPDATE_CHALLENGE':
      return {
        ...state,
        challenges: state.challenges.map(challenge =>
          challenge.id === action.payload.id
            ? { ...challenge, ...action.payload.updates }
            : challenge
        )
      };

    case 'DELETE_CHALLENGE':
      return {
        ...state,
        challenges: state.challenges.filter(challenge => challenge.id !== action.payload)
      };

    case 'SET_ATTENDEES':
      return { ...state, attendees: action.payload };

    case 'SET_FAQ':
      return { ...state, faq: action.payload };

    case 'UPSERT_FAQ': {
      const next = [...(state.faq || [])];
      const idx = next.findIndex(f => f.id === action.payload.id);
      if (idx >= 0) next[idx] = action.payload; else next.push(action.payload);
      return { ...state, faq: next };
    }

    case 'DELETE_FAQ':
      return { ...state, faq: (state.faq || []).filter(f => f.id !== action.payload) };

    case 'SET_PHASE':
      return { ...state, phase: action.payload };

    case 'SET_WINNER_CHALLENGE': {
      const next = {
        ...(state.winners || { challenge: {}, bounty: {} }),
        challenge: { ...(state.winners?.challenge || {}), [action.payload.type]: action.payload.projectId },
      };
      return { ...state, winners: next };
    }

    case 'SET_WINNER_BOUNTY': {
      const next = {
        ...(state.winners || { challenge: {}, bounty: {} }),
        bounty: { ...(state.winners?.bounty || {}), [action.payload.bountyId]: action.payload.projectId },
      };
      return { ...state, winners: next };
    }

    case 'ADD_ATTENDEE':
      return { ...state, attendees: [...state.attendees, action.payload] };

    case 'UPDATE_ATTENDEE':
      return {
        ...state,
        attendees: state.attendees.map(attendee =>
          attendee.id === action.payload.id
            ? { ...attendee, ...action.payload.updates }
            : attendee
        )
      };

    case 'DELETE_ATTENDEE':
      return {
        ...state,
        attendees: state.attendees.filter(attendee => attendee.id !== action.payload)
      };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      return state;
  }
};

// Context
interface HackathonContextType {
  state: HackathonState;
  dispatch: React.Dispatch<HackathonAction>;
  // API-like functions
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<{ success: boolean }>;
  createProject: (project: Omit<Project, 'id'>) => Promise<{ success: boolean; id: string }>;
  deleteProject: (id: string) => Promise<{ success: boolean }>;
  updateAttendee: (id: string, updates: Partial<Attendee>) => Promise<{ success: boolean }>;
  checkInAttendee: (email: string) => Promise<{ success: boolean }>;
  updateBounty: (id: string, updates: Partial<Bounty>) => Promise<{ success: boolean }>;
  createBounty: (bounty: Omit<Bounty, 'id'>) => Promise<{ success: boolean; id: string }>;
  claimBounty: (bountyId: string, userEmail: string) => Promise<{ success: boolean }>;
  createChallenge: (challenge: Omit<Challenge, 'id'>) => Promise<{ success: boolean; id: string }>;
  updateChallenge: (id: string, updates: Partial<Challenge>) => Promise<{ success: boolean }>;
  deleteChallenge: (id: string) => Promise<{ success: boolean }>;
  createGoodie: (goodie: Omit<Goodie, 'id'>) => Promise<{ success: boolean; id: string }>;
  updateGoodie: (id: string, updates: Partial<Goodie>) => Promise<{ success: boolean }>;
  deleteGoodie: (id: string) => Promise<{ success: boolean }>;
  // Team management
  assignAttendeeToTeam: (attendeeId: string, teamName: string, projectId?: string) => Promise<{ success: boolean }>;
  removeAttendeeFromTeam: (attendeeId: string) => Promise<{ success: boolean }>;
  updateAttendeeTeamStatus: (attendeeId: string, status: TeamStatus) => Promise<{ success: boolean }>;
  // Profile management
  updateUserProfile: (
    userId: string,
    updates: { profile?: Partial<User['profile']>; name?: string; firstName?: string; lastName?: string }
  ) => Promise<{ success: boolean }>;
  // Project collaboration
  addProjectCollaborator: (projectId: string, userId: string) => Promise<{ success: boolean }>;
  removeProjectCollaborator: (projectId: string, userId: string) => Promise<{ success: boolean }>;
  // Bounty templates
  createProjectFromBounty: (bountyId: string, teamData: { name: string; members: string[] }) => Promise<{ success: boolean; projectId: string }>;
  // Session management
  saveSession: () => void;
  loadSession: () => void;
  clearSession: () => void;
  // File-based persistence (JSON)
  exportStateJson: () => string;
  downloadStateJson: () => void;
  importStateJson: (json: string) => Promise<{ success: boolean }>;
  setPhase: (next: { votingOpen: boolean; announce: boolean }) => Promise<{ success: boolean }>;
  pickChallengeWinner: (type: ChallengeType, projectId: string) => Promise<{ success: boolean }>;
  pickBountyWinner: (bountyId: string, projectId: string) => Promise<{ success: boolean }>;
  // FAQ management
  setFaq: (items: FaqItem[]) => Promise<{ success: boolean }>;
  upsertFaqItem: (item: Omit<FaqItem, 'id'> & Partial<Pick<FaqItem, 'id'>>) => Promise<{ success: boolean; id: string }>;
  deleteFaqItem: (id: string) => Promise<{ success: boolean }>;
}

const HackathonContext = createContext<HackathonContextType | undefined>(undefined);

// Provider component
export const HackathonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(hackathonReducer, initialState);
  const [hydrated, setHydrated] = React.useState(false);
  const fallbackTriedRef = React.useRef(false);

  // Helper: robustly fetch a JSON asset; ensure content-type and valid JSON
  const fetchJsonAsset = async (urls: string[]): Promise<any | null> => {
    for (const url of urls) {
      try {
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) continue;
        const ct = res.headers.get('content-type') || '';
        const text = await res.text();
        // Vite may return index.html for unknown paths; guard by content-type or leading brace
        const looksJson = ct.includes('application/json') || (/^\s*[\[{]/.test(text) && !/^\s*<!doctype/i.test(text));
        if (!looksJson) continue;
        try {
          return JSON.parse(text);
        } catch {
          continue;
        }
      } catch {
        // try next
      }
    }
    return null;
  };

  // Session management (auth + minimal flags only)
  const saveSession = () => {
    try {
      const minimal = {
        currentUser: state.currentUser ? {
          ...state.currentUser,
          // Persist only safe, minimal fields for auth/UX continuity
          profile: state.currentUser.profile || undefined,
          onboardingCompleted: state.currentUser.onboardingCompleted || false,
        } : null,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('hackathon-session', JSON.stringify(minimal));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  const loadSession = () => {
    try {
      const saved = localStorage.getItem('hackathon-session');
      if (saved) {
        const session = JSON.parse(saved);
        // Check if session is less than 24 hours old
        const sessionAge = Date.now() - new Date(session.timestamp).getTime();
        if (sessionAge < 24 * 60 * 60 * 1000) {
          // Only restore auth/minimal user context. All core data remains from state.json
          dispatch({ type: 'SET_CURRENT_USER', payload: session.currentUser });
        } else {
          clearSession();
        }
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      clearSession();
    }
  };

  const clearSession = () => {
    try {
      localStorage.removeItem('hackathon-session');
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  };

  // File-based persistence (JSON)
  const exportStateJson = (): string => {
    // Exclude currentUser to keep auth local-only
    const payload = {
      projects: state.projects.map(p => ({ ...p, submittedAt: p.submittedAt ? p.submittedAt.toISOString() : undefined })),
      challenges: state.challenges,
      bounties: state.bounties,
      goodies: state.goodies,
      attendees: state.attendees.map(a => ({ ...a, registeredAt: a.registeredAt ? a.registeredAt.toISOString() : undefined })),
      faq: state.faq || [],
      phase: state.phase || { votingOpen: false, announce: false },
      winners: state.winners || { challenge: {}, bounty: {} },
      loading: false,
      error: null,
    } as const;
    return JSON.stringify(payload, null, 2);
  };

  const downloadStateJson = () => {
    try {
      const data = exportStateJson();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'state.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to download state JSON', e);
    }
  };

  const importStateJson = async (json: string): Promise<{ success: boolean }> => {
    try {
      const parsed = JSON.parse(json);
      const revived = reviveDates(parsed);
      // Do not set currentUser from imports; auth is session/local-only
      dispatch({ type: 'SET_PROJECTS', payload: revived.projects });
      dispatch({ type: 'SET_CHALLENGES', payload: revived.challenges });
      dispatch({ type: 'SET_BOUNTIES', payload: revived.bounties });
      dispatch({ type: 'SET_GOODIES', payload: revived.goodies });
      dispatch({ type: 'SET_ATTENDEES', payload: revived.attendees });
      dispatch({ type: 'SET_FAQ', payload: revived.faq || [] });
      dispatch({ type: 'SET_PHASE', payload: revived.phase });
      dispatch({ type: 'SET_WINNER_CHALLENGE', payload: { type: 'featherless', projectId: revived.winners?.challenge?.featherless } });
      dispatch({ type: 'SET_WINNER_CHALLENGE', payload: { type: 'activepieces', projectId: revived.winners?.challenge?.activepieces } });
      dispatch({ type: 'SET_WINNER_CHALLENGE', payload: { type: 'aibuilders', projectId: revived.winners?.challenge?.aibuilders } });
      Object.keys(revived.winners?.bounty || {}).forEach(bountyId => {
        dispatch({ type: 'SET_WINNER_BOUNTY', payload: { bountyId, projectId: revived.winners?.bounty[bountyId] } });
      });
      // Do NOT touch auth session here; preserve existing currentUser across data imports
      return { success: true };
    } catch (e) {
      console.error('Failed to import state JSON', e);
      return { success: false };
    }
  };

  // Load session on mount and hydrate from Neon or localStorage.
  // If none found, one-time migrate from assets/state.json, then persist to Neon and memoize migration flag.
  React.useEffect(() => {
    loadSession();
    (async () => {
      try {
        // Prefer Supabase for bounties/challenges/goodies if configured
        const syncFromSupabase = async () => {
          if (!hasSupabase()) return;
          // Read challenges
          try {
            const { data: ch, error: chErr } = await supabase.from('challenges').select('*');
            if (!chErr && Array.isArray(ch)) {
              dispatch({ type: 'SET_CHALLENGES', payload: ch as any });
            }
          } catch {}
          // Read bounties
          try {
            const { data: bo, error: boErr } = await supabase.from('bounties').select('*');
            if (!boErr && Array.isArray(bo)) {
              dispatch({ type: 'SET_BOUNTIES', payload: bo as any });
            }
          } catch {}
          // Read goodies
          try {
            const { data: go, error: goErr } = await supabase.from('goodies').select('*');
            if (!goErr && Array.isArray(go)) {
              dispatch({ type: 'SET_GOODIES', payload: go as any });
            }
          } catch {}
        };
        await syncFromSupabase();
        // 1) Try Neon
        if (hasNeon()) {
          const dbState = await loadStateFromDB();
          if (dbState) {
            await importStateJson(JSON.stringify(dbState));
            setHydrated(true);
            // After hydration from Neon, prefer Supabase data for sponsor-managed entities if present
            await syncFromSupabase();
            return;
          }
        }
        // 2) Try localStorage snapshot
        const persisted = localStorage.getItem('hackathon-persist');
        if (persisted) {
          await importStateJson(persisted);
          // Also persist to Neon if configured and empty
          if (hasNeon()) {
            try { await saveStateToDB(JSON.parse(persisted)); } catch {}
          }
          setHydrated(true);
          // After hydration from local snapshot, prefer Supabase data for sponsor-managed entities if present
          await syncFromSupabase();
          return;
        }
        // 3) One-time migration from assets/state.json (or assets/backup.json) → import + save to Neon and LS
        const migrated = localStorage.getItem('hackathon-migration-done');
        if (!migrated) {
          const stateUrl = new URL('../assets/state.json', import.meta.url).href;
          const backupUrl = new URL('../assets/backup.json', import.meta.url).href;
          const asset = await fetchJsonAsset([stateUrl, backupUrl]);
          if (asset) {
            const json = JSON.stringify(asset);
            await importStateJson(json);
            localStorage.setItem('hackathon-persist', json);
            if (hasNeon()) {
              try { await saveStateToDB(asset); } catch {}
            }
            localStorage.setItem('hackathon-migration-done', 'true');
            setHydrated(true);
            return;
          }
        }
      } catch (e) {
        console.warn('Hydration failed:', e);
      }
      // No sources found or failed — mark as hydrated to allow persistence of current in-memory state
      setHydrated(true);
    })();
  }, []);

  // Save session and persist state on changes (Neon if configured, else localStorage)
  const persistTimer = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (!hydrated) return; // Avoid overwriting persisted data before hydration completes
    if (state.currentUser) {
      saveSession();
    }
    const persist = async () => {
      try {
        const json = exportStateJson();
        if (hasNeon()) {
          await saveStateToDB(JSON.parse(json));
        } else {
          localStorage.setItem('hackathon-persist', json);
        }
      } catch {}
    };
    if (persistTimer.current) window.clearTimeout(persistTimer.current);
    // Debounce writes to avoid excessive calls
    persistTimer.current = window.setTimeout(() => { persist(); }, 500) as unknown as number;
    return () => {
      if (persistTimer.current) window.clearTimeout(persistTimer.current);
    };
  }, [hydrated, state.currentUser, state.projects, state.challenges, state.bounties, state.goodies, state.attendees, state.faq, state.phase, state.winners]);

  // Post-hydration safety net: if attendees are empty, attempt a one-time fallback import
  React.useEffect(() => {
    (async () => {
      if (!hydrated) return;
      if (fallbackTriedRef.current) return;
      if ((state.attendees || []).length > 0) return;
      // Try localStorage snapshot if exists and non-empty
      try {
        const persisted = localStorage.getItem('hackathon-persist');
        if (persisted) {
          const parsed = JSON.parse(persisted);
          if (Array.isArray(parsed.attendees) && parsed.attendees.length > 0) {
            await importStateJson(persisted);
            fallbackTriedRef.current = true;
            return;
          }
        }
      } catch {}
      // Try assets/state.json then backup.json using robust JSON detection
      const stateUrl = new URL('../assets/state.json', import.meta.url).href;
      const backupUrl = new URL('../assets/backup.json', import.meta.url).href;
      const asset = await fetchJsonAsset([stateUrl, backupUrl]);
      if (asset) {
        const json = JSON.stringify(asset);
        await importStateJson(json);
        localStorage.setItem('hackathon-persist', json);
        fallbackTriedRef.current = true;
        return;
      }
      fallbackTriedRef.current = true;
    })();
  }, [hydrated, state.attendees]);

  // Ensure auth is stable at app level: if currentUser becomes null but a valid session exists, restore it.
  React.useEffect(() => {
    if (!state.currentUser) {
      try {
        const saved = localStorage.getItem('hackathon-session');
        if (saved) {
          const session = JSON.parse(saved);
          const age = Date.now() - new Date(session.timestamp).getTime();
          if (session.currentUser && age < 24 * 60 * 60 * 1000) {
            dispatch({ type: 'SET_CURRENT_USER', payload: session.currentUser });
          }
        }
      } catch {}
    }
  }, [state.currentUser]);

  // Mock API functions
  const login = async (user: User): Promise<void> => {
    // Determine type from attendees by email if possible
    const a = state.attendees.find(att => att.email === user.email);
    const team = a?.team?.toLowerCase() || '';
    let resolvedType: UserType = user.type || 'hacker';
    if (team.includes('sponsor')) {
      resolvedType = 'sponsor';
    } else if (team === 'host' || team === 'hosts') {
      resolvedType = 'host';
    }
    const current: User = { ...user, type: resolvedType };
    dispatch({ type: 'SET_CURRENT_USER', payload: current });
    saveSession();
  };
  const logout = async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    await new Promise(resolve => setTimeout(resolve, 300));
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
    clearSession();
    dispatch({ type: 'SET_LOADING', payload: false });
  };

  const updateProject = async (id: string, updates: Partial<Project>): Promise<{ success: boolean }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      // Compute the next project data to sync attendees
      const existing = state.projects.find(p => p.id === id);
      const nextProject: Project | null = existing ? ({ ...existing, ...updates } as Project) : null;
      dispatch({ type: 'UPDATE_PROJECT', payload: { id, updates } });
      // Sync attendees' project assignments
      if (nextProject) {
        const teamEmails = new Set((nextProject.teamMembers || []).map(e => e.toLowerCase()));
        // Assign projectId to attendees on the team
        state.attendees.forEach(att => {
          const isOnTeam = teamEmails.has(att.email.toLowerCase());
          const wasOnThis = att.projectId === nextProject.id;
          if (isOnTeam && !wasOnThis) {
            dispatch({ type: 'UPDATE_ATTENDEE', payload: { id: att.id, updates: { projectId: nextProject.id, team: nextProject.teamName || nextProject.name, teamStatus: 'hasTeam' } } });
          } else if (!isOnTeam && wasOnThis) {
            dispatch({ type: 'UPDATE_ATTENDEE', payload: { id: att.id, updates: { projectId: undefined, team: undefined, teamStatus: att.teamStatus === 'hasTeam' ? 'solo' : att.teamStatus } } });
          }
        });
      }
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update project' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false };
    }
  };

  const createProject = async (project: Omit<Project, 'id'>): Promise<{ success: boolean; id: string }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      const newProject: Project = {
        ...project,
        id: `proj-${Date.now()}`
      };
      dispatch({ type: 'ADD_PROJECT', payload: newProject });
      // Sync attendees' project assignments based on teamMembers
      const teamEmails = new Set((newProject.teamMembers || []).map(e => e.toLowerCase()));
      state.attendees.forEach(att => {
        if (teamEmails.has(att.email.toLowerCase())) {
          dispatch({ type: 'UPDATE_ATTENDEE', payload: { id: att.id, updates: { projectId: newProject.id, team: newProject.teamName || newProject.name, teamStatus: 'hasTeam' } } });
        }
      });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true, id: newProject.id };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create project' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, id: '' };
    }
  };

  const deleteProject = async (id: string): Promise<{ success: boolean }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      dispatch({ type: 'DELETE_PROJECT', payload: id });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete project' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false };
    }
  };

  const updateAttendee = async (id: string, updates: Partial<Attendee>): Promise<{ success: boolean }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      dispatch({ type: 'UPDATE_ATTENDEE', payload: { id, updates } });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update attendee' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false };
    }
  };

  const checkInAttendee = async (email: string): Promise<{ success: boolean }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Simulate Luma API call to verify email
      await new Promise(resolve => setTimeout(resolve, 800));

      const attendee = state.attendees.find(a => a.email === email);
      if (attendee) {
        dispatch({ type: 'UPDATE_ATTENDEE', payload: { id: attendee.id, updates: { checkedIn: true } } });
      }

      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to check in attendee' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false };
    }
  };

  const updateBounty = async (id: string, updates: Partial<Bounty>): Promise<{ success: boolean }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      if (hasSupabase()) {
        const { error } = await supabase.from('bounties').update(updates as any).eq('id', id);
        if (error) throw error;
      } else {
        await new Promise(resolve => setTimeout(resolve, 400));
      }
      dispatch({ type: 'UPDATE_BOUNTY', payload: { id, updates } });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update bounty' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false };
    }
  };

  const createBounty = async (bounty: Omit<Bounty, 'id'>): Promise<{ success: boolean; id: string }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      let newId = `bounty-${Date.now()}`;
      if (hasSupabase()) {
        const insert = { ...bounty } as any;
        const { data, error } = await supabase.from('bounties').insert(insert).select('id').single();
        if (error) throw error;
        newId = (data as any)?.id || newId;
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      const newBounty: Bounty = { ...(bounty as any), id: newId } as Bounty;
      dispatch({ type: 'ADD_BOUNTY', payload: newBounty });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true, id: newBounty.id };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create bounty' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, id: '' };
    }
  };

  const claimBounty = async (bountyId: string, userEmail: string): Promise<{ success: boolean }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      dispatch({ type: 'UPDATE_BOUNTY', payload: { 
        id: bountyId, 
        updates: { status: 'claimed', claimedBy: userEmail } 
      }});
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to claim bounty' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false };
    }
  };

  const createChallenge = async (challenge: Omit<Challenge, 'id'>): Promise<{ success: boolean; id: string }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      let newId = `challenge-${Date.now()}`;
      if (hasSupabase()) {
        const insert = { ...challenge } as any;
        const { data, error } = await supabase.from('challenges').insert(insert).select('id').single();
        if (error) throw error;
        newId = (data as any)?.id || newId;
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      const newChallenge: Challenge = { ...(challenge as any), id: newId } as Challenge;
      dispatch({ type: 'ADD_CHALLENGE', payload: newChallenge });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true, id: newChallenge.id };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create challenge' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, id: '' };
    }
  };

  const updateChallenge = async (id: string, updates: Partial<Challenge>): Promise<{ success: boolean }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      if (hasSupabase()) {
        const { error } = await supabase.from('challenges').update(updates as any).eq('id', id);
        if (error) throw error;
      } else {
        await new Promise(resolve => setTimeout(resolve, 400));
      }
      dispatch({ type: 'UPDATE_CHALLENGE', payload: { id, updates } });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update challenge' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false };
    }
  };

  const deleteChallenge = async (id: string): Promise<{ success: boolean }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      dispatch({ type: 'DELETE_CHALLENGE', payload: id });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete challenge' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false };
    }
  };

  const createGoodie = async (goodie: Omit<Goodie, 'id'>): Promise<{ success: boolean; id: string }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      let newId = `goodie-${Date.now()}`;
      if (hasSupabase()) {
        const insert = { ...goodie } as any;
        const { data, error } = await supabase.from('goodies').insert(insert).select('id').single();
        if (error) throw error;
        newId = (data as any)?.id || newId;
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      const newGoodie: Goodie = { ...(goodie as any), id: newId } as Goodie;
      dispatch({ type: 'ADD_GOODIE', payload: newGoodie });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true, id: newGoodie.id };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create goodie' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, id: '' };
    }
  };

  const updateGoodie = async (id: string, updates: Partial<Goodie>): Promise<{ success: boolean }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      if (hasSupabase()) {
        const { error } = await supabase.from('goodies').update(updates as any).eq('id', id);
        if (error) throw error;
      } else {
        await new Promise(resolve => setTimeout(resolve, 400));
      }
      dispatch({ type: 'UPDATE_GOODIE', payload: { id, updates } });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update goodie' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false };
    }
  };

  const deleteGoodie = async (id: string): Promise<{ success: boolean }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      dispatch({ type: 'DELETE_GOODIE', payload: id });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete goodie' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false };
    }
  };

  // Team management functions
  const assignAttendeeToTeam = async (attendeeId: string, teamName: string, projectId?: string): Promise<{ success: boolean }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      dispatch({ type: 'UPDATE_ATTENDEE', payload: { 
        id: attendeeId, 
        updates: { team: teamName, projectId, teamStatus: 'hasTeam' } 
      }});
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to assign attendee to team' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false };
    }
  };

  const removeAttendeeFromTeam = async (attendeeId: string): Promise<{ success: boolean }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      dispatch({ type: 'UPDATE_ATTENDEE', payload: { 
        id: attendeeId, 
        updates: { team: undefined, projectId: undefined, teamStatus: 'solo' } 
      }});
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove attendee from team' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false };
    }
  };

  const updateAttendeeTeamStatus = async (attendeeId: string, status: TeamStatus): Promise<{ success: boolean }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      dispatch({ type: 'UPDATE_ATTENDEE', payload: { 
        id: attendeeId, 
        updates: { teamStatus: status, wantsSolo: status === 'solo' } 
      }});
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update team status' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false };
    }
  };

  // Profile management
  const updateUserProfile = async (
    userId: string,
    updates: { profile?: Partial<User['profile']>; name?: string; firstName?: string; lastName?: string }
  ): Promise<{ success: boolean }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      // Update current user: profile, and optionally name
      const nextUser = {
        ...state.currentUser!,
        ...(updates.name ? { name: updates.name } : {}),
        profile: { ...state.currentUser?.profile, ...(updates.profile || {}) }
      };
      dispatch({ type: 'SET_CURRENT_USER', payload: nextUser });

      // Also update attendee profile and name fields if exists
      const attendee = state.attendees.find(a => a.email === state.currentUser?.email);
      if (attendee) {
        const profileUpdates = { ...attendee.profile, ...(updates.profile || {}) } as any;
        const attendeeUpdates: Partial<Attendee> = {
          ...(updates.name ? { name: updates.name } : {}),
          ...(updates.firstName ? { firstName: updates.firstName } : {}),
          ...(updates.lastName ? { lastName: updates.lastName } : {}),
          profile: profileUpdates,
        };
        if (profileUpdates.skills && Array.isArray(profileUpdates.skills)) {
          attendeeUpdates.skills = profileUpdates.skills as string[];
        }
        dispatch({ type: 'UPDATE_ATTENDEE', payload: { id: attendee.id, updates: attendeeUpdates } });
      }
      dispatch({ type: 'SET_LOADING', payload: false });
      saveSession();
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update profile' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false };
    }
  };

  // Project collaboration
  const addProjectCollaborator = async (projectId: string, userId: string): Promise<{ success: boolean }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const project = state.projects.find(p => p.id === projectId);
      if (project) {
        const collaborators = [...(project.collaborators || []), userId];
        dispatch({ type: 'UPDATE_PROJECT', payload: { 
          id: projectId, 
          updates: { collaborators } 
        }});
      }
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add collaborator' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false };
    }
  };

  const removeProjectCollaborator = async (projectId: string, userId: string): Promise<{ success: boolean }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const project = state.projects.find(p => p.id === projectId);
      if (project) {
        const collaborators = (project.collaborators || []).filter(id => id !== userId);
        dispatch({ type: 'UPDATE_PROJECT', payload: { 
          id: projectId, 
          updates: { collaborators } 
        }});
      }
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove collaborator' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false };
    }
  };

  // Bounty templates
  const createProjectFromBounty = async (bountyId: string, teamData: { name: string; members: string[] }): Promise<{ success: boolean; projectId: string }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const bounty = state.bounties.find(b => b.id === bountyId);
      if (!bounty || !bounty.projectTemplate) {
        throw new Error('Bounty template not found');
      }
      
      const newProject: Project = {
        ...bounty.projectTemplate,
        id: `proj-${Date.now()}`,
        teamName: teamData.name,
        teamMembers: teamData.members,
        bountyId: bountyId,
        templateBountyId: bountyId,
        collaborators: teamData.members,
        status: 'draft',
        type: 'bounty'
      } as Project;
      
      dispatch({ type: 'ADD_PROJECT', payload: newProject });
      
      // Update bounty claimed status
      const claimedTeams = [...(bounty.claimedTeams || []), newProject.id];
      const status = claimedTeams.length >= (bounty.maxTeams || 1) ? 'claimed' : 'open';
      dispatch({ type: 'UPDATE_BOUNTY', payload: { 
        id: bountyId, 
        updates: { claimedTeams, status } 
      }});
      
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true, projectId: newProject.id };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create project from bounty' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, projectId: '' };
    }
  };

  const setPhase = async (next: { votingOpen: boolean; announce: boolean }): Promise<{ success: boolean }> => {
    dispatch({ type: 'SET_PHASE', payload: next });
    saveSession();
    return { success: true };
  };

  const pickChallengeWinner = async (type: ChallengeType, projectId: string): Promise<{ success: boolean }> => {
    dispatch({ type: 'SET_WINNER_CHALLENGE', payload: { type, projectId } });
    // Auto set announce true when all challenges have winners
    const all = (state.challenges || []).every(c => (type === c.type ? projectId : (state.winners?.challenge || {})[c.type]));
    if (all) dispatch({ type: 'SET_PHASE', payload: { ...(state.phase || { votingOpen: false, announce: false }), announce: true } });
    saveSession();
    return { success: true };
  };

  const pickBountyWinner = async (bountyId: string, projectId: string): Promise<{ success: boolean }> => {
    dispatch({ type: 'SET_WINNER_BOUNTY', payload: { bountyId, projectId } });
    saveSession();
    return { success: true };
  };

  // FAQ management
  const setFaq = async (items: FaqItem[]): Promise<{ success: boolean }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await new Promise(res => setTimeout(res, 200));
      dispatch({ type: 'SET_FAQ', payload: items });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true };
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to set FAQ' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false };
    }
  };

  const upsertFaqItem = async (item: Omit<FaqItem, 'id'> & Partial<Pick<FaqItem, 'id'>>): Promise<{ success: boolean; id: string }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await new Promise(res => setTimeout(res, 200));
      const id = item.id || `faq-${Date.now()}`;
      dispatch({ type: 'UPSERT_FAQ', payload: { id, question: item.question, answer: item.answer } as FaqItem });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true, id };
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to upsert FAQ' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, id: '' };
    }
  };

  const deleteFaqItem = async (id: string): Promise<{ success: boolean }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await new Promise(res => setTimeout(res, 200));
      dispatch({ type: 'DELETE_FAQ', payload: id });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true };
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete FAQ' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false };
    }
  };

  const contextValue: HackathonContextType = {
    state,
    dispatch,
    login,
    logout,
    updateProject,
    createProject,
    deleteProject,
    updateAttendee,
    checkInAttendee,
    updateBounty,
    createBounty,
    claimBounty,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    createGoodie,
    updateGoodie,
    deleteGoodie,
    // Team management
    assignAttendeeToTeam,
    removeAttendeeFromTeam,
    updateAttendeeTeamStatus,
    // Profile management
    updateUserProfile,
    // Project collaboration
    addProjectCollaborator,
    removeProjectCollaborator,
    // Bounty templates
    createProjectFromBounty,
    // Session management
    saveSession,
    loadSession,
    clearSession,
    // File-based persistence (JSON)
    exportStateJson,
    downloadStateJson,
    importStateJson,
    setPhase,
    pickChallengeWinner,
    pickBountyWinner,
    // FAQ
    setFaq,
    upsertFaqItem,
    deleteFaqItem,
  };

  return (
    <HackathonContext.Provider value={contextValue}>
      {children}
    </HackathonContext.Provider>
  );
};

// Custom hook
export const useHackathon = (): HackathonContextType => {
  const context = useContext(HackathonContext);
  if (context === undefined) {
    throw new Error('useHackathon must be used within a HackathonProvider');
  }
  return context;
};