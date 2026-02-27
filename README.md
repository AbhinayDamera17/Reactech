# ⚗️ Reactech — Virtual Chemistry Lab

> **An AI-powered, gesture-controlled virtual chemistry lab that uses real-time hand tracking to simulate chemical reactions with dramatic visual effects and intelligent mistake detection.**

[![Built with React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite)](https://vitejs.dev)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Hands-4285f4?logo=google)](https://mediapipe.dev)
[![Three.js](https://img.shields.io/badge/Three.js-3D_FX-black?logo=three.js)](https://threejs.org)

---

## 📖 Table of Contents

- [About the Project](#about-the-project)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [Capstone Questions & Answers](#capstone-questions--answers)
- [Frequently Asked Questions (FAQ)](#frequently-asked-questions-faq)

---

## About the Project

**Reactech** is a web-based virtual chemistry laboratory designed for students and teachers. It allows users to simulate chemical reactions in two modes:

- **Manual Lab** — Select two chemicals from dropdowns, click "Mix", and see the reaction result with AI-generated explanations.
- **Live Lab** — Uses your webcam and **MediaPipe hand tracking** to detect real hand gestures. Assign chemicals to each hand, bring your hands together, and watch the reaction happen with **real-time visual effects** (explosions, smoke, sparkles).

The application includes an **AI Mistake Detection System** that acts as a virtual lab supervisor — detecting unsafe gestures, wrong chemical pairings, and providing corrective guidance in real-time.

---

## Key Features

| Feature | Description |
|---------|-------------|
| 🖐️ **Real-time Hand Tracking** | MediaPipe Hands detects and tracks both hands at 30fps with smoothed coordinates |
| 🧪 **15 Chemicals & 14 Reactions** | Includes acids, bases, metals, and salts with full reaction data |
| 💥 **Dramatic Visual Effects** | Risk-based effects: sparkles (safe), smoke + sparks (moderate), fireball + shockwave (danger) |
| 🤖 **AI Mistake Detection** | Validates chemical selections, detects unsafe gestures, suggests alternatives |
| 📚 **Reaction Guide** | Searchable encyclopedia of all available reactions with filtering by type and risk |
| 👨‍🏫 **Teacher Mode** | Extended notes, mistake logs, and detailed teacher-specific content |
| 🎯 **Gesture-Based Triggering** | Bring hands together to trigger reactions — zero-delay ref-based engine |
| 💬 **AI Chat Assistant** | Ask chemistry questions and get instant educational answers |
| 🖥️ **Debug Mode** | Real-time FPS, hand distance, tracking quality, and API status overlay |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | React 19 | Component-based UI |
| **Build Tool** | Vite 7 | Fast HMR dev server |
| **Hand Tracking** | MediaPipe Tasks Vision | Real-time hand landmark detection |
| **3D/Effects** | Three.js, @react-three/fiber, @react-three/drei | 3D rendering pipeline |
| **Backend API** | Python FastAPI (port 8000) | AI-powered reaction analysis |
| **Styling** | Vanilla CSS | Dark theme with glassmorphism |

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        REACTECH APP                          │
├──────────────┬──────────────┬──────────────┬─────────────────┤
│   Manual Lab │   Live Lab   │ Reaction     │  AI Chat        │
│              │              │ Guide        │  Assistant      │
├──────────────┴──────────────┴──────────────┴─────────────────┤
│                    CORE SERVICES                             │
│  ┌─────────────┐ ┌──────────────────┐ ┌───────────────────┐ │
│  │ HandTracker  │ │ GestureReaction  │ │ MistakeDetector   │ │
│  │ (MediaPipe)  │ │ Engine           │ │ System            │ │
│  └──────┬──────┘ └────────┬─────────┘ └────────┬──────────┘ │
│         │                 │                     │            │
│  ┌──────▼──────┐ ┌────────▼─────────┐ ┌────────▼──────────┐ │
│  │ CameraFeed  │ │ ReactionEffects  │ │ ReactionValidator │ │
│  │ ChemOverlay │ │ 3D               │ │ GestureAnalyzer   │ │
│  │             │ │                  │ │ SafetyAdvisor     │ │
│  └─────────────┘ └──────────────────┘ └───────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│               chemicals.js (Local Reaction Database)         │
│               api.js (FastAPI Backend Integration)            │
└──────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
Reactech/
├── index.html                  # Entry HTML
├── package.json                # Dependencies & scripts
├── vite.config.js              # Vite configuration
└── src/
    ├── main.jsx                # React entry point
    ├── App.jsx                 # Root app with tab navigation
    ├── App.css                 # Global styles
    ├── LiveLab.css             # Live Lab specific styles + effect animations
    ├── api.js                  # Backend API integration
    ├── chemicals.js            # Chemical database & local reaction data
    ├── components/
    │   ├── LiveLabPage.jsx     # Live Lab — camera + hand tracking + reaction
    │   ├── HandTracker.jsx     # MediaPipe hand detection & smoothing
    │   ├── CameraFeed.jsx      # Webcam video capture
    │   ├── ChemicalOverlay.jsx # Chemical labels on tracked hands
    │   ├── GestureReactionEngine.jsx  # Gesture-based reaction trigger
    │   ├── ReactionEffects3D.jsx      # Visual effects (explosion/smoke/sparkle)
    │   ├── ExplosionEffect.jsx # Legacy explosion overlay
    │   ├── SmokeEffect.jsx     # Legacy smoke overlay
    │   ├── MistakeOverlay.jsx  # Warning cards & danger modals
    │   ├── MistakeLog.jsx      # Session mistake history (Teacher Mode)
    │   ├── ReactionPanel.jsx   # Manual Lab reaction UI
    │   ├── ReactionCard.jsx    # Individual reaction display card
    │   ├── GuidePage.jsx       # Reaction Guide encyclopedia
    │   ├── AssistantPanel.jsx  # AI chat assistant
    │   ├── TeacherPanel.jsx    # Teacher mode toggle & panel
    │   ├── FilterDropdown.jsx  # Dropdown filter component
    │   ├── SearchBar.jsx       # Search input component
    │   └── RiskBadge.jsx       # Risk level badge component
    └── mistakes/
        ├── MistakeDetector.js  # Orchestrator for all mistake checks
        ├── ReactionValidator.js # Chemical pair validation
        ├── GestureAnalyzer.js  # Hand speed/shake detection
        ├── SafetyAdvisor.js    # Safety tips & advice engine
        └── MistakeLogger.js    # Session mistake log
```

---

## Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **npm** ≥ 9
- A **webcam** (for Live Lab)
- Modern browser (Chrome/Edge recommended for MediaPipe support)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/reactech.git
cd reactech

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Backend (Optional)

For full AI-powered reactions, start the Python backend:

```bash
cd backend
pip install fastapi uvicorn
uvicorn app:app --reload --port 8000
```

> **Note:** The app works fully offline with local fallback data. The backend enhances responses with AI analysis.

---

## Usage Guide

### Manual Lab
1. Select **Chemical A** and **Chemical B** from the dropdowns
2. Click **Mix** to trigger the reaction
3. View the balanced equation, product, risk level, and AI explanation
4. Toggle **Teacher Mode** for detailed notes

### Live Lab
1. Navigate to the **Live Lab** tab
2. Grant **camera permission** when prompted
3. Select chemicals for **Left Hand** and **Right Hand**
4. Show both hands to the camera — landmarks will appear
5. **Bring your hands together** — the reaction triggers instantly with visual effects
6. View results in the sidebar panel
7. Toggle **Debug Mode** to see real-time tracking metrics

---

## Capstone Questions & Answers

### Q1: What is the problem statement of your project?

**A:** Traditional chemistry education relies heavily on physical lab sessions, which face challenges including safety risks with dangerous chemicals, limited lab access for students, high costs of consumables, and inability to repeat dangerous experiments safely. There is a need for an interactive, safe, and accessible virtual lab that provides the engagement of hands-on experimentation with the safety of a digital environment.

---

### Q2: What is the proposed solution?

**A:** **Reactech** is an AI-powered virtual chemistry lab that uses **real-time hand tracking via MediaPipe** to simulate chemical reactions through natural hand gestures. Students assign chemicals to each hand and physically bring their hands together to trigger reactions — mimicking the real-world act of mixing chemicals. The system provides:

- **Instant visual feedback** (explosion, smoke, sparkle effects based on reaction risk)
- **AI-powered mistake detection** acting as a virtual lab supervisor
- **Comprehensive educational content** including balanced equations, safety notes, and teacher mode
- **Zero safety risk** — dangerous reactions like Na + H₂O can be explored safely

---

### Q3: What technologies are used and why?

**A:**

| Technology | Why We Chose It |
|-----------|----------------|
| **React 19** | Component-based architecture for modular, maintainable UI with latest concurrent features |
| **Vite 7** | Near-instant Hot Module Replacement for rapid development iteration |
| **MediaPipe Hands** | Google's production-grade hand landmark detection — tracks 21 landmarks per hand at 30fps in-browser |
| **Three.js / React Three Fiber** | Hardware-accelerated 3D rendering for dramatic reaction effects |
| **FastAPI (Python)** | High-performance async backend for AI-powered reaction analysis |
| **CSS Animations** | GPU-accelerated particle systems for visual effects without heavy libraries |

---

### Q4: How does the hand tracking work?

**A:** The system uses **MediaPipe Hands** (Google's ML model) to detect hand landmarks through the webcam:

1. **CameraFeed** captures the webcam stream at 640×480+ resolution
2. **HandTracker** runs MediaPipe's hand landmarker on each video frame, detecting up to 2 hands with 21 landmarks each
3. **Smoothing** — A 5-frame moving average smooths landmark positions to eliminate jitter
4. **Persistence** — A grace period prevents flickering when hands momentarily leave frame
5. **Quality Assessment** — Confidence scores drive green/yellow/red landmark coloring
6. **GestureReactionEngine** computes the normalized distance between hand centers and triggers reactions when hands are close enough (threshold: 0.20 in normalized 0-1 space)

---

### Q5: How does the Mistake Detection System work?

**A:** The Mistake Detection System acts as an **AI Lab Supervisor** with five modules:

1. **ReactionValidator** — Validates chemical pairs, detects non-reactive combinations, suggests valid alternatives
2. **GestureAnalyzer** — Monitors hand speed and shake, warns about unsafe gestures
3. **SafetyAdvisor** — Provides safety tips and PPE reminders based on reaction risk
4. **MistakeLogger** — Maintains a per-session log of all detected mistakes (visible in Teacher Mode)
5. **MistakeDetector** — Orchestrates all modules and determines whether to show warnings or danger modals

Detection types:
- ❌ Same chemical selected for both hands
- ❌ Non-reactive chemical pair (with suggestions)
- ❌ Missing hand or chemical selection
- ⚠️ Unsafe hand speed or shaking
- ⚠️ Repeated dangerous reaction attempts

---

### Q6: What are the different types of visual effects?

**A:** The `ReactionEffects3D` component renders risk-based effects at the hand convergence point:

| Risk Level | Effects |
|-----------|---------|
| 🟢 **Safe** | Green pulsing glow + expanding rings + 50 sparkle particles + 20 floating bubbles + "✅ Safe Reaction" label |
| 🟡 **Moderate** | Amber glow + 25 smoke clouds + 60 orange sparks + 8 steam jets + light screen shake + "⚠️ Caution" label |
| 🔴 **Danger** | White flash + fireball (inner/outer) + 3 shockwave rings + 80 debris particles + 40 embers + red overlay pulse + heavy screen shake + "🔴 DANGER" label |

All particle positions are pre-computed in JavaScript using trigonometric functions and rendered via CSS custom properties (`--dx`, `--dy`) for maximum browser compatibility.

---

### Q7: How is the reaction triggering optimized for speed?

**A:** The `GestureReactionEngine` uses a **ref-based, zero-delay architecture**:

- **No `setState` in the hot path** — all timing-critical data uses `useRef` to avoid React's batched state updates
- **Normalized distance threshold (0.20)** — works at any camera resolution
- **Runs on every render** (`useEffect` with no dependency array) for instant response
- **Local fallback first** — triggers visual effects immediately from local `chemicals.js` data before the API call returns
- **1.5-second debounce lock** — prevents duplicate triggers while allowing fast repeat

---

### Q8: What chemicals and reactions are supported?

**A:** The system includes **15 chemicals** and **14 pre-defined reactions** across multiple reaction types:

**Chemicals:** HCl, NaOH, H₂SO₄, Na, H₂O, NaHCO₃, CH₃COOH, H₂O₂, KNO₃, AgNO₃, NaCl, Fe, CuSO₄, Mg, Zn

**Reaction Types:**
- **Neutralization** — HCl + NaOH, H₂SO₄ + NaOH
- **Single Displacement** — Na + H₂O, Fe + CuSO₄, Mg + HCl, Zn + HCl, Zn + CuSO₄
- **Double Displacement** — AgNO₃ + NaCl
- **Acid-Carbonate** — HCl + NaHCO₃, CH₃COOH + NaHCO₃
- **Decomposition** — H₂O₂ + KNO₃

---

### Q9: What are the unique selling points (USPs) of this project?

**A:**
1. **Gesture-controlled chemistry** — First-of-its-kind hand-tracking interface for chemical reactions
2. **AI mistake detection** — Real-time intelligent supervision that guides students, not just shows results
3. **Risk-graduated visual effects** — Different effects for safe/moderate/danger reactions create visceral learning experiences
4. **Zero safety risk** — Students can safely explore reactions like Na + H₂O that are too dangerous for school labs
5. **Offline-capable** — Works entirely in-browser with local fallback data, no cloud dependency
6. **Teacher Mode** — Dedicated mode with extended notes, mistake logs, and detailed explanations

---

### Q10: What are the future enhancements planned?

**A:**
1. **Voice commands** — "Mix sodium with water" using Web Speech API
2. **AR mode** — Project 3D molecules onto the real world using WebXR
3. **Multiplayer lab** — Students collaborate on experiments via WebRTC
4. **Assessment mode** — Graded quizzes where students must predict reaction outcomes
5. **More chemicals** — Expand from 15 to 50+ chemicals with organic reactions
6. **Mobile support** — Responsive layout with touch-based alternative to gestures
7. **LMS integration** — Export results to Google Classroom or Moodle

---

## Frequently Asked Questions (FAQ)

### General

**Q: Does the app work without a webcam?**
A: Yes! The Manual Lab mode works fully without a webcam. Only the Live Lab requires camera access.

**Q: Does the app need an internet connection?**
A: No. All reaction data is stored locally in `chemicals.js`. The backend API is optional and only enhances AI explanations.

**Q: Which browsers are supported?**
A: Chrome and Edge are recommended for best MediaPipe support. Firefox works for Manual Lab but may have limited hand tracking support.

### Live Lab

**Q: Why isn't my hand being detected?**
A: Ensure good lighting (avoid backlit situations), show your full palms to the camera, and keep hands within frame. The lighting hint will appear if conditions are poor.

**Q: How close do my hands need to be?**
A: The trigger threshold is 20% of the normalized frame width. Roughly when your hands are visibly close together — they don't need to physically touch.

**Q: Can I trigger the same reaction multiple times?**
A: Yes! There is no limit on repeating reactions. A warning will appear after 3 dangerous reactions as a safety reminder, but it will never block you.

**Q: What do the colored dots on my hand mean?**
A: 🟢 Green = stable tracking (high confidence), 🟡 Yellow = weak tracking (moderate confidence), 🔴 Red = lost tracking (low confidence).

### Technical

**Q: How is performance optimized?**
A: Hand tracking runs via `requestAnimationFrame` loop, coordinate smoothing uses a 5-frame moving average, effects use CSS animations (GPU-accelerated), and the reaction engine uses refs instead of state for zero-delay response.

**Q: What is the API endpoint structure?**
A:
- `POST /mix` — Send `{ chem1, chem2 }` to get reaction data
- `POST /analyze-mistake` — Send mistake context for AI explanation
- `GET /reaction-guide` — Get all available reactions

---

## 📄 License

This project is built as a capstone project for educational purposes.

---

<p align="center">
  Built with ❤️ by the Reactech Team
</p>
"# reactech" 
"# reactech" 
