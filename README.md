<img width="1280" height="640" alt="LeafPop project banner" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />

# LeafPop AI 🎯

## Basic Details
### Team Name: team dualSIM

### Team Members
- Team Lead: Tharun Krishna C U - Christ College of Engineering (Autonomous), Irinjalakuda
- Member 2: Anoop Danimon - Christ College of Engineering (Autonomous), Irinjalakuda
- Member 3: [Add member name] - [Add college]

### Project Description
LeafPop AI is a smart leaf analysis and pop-scoring platform that combines image-based leaf health prediction with real and virtual pop gameplay. Users can upload or analyze a leaf, estimate its pop potential, and compete in a leaderboard based on how well they pop the leaf or crack the virtual leaf.

### The Problem (that doesn't exist)
People were never fully satisfied with just looking at leaves — they wanted a way to turn plant analysis into an actual challenge, score it like a game, and compare results with friends. Basically, the world needed a leaf that could be judged like a sport.

### The Solution (that nobody asked for)
LeafPop AI turns leaf inspection into a playful experience. It predicts leaf health and crack potential using AI, scores real-world audio pops with signal processing, and adds a virtual leaf-popping game with leaderboard competition. It is part science, part sport, and part chaos — all in the name of better leaf vibes.

## Technical Details
### Technologies/Components Used
For Software:
- Python
- FastAPI
- Pydantic
- Supabase
- Next.js
- TypeScript
- React
- Tailwind CSS
- Librosa
- SciPy
- NumPy
- MediaRecorder API
- GitHub Actions / Git

For Hardware:
- No dedicated hardware required for the software version
- Uses microphone input from a laptop/mobile device for real pop recordings
- Optional external microphone for better audio capture quality

### Implementation
For Software:

# Installation
```bash
# Backend
cd leafpop-backend
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd ../leafpop-frontend
npm install
```

# Run
```bash
# Backend
cd leafpop-backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend
cd leafpop-frontend
npm run dev
```

### Project Documentation
For Software:

# Screenshots (Add at least 3)
![Leaf analyzer dashboard](docs/screenshots/leaf-analyzer.png)
*AI leaf analysis dashboard showing leaf health, dryness, and pop potential.*

![Real pop recording flow](docs/screenshots/real-pop.png)
*Users record a leaf pop and the model evaluates loudness, sharpness, and impact.*

![Virtual leaf pop gameplay](docs/screenshots/virtual-pop.png)
*Virtual leaf challenge where precision, timing, and impact determine the score.*

# Diagrams
![Workflow](docs/diagrams/leafpop-workflow.png)
*The application flow from leaf upload → AI analysis → real pop scoring → leaderboard ranking.*

## Team Contributions
- Tharun Krishna C U: Project leadership, backend API development, deployment setup, system integration
- Anoop Danimon: Frontend and gameplay development, UI/UX, project support
- [Add member name]: [Specific contributions]

---
Made with ❤️ at TinkerHub Useless Projects

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless-projects-3.0)


