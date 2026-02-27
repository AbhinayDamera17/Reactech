# ⚗️ Reactech — Virtual Chemistry Lab

> **An AI-powered, gesture-controlled virtual chemistry lab that uses real-time hand tracking to simulate chemical reactions with dramatic visual effects, intelligent mistake detection, and Gemini AI assistance.**

[![Built with React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite)](https://vitejs.dev)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Hands-4285f4?logo=google)](https://mediapipe.dev)
[![Three.js](https://img.shields.io/badge/Three.js-3D_FX-black?logo=three.js)](https://threejs.org)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI_Powered-4285f4?logo=google)](https://ai.google.dev/)

---

## 📖 Table of Contents

- [About the Project](#about-the-project)
- [Key Features](#key-features)
- [What's New](#whats-new)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [AI Integration](#ai-integration)
- [Capstone Questions & Answers](#capstone-questions--answers)
- [Frequently Asked Questions (FAQ)](#frequently-asked-questions-faq)

---

## About the Project

**Reactech** is a cutting-edge web-based virtual chemistry laboratory designed for students and teachers. It combines real-time hand tracking, AI-powered assistance, and immersive visual effects to create an engaging and safe learning environment.

### Three Interactive Modes:

- **Manual Lab** — Select chemicals from searchable dropdowns, mix them with realistic beaker visualization, interactive pH testing with litmus paper, and get AI-powered explanations
- **Live Lab** — Uses webcam and **MediaPipe hand tracking** to detect real hand gestures. Assign chemicals to each hand, bring them together, and watch reactions with **real-time 3D effects**
- **Reaction Guide** — Comprehensive encyclopedia of all available reactions with advanced filtering and search capabilities

The application features an **AI Lab Assistant** powered by Google Gemini that provides real-time chemistry guidance, safety advice, and educational explanations.

---

## Key Features

| Feature | Description |
|---------|-------------|
| 🖐️ **Real-time Hand Tracking** | MediaPipe Hands detects and tracks both hands at 30fps with smoothed coordinates |
| 🧪 **35 Chemicals & 44+ Reactions** | Comprehensive database including acids, bases, metals, salts, and organic compounds |
| 💥 **Dramatic Visual Effects** | Risk-based 3D effects: sparkles (safe), smoke + sparks (moderate), fireball + shockwave (danger) |
| 🤖 **Gemini AI Assistant** | Google Gemini-powered chat assistant for chemistry questions and safety guidance |
| 🔍 **Searchable Chemical Selection** | Type-to-filter dropdowns with formula and name search |
| 🧪 **Realistic Beaker Visualization** | Layered chemicals with liquid animations, solid particles, and glass effects |
| 🧪 **Interactive Litmus Paper pH Testing** | Real-time pH testing with color-changing litmus paper and educational pH scale |
| 📚 **Advanced Reaction Guide** | Searchable encyclopedia with risk-based filtering and detailed explanations |
| 🎯 **Gesture-Based Triggering** | Bring hands together to trigger reactions — zero-delay ref-based engine |
| 💬 **Intelligent Mistake Detection** | AI-powered system that validates reactions and provides safety guidance |
| 🖥️ **Debug Mode** | Real-time FPS, hand distance, tracking quality, and API status overlay |

---

## What's New

### 🚀 Latest Updates (v2.1)

- **🧪 Interactive Litmus Paper**: Added real-time pH testing to Lab Workspace with color-changing indicators and educational pH scale
- **🤖 Gemini AI Integration**: Replaced local Q&A with Google Gemini AI for comprehensive chemistry assistance
- **🔍 Enhanced Chemical Database**: Expanded from 15 to 35 chemicals with 44+ reactions
- **🧪 Realistic Beaker Effects**: Added layered chemical visualization with liquid animations and solid particles
- **🎨 Unified Dark Theme**: Consistent cyan-accented dark theme across all three modes
- **📱 Improved UX**: Searchable chemical dropdowns with type-to-filter functionality
- **🔧 Better Performance**: Fixed height constraints and optimized rendering
- **🧹 Clear Beaker Function**: One-click reset for starting fresh experiments

### 🎯 Key Improvements

- **Interactive pH Testing**: Real-time litmus paper that changes color based on chemical pH levels
- **Educational pH Scale**: Visual pH scale (0-14) with moving marker and acid/base classifications
- **Searchable Dropdowns**: Type chemical names or formulas to quickly find compounds
- **Layered Chemical Display**: See chemicals as separate layers before mixing, with realistic physics
- **Enhanced Visual Effects**: Improved glass materials, liquid surfaces, and particle systems
- **AI-Powered Responses**: Get detailed explanations about chemical properties, safety, and real-world applications
- **Responsive Layout**: Better spacing and alignment across all screen sizes

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | React 19 | Component-based UI with concurrent features |
| **Build Tool** | Vite 7 | Fast HMR dev server and optimized builds |
| **Hand Tracking** | MediaPipe Tasks Vision | Real-time hand landmark detection |
| **3D/Effects** | Three.js, @react-three/fiber, @react-three/drei | Hardware-accelerated 3D rendering |
| **AI Assistant** | Google Gemini API | Natural language chemistry assistance |
| **Styling** | Vanilla CSS | Dark glassmorphism theme with animations |
| **State Management** | React Hooks | Local state with useRef for performance-critical paths |

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        REACTECH APP                          │
├──────────────┬──────────────┬──────────────┬─────────────────┤
│   Manual Lab │   Live Lab   │ Reaction     │  Gemini AI      │
│   • Beaker   │   • Camera   │ Guide        │  Assistant      │
│   • Dropdowns│   • Tracking │ • Search     │  • Chat         │
│   • pH Test  │   • Effects  │ • Filter     │  • Context      │
├──────────────┴──────────────┴──────────────┴─────────────────┤
│                    CORE SERVICES                             │
│  ┌─────────────┐ ┌──────────────────┐ ┌───────────────────┐ │
│  │ HandTracker  │ │ GestureReaction  │ │ MistakeDetector   │ │
│  │ (MediaPipe)  │ │ Engine           │ │ System            │ │
│  └──────┬──────┘ └────────┬─────────┘ └────────┬──────────┘ │
│         │                 │                     │            │
│  ┌──────▼──────┐ ┌────────▼─────────┐ ┌────────▼──────────┐ │
│  │ CameraFeed  │ │ ReactionEffects  │ │ Gemini Service    │ │
│  │ ChemOverlay │ │ 3D + Particles   │ │ API Integration   │ │
│  │ TestTube    │ │ LitmusPaper      │ │ Context Building  │ │
│  └─────────────┘ └──────────────────┘ └───────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│               chemicals.js (Expanded Reaction Database)      │
│               gemini.js (AI Service Integration)             │
└──────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
Reactech/
├── index.html                  # Entry HTML
├── package.json                # Dependencies & scripts
├── vite.config.js              # Vite configuration
├── .env.example                # Environment variables template
├── GEMINI_SETUP.md            # AI setup instructions
└── src/
    ├── main.jsx                # React entry point
    ├── App.jsx                 # Root app with tab navigation
    ├── App.css                 # Global styles and theme
    ├── LiveLab.css             # Live Lab specific styles + animations
    ├── chemicals.js            # Expanded chemical database (35 chemicals, 44+ reactions)
    ├── services/
    │   └── gemini.js           # Google Gemini AI integration
    ├── components/
    │   ├── LiveLabPage.jsx     # Live Lab — camera + hand tracking + reactions
    │   ├── HandTracker.jsx     # MediaPipe hand detection & smoothing
    │   ├── CameraFeed.jsx      # Webcam video capture
    │   ├── ChemicalOverlay.jsx # Chemical labels on tracked hands
    │   ├── GestureReactionEngine.jsx  # Gesture-based reaction trigger
    │   ├── ReactionEffects3D.jsx      # 3D visual effects system
    │   ├── ExplosionEffect.jsx # Explosion particle effects
    │   ├── SmokeEffect.jsx     # Smoke and steam effects
    │   ├── MistakeOverlay.jsx  # Warning cards & danger modals
    │   ├── MistakeLog.jsx      # Session mistake history
    │   ├── ReactionPanel.jsx   # Manual Lab with beaker visualization
    │   ├── ReactionCard.jsx    # Individual reaction display card
    │   ├── GuidePage.jsx       # Reaction Guide encyclopedia
    │   ├── AssistantPanel.jsx  # Gemini AI chat assistant
    │   ├── LitmusPaper.jsx     # Interactive pH testing component
    │   ├── TestTube.jsx        # Test tube visualization for Live Lab
    │   ├── SearchableSelect.jsx # Type-to-filter dropdown component
    │   ├── FilterDropdown.jsx  # Advanced filtering component
    │   ├── SearchBar.jsx       # Search input component
    │   └── RiskBadge.jsx       # Risk level indicator
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
- **Google Gemini API Key** (optional, for AI assistant)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/reactech.git
cd reactech

# Install frontend dependencies
npm install

# Set up environment variables (optional)
cp .env.example .env
# Edit .env and add your Gemini API key

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### Backend Setup (Optional but Recommended)

The Python backend provides advanced chemistry analysis and AI-powered features:

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Set up backend environment variables
cp ../.env.example .env
# Edit .env and add your API keys

# Start the backend server
python app.py
```

The backend will be available at `http://localhost:8000`.

**API Documentation**: Visit `http://localhost:8000/docs` for interactive API documentation.

### AI Setup (Optional)

To enable the Gemini AI assistant:

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Copy `.env.example` to `.env`
3. Add your API key: `VITE_GEMINI_API_KEY=your_api_key_here`
4. Restart both frontend and backend servers

See `GEMINI_SETUP.md` for detailed instructions.

> **Note:** The app works with three levels of functionality:
> 1. **Frontend only**: Basic reactions with local data
> 2. **Frontend + Gemini**: Enhanced AI chat assistant
> 3. **Full stack**: Advanced chemistry engine + AI analysis

---

## Usage Guide

### Manual Lab
1. Select **Chemical A** and **Chemical B** from the searchable dropdowns
2. Type to filter chemicals by name or formula
3. Watch chemicals appear as layers in the realistic beaker
4. **Observe the Litmus Paper** — it automatically shows the pH of selected chemicals
   - 🔴 Red: Strong acids (pH < 5)
   - 🟠 Orange: Weak acids (pH 5-7)
   - 🟣 Purple: Neutral (pH = 7)
   - 🔵 Light Blue: Weak bases (pH 7-10)
   - 🔵 Blue: Strong bases (pH > 10)
5. Click **Mix** to trigger the reaction
6. View the balanced equation, products, and risk assessment
7. **Check the updated pH** — litmus paper shows the reaction's final pH
8. Use the **pH scale reference** to understand acid/base strength
9. Click **Clear Beaker** to start fresh

### Live Lab
1. Navigate to the **Live Lab** tab
2. Grant **camera permission** when prompted
3. Select chemicals for **Left Hand** and **Right Hand** using searchable dropdowns
4. Show both hands to the camera — colored landmarks will appear
5. **Bring your hands together** — the reaction triggers instantly with 3D effects
6. View results and explanations in the sidebar panel
7. Toggle **Debug Mode** to see real-time tracking metrics

### Reaction Guide
1. Browse all available reactions in an organized grid
2. Use the **search bar** to find specific chemicals or reactions
3. **Filter by risk level** (Safe, Moderate, Danger) or reaction type
4. Click any reaction card to see detailed information
5. View balanced equations, products, and safety notes

### AI Assistant
1. Click the **🤖 AI** toggle to enable Gemini-powered responses
2. Ask any chemistry question in natural language
3. Get detailed explanations about:
   - Chemical properties and uses
   - Safety precautions and PPE requirements
   - Reaction mechanisms and theory
   - Real-world applications
4. The AI maintains conversation context for follow-up questions

---

## AI Integration

### Gemini AI Features

The Google Gemini integration provides:

- **Natural Language Processing**: Ask questions in plain English
- **Chemistry Expertise**: Specialized knowledge about chemical reactions, safety, and applications
- **Contextual Responses**: Maintains conversation history for follow-up questions
- **Educational Focus**: Responses tailored for student learning with safety emphasis
- **Fallback Support**: Graceful degradation to local responses if API is unavailable

### Example Interactions

```
Student: "Where do we use NaOH in daily life?"

AI Response: "NaOH (Sodium Hydroxide) has many daily uses:
• Soap making - saponification of fats
• Drain cleaners - dissolves grease and hair
• Paper production - pulping wood
• Food processing - pretzels, olives
• Oven cleaners - breaks down baked-on grease

⚠️ Caustic - handle with care!"
```

### API Configuration

The Gemini service uses:
- **Model**: `gemini-2.5-flash` (latest fast model)
- **API Version**: `v1beta` (current stable)
- **Temperature**: 0.7 (balanced creativity/accuracy)
- **Max Tokens**: 500 (concise responses)
- **Safety Settings**: Configured for educational content

---

## Frequently Asked Questions (FAQ)

### General

**Q: Does the app work without a webcam?**
A: Yes! The Manual Lab and Reaction Guide work fully without a webcam. Only the Live Lab requires camera access.

**Q: Does the app need an internet connection?**
A: No for basic functionality. All reaction data is stored locally. Internet is only needed for the Gemini AI assistant, which has local fallbacks.

**Q: Which browsers are supported?**
A: Chrome and Edge are recommended for best MediaPipe support. Firefox works for Manual Lab but may have limited hand tracking capabilities.

### AI Assistant

**Q: How do I enable the AI assistant?**
A: Get a free Gemini API key from Google AI Studio, add it to your `.env` file as `VITE_GEMINI_API_KEY`, and restart the server. See `GEMINI_SETUP.md` for details.

**Q: What can I ask the AI?**
A: Anything chemistry-related! Ask about chemical properties, safety procedures, real-world applications, reaction mechanisms, or general chemistry concepts.

**Q: Does the AI remember our conversation?**
A: Yes, it maintains context from the last 6 messages for follow-up questions and natural conversation flow.

### Live Lab

**Q: Why isn't my hand being detected?**
A: Ensure good lighting, show your full palms to the camera, and keep hands within frame. Avoid backlighting and wear contrasting colors.

**Q: How close do my hands need to be?**
A: The trigger threshold is 20% of the normalized frame width. Your hands should be visibly close but don't need to physically touch.

**Q: What do the colored dots mean?**
A: 🟢 Green = stable tracking, 🟡 Yellow = moderate confidence, 🔴 Red = low confidence or lost tracking.

### Manual Lab

**Q: How do I search for chemicals?**
A: Click on any dropdown and start typing. You can search by chemical name (e.g., "sodium") or formula (e.g., "NaOH").

**Q: Why do chemicals appear in layers?**
A: This simulates real chemistry where denser liquids sink and solids settle. Chemical B appears at the bottom, Chemical A on top.

**Q: How does the Litmus Paper work?**
A: The litmus paper automatically appears when you select chemicals and shows real-time pH changes. It uses realistic color coding: red for acids, purple for neutral, and blue for bases. The pH scale below shows the exact value and moves as you add different chemicals.

**Q: How accurate is the pH testing?**
A: pH values are based on realistic chemical properties. Strong acids show red (pH 1-2), strong bases show blue (pH 12-14), with appropriate colors for weak acids/bases. The system uses actual chemical data for educational accuracy.

---

## 📄 License

This project is built as a capstone project for educational purposes.

---

<p align="center">
  Built with ❤️ and powered by Google Gemini AI
</p>