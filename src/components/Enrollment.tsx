import React, { useMemo, useState } from 'react';
import { useHackathon } from '../contexts/HackathonContext';
import type { Attendee, Challenge, Project, Bounty } from '../contexts/HackathonContext';
import { Trophy, Tag, ExternalLink, Video, Presentation, MapPin, Linkedin } from 'lucide-react';

interface EnrollmentProps {
  mode: 'host' | 'sponsor';
  showWinnersOnly?: boolean;
}

const Enrollment: React.FC<EnrollmentProps> = ({ mode, showWinnersOnly = false }) => {
  const { state, pickChallengeWinner, pickBountyWinner, setPhase } = useHackathon();
  const { currentUser, challenges, bounties, projects, attendees, winners, phase } = state as any;
  const getSponsorWebsite = (sponsorId: string) => {
    const sponsor = (attendees as Attendee[]).find((a: Attendee) => (a as Attendee).sponsorId === sponsorId);
    return sponsor?.profile?.website;
  };
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);

  const getWinnerForChallenge = (challengeType: string) => (winners?.challenge || {})[challengeType];
  const setWinnerForChallenge = async (projectId: string, challengeType: string) => {
    await pickChallengeWinner(challengeType as any, projectId);
    await setPhase({ ...(phase || { votingOpen: false, announce: false }), announce: true });
    window.dispatchEvent(new Event('phase-updated'));
  };
  const getWinnerForBounty = (bountyId: string) => (winners?.bounty || {})[bountyId];
  const setWinnerForBounty = async (projectId: string, bountyId: string) => {
    await pickBountyWinner(bountyId, projectId);
    await setPhase({ ...(phase || { votingOpen: false, announce: false }), announce: true });
    window.dispatchEvent(new Event('phase-updated'));
  };

  const visibleChallenges = useMemo<Challenge[]>(() => {
    if (mode === 'sponsor') {
      return (challenges as Challenge[]).filter((c: Challenge) => c.sponsorId === (currentUser as any)?.id);
    }
    return challenges as Challenge[];
  }, [mode, challenges, currentUser]);

  const visibleBounties = useMemo<Bounty[]>(() => {
    if (mode === 'sponsor') {
      return (bounties as Bounty[]).filter((b: Bounty) => b.sponsorId === (currentUser as any)?.id);
    }
    return bounties as Bounty[];
  }, [mode, bounties, currentUser]);

  const getProjectTeam = (projectId: string): Attendee[] => (attendees as Attendee[]).filter((a: Attendee) => a.projectId === projectId);

  const projectCard = (project: Project) => {
    const team = getProjectTeam(project.id);
    const prizeCount = (project.challengesEnrolled || []).length;
    const startedLabel = (() => {
      switch (project.startedFrom) {
        case 'company': return "It's my company";
        case 'some_code': return 'Some code existed';
        case 'idea': return 'Idea existed';
        case 'scratch': return 'From scratch';
        default: return undefined;
      }
    })();
    return (
      <div key={project.id} className="p-3 bg-black/20 rounded-lg border border-white/10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* No title repeat here; just description and metadata */}
            {project.description && (
              <p className="text-sm text-gray-300 mb-2">{project.description}</p>
            )}
            {project.tags && project.tags.length > 0 && (
              <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                <Tag className="w-3 h-3" /> {project.tags.join(', ')}
              </div>
            )}
            <div className="text-xs text-gray-400 mb-2">
              Prizes enrolled: <span className="text-gray-200" title={(project.challengesEnrolled || []).join(', ')}>{prizeCount}</span>
            </div>
            {startedLabel && (
              <div className="text-xs text-gray-400 mb-2">Started from: <span className="text-gray-200">{startedLabel}</span></div>
            )}
            <div className="mb-2 text-xs text-gray-300">
              <span className="text-gray-400">Team:</span>{' '}
              <span>
                {team.map((m, idx) => (
                  <span key={m.id} className="inline-flex items-center gap-1 mr-2">
                    <span className="text-blue-300">{m.firstName} {m.lastName}</span>
                    {m.profile?.city && (
                      <span className="inline-flex items-center gap-1 text-gray-400">
                        <MapPin className="w-3 h-3" /> {m.profile.city}
                      </span>
                    )}
                    {m.profile?.linkedin && (
                      <a href={m.profile.linkedin} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300" title="LinkedIn">
                        <Linkedin className="w-3 h-3" />
                      </a>
                    )}
                    {idx < team.length - 1 ? ',' : ''}
                  </span>
                ))}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-3">
            {project.demoUrl && (
              <a href={project.demoUrl} target="_blank" rel="noreferrer" className="p-1 text-green-400 hover:bg-green-500/20 rounded" title="Demo URL">
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {project.videoDemo && (
              <a href={project.videoDemo} target="_blank" rel="noreferrer" className="p-1 text-red-400 hover:bg-red-500/20 rounded" title="Video Demo">
                <Video className="w-4 h-4" />
              </a>
            )}
            {project.slides && (
              <a href={project.slides} target="_blank" rel="noreferrer" className="p-1 text-blue-400 hover:bg-blue-500/20 rounded" title="Slides">
                <Presentation className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Challenges Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">Challenges</h3>
        </div>
        <div className="space-y-3">
          {visibleChallenges.map((ch: Challenge) => {
            let enrolledProjects: Project[] = (projects as Project[]).filter((p: Project) => (p.challengesEnrolled || []).includes(ch.type));
            if (showWinnersOnly) {
              const winnerId = getWinnerForChallenge(ch.type);
              enrolledProjects = winnerId ? enrolledProjects.filter((p: Project) => p.id === winnerId) : [];
            }
            return (
              <div key={ch.id} className="p-4 bg-black/20 rounded-lg border border-white/10">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{ch.title}</span>
                      {getSponsorWebsite(ch.sponsorId) && (
                        <a
                          href={getSponsorWebsite(ch.sponsorId)!}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 underline text-2xs ml-2"
                        >
                          {new URL(getSponsorWebsite(ch.sponsorId)!).hostname}
                        </a>
                      )}
                    </div>
                    {/* Description removed per request */}
                  </div>
                  {(() => {
                    const winnerId = getWinnerForChallenge(ch.type);
                    const winnerProject = (projects as Project[]).find((p: Project) => p.id === winnerId);
                    return winnerProject ? (
                      <div className="text-xs text-yellow-300 px-2 py-1 border border-yellow-500/30 rounded">
                        Winner Selected: {winnerProject.name}
                      </div>
                    ) : null;
                  })()}
                </div>
                <div className="space-y-2 mt-3">
                  {enrolledProjects.length === 0 && (
                    <div className="text-xs text-gray-500">No projects enrolled for this challenge yet.</div>
                  )}
                  {(enrolledProjects as Project[]).map((p: Project) => (
                    <div key={p.id}>
                      <button
                        onClick={() => setOpenProjectId(id => id === p.id ? null : p.id)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between px-2 py-2 hover:bg-white/5 rounded border-b border-white/10">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">{p.name}</span>
                              {getWinnerForChallenge(ch.type) === p.id && (
                                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded-full text-2xs">Winner</span>
                              )}
                              {p.startedFrom && (
                                <span className="px-2 py-0.5 bg-white/5 text-gray-300 rounded-full text-2xs">
                                  {p.startedFrom === 'company' ? "It's my company" : p.startedFrom === 'some_code' ? 'Some code existed' : p.startedFrom === 'idea' ? 'Idea existed' : 'From scratch'}
                                </span>
                              )}
                            </div>
                            <div className="mt-1 text-[11px] text-gray-300 flex flex-wrap gap-2">
                              {getProjectTeam(p.id).map((m: Attendee, idx: number) => (
                                <span key={m.id || idx} className="inline-flex items-center gap-1 mr-2">
                                  <span className="text-blue-300">{m.firstName} {m.lastName}</span>
                                  {m.profile?.city && (
                                    <span className="inline-flex items-center gap-1 text-gray-400">
                                      <MapPin className="w-3 h-3" /> {m.profile.city}
                                    </span>
                                  )}
                                  {m.profile?.linkedin && (
                                    <a href={m.profile.linkedin} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300" title="LinkedIn">
                                      <Linkedin className="w-3 h-3" />
                                    </a>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                          {mode === 'sponsor' && currentUser?.id === ch.sponsorId && !showWinnersOnly && (
                            <button
                              onClick={(e) => { e.preventDefault(); setWinnerForChallenge(p.id, ch.type); }}
                              className={`px-2 py-1 rounded text-xs border ${getWinnerForChallenge(ch.type) === p.id ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
                              title={getWinnerForChallenge(ch.type) === p.id ? 'Winner Selected' : 'Winner'}
                            >
                              Winner
                            </button>
                          )}
                        </div>
                      </button>
                      {openProjectId === p.id && (
                        <div className="mt-2">
                          {projectCard(p)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bounties Section */}
      {visibleBounties.length > 0 && (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Bounties</h3>
        </div>
        <div className="space-y-3">
          {visibleBounties.map((b: Bounty) => {
            let bountyProjects: Project[] = (projects as Project[]).filter((p: Project) => p.bountyId === b.id);
            if (showWinnersOnly) {
              const winnerId = getWinnerForBounty(b.id);
              bountyProjects = winnerId ? bountyProjects.filter((p: Project) => p.id === winnerId) : [];
            }
            if (bountyProjects.length === 0) return null;
            return (
              <div key={b.id} className="p-4 bg-black/20 rounded-lg border border-white/10">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-semibold text-white">
                    {b.title}
                    {getSponsorWebsite(b.sponsorId as any) && (
                      <a
                        href={getSponsorWebsite(b.sponsorId as any)!}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 underline text-2xs ml-2"
                      >
                        {new URL(getSponsorWebsite(b.sponsorId as any)!).hostname}
                      </a>
                    )}
                  </span>
                  {(() => {
                    const winnerId = getWinnerForBounty(b.id);
                    const winnerProject = (projects as Project[]).find((p: Project) => p.id === winnerId);
                    return winnerProject ? (
                      <div className="text-xs text-yellow-300 px-2 py-1 border border-yellow-500/30 rounded">
                        Winner Selected: {winnerProject.name}
                      </div>
                    ) : null;
                  })()}
                </div>
                <div className="space-y-2">
                  {(bountyProjects as Project[]).map((p: Project) => (
                    <div key={p.id}>
                      <button
                        onClick={() => setOpenProjectId(id => id === p.id ? null : p.id)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between px-2 py-2 hover:bg-white/5 rounded border-b border-white/10">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">{p.name}</span>
                              {getWinnerForBounty(b.id) === p.id && (
                                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded-full text-2xs">Winner</span>
                              )}
                              {p.startedFrom && (
                                <span className="px-2 py-0.5 bg-white/5 text-gray-300 rounded-full text-2xs">
                                  {p.startedFrom === 'company' ? "It's my company" : p.startedFrom === 'some_code' ? 'Some code existed' : p.startedFrom === 'idea' ? 'Idea existed' : 'From scratch'}
                                </span>
                              )}
                            </div>
                            <div className="mt-1 text-[11px] text-gray-300 flex flex-wrap gap-2">
                              {getProjectTeam(p.id).map(m => (
                                <span key={m.id} className="inline-flex items-center gap-1 mr-2">
                                  <span className="text-blue-300">{m.firstName} {m.lastName}</span>
                                  {m.profile?.city && (
                                    <span className="inline-flex items-center gap-1 text-gray-400">
                                      <MapPin className="w-3 h-3" /> {m.profile.city}
                                    </span>
                                  )}
                                  {m.profile?.linkedin && (
                                    <a href={m.profile.linkedin} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300" title="LinkedIn">
                                      <Linkedin className="w-3 h-3" />
                                    </a>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                          {mode === 'sponsor' && currentUser?.id === b.sponsorId && !showWinnersOnly && (
                            <button
                              onClick={(e) => { e.preventDefault(); setWinnerForBounty(p.id, b.id); }}
                              className={`px-2 py-1 rounded text-xs border ${getWinnerForBounty(b.id) === p.id ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
                              title={getWinnerForBounty(b.id) === p.id ? 'Winner Selected' : 'Winner'}
                            >
                              Winner
                            </button>
                          )}
                        </div>
                      </button>
                      {openProjectId === p.id && (
                        <div className="mt-2">
                          {projectCard(p)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
};

export default Enrollment;
