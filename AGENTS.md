# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Edutechplus v3 is a B2C mobile app converting existing B2G classroom content (math videos/applets for grades 3-6) into a student-facing experience. The core innovation is voice AI agent modules ("Math Mate") that create continuity between content assets, replacing teacher facilitation.

**Current Status:** Research/planning phase with content assets ready; implementation pending on voice agent architecture decisions.

## Architecture Concept

Sequential node-based flow: Voice Agent → Content Asset → Voice Agent → Content Asset...

Each voice interaction is bounded (10-15 seconds), non-persistent, and must definitively terminate before the next content node begins.

**Stack (planned):**
- React 19 + Vite
- Voice API: Vapi (preferred) or OpenAI Realtime API
- Content: Local video files + HTML5 applets (GeoGebra-based)
- Environment variables via `.env` (see `.env.example`)

## Repository Structure

```
context-docs/               # Project planning and context documents
├── high-level-context.md   # Project overview and objectives
├── agent_content_context.md # Voice agent content guide for all 7 assets
├── wip-observations-and-progress-doc.md # Development progress notes
└── krishna-context.md      # Founder context for AI assistants

fractions-module-content/   # Content assets for MVP
├── videos/                 # 3 MP4 educational videos
├── applets/                # 4 interactive HTML5 applets (A1-A4)
└── content-context-docs/   # Detailed context for each asset
    └── learning-journey-mvp.md # Complete asset sequence specification
```

## Key Technical Constraints

1. **Voice Session Termination:** Agent must signal completion naturally (not mid-sentence) while being programmatically controllable. This is the core unsolved problem.

2. **Bounded Sessions:** Voice listening only during 10-15 second windows to avoid false activations during video/applet playback and control costs.

3. **Target Audience:** Grade 4 students (Asian/Indonesian) - simple language, warm tone, non-judgmental.

## MVP Learning Journey

7 assets in fixed sequence (~20 min total):
1. Video 1: Foundation concepts (2.5 min)
2. Applet A1: Cut & Glue Practice (4 min)
3. Applet A2: Paper Cut Snapshot (2 min)
4. Applet A3: Statement Cake (3 min)
5. Video 2: Advanced concepts (1.9 min)
6. Applet A4: Cut & Glue Practice 2 (3 min)
7. Video 3: Mastery culmination (30 sec)

Voice interactions occur before and after each asset.

## Voice Agent Guidelines

- Maximum 2 sentences (10-15 seconds) per interaction
- Pre-asset: Introduce what's coming → immediately trigger asset
- Post-asset: Ask 1 question → listen → respond in 1 sentence → trigger next asset
- Never lecture, ask follow-ups, or continue after responding
- Tone: Warm, encouraging, patient - like a friendly teacher
