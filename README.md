# Hackday App — Data Flow and State Overview

## Global State: `src/contexts/HackathonContext.tsx`
- __State shape__: `currentUser`, `projects`, `challenges`, `bounties`, `goodies`, `attendees`, `loading`, `error`.
- __Important Types__: `User`, `Project`, `Attendee`, `Challenge`, `Bounty`.
- __Session__: Saved/restored via `localStorage` by the Provider’s `saveSession/loadSession/clearSession`.
- __Project editing access__: Any user whose email appears in `Project.teamMembers` is considered a project editor.

### Key API functions
- __`updateUserProfile(userId, { profile, name, firstName, lastName })`__
  - Merges into `currentUser.profile` and updates `currentUser.name` when provided.
  - Also updates the matching `Attendee` entry (by `email`) with `firstName`, `lastName`, and merged `profile`.
- __`createProject(project)` / `updateProject(id, updates)`__
  - Persist projects into global state. Team member email list (`teamMembers`) determines who can edit the project via `HackerProject` screen.

## Components and Data Flow

### `src/components/HackerProject.tsx`
- __Purpose__: Create/Edit a hacker’s project.
- __State binding__:
  - Loads the current user’s project by checking if `currentUser.email` is included in any `project.teamMembers`.
  - All project fields (name, description, links, tags, challenges, team members) bind to local component state and are saved to global state with `createProject` or `updateProject`.
- __Team management__:
  - Add/remove/update team members by email.
  - After adding a teammate’s email, they can edit the same project since `HackerProject` checks membership by `teamMembers.includes(currentUser.email)`.
  - Shows a guidance banner if the user is solo (only one non-empty email).
- __Constraints__:
  - `teamName` is optional; the UI does not enforce it.
- __Profile completion banner__:
  - A clickable banner prompts “Complete your profile”; clicking opens `ProfileEditor`.
  - An `X` dismiss button persists dismissal to `localStorage` with a key per-user (`profile-banner-dismissed-<email>`).

### `src/components/ProfileEditor.tsx`
- __Purpose__: Edit the current user’s profile and identity.
- __Prefill__: `firstName`/`lastName` are populated from the matching attendee (if found) or split from `currentUser.name`.
- __Fields__: First name, Last name, City, LinkedIn, Twitter, Bio, and tag-like Other Projects (renamed to "Add Tags").
- __Save__: Calls `updateUserProfile` with `{ profile, name, firstName, lastName }` so both `currentUser` and the matching `Attendee` record are updated in global state.

### Dashboards
- __`src/components/HostDashboard.tsx`__
- __`src/components/SponsorDashboard.tsx`__
  - Both dashboards show a clickable, dismissible “Complete your profile” banner (same behavior as project page).
  - Non-onboarding back buttons were removed; back navigation is handled at the app shell (`HackathonInterface`) and appears only during onboarding.
  - Lists, stats, and tables are derived from global state (`projects`, `attendees`, `bounties`, `challenges`, `goodies`).
  - Any UI not backed by state has been removed/avoided.

### `src/components/HackathonInterface.tsx`
- __Back button__: Shown only during onboarding screens (`hostLogin`, `sponsorLogin`, `hackerSignup`, `projectQuestions`, `projectSetup`). Positioned bottom-left.
- __Screen routing__: Directs between major app screens and passes data through `formData` or `hostDashboardData` where required.

## How to Collaborate on Projects
- __Adding teammates__:
  - In the project page, add teammates by entering their email under Team Members.
  - Saving persists to global state; the added teammate (when logged in with that email) will be able to edit the same project.
- __Joining an existing project__:
  - You must ask the project creator to add your email to their project’s Team Members list.
  - Once added, refresh or revisit the project page to load the project for your account.
- __Removing a teammate__:
  - Use the remove button next to a team member email; save to persist the change.

## Persistence
- __Session__: Provider stores a session with user and datasets in `localStorage`. The closable profile banner also stores a per-user dismissal flag in `localStorage`.

## Notes and Guarantees
- `teamName` is optional and not required to save a project.
- Project editing rights are determined solely by email membership in `teamMembers`.
- Profile changes update both the `currentUser` and corresponding `Attendee` record for consistency across dashboards.
