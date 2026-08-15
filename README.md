# 🧠 MemoryMap — Turn information into connections.

An AI-powered knowledge mapping & learning platform. Upload a PDF, paste notes, or
enter a topic, and MemoryMap turns it into an **interactive knowledge graph** —
then tutors you on every concept, quizzes you adaptively, detects your weak
areas, and tracks your mastery from **Unknown → Learning → Familiar → Mastered**.

Built for hackathons and demos: it ships with a **built-in mock AI mode** and a
complete **Electrostatics demo dataset**, so the whole product runs with **zero
configuration and no API key**.

---

## ✨ Features

| Area | What you get |
| --- | --- |
| 🗺️ Knowledge Map | Zoom / pan / drag / click nodes · expand & collapse branches · search · highlight related concepts · minimap · mastery colors on nodes |
| 🤖 AI Concept Tutor | Simple explanation, real-world example, key points, formulas, related concepts, common mistakes — plus "Ask AI" |
| 📝 Quiz Engine | Multiple choice, true/false, and short answer · per-concept quizzes · instant explanations |
| 📊 Weak-Area Detection | Quiz results flag weak concepts and generate a timed **study plan** |
| 📈 Progress Dashboard | Maps created, concepts learned, quiz scores, streaks, mastery distribution, recent activity |
| 🚀 Demo Mode | Click **Try Demo** and open the Electrostatics map instantly — 21 connected concepts |

## 🔄 Learning loop

```
Upload → Analyze → Knowledge Map → Explore → Learn → Quiz → Weak Areas → Review
```

---

## 🚀 Quick start

Requires **Node.js 18+**.

```bash
npm install
npm run dev        # → http://localhost:5173
```

Open the app, click **Try the Electrostatics Demo**, and the full flow works
immediately — no keys, no sign-up.

### Production build

```bash
npm run build      # outputs ./dist (static site)
npm run preview    # serve the production build locally
```

---

## 🧪 Demo mode (no API key)

The app defaults to **mock AI mode**. All five AI operations
(`generateKnowledgeMap`, `explainConcept`, `generateQuiz`, `evaluateAnswer`,
`generateStudyPlan`, `askQuestion`) are answered locally using the curated
Electrostatics dataset + question bank. This is what makes the demo bulletproof
for hackathon presentations.

## 🔌 Wiring up real AI

The AI layer is a clean abstraction (`src/services/aiService.js`). The app only
talks to that interface — swap providers without touching UI code.

**Option A — Express proxy (recommended):**

```bash
# terminal 1 — backend
cp .env.example .env            # then edit server/.env with AI_PROVIDER=openai + key
npm run server                  # → http://localhost:3001

# terminal 2 — frontend
$env:VITE_API_URL="http://localhost:3001"   # or put in a .env file
npm run dev
```

**Option B — direct provider:** extend `getProvider()` in `aiService.js` and add
a new provider class implementing the same methods.

### Environment variables

See [.env.example](./.env.example). Keys stay **server-side only** — never ship
them in frontend code. The frontend only ever talks to `/api/*` on your own
backend.

---

## 🏗️ Architecture

```
src/
├── components/          # Navbar, UI primitives (toasts, skeletons)
├── pages/               # Landing, CreateMap, KnowledgeMap, Quiz, Results, Dashboard
├── features/
│   ├── knowledge-map/   # React Flow graph, layout, nodes
│   ├── tutor/           # ConceptPanel (AI tutor)
│   ├── quiz/            # quiz + results logic
│   └── progress/        # dashboard widgets
├── services/
│   ├── aiService.js     # ← AI abstraction (single entry point)
│   └── providers/
│       └── mockAIProvider.js
├── hooks/
├── utils/               # types, mastery, storage, dates
├── data/                # demo dataset + quiz bank
└── styles/              # global.css, app.css
server/                  # optional Express AI proxy (mock or OpenAI)
```

**AI abstraction:**

```
aiService (client)
 ├── generateKnowledgeMap()
 ├── explainConcept()
 ├── generateQuiz()
 ├── evaluateAnswer()
 ├── generateStudyPlan()
 └── askQuestion()
```

---

## 🛠️ Tech stack

- **React 18 + Vite** (fast builds, easy deploy)
- **React Flow (@xyflow/react)** — interactive graph, minimap, controls
- **React Router** — multi-page flow
- **Framer Motion** — smooth landing-page animations
- **Lucide** — icons
- **Express** — optional AI proxy backend

## ☁️ Deploy

The frontend is a static site — host `dist/` anywhere (GitHub Pages, Netlify,
Vercel, Cloudflare Pages):

```bash
npm run build
```

For real AI, deploy `server/` to a platform with Node support and set the env
vars above.

## ⚖️ Notes

- Progress is stored in `localStorage` (per-browser). No account needed.
- PDF uploads are parsed entirely in your browser with PDF.js — no server
  required. Full text is extracted page-by-page (up to 80 pages) and used to
  build the map. Scanned/image-only PDFs show a clear error and suggest pasting
  text instead. Files up to 50 MB are accepted.