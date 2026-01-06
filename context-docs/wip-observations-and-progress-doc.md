# **High-Level Context: Voice-Guided Fractions Learning (Math Mate)**

**Last Updated:** January 2026

---

## **Project Overview**

Edutechplus operates in B2G edtech with pre-built math and science content (videos, applets, slides) designed for teacher-controlled classroom delivery on TV screens to grades 3-6. Standardized flow assumes low teacher capability.

**Objective:** Shift the same assets into a B2C student-facing mobile app. Remove teacher dependency. Maintain existing learning journey structure while adding engagement layer to compensate for loss of human facilitation. Outcome is to design an immersive, engaging "20-25 minute experience" which keeps grade 4 kids engaged throughout this period \- thereby removing teacher dependency.

**Approach:** Insert voice AI agent modules between content assets in fixed learning journey sequence. Voice agent initiates 10-15 second conversation with student, which is non-judgemental, and performs lightweight comprehension check tied to previous content (video/applet), then triggers next asset (video or applet). Post-asset completion, the voice agent re-engages to acknowledge what the student just consumed, provides brief contextual reinforcement, then hands off to the next content piece. Voice acts as connective tissue between assets \- engagement primary, comprehension check secondary.

**Why This Might Work:** Voice creates continuity illusion mimicking teacher presence. Contextual callbacks to prior content signal attentiveness and personalization without requiring adaptive learning logic. Comprehension checks double as engagement reset points, preventing passive consumption drift. Tool calling automates asset sequencing, eliminating navigation friction. Low complexity—voice modules slot between existing assets without restructuring content or requiring branching logic.

---

## **Implementation History & Technical Decisions**

### **What We Tried**

**1\. Deepgram Voice Agent API**

* **Why tried:** Single API for STT+LLM+TTS orchestration. Seemed simpler than multi-component stack.  
* **Why abandoned:** Threw configuration errors. Initialization issues prevented basic testing. Moved on due to implementation friction.

**2\. OpenAI Realtime API (Multiple Attempts)**

* **Why tried:** Native voice-to-voice model, single API, good documentation.  
* **What we built:** Complete React 19 \+ Vite MVP with WebRTC direct connection. 14 sessions (pre/post for 7 assets). Custom hooks (`useOpenAIWebRTC`, `useAssetSequence`). Asset completion detection via YouTube iframe API \+ script injection for applets. Agent persona "Math Mate" with function calling.  
* **Why abandoned:** Could not reliably control agent termination. Voice sessions would initiate but continue indefinitely—neither time-bounded nor question-bounded termination worked. Agent lacked a "stop" mechanism that felt semantically complete yet was programmatically reliable.

**3\. Authentication Complexity**

* **Issue discovered:** OpenAI moved to GA requiring ephemeral keys/client secrets instead of direct API key usage. This added a backend requirement (session token generation endpoint) which complicated the "simple demo" goal.  
* **Why this mattered:** Exposed API keys acceptable for internal demo, but ephemeral key workflow introduced 401 errors and WebRTC connection failures during troubleshooting.

---

## **Current Problem Statement**

**Core Issue:** Voice agent must operate as bounded, discrete sessions—not persistent listening state.

**Why Bounded Sessions Matter:**

1. **UX:** Target audience (Asian Grade 4 students) may accidentally trigger agent by talking to others during video/applet consumption. Continuous listening creates false activations.  
2. **Cost:** 20-25 minute total experience with continuous listening is expensive at scale. Need listening only during 10-15 second conversation windows (total \~3.5 min of 7 interactions).  
3. **Control:** Content assets (videos/applets) have their own audio. Persistent agent listening causes confusion between student speech, video audio, and applet sounds.

**The Missing Mechanism:** Need agent to signal "my turn is over" in a way that:

* Feels natural (completes sentence/thought)  
* Is machine-detectable (triggers next node in sequence)  
* Happens predictably (doesn't run forever if student is silent/confused)

**Desired Architecture:** Sequential independent nodes: Voice Agent Node → Content Asset Node → Voice Agent Node → Content Asset Node. Voice agent must definitively terminate (not pause, not mute—END) before content node can begin.

**Key Constraint:** Programmatic termination WITHOUT abrupt cutoff. Agent shouldn't "decide" when to stop \- React should control this, but conversation must feel complete.

---

## **Possible Solutions**

### **Solution 1: Time-Bounded Termination with Natural Speech Completion (Vapi)**

**Platform:** Vapi (hosted voice agent platform)

**Approach:** Hybrid of prompt constraints \+ hard time limit \+ speech-end detection

**Implementation:**

1. **Prompt constraint:** "You have exactly 2 exchanges. Exchange 1: Ask question. Exchange 2: Acknowledge answer briefly and transition."  
2. **Time-based hard limit:** Force terminate after 30 seconds regardless of conversation state  
3. **React detects `speech-end` event** → checks if 30 sec passed → calls `vapi.stop()`

**Code Pattern:**

const MAX\_TIME \= 30000; // 30 sec  
let startTime \= Date.now();

vapi.on('speech-end', () \=\> {  
  if (Date.now() \- startTime \>= MAX\_TIME) {  
    vapi.stop(); // Force end  
    moveToNextAsset();  
  }  
});

**What this achieves:**

* Agent tries to follow 2-turn prompt  
* If agent goes off-track (e.g., kid says "bad" → agent asks follow-ups), timeout kills session after 30 sec  
* Waits for `speech-end` so no mid-sentence cutoff  
* Not semantic termination, but time-bounded programmatic termination with natural speech completion

**Pros:**

* Guarantees termination  
* Feels natural 80% of time  
* Handles edge cases with timeout  
* Simple implementation

**Cons:**

* Relies partially on prompt adherence (unreliable with kids giving unexpected answers)  
* 30-second timeout might feel long if agent goes severely off-track  
* Latency: \~500-800ms (STT → LLM → TTS pipeline)

**Cost:** \~$0.05-0.07/min \= \~$0.20-0.30 per student (7 interactions × 30 sec each)

**MVP Verdict:** Acceptable for demo. Proves concept, handles majority of cases, edge cases don't break experience badly.

---

## **Open Questions**

* Can we reduce timeout to 20 seconds without cutting off natural conversations?  
* Should we explore OpenAI Realtime API again with manual turn control (`turn_detection: null`)?  
* Is Vapi's 500-800ms latency acceptable for Grade 4 kids or will it feel laggy?  
* Should we test other platforms (Retell AI, LiveKit) for comparison?

