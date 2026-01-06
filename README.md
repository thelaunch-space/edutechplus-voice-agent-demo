# Edutechplus MVP - Fractions Learning Journey

A mobile-first learning app that guides Grade 4 students through a 20-minute fractions learning journey using voice AI (Math Mate) to connect 7 sequential content assets.

## 🎯 What This Is

An MVP implementation of the "baton pass" architecture where:
- **Voice Agent (Vapi)** introduces and transitions between content
- **Videos** deliver educational content
- **Interactive Applets** provide hands-on practice
- Each component signals completion before the next begins

## 🚀 Quick Start

### 1. Configure Vapi API Key

Open `.env` and add your Vapi public key:

```bash
VITE_VAPI_PUBLIC_KEY=your_actual_vapi_public_key_here
```

### 2. Install Dependencies (Already Done)

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

## 📱 Usage

1. **Allow microphone access** when prompted (required for voice interaction)
2. The journey starts automatically with Math Mate greeting you
3. Follow along through all 7 assets:
   - Video 1: Foundation concepts
   - Applet A1: Cut & Glue Practice
   - Applet A2: Paper Cut Snapshot
   - Applet A3: Statement Cake
   - Video 2: Advanced concepts
   - Applet A4: Cut & Glue Practice 2
   - Video 3: Mastery culmination

## 🏗️ Architecture

### Components

- **`JourneyManager`**: State machine controlling the sequence
- **`VoiceAgent`**: Vapi integration with 30s timeout fallback
- **`VideoPlayer`**: HTML5 video with `onEnded` detection
- **`AppletFrame`**: Iframe wrapper listening for `postMessage`

### Data Flow

```
learningJourney.js → JourneyManager → Component → onComplete() → Next Step
```

### Termination Strategy

- **Voice**: Function calling (`completeInteraction`) + 30s timeout
- **Video**: HTML5 `ended` event
- **Applet**: `postMessage({ type: 'ASSET_COMPLETE' })` after 2.5s loading bar

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   ├── JourneyManager.jsx    # Main orchestrator
│   │   ├── VoiceAgent.jsx        # Vapi integration
│   │   ├── VideoPlayer.jsx       # Video playback
│   │   └── AppletFrame.jsx       # Applet container
│   ├── learningJourney.js        # Sequence configuration
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── fractions-module-content/
│   ├── videos/                   # 3 MP4 files
│   └── applets/                  # 4 HTML5 applets (patched)
├── .env                          # Environment variables
└── package.json
```

## 🔧 Key Implementation Details

### Voice Agent (Vapi)

- Uses OpenAI GPT-4o-mini for responses
- System prompts enforce immediate termination via function calling
- 30-second safety timeout as fallback
- Visual status indicators (connecting/listening/completed)

### Applets

All 4 applets have been patched with:
- `showCompletionLoader()` function
- 2.5-second animated loading bar
- `postMessage` to parent window on completion

### Videos

- Local MP4 files from `fractions-module-content/videos/`
- Auto-play with fallback controls
- Mobile-optimized with `playsInline`

## 🎨 Design Decisions

1. **Simplest Stack**: Vanilla React + Vite (no router, no state management library)
2. **Minimal Dependencies**: Only React, Vite, and Vapi SDK
3. **Mobile-First**: Full viewport components, touch-friendly
4. **No Persistence**: Journey resets on reload (MVP scope)
5. **Inline Styles**: Fastest implementation, no CSS modules

## 🐛 Troubleshooting

### Voice not working
- Check that `.env` has your actual Vapi public key
- Ensure microphone permissions are granted
- Check browser console for Vapi errors

### Videos not playing
- Ensure video files exist in `fractions-module-content/videos/`
- Try clicking the video to manually play if autoplay fails

### Applets not completing
- Check browser console for `postMessage` events
- Verify applet reaches its final state (step 13 for A1, step 3 for A2, etc.)

## 📝 Next Steps (Post-MVP)

- Add progress indicator showing X/21 steps
- Persist journey state to localStorage
- Add skip/replay controls
- Implement error recovery
- Add analytics tracking
- Optimize for production build

## 🔑 Environment Variables

```bash
# Vapi Voice Agent
VITE_VAPI_PUBLIC_KEY=your_vapi_public_key_here

# YouTube video IDs (optional, using local files instead)
VITE_YOUTUBE_VIDEO_1_ID=kD3wbmePp_8
VITE_YOUTUBE_VIDEO_2_ID=pag3P1l3Tdk
VITE_YOUTUBE_VIDEO_3_ID=6M7MIfeL7ak

# OpenAI (not used in MVP, Vapi handles this)
OPENAI_API_KEY=sk-proj-...
```

## 📄 License

Internal project - Edutechplus v3
