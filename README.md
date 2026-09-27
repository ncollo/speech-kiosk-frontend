# ClearCaption — AI Speech-to-Text Captioning Kiosk for Hospital Reception

An accessible, real-time speech-to-text captioning kiosk designed for Deaf and hard-of-hearing (HoH) patients at hospital reception and intake desks.

Deployed as a dual-display interactive system: a patient-facing 10-inch tablet kiosk paired with a clinician triage dashboard.

---

## 🏥 Problem Statement & Clinical Context

Communication barriers in clinical intake lead to diagnostic delays, heightened anxiety, and potential medical errors for Deaf and hard-of-hearing patients. Face masks, glass partitions, and rapid speech exacerbate these barriers.

**ClearCaption** bridges this gap right at the reception counter:
- Converts clinician/receptionist speech into high-contrast, large-font captions with sub-300ms latency.
- Provides visual symptom cards with integrated American Sign Language (ASL) video references for non-verbal response.
- Delivers a staff console with timestamped transcripts, statement flagging, and emergency triage escalation.

---

## ✨ Key Features

### 1. Patient-Facing Tablet Interface
- **Ultra-Legible Captions:** Minimum 34px bold text using the Braille Institute's **Atkinson Hyperlegible** typeface.
- **Cognitive Clarity:** Two-line conversational context (previous question faded above current response).
- **Tactile Symptom Grid:** 10 visual symptom selector cards with generous touch targets (80px+ height).
- **ASL Video Integration:** Each symptom card features an instant sign language video indicator.
- **Ambient Connection Indicator:** Discreet, non-alarming status bar ("Listening · Session active").
- **Zero Distraction Design:** Functional-only layout with zero drop shadows, gradients, or extraneous decorations.

### 2. Clinician & Receptionist Triage Console
- **Timestamped Transcripts:** Live chronological conversation log with speaker delineation.
- **Critical Statement Flagging:** One-tap amber flags to highlight key statements for physician handoff.
- **Triage Escalation:** Immediate trigger to alert emergency staff or request an in-person ASL interpreter.
- **Microphone Management:** Dedicated mute and audio gain controls.

### 3. Project Overview & Landing Page
- Comprehensive marketing & documentation portal detailing system architecture.
- Real medical photography and live interface showcase with interactive view toggles.
- WCAG 2.2 AAA accessibility compliance breakdown and clinical impact metrics.

---

## 🎨 Design System & Palette

| Token | Hex | Usage |
|---|---|---|
| **Slate Teal** | `#1B4B4F` | Primary brand, headers, button backgrounds |
| **Warm Off-White** | `#FAF8F3` | Surface background, optimal contrast |
| **Muted Amber** | `#C97A2B` | Active symptom selection, triage alerts (never decorative) |
| **Deep Charcoal** | `#123336` | Console frames, dark navigation surfaces |

---

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Modular Vanilla CSS with scoped design tokens
- **Typography:** Atkinson Hyperlegible (Google Fonts / Braille Institute)
- **Routing:** React Router v7

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ncollo/speech-kiosk-frontend.git
cd speech-kiosk-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

### Available Routes
- `/` — Project landing page, feature highlights, and interface showcase
- `/kiosk` — Interactive hospital kiosk application (Patient & Clinician views)

### Production Build

```bash
npm run build
npm run preview
```

---

## ♿ Accessibility Compliance

- **WCAG 2.2 AAA:** Color contrast ratios exceed 7:1 for all critical text.
- **ADA Title III:** Compliant interactive touch targets (minimum 64px).
- **HIPAA Privacy:** Zero persistent voice recording stored locally on the public kiosk interface.

---

## 📄 License

MIT License. Designed with Deaf and Hard-of-Hearing advocacy principles for healthcare accessibility.
