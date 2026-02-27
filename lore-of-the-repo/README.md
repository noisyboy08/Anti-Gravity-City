<div align="center">
  <img src="https://raw.githubusercontent.com/glittercowboy/lord-of-repo/main/public/logo.png" alt="Lord of Repo Logo" width="120" />
  <h1>🌐 Lord of Repo</h1>
  <p><b>A Massively Gamified 3D Metaverse for Software Engineering Teams</b></p>
  
  [![React](https://img.shields.io/badge/React-18.x-00f5ff?style=for-the-badge&logo=react)](https://react.dev/)
  [![Three.js](https://img.shields.io/badge/Three.js-r172-white?style=for-the-badge&logo=three.js)](https://threejs.org/)
  [![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
  [![Gemini](https://img.shields.io/badge/AI-Google_Gemini-4285F4?style=for-the-badge&logo=google)](https://aistudio.google.com/)
</div>

<br/>

> **Lord of Repo** transforms your dull, static GitHub repositories into a sprawling, interactive, 3D Cyberpunk City. Instead of scrolling through an IDE tree view, you fly through a glowing metropolis where every building is a file, the altitude of the building represents its architectural depth, and real-time live effects visualize everything from Git commits to code complexity.

---

## 🚀 The Ultimate Gamified Developer Experience

This project takes 3D Code Visualization to the absolute extreme. Here are just a few of the **19+ Interactive Systems** running concurrently inside the engine:

### 🎮 The Feature Lab
- **📈 Economy of Code:** Repositories turned into a Stock Market. Files dynamically gain/lose LED-ticker "value" based on complexity algorithms.
- **🔫 FPS Mode (Glitch Hunt):** Switch from aerial drone cameras to `PointerLockControls`. Land on the streets, walk around in First-Person, and shoot neon wireframe Spiders crawling on buggy files.
- **🚀 The Burndown:** Real-time CI/CD webhook visualizations. When builds pass, Green supply capsules rain from the sky. When they fail, burning red meteorites crash into the city.
- **👁️ Phantom Reviewer:** A rogue AI drone that flies around your codebase physically spray-painting "Refactor This!" graffiti on bloated monolithic components.
- **🌀 The Nexus (Wormholes):** Inter-repository travel. Stargates at the edge of the universe let you physically warp your camera into entirely different frontend/backend microservices.
- **👻 Multiplayer "Ghost" Mode:** Connected to a local `socket.io` server. See your coworkers as glowing orbs flying around the codebase in real-time. If they interact with a file, a laser pointer shows you precisely what they are looking at.
- **👾 Linter Wars (Tower Defense):** Drop "TS Cannons" and "ESLint Lasers" onto file islands to defend your codebase from incoming unchecked raw-commit aliens.

### 🧠 Deep Codebase Analysis
- **AST Parsing (Knowledge Graph):** Real-time JavaScript fetching and regex parsing to physically draw glowing `EnergyBeams` connecting modules based on their `import/export` dependencies.
- **GitNexus Chatbot:** Fully powered by Google `gemini-1.5-flash`. The model natively ingests the entire mapped JSON architecture of your repository and can answer massive architectural questions inside a dedicated glassmorphism HUD.
- **Code Inspector Panel:** Double click a building to open its raw source code directly on the left of your screen via `react-syntax-highlighter` (Atom Dark Theme).
- **Time-Travel (Commit Scrubber):** A timeline slider at the bottom of the screen physically constructs and deconstructs the city's architecture to show how the repository evolved over time.

---

## 🛠️ Tech Stack & Architecture

- **Core Engine:** React 18 + Vite (for instantaneous HMR).
- **3D Renderer:** `@react-three/fiber` and `@react-three/drei` heavily augmenting `three.js`.
- **Styling:** Custom Vanilla CSS for extreme layout flexibility, paired with `framer-motion` for complex HUD/UI orchestrations and staggering micro-animations.
- **Backend:** Natively talks to the `api.github.com` REST endpoints. Features an optional lightweight `node.js / socket.io` express server for multiplayer presence.
- **Audio:** Custom procedural Web Audio API synthesizers (`src/utils/soundEffects.js`) for sci-fi Hover, Click, and Warp sounds.

---

## 📦 Local Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/lord-of-repo.git
   cd lord-of-repo
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```

4. **[Optional] Start the Multiplayer WebSocket Server**
   To see Ghost Avatars and multiplayer presence:
   ```bash
   # Open a separate terminal tab
   node server.js
   ```

---

## 💎 How to Use

1. Enter **any** public GitHub repository in the format `Owner/Repo` (e.g., `vuejs/core` or `facebook/react`) into the Search Bar.
2. Click **Visualize**.
3. *Optional:* Obtain a Free **Google Gemini API Key** from Google AI Studio and paste it onto the initial home screen. This will unlock the **GitNexus Chat** feature.
4. **Navigation:** Left-click and drag to orbit around the city. Scroll to zoom. Use the right-click to pan.
5. **HUD Controls:** Open the **Feature Lab** on the left to toggle gamification layers. Open the bottom **Timeline** to scrub through time. Click the **Floating `+` Button** in the bottom right to export a 3D STL Trophy or switch to Galaxy mode.

---

## 🚧 Roadmap / Future Upgrades

- [ ] **Full IDE Two-Way Sync:** A VS Code extension that beams your local cursor position into the 3D world.
- [ ] **InstancedMesh Integration (Linux Kernel Support):** The `Mega City` option currently creates mock models. The ultimate goal is passing the raw GitHub data through `<instancedMesh>` to render 100,000+ files at 160FPS natively.
- [ ] **Actual CI/CD Integration:** Connect "The Burndown" feature directly to GitHub Actions webhooks to monitor active deployments.

---

<div align="center">
  <p><i>"The most beautiful way to visualize technical debt."</i></p>
</div>
