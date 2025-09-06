import React, { useState, useEffect } from 'react';
import { useHackathon } from '../contexts/HackathonContext';
import { HackathonProvider } from '../contexts/HackathonContext';
import SettingsMenu from './SettingsMenu';
import ProfileEditor from './ProfileEditor';
import CountdownTimer from './CountdownTimer';
import { ArrowLeft } from 'lucide-react';
import WelcomeScreen from './WelcomeScreen';
import HelloWelcome from './HelloWelcome';
import HostLogin from './HostLogin';
import SponsorLogin from './SponsorLogin';
import HackerSignup from './HackerSignup';
import ProjectSetup from './ProjectSetup';
import HackerProject from './HackerProject';
import HostDashboard from './HostDashboard';
import SponsorDashboard from './SponsorDashboard';
import ProjectEditor from './ProjectEditor';
import AttendeeManager from './AttendeeManager';
import EnrollReview from './EnrollReview';
import PrizeAnnouncement from './PrizeAnnouncement';
import BountyEditor from './BountyEditor';
import ChallengeEditor from './ChallengeEditor';
import GoodieEditor from './GoodieEditor';

// Re-export types from context for backward compatibility
export type { User, Project, Bounty, Attendee } from '../contexts/HackathonContext';

interface SpeedSettings {
  portalIntroSpeed: number;
  portalIntroTime: number;
  portalAccelSpeed: number;
  portalAccelTime: number;
  portalIdleSpeed: number;
}

interface HackathonInterfaceProps {
  onAccelerate: (accelerating: boolean) => void;
  speedSettings: SpeedSettings;
}

const HackathonInterfaceContent: React.FC<HackathonInterfaceProps> = ({ onAccelerate, speedSettings }) => {
  const { state } = useHackathon();
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [uiState, setUiState] = useState<'hidden' | 'emerging' | 'visible' | 'disappearing'>('hidden');
  const [showUI, setShowUI] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [hostDashboardData, setHostDashboardData] = useState<any>({});
  const [speedBoostCount, setSpeedBoostCount] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isClickFrozen, setIsClickFrozen] = useState(false);
  const [portalAnimationsEnabled, setPortalAnimationsEnabled] = useState(() => {
    const saved = localStorage.getItem('portal-animations-enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  // Prevent late intro timers from re-triggering UI state after user interaction
  const introInitializedRef = React.useRef(false);
  const introTimersRef = React.useRef<number[]>([]);
  const computeShowWinners = () => !!(state.phase && (state.phase.votingOpen || state.phase.announce));
  const showWinners = computeShowWinners();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const winnersPickedAll = () => {
    const ch = state.challenges || [];
    if (ch.length === 0) return false;
    const map = (state.winners?.challenge || {}) as Record<string, string>;
    return ch.every((c: any) => !!map[c.type]);
  };

  // If logged in, never show Welcome/Signup/Login screens; force route to the correct home
  useEffect(() => {
    const user = state.currentUser;
    if (!showUI || !user) return;
    const disallowed = new Set(['welcome', 'hostLogin', 'sponsorLogin', 'hackerSignup']);
    if (disallowed.has(currentScreen)) {
      const target = user.type === 'host' ? 'hostDashboard' : user.type === 'sponsor' ? 'sponsorDashboard' : 'hackerProject';
      setCurrentScreen(target);
    }
  }, [state.currentUser, showUI, currentScreen]);
  // Save portal animations preference
  useEffect(() => {
    localStorage.setItem('portal-animations-enabled', JSON.stringify(portalAnimationsEnabled));
  }, [portalAnimationsEnabled]);

  // Listen to admin phase toggles (still dispatch a phase-updated event to sync any UI not reading context)
  useEffect(() => {
    const onPhaseUpdated = () => {};
    window.addEventListener('phase-updated', onPhaseUpdated as any);
    return () => window.removeEventListener('phase-updated', onPhaseUpdated as any);
  }, []);

  // Listen for global open-profile-editor event to show modal
  useEffect(() => {
    const handler = () => setShowProfileModal(true);
    window.addEventListener('open-profile-editor', handler as EventListener);
    return () => window.removeEventListener('open-profile-editor', handler as EventListener);
  }, []);

  // Handle speed boost (clicks, keyboard): always burst; count only during transitions
  const handleSpeedBoost = () => {
    if (isTransitioning) {
      setSpeedBoostCount(prev => prev + 1);
    }
    // Trigger intense G-force acceleration burst in Three.js
    onAccelerate(true);
    setTimeout(() => onAccelerate(false), 200);
  };

  // Add click listener for speed boost
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Only boost if clicking on the tunnel area (not UI elements)
      const target = e.target as HTMLElement;
      if (!target.closest('.quiz-container') && !target.closest('.fixed')) {
        handleSpeedBoost();
      }
    };

    if (isTransitioning) {
      document.addEventListener('click', handleClick);
    }

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [isTransitioning]);

  // Add Space key listener for speed boost (always active)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable;
      if (isTyping) return;
      if (e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        handleSpeedBoost();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initial journey - show tunnel for intro time, then show welcome screen
  useEffect(() => {
    // Check if user is already authenticated
    const savedSession = localStorage.getItem('hackathon-session');
    const forceWelcome = localStorage.getItem('force-welcome') === '1';
    if (savedSession && !forceWelcome) {
      try {
        const session = JSON.parse(savedSession);
        const sessionAge = Date.now() - new Date(session.timestamp).getTime();
        if (sessionAge < 24 * 60 * 60 * 1000 && session.currentUser) {
          // User is authenticated, skip welcome and go to appropriate screen
          setShowUI(true);
          setUiState('visible');
          
          if (session.currentUser.type === 'hacker') {
            const email = session.currentUser.email;
            const hasProject = (state.projects || []).some(p => (p.teamMembers || []).includes(email));
            if (hasProject) {
              setCurrentScreen('hackerProject');
            } else if (!session.currentUser.onboardingCompleted) {
              // Skip questions; go straight to project
              setCurrentScreen('hackerProject');
            }
          } else if (session.currentUser.type === 'host') {
            setCurrentScreen('hostDashboard');
          } else if (session.currentUser.type === 'sponsor') {
            setCurrentScreen('sponsorDashboard');
          }
          return;
        }
      } catch (error) {
        console.error('Failed to parse saved session:', error);
      }
    }
    
    // No valid session, show special hello welcome, then overview (welcome)
    const introMs = Math.max(0, Number(speedSettings.portalIntroTime) * 1000 || 0);
    // Schedule intro only once
    if (!introInitializedRef.current) {
      introInitializedRef.current = true;
      const t1 = window.setTimeout(() => {
        setShowUI(true);
        setCurrentScreen('helloWelcome');
        setUiState('emerging');
        const t2 = window.setTimeout(() => {
          setUiState('visible');
        }, 2000);
        introTimersRef.current.push(t2);

        // Continue tunnel zoom for a bit, then show overview (welcome) without extra animation
        const t3 = window.setTimeout(() => {
          // small acceleration burst for cinematic effect
          onAccelerate(true);
          setTimeout(() => onAccelerate(false), 1200);
          // Navigate to overview after zoom
          const t4 = window.setTimeout(() => {
            navigateToScreen('welcome', {}, true);
          }, 1400);
          introTimersRef.current.push(t4);
        }, 2200 + 800); // show hello for ~3s in total before zoom-transition
        introTimersRef.current.push(t3);
      }, introMs);
      introTimersRef.current.push(t1);
    }
    return () => {
      // No-op here; timers are cleared when navigating or unmounting
    };
  }, [speedSettings.portalIntroTime]);

  const navigateToScreen = (screen: string, data?: any, skipAnimation = false) => {
    // If logged in, do not allow navigation to pre-login screens
    const user = state.currentUser;
    const preLogin = new Set(['welcome', 'hostLogin', 'sponsorLogin', 'hackerSignup']);
    const routeForUser = (u: any): string => {
      if (!u) return 'welcome';
      if (u.type === 'host') return 'hostDashboard';
      if (u.type === 'sponsor') return 'sponsorDashboard';
      return 'hackerProject';
    };
    if (user && preLogin.has(screen)) {
      screen = routeForUser(user);
      skipAnimation = true;
    }
    // Skip animation for edit modes, tabs, and related views
    const noAnimationScreens = [
      // Pre-login and onboarding
      'welcome', 'hostLogin', 'sponsorLogin', 'hackerSignup', 'projectSetup',
      // Editors and dashboards
      'projectEditor', 'attendeeManager', 'bountyEditor',
      'hostDashboard', 'sponsorDashboard', 'enrollReview', 'prizeAnnouncement'
    ];
    
    const isEditMode = screen.includes('Editor') || screen.includes('Manager');
    const isTabNavigation = (currentScreen === 'hostDashboard' && screen === 'hostDashboard') ||
                           (currentScreen === 'sponsorDashboard' && screen === 'sponsorDashboard');
    
    if (!portalAnimationsEnabled || skipAnimation || isEditMode || isTabNavigation || 
        (noAnimationScreens.includes(currentScreen) && noAnimationScreens.includes(screen))) {
      // Direct navigation without tunnel animation
      // Clear any pending intro timers so they don't retrigger welcome/emergence state
      introTimersRef.current.forEach(id => clearTimeout(id));
      introTimersRef.current = [];
      setCurrentScreen(screen);
      if (data) {
        if (screen === 'hostDashboard') {
          setHostDashboardData((prev: any) => ({ ...prev, ...data }));
        } else {
          setFormData((prev: any) => ({ ...prev, ...data }));
        }
      }
      return;
    }
    
    // Full tunnel animation for major screen changes
    // Clear any pending intro timers so they don't retrigger welcome/emergence state
    introTimersRef.current.forEach(id => clearTimeout(id));
    introTimersRef.current = [];
    setIsTransitioning(true);
    setSpeedBoostCount(0);
    setUiState('disappearing');
    
    setTimeout(() => {
      onAccelerate(true);
    }, 300);

    // Calculate dynamic timing based on speed boosts
    const baseAccelTime = speedSettings.portalAccelTime * 1000;
    const speedBoostReduction = speedBoostCount * 400; // 0.4 seconds per click
    const actualAccelTime = Math.max(500, baseAccelTime - speedBoostReduction);

    setTimeout(() => {
      onAccelerate(false);
      setCurrentScreen(screen);
      if (data) {
        if (screen === 'hostDashboard') {
          setHostDashboardData((prev: any) => ({ ...prev, ...data }));
        } else {
          setFormData((prev: any) => ({ ...prev, ...data }));
        }
      }
      
      setTimeout(() => {
        setIsTransitioning(false);
        setUiState('emerging');
        
        // Calculate dynamic emergence time based on speed boosts (slower base)
        const baseEmergenceTime = 3000;
        const emergenceSpeedBoost = speedBoostCount * 100; // 0.1 seconds per click
        const actualEmergenceTime = Math.max(200, baseEmergenceTime - emergenceSpeedBoost);
        
        setTimeout(() => {
          setUiState('visible');
        }, actualEmergenceTime);
      }, 500);
    }, actualAccelTime);
  };

  // Freeze clicks on UI elements while emerging and for 1s after visible
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    // Disable UI interactions during hidden/disappearing/emerging
    if (uiState === 'hidden' || uiState === 'disappearing' || uiState === 'emerging') {
      setIsClickFrozen(true);
    }
    if (uiState === 'visible') {
      // Keep frozen for 1 second after becoming visible
      setIsClickFrozen(true);
      timeout = setTimeout(() => setIsClickFrozen(false), 1000);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [uiState]);

  const handleLogin = (user: any) => {
    if (user && user.type === 'host') {
      navigateToScreen('hostDashboard');
    } else if (user && user.type === 'sponsor') {
      navigateToScreen('sponsorDashboard');
    }
  };

  const handleLogout = () => {
    // Clear any pending intro timers
    introTimersRef.current.forEach(id => clearTimeout(id));
    introTimersRef.current = [];
    // Reset to Welcome with a fresh emergence animation
    setIsTransitioning(false);
    setCurrentScreen('welcome');
    setShowUI(true);
    setUiState('emerging');
    // Freeze clicks immediately during reset
    setIsClickFrozen(true);
    const t = window.setTimeout(() => {
      setUiState('visible');
      // Unfreeze after 1s of visible
      window.setTimeout(() => setIsClickFrozen(false), 1000);
    }, 3800);
    introTimersRef.current.push(t);
  };

  // Get back navigation info
  const getBackNavigation = () => {
    const backRoutes: Record<string, string> = {
      'hostLogin': 'welcome',
      'sponsorLogin': 'welcome', 
      'hackerSignup': 'welcome',
      'projectSetup': 'hackerSignup',
      // Back navigation intentionally disabled for non-onboarding screens
    };
    
    return backRoutes[currentScreen] || null;
  };

  const handleBackNavigation = () => {
    const backScreen = getBackNavigation();
    if (backScreen) {
      navigateToScreen(backScreen, {}, true); // Skip animation for back navigation
    }
  };

  // Render current screen
  const renderScreen = () => {
    const screenProps = {
      formData,
      setFormData,
      hostDashboardData,
      setHostDashboardData,
      onNavigate: navigateToScreen,
      onLogin: handleLogin,
      uiState
    };

    switch (currentScreen) {
      case 'helloWelcome':
        return <HelloWelcome uiState={uiState} />;
      case 'welcome':
        return <WelcomeScreen {...screenProps} />;
      case 'hostLogin':
        return <HostLogin {...screenProps} />;
      case 'sponsorLogin':
        return <SponsorLogin {...screenProps} />;
      case 'hackerSignup':
        return <HackerSignup {...screenProps} />;
      
      case 'projectSetup':
        return <ProjectSetup {...screenProps} />;
      case 'hackerProject':
        return <HackerProject {...screenProps} />;
      case 'hostDashboard':
        return <HostDashboard {...screenProps} onNavigate={(screen, data) => navigateToScreen(screen, data, true)} />;
      case 'sponsorDashboard':
        return <SponsorDashboard {...screenProps} onNavigate={(screen, data) => navigateToScreen(screen, data, true)} />;
      case 'projectEditor':
        return <ProjectEditor {...screenProps} onNavigate={(screen, data) => navigateToScreen(screen, data, true)} />;
      case 'attendeeManager':
        return <AttendeeManager {...screenProps} onNavigate={(screen, data) => navigateToScreen(screen, data, true)} />;
      case 'bountyEditor':
        return <BountyEditor {...screenProps} onNavigate={(screen, data) => navigateToScreen(screen, data, true)} />;
      case 'challengeEditor':
        return <ChallengeEditor {...screenProps} onNavigate={(screen, data) => navigateToScreen(screen, data, true)} />;
      case 'goodieEditor':
        return <GoodieEditor {...screenProps} onNavigate={(screen, data) => navigateToScreen(screen, data, true)} />;
      case 'enrollReview':
        return <EnrollReview {...screenProps} onNavigate={(screen, data) => navigateToScreen(screen, data, true)} />;
      case 'prizeAnnouncement':
        return <PrizeAnnouncement {...screenProps} onNavigate={(screen, data) => navigateToScreen(screen, data, true)} />;
      default:
        return <WelcomeScreen {...screenProps} />;
    }
  };

  if (!showUI) return null;

  const onboardingScreens = ['hostLogin', 'sponsorLogin', 'hackerSignup', 'projectSetup'] as const;
  const showBackButton = onboardingScreens.includes(currentScreen as any) && getBackNavigation() !== null && currentScreen !== 'welcome';

  return (
    <>
      <SettingsMenu 
        portalAnimationsEnabled={portalAnimationsEnabled}
        onTogglePortalAnimations={setPortalAnimationsEnabled}
        onLogout={handleLogout}
      />
      
      {/* Hide timer if winners are being announced */}
      {!(state.phase?.announce) && (
        <CountdownTimer />
      )}
      {showWinners && (
        <button
          onClick={() => navigateToScreen('prizeAnnouncement', {}, true)}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 bg-green-500/20 border border-green-500/40 text-green-300 rounded-lg backdrop-blur-md hover:bg-green-500/30 transition-colors"
        >
          {state.phase?.announce ? 'Winners' : state.phase?.votingOpen ? 'Voting' : 'View Winners'}
        </button>
      )}
      
      {/* Back Button: bottom-left, onboarding only */}
      {showBackButton && (
        <button
          onClick={handleBackNavigation}
          className="fixed bottom-4 left-4 z-40 p-2 text-green-400 hover:bg-green-500/20 rounded-lg border border-green-500/30 backdrop-blur-md bg-black/40"
          aria-label="Go back"
        >
          <ArrowLeft />
        </button>
      )}
      
      <div 
        className={`quiz-container state-${uiState}`}
        tabIndex={0}
        style={{ outline: 'none', pointerEvents: (isTransitioning || uiState !== 'visible' || isClickFrozen) ? 'none' : 'auto' }}
      >
        {renderScreen()}
      </div>

      {/* Global Profile Editor Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[60]">
          <ProfileEditor onClose={() => setShowProfileModal(false)} />
        </div>
      )}
    </>
  );
};

const HackathonInterface: React.FC<HackathonInterfaceProps> = (props) => {
  return (
    <HackathonProvider>
      <HackathonInterfaceContent {...props} />
    </HackathonProvider>
  );
};

export default HackathonInterface;