# Implementation Plan: Edutechplus MVP

## 1. Architecture: The "Baton Pass" System
We will implement a sequential state machine where active control (the "baton") is handed explicitly between three distinct components. There is **no overlap**—only one component is active at a time.

### Components
1.  **VoiceAgent (Vapi)**: Handles all verbal interaction. **Termination** is the critical guardrail.
2.  **VideoPlayer (HTML5)**: Passive content consumption.
3.  **AppletFrame (Iframe)**: Interactive WebGL/HTML5 content.

## 2. Component Logic & Termination Strategy

### A. VoiceAgent (`<VoiceAgent />`)
-   **Role**: Context provider & Transition manager.
-   **Termination Logic**:
    1.  **Primary (Semantic)**: Agent calls `completeInteraction()` function after finishing its response.
        -   System prompt enforces: "After responding to the student, IMMEDIATELY call `completeInteraction`."
        -   React listens for `call-function` event -> triggers `onComplete()`.
    2.  **Fallback (Safety)**: Hard 30-second timeout. If function isn't called, force `vapi.stop()` and trigger `onComplete()`.
-   **Config**: Accepts `script` and `systemPrompt` props for the specific step.
-   **Architecture**: Follows a strictly linear sequence: Step 1 (Voice) -> Step 2 (Video) -> Step 3 (Voice). The agent component is stateless regarding 'pre/post' context.

### B. VideoPlayer (`<VideoPlayer />`)
-   **Role**: Delivers MP4 content.
-   **Termination Logic**: Standard HTML5 `onEnded` event triggers `onComplete()`.
-   **Config**: Accepts `src` path (e.g., `/videos/video-1.mp4`).

### C. AppletFrame (`<AppletFrame />`)
-   **Role**: Container for existing HTML5 applets.
-   **Termination Logic**:
    -   **Problem**: Applets currently loop or show "Start Over".
    -   **Fix**: We will patch `app.js` in each applet.
    -   **Patch**: In the final state (e.g., `case 13`), inject `window.parent.postMessage({ type: 'ASSET_COMPLETE' }, '*')`.
    -   **React Side**: Listen for this message -> trigger `onComplete()`.

## 3. Data Model: `learningJourney.js`
We will create a master configuration array that maps the exact sequence, populated with data from your `content-context-docs`.

```javascript
export const SEQUENCE = [
  // 1. Foundation Video
  {
    // Step 1: Pre-Video Interaction
    id: 'step-1-voice-intro',
    type: 'voice',
    script: "Hi! I'm Math Mate. Let's learn about fractions. Watch this video carefully!", // Derived from VIDEO_1_CONTEXT
    systemPrompt: "You are a warm teacher. Introduce fractions briefly."
  },
  {
    // Step 2: Content
    id: 'step-1-video',
    type: 'video',
    src: '/videos/video-1.mp4'
  },
  // 2. Cut & Glue Practice
  {
    // Step 3: Post-Video / Pre-Applet Bridge Interaction
    id: 'step-2-voice-bridge',
    type: 'voice',
    script: "That was cool! Now it's your turn. Use the scissors to make equal parts.", // Derived from A1_CONTEXT
    systemPrompt: "Encourage the student to try cutting."
  },
  {
    // Step 4: Content
    id: 'step-2-applet',
    type: 'applet',
    src: '/applets/A1/index.html'
  },
  // ... continues for all 7 assets
];
```

## 4. Execution Roadmap

**Phase 1: Asset Prep (The "Patching" Phase)**
-   Review `A1-A4` `app.js` files and inject `postMessage` code at their specific "Completion" steps.
-   Verify all video paths.

**Phase 2: Core Engine**
-   Initialize React project.
-   Install `vapi-web` SDK.
-   Build `JourneyManager` component (The State Machine).

**Phase 3: Component Implementation**
-   Build `VoiceAgent` with timeout guardrails.
-   Build `AppletFrame` with message listeners.
-   Build `VideoPlayer`.

**Phase 4: Orchestration**
-   Assemble `learningJourney.js` with all scripts.
-   Run end-to-end test.

## 5. Risk Management
-   **Vapi Latency**: Add a simple "Thinking..." UI state so the child doesn't think it's broken.
-   **Applet iframe sizing**: Ensure 100% width/height to fit mobile screens.
