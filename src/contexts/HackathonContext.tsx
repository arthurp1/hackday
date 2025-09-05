import React, { createContext, useContext, useReducer, ReactNode } from 'react';
// Seeded state file (JSON)
import seededState from './state.json';

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

export interface Goodie {
  id: string;
  sponsorId: string;
  type: GoodieType;
  title: string;
  description: string;
  details: string;
  quantity?: number;
  forEveryone: boolean;
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
*/
  profile?: {
    city?: string;
    linkedin?: string;
    twitter?: string;
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
  challengesEnrolled: ChallengeType[];
  bountyId?: string;
  submittedAt?: Date;
  status: 'draft' | 'submitted' | 'judging' | 'winner';
  description?: string;
  tags?: string[];
  collaborators?: string[]; // User IDs who can edit
  isTemplate?: boolean; // For bounty templates
  templateBountyId?: string; // Reference to original bounty
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
  skills: string[];
  teamStatus?: TeamStatus;
  profile?: {
    city?: string;
    linkedin?: string;
    twitter?: string;
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
  } as HackathonState;
};

// Initial state from JSON seed (revived)
const initialState: HackathonState = reviveDates(seededState as any);
/* Previous inline mock removed in favor of state.json */
/*
  currentUser: null,
  projects: [
    {
      id: 'proj-1',
      type: 'newProject',
      name: 'AI Code Assistant',
      teamName: 'Code Wizards',
      teamMembers: ['alice@example.com', 'bob@example.com'],
      demoUrl: 'https://demo.example.com',
      videoDemo: 'https://youtube.com/watch?v=demo123',
      slides: 'https://slides.com/code-wizards',
      challengesEnrolled: ['featherless', 'aibuilders'],
      status: 'submitted',
      description: 'An AI-powered code completion tool that helps developers write better code faster',
      submittedAt: new Date('2024-01-20T10:30:00Z')
    },
    {
      id: 'proj-2',
      type: 'bounty',
      name: 'Smart Contract Auditor',
      teamName: 'Blockchain Builders',
      teamMembers: ['charlie@example.com', 'diana@example.com', 'eve@example.com'],
      demoUrl: 'https://contract-auditor.demo.com',
      videoDemo: 'https://youtube.com/watch?v=blockchain456',
      challengesEnrolled: ['featherless'],
      bountyId: 'bounty-ap-1',
      status: 'draft',
      description: 'Automated smart contract vulnerability detection using AI'
    },
    {
      id: 'proj-3',
      type: 'existingTeam',
      name: 'Voice-Controlled IoT Hub',
      teamName: 'IoT Innovators',
      teamMembers: ['frank@example.com', 'grace@example.com'],
      demoUrl: 'https://iot-demo.example.com',
      videoDemo: 'https://youtube.com/watch?v=demo123',
      slides: 'https://slides.com/iot-innovators',
      challengesEnrolled: ['aibuilders', 'activepieces'],
      status: 'judging',
      description: 'Smart home automation with natural language voice commands',
      submittedAt: new Date('2024-01-19T14:15:00Z')
    },
    {
      id: 'proj-4',
      type: 'newProject',
      name: 'Climate Data Visualizer',
      teamName: 'Green Tech',
      teamMembers: ['henry@example.com', 'iris@example.com'],
      demoUrl: 'https://climate-viz.demo.com',
      challengesEnrolled: ['aibuilders'],
      status: 'submitted',
      description: 'Interactive climate data visualization platform for researchers',
      submittedAt: new Date('2024-01-21T09:45:00Z')
    },
    {
      id: 'proj-5',
      type: 'bounty',
      name: 'DeFi Yield Optimizer',
      teamName: 'Yield Hunters',
      teamMembers: ['jack@example.com'],
      challengesEnrolled: ['featherless'],
      bountyId: 'bounty-ab-1',
      status: 'winner',
      description: 'Automated DeFi yield farming optimization tool',
      submittedAt: new Date('2024-01-18T16:20:00Z')
    }
  ],
  challenges: [
    {
      id: 'challenge-featherless',
      type: 'featherless',
      title: 'Build a sophisticated AI app using at least 2 different genAI models on featherless.ai',
      description: 'Create an innovative application that leverages multiple AI models from Featherless.ai. Perfect for projects using LLMs.',
      prizes: [
        { type: 'cash', amount: 50, currency: '€', details: '€50 cash prize' },
        { type: 'free_plan', details: 'Free Featherless.ai plan' }
      ],
      requirements: [
        'Use at least 2 different genAI models on featherless.ai',
        'Needs to be a new project or young startup',
        'Working demo required'
      ],
      sponsorId: 'sponsor-featherless',
      tags: ['AI', 'LLM', 'Machine Learning', 'Startup']
    },
    {
      id: 'challenge-activepieces',
      type: 'activepieces',
      title: 'Build a pragmatic app usable for AI founders using ActivePieces.com',
      description: 'Create practical automation tools for startups and enterprises using ActivePieces.com. Perfect for projects with many integrations and workflows.',
      prizes: [
        { type: 'cash', amount: 50, currency: '€', details: '€50 cash prize' },
        { type: 'free_plan', details: 'Free ActivePieces.com plan' }
      ],
      requirements: [
        'Use ActivePieces.com for backend automation',
        'Target AI founders and startups',
        'Start & Scaleup Stack: Notion, Docs, Slack, WhatsApp + Marketing Tools',
        'Enterprise tools: Jira, Teams, Email'
      ],
      sponsorId: 'sponsor-activepieces',
      tags: ['Automation', 'Integration', 'Workflow', 'Enterprise']
    },
    {
      id: 'challenge-aibuilders',
      type: 'aibuilders',
      title: 'Coolest app that can be useful for aibuilders.club Community integrate with AI chat',
      description: 'Build an innovative tool that integrates with AI chat and serves the AI Builders community',
      prizes: [
        { type: 'cash', amount: 100, currency: '€', details: '€100 cash prize' },
        { type: 'voucher', details: 'Community recognition badge' }
      ],
      requirements: [
        'Must be useful for aibuilders.club community',
        'Integrate with AI chat functionality',
        'Innovative and creative approach',
        'Community-focused features'
      ],
      sponsorId: 'sponsor-aibuilders',
      tags: ['Community', 'AI', 'Chat', 'Innovation']
    }
  ],
  bounties: [
    // AI Builders Bounties
    {
      id: 'bounty-ab-1',
      sponsorId: 'sponsor-aibuilders',
      title: 'Event LinkedIn and Event Cover Photo Automation',
      description: 'Automate LinkedIn event posting and cover photo generation for AI Builders events',
      prizes: [
        { type: 'cash', amount: 100, currency: '€', details: '€100 cash prize' }
      ],
      requirements: ['Open source contribution', 'GitHub integration', 'LinkedIn API usage'],
      githubUrl: 'https://github.com/aibuilders/linkedin-automation',
      status: 'open',
      category: 'aibuilders',
      tags: ['LinkedIn', 'Automation', 'Social Media'],
      maxTeams: 1,
      claimedTeams: [],
      projectTemplate: {
        name: 'LinkedIn Event Automation',
        description: 'Automate LinkedIn event posting and cover photo generation',
        tags: ['LinkedIn', 'Automation', 'Events'],
        type: 'bounty'
      }
    },
    {
      id: 'bounty-ab-2',
      sponsorId: 'sponsor-aibuilders',
      title: 'AI Video Editing or Recording Setup',
      description: 'Create AI-powered video editing tools for content creators',
      prizes: [
        { type: 'cash', amount: 100, currency: '€', details: '€100 cash prize' }
      ],
      requirements: ['Video processing capabilities', 'AI integration', 'User-friendly interface'],
      githubUrl: 'https://github.com/aibuilders/video-editing',
      status: 'open',
      category: 'aibuilders',
      tags: ['Video', 'AI', 'Content Creation'],
      maxTeams: 1,
      claimedTeams: [],
      projectTemplate: {
        name: 'AI Video Editor',
        description: 'AI-powered video editing tools for content creators',
        tags: ['Video', 'AI', 'Editing'],
        type: 'bounty'
      }
    },
    {
      id: 'bounty-ab-3',
      sponsorId: 'sponsor-aibuilders',
      title: 'Matrix.org deployment and bridges',
      description: 'Deploy Matrix server with bridges for AI Builders community communication',
      prizes: [
        { type: 'cash', amount: 100, currency: '€', details: '€100 cash prize' }
      ],
      requirements: ['Matrix server deployment', 'Bridge integrations', 'Documentation'],
      githubUrl: 'https://github.com/aibuilders/matrix-deployment',
      status: 'open',
      category: 'aibuilders'
    },
    {
      id: 'bounty-ab-4',
      sponsorId: 'sponsor-aibuilders',
      title: 'OpenCollective Expense and Event automations',
      description: 'Automate expense tracking and event management for OpenCollective',
      prizes: [
        { type: 'cash', amount: 100, currency: '€', details: '€100 cash prize' }
      ],
      requirements: ['OpenCollective API integration', 'Expense automation', 'Event management'],
      githubUrl: 'https://github.com/aibuilders/opencollective-automation',
      status: 'open',
      category: 'aibuilders'
    },
    {
      id: 'bounty-ab-5',
      sponsorId: 'sponsor-aibuilders',
      title: 'Weekly Summarizer and news finder',
      description: 'AI-powered weekly summary and news aggregation for AI Builders community',
      prizes: [
        { type: 'cash', amount: 100, currency: '€', details: '€100 cash prize' }
      ],
      requirements: ['News aggregation', 'AI summarization', 'Weekly automation'],
      githubUrl: 'https://github.com/aibuilders/weekly-summarizer',
      status: 'open',
      category: 'aibuilders'
    },
    {
      id: 'bounty-ab-6',
      sponsorId: 'sponsor-aibuilders',
      title: 'AI Builder LinkTree, Sink redirect tracking optimization',
      description: 'Optimize link tracking and redirect system for AI Builders community',
      prizes: [
        { type: 'cash', amount: 100, currency: '€', details: '€100 cash prize' }
      ],
      requirements: ['Link tracking system', 'Analytics integration', 'Performance optimization'],
      githubUrl: 'https://github.com/aibuilders/linktree-optimization',
      status: 'open',
      category: 'aibuilders'
    },
    {
      id: 'bounty-ab-7',
      sponsorId: 'sponsor-aibuilders',
      title: 'Windows VPS - Setup LinkedIn scraper free alternative',
      description: 'Create free alternative to LinkedIn scraping tools on Windows VPS',
      prizes: [
        { type: 'cash', amount: 100, currency: '€', details: '€100 cash prize' }
      ],
      requirements: ['Windows VPS setup', 'LinkedIn data extraction', 'Free alternative solution'],
      githubUrl: 'https://github.com/aibuilders/linkedin-scraper',
      status: 'open',
      category: 'aibuilders'
    },
    // ActivePieces Bounties
    {
      id: 'bounty-ap-1',
      sponsorId: 'sponsor-activepieces',
      title: 'Microsoft Teams Integration',
      description: 'Build Microsoft Teams integration for ActivePieces platform',
      prizes: [
        { type: 'cash', amount: 100, currency: '$', details: '$100 cash prize' }
      ],
      requirements: ['Teams API integration', 'ActivePieces connector', 'Documentation'],
      githubUrl: 'https://github.com/activepieces/activepieces/issues/teams',
      status: 'open',
      category: 'activepieces'
    },
    {
      id: 'bounty-ap-2',
      sponsorId: 'sponsor-activepieces',
      title: 'Microsoft Outlook Integration',
      description: 'Build Microsoft Outlook integration for ActivePieces platform',
      prizes: [
        { type: 'cash', amount: 80, currency: '$', details: '$80 cash prize' }
      ],
      requirements: ['Outlook API integration', 'Email automation', 'Calendar sync'],
      githubUrl: 'https://github.com/activepieces/activepieces/issues/outlook',
      status: 'open',
      category: 'activepieces'
    },
    {
      id: 'bounty-ap-3',
      sponsorId: 'sponsor-activepieces',
      title: 'Wonderchat Integration',
      description: 'Build Wonderchat integration for ActivePieces platform',
      prizes: [
        { type: 'cash', amount: 30, currency: '$', details: '$30 cash prize' }
      ],
      requirements: ['Wonderchat API integration', 'Chat automation', 'Webhook support'],
      githubUrl: 'https://github.com/activepieces/activepieces/issues/wonderchat',
      status: 'open',
      category: 'activepieces'
    },
    {
      id: 'bounty-ap-4',
      sponsorId: 'sponsor-activepieces',
      title: 'TextCortex AI Integration',
      description: 'Build TextCortex AI integration for ActivePieces platform',
      prizes: [
        { type: 'cash', amount: 50, currency: '$', details: '$50 cash prize' }
      ],
      requirements: ['TextCortex API integration', 'AI text generation', 'Content automation'],
      githubUrl: 'https://github.com/activepieces/activepieces/issues/textcortex',
      status: 'open',
      category: 'activepieces'
    },
    {
      id: 'bounty-ap-5',
      sponsorId: 'sponsor-activepieces',
      title: 'Toggl Track Integration',
      description: 'Build Toggl Track integration for ActivePieces platform',
      prizes: [
        { type: 'cash', amount: 100, currency: '$', details: '$100 cash prize' }
      ],
      requirements: ['Toggl API integration', 'Time tracking automation', 'Project sync'],
      githubUrl: 'https://github.com/activepieces/activepieces/issues/toggl',
      status: 'claimed',
      claimedBy: 'charlie@example.com',
      category: 'activepieces'
    }
  ],
  goodies: [
    {
      id: 'goodie-1',
      sponsorId: 'sponsor-featherless',
      type: 'free_trial',
      title: 'Featherless AI Free Trial',
      description: '3-month free trial of Featherless AI platform',
      details: 'Access to all LLM models with 100k tokens/month',
      forEveryone: true
    },
    {
      id: 'goodie-2',
      sponsorId: 'sponsor-activepieces',
      type: 'coupon',
      title: 'ActivePieces Discount',
      description: '50% off ActivePieces Pro plan for 6 months',
      details: 'Coupon code: HACKATHON50',
      forEveryone: true
    },
    {
      id: 'goodie-3',
      sponsorId: 'sponsor-aibuilders',
      type: 'swag',
      title: 'AI Builders Sticker Pack',
      description: 'Exclusive AI Builders community stickers',
      details: 'Limited edition holographic stickers',
      quantity: 100,
      forEveryone: false
    },
    {
      id: 'goodie-4',
      sponsorId: 'sponsor-aibuilders',
      type: 'shirt_pickup',
      title: 'AI Builders T-Shirt',
      description: 'Official AI Builders community t-shirt',
      details: 'Available in S, M, L, XL - pickup at event',
      quantity: 50,
      forEveryone: false
    }
  ],
  attendees: [
    {
      id: 'att-1',
      name: 'Alice Johnson',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice@example.com',
      checkedIn: true,
      registeredAt: new Date('2024-01-15'),
      team: 'Code Wizards',
      projectId: 'proj-1',
      wantsSolo: false,
      skills: ['React', 'Python', 'AI/ML', 'TypeScript']
    },
    {
      id: 'att-2',
      name: 'Bob Smith',
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob@example.com',
      checkedIn: true,
      registeredAt: new Date('2024-01-16'),
      team: 'Code Wizards',
      projectId: 'proj-1',
      wantsSolo: false,
      skills: ['Node.js', 'TypeScript', 'DevOps', 'Docker'],
      teamStatus: 'hasTeam',
      profile: {
        city: 'Amsterdam',
        linkedin: 'https://linkedin.com/in/bobsmith',
        otherProjects: ['E-commerce Platform', 'Chat Bot'],
        bio: 'Full-stack developer passionate about AI'
      }
    },
    {
      id: 'att-3',
      name: 'Charlie Brown',
      firstName: 'Charlie',
      lastName: 'Brown',
      email: 'charlie@example.com',
      checkedIn: false,
      registeredAt: new Date('2024-01-17'),
      team: 'Blockchain Builders',
      projectId: 'proj-2',
      wantsSolo: false,
      skills: ['Solidity', 'Web3', 'Security', 'Rust']
    },
    {
      id: 'att-4',
      name: 'Diana Prince',
      firstName: 'Diana',
      lastName: 'Prince',
      email: 'diana@example.com',
      checkedIn: true,
      registeredAt: new Date('2024-01-18'),
      team: 'Blockchain Builders',
      projectId: 'proj-2',
      wantsSolo: false,
      skills: ['Smart Contracts', 'DeFi', 'JavaScript']
    },
    {
      id: 'att-5',
      name: 'Eve Wilson',
      firstName: 'Eve',
      lastName: 'Wilson',
      email: 'eve@example.com',
      checkedIn: false,
      registeredAt: new Date('2024-01-19'),
      team: 'Blockchain Builders',
      projectId: 'proj-2',
      wantsSolo: false,
      skills: ['Cryptography', 'Blockchain', 'Go']
    },
    {
      id: 'att-6',
      name: 'Frank Miller',
      firstName: 'Frank',
      lastName: 'Miller',
      email: 'frank@example.com',
      checkedIn: true,
      registeredAt: new Date('2024-01-20'),
      team: 'IoT Innovators',
      projectId: 'proj-3',
      wantsSolo: false,
      skills: ['IoT', 'Hardware', 'C++', 'Arduino']
    },
    {
      id: 'att-7',
      name: 'Grace Lee',
      firstName: 'Grace',
      lastName: 'Lee',
      email: 'grace@example.com',
      checkedIn: true,
      registeredAt: new Date('2024-01-21'),
      team: 'IoT Innovators',
      projectId: 'proj-3',
      wantsSolo: false,
      skills: ['Embedded Systems', 'Python', 'Sensors']
    },
    {
      id: 'att-8',
      name: 'Henry Davis',
      firstName: 'Henry',
      lastName: 'Davis',
      email: 'henry@example.com',
      checkedIn: true,
      registeredAt: new Date('2024-01-22'),
      team: 'Green Tech',
      projectId: 'proj-4',
      wantsSolo: false,
      skills: ['Data Science', 'Python', 'Machine Learning', 'Visualization']
    },
    {
      id: 'att-9',
      name: 'Iris Chen',
      firstName: 'Iris',
      lastName: 'Chen',
      email: 'iris@example.com',
      checkedIn: false,
      registeredAt: new Date('2024-01-23'),
      team: 'Green Tech',
      projectId: 'proj-4',
      wantsSolo: false,
      skills: ['Frontend', 'React', 'D3.js', 'UX Design']
    },
    {
      id: 'att-10',
      name: 'Jack Thompson',
      firstName: 'Jack',
      lastName: 'Thompson',
      email: 'jack@example.com',
      checkedIn: true,
      registeredAt: new Date('2024-01-24'),
      team: 'Yield Hunters',
      projectId: 'proj-5',
      wantsSolo: false,
      skills: ['DeFi', 'Solidity', 'Web3', 'Trading']
    },
    // Add some solo attendees for testing
    {
      id: 'att-11',
      name: 'Sarah Wilson',
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'sarah@example.com',
      checkedIn: true,
      registeredAt: new Date('2024-01-25'),
      wantsSolo: undefined, // Needs confirmation
      skills: ['React', 'TypeScript', 'UI/UX']
    },
    {
      id: 'att-12',
      name: 'Mike Johnson',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike@example.com',
      checkedIn: false,
      registeredAt: new Date('2024-01-26'),
      wantsSolo: undefined, // Needs confirmation
      skills: ['Python', 'AI/ML', 'Data Science']
    },
    {
      id: 'att-13',
      name: 'Lisa Brown',
      firstName: 'Lisa',
      lastName: 'Brown',
      email: 'lisa@example.com',
      checkedIn: true,
      registeredAt: new Date('2024-01-27'),
      wantsSolo: true, // Confirmed solo
      skills: ['Backend', 'Node.js', 'Databases']
    },
    // Add sponsor users as attendees
    {
      id: 'att-sponsor-1',
      name: 'Darin (Featherless.ai)',
      firstName: 'Darin',
      lastName: '(Featherless.ai)',
      email: 'darin@featherless.ai',
      checkedIn: true,
      registeredAt: new Date('2024-01-10'),
      team: 'Sponsors',
      projectId: undefined,
      wantsSolo: false,
      skills: ['AI/ML', 'LLM', 'API', 'Hosting']
    },
    {
      id: 'att-sponsor-2',
      name: 'Kareem (ActivePieces.com)',
      firstName: 'Kareem',
      lastName: '(ActivePieces.com)',
      email: 'kareem@activepieces.com',
      checkedIn: true,
      registeredAt: new Date('2024-01-10'),
      team: 'Sponsors',
      projectId: undefined,
      wantsSolo: false,
      skills: ['Automation', 'Integrations', 'Workflow', 'Low-code']
    },
    {
      id: 'att-sponsor-3',
      name: 'Arthur (AIBuilders.com)',
      firstName: 'Arthur',
      lastName: '(AIBuilders.com)',
      email: 'arthur@aibuilders.club',
      checkedIn: true,
      registeredAt: new Date('2024-01-10'),
      team: 'Sponsors',
      projectId: undefined,
      wantsSolo: false,
      skills: ['Community', 'AI', 'Networking', 'Events']
    }
  ],
  loading: false,
  error: null
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
}

const HackathonContext = createContext<HackathonContextType | undefined>(undefined);

// Provider component
export const HackathonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(hackathonReducer, initialState);

  // Session management
  const saveSession = () => {
    try {
      localStorage.setItem('hackathon-session', JSON.stringify({
        currentUser: state.currentUser,
        projects: state.projects,
        challenges: state.challenges,
        bounties: state.bounties,
        goodies: state.goodies,
        attendees: state.attendees,
        timestamp: new Date().toISOString()
      }));
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
          dispatch({ type: 'SET_CURRENT_USER', payload: session.currentUser });
          dispatch({ type: 'SET_PROJECTS', payload: session.projects });
          if (session.challenges) {
            dispatch({ type: 'SET_CHALLENGES', payload: session.challenges });
          }
          dispatch({ type: 'SET_BOUNTIES', payload: session.bounties });
          if (session.goodies) {
            dispatch({ type: 'SET_GOODIES', payload: session.goodies });
          }
          dispatch({ type: 'SET_ATTENDEES', payload: session.attendees });
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
    const payload = {
      ...state,
      // Convert Dates to ISO strings for JSON
      projects: state.projects.map(p => ({ ...p, submittedAt: p.submittedAt ? p.submittedAt.toISOString() : undefined })),
      attendees: state.attendees.map(a => ({ ...a, registeredAt: a.registeredAt ? a.registeredAt.toISOString() : undefined })),
    };
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
      // Apply wholesale by dispatching sets
      dispatch({ type: 'SET_CURRENT_USER', payload: revived.currentUser });
      dispatch({ type: 'SET_PROJECTS', payload: revived.projects });
      dispatch({ type: 'SET_CHALLENGES', payload: revived.challenges });
      dispatch({ type: 'SET_BOUNTIES', payload: revived.bounties });
      dispatch({ type: 'SET_GOODIES', payload: revived.goodies });
      dispatch({ type: 'SET_ATTENDEES', payload: revived.attendees });
      // Save to session for persistence
      saveSession();
      return { success: true };
    } catch (e) {
      console.error('Failed to import state JSON', e);
      return { success: false };
    }
  };

  const loadInitialStateFromJson = async (): Promise<{ success: boolean }> => {
    try {
      const response = await fetch('state.json');
      if (response.ok) {
        const json = await response.text();
        await importStateJson(json);
        return { success: true };
      } else {
        console.error('Failed to load initial state from JSON:', response.status);
        return { success: false };
      }
    } catch (e) {
      console.error('Failed to load initial state from JSON:', e);
      return { success: false };
    }
  };

  // Load session on mount
  React.useEffect(() => {
    loadSession();
  }, []);

  // Save session when state changes
  React.useEffect(() => {
    if (state.currentUser) {
      saveSession();
    }
  }
  )

  // Mock API functions
  const login = async (user: User): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    dispatch({ type: 'SET_CURRENT_USER', payload: user });
    dispatch({ type: 'SET_LOADING', payload: false });
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
      dispatch({ type: 'UPDATE_PROJECT', payload: { id, updates } });
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
      await new Promise(resolve => setTimeout(resolve, 400));
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
      await new Promise(resolve => setTimeout(resolve, 500));
      const newBounty: Bounty = {
        ...bounty,
        id: `bounty-${Date.now()}`
      };
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
    createChallenge: async (challenge: Omit<Challenge, 'id'>): Promise<{ success: boolean; id: string }> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newChallenge: Challenge = {
          ...challenge,
          id: `challenge-${Date.now()}`
        };
        dispatch({ type: 'ADD_CHALLENGE', payload: newChallenge });
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: true, id: newChallenge.id };
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to create challenge' });
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: false, id: '' };
      }
    },
    updateChallenge: async (id: string, updates: Partial<Challenge>): Promise<{ success: boolean }> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        await new Promise(resolve => setTimeout(resolve, 400));
        dispatch({ type: 'UPDATE_CHALLENGE', payload: { id, updates } });
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: true };
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to update challenge' });
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: false };
      }
    },
    deleteChallenge: async (id: string): Promise<{ success: boolean }> => {
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
    },
    createGoodie: async (goodie: Omit<Goodie, 'id'>): Promise<{ success: boolean; id: string }> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newGoodie: Goodie = {
          ...goodie,
          id: `goodie-${Date.now()}`
        };
        dispatch({ type: 'ADD_GOODIE', payload: newGoodie });
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: true, id: newGoodie.id };
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to create goodie' });
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: false, id: '' };
      }
    },
    updateGoodie: async (id: string, updates: Partial<Goodie>): Promise<{ success: boolean }> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        await new Promise(resolve => setTimeout(resolve, 400));
        dispatch({ type: 'UPDATE_GOODIE', payload: { id, updates } });
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: true };
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to update goodie' });
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: false };
      }
    },
    deleteGoodie: async (id: string): Promise<{ success: boolean }> => {
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
    },
    // Team management functions
    assignAttendeeToTeam: async (attendeeId: string, teamName: string, projectId?: string): Promise<{ success: boolean }> => {
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
    },
    removeAttendeeFromTeam: async (attendeeId: string): Promise<{ success: boolean }> => {
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
    },
    updateAttendeeTeamStatus: async (attendeeId: string, status: TeamStatus): Promise<{ success: boolean }> => {
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
    },
    // Profile management
    updateUserProfile: async (
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
          dispatch({ type: 'UPDATE_ATTENDEE', payload: { 
            id: attendee.id, 
            updates: { 
              profile: { ...attendee.profile, ...(updates.profile || {}) },
              ...(updates.firstName ? { firstName: updates.firstName } : {}),
              ...(updates.lastName ? { lastName: updates.lastName } : {})
            } 
          }});
        }
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: true };
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to update profile' });
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: false };
      }
    },
    // Project collaboration
    addProjectCollaborator: async (projectId: string, userId: string): Promise<{ success: boolean }> => {
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
    },
    removeProjectCollaborator: async (projectId: string, userId: string): Promise<{ success: boolean }> => {
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
    },
    // Bounty templates
    createProjectFromBounty: async (bountyId: string, teamData: { name: string; members: string[] }): Promise<{ success: boolean; projectId: string }> => {
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
    },
    saveSession,
    loadSession,
    clearSession,
    exportStateJson,
    downloadStateJson,
    importStateJson,
    loadInitialStateFromJson
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