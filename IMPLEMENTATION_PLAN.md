# Implementation Plan: Next.js 15 + CopilotKit + AG-UI

## Overview
Upgrade TripMate AI frontend to Next.js 15 with React 19, integrate CopilotKit for agentic UI, and implement AG-UI protocol in the FastAPI backend.

## Phase 1: Frontend Upgrade to Next.js 15 + React 19

### Step 1.1: Update package.json dependencies
- Upgrade `next` from 14.1.0 to 15.1.x
- Upgrade `react` and `react-dom` from 18.x to 19.x
- Update `@types/react` and `@types/react-dom`

### Step 1.2: Install CopilotKit packages
- Add `@copilotkit/react-core`
- Add `@copilotkit/react-ui`

### Step 1.3: Run npm install and fix breaking changes
- Handle async request APIs if any
- Fix any React 19 deprecations

## Phase 2: Backend AG-UI Protocol Implementation

### Step 2.1: Install AG-UI SDK
- Add `ag-ui-protocol` to requirements.txt

### Step 2.2: Create AG-UI endpoint
- New route `/api/agent` with AG-UI event streaming
- Implement AG-UI event types:
  - `RUN_STARTED` / `RUN_FINISHED`
  - `TEXT_MESSAGE_START` / `TEXT_MESSAGE_CONTENT` / `TEXT_MESSAGE_END`
  - `TOOL_CALL_START` / `TOOL_CALL_ARGS` / `TOOL_CALL_END`

### Step 2.3: Refactor TravelAgent for AG-UI
- Update agent to emit proper AG-UI events
- Stream OpenAI responses token by token

## Phase 3: Frontend CopilotKit Integration

### Step 3.1: Setup CopilotKit Provider
- Wrap app with `<CopilotKit>` provider
- Configure runtime URL to point to AG-UI endpoint

### Step 3.2: Replace Custom Chat with CopilotChat
- Remove custom `TravelChat` component
- Add `<CopilotSidebar>` or `<CopilotChat>` component
- Configure styling to match existing UI

### Step 3.3: Implement CopilotKit Actions
- Add `useCopilotAction` for trip-related actions
- Connect to trip management functionality

## Phase 4: Testing

### Step 4.1: Update existing Playwright tests
- Update chat.spec.ts for new CopilotKit UI
- Ensure all 31 tests pass

### Step 4.2: Add new AG-UI tests
- Test AG-UI endpoint streaming
- Test event format compliance

## Execution Order

1. **Backend first**: Implement AG-UI endpoint (can test independently)
2. **Frontend upgrade**: Next.js 15 + React 19
3. **CopilotKit integration**: Provider + Chat component
4. **Testing**: Verify everything works

## Risk Mitigation

- Keep existing `/api/copilotkit` endpoint as fallback
- Test incrementally after each step
- Commit after each successful phase
