# telc Deutsch A1 (Start Deutsch 1) — Reading Exam Simulator

A web application designed for **telc Deutsch A1 / Start Deutsch 1** exam preparation (specifically the **Lesen — Reading** section).

The application accurately simulates the real exam environment: authentic part structure, authentic texts, a 25-minute countdown timer, score calculation, and a detailed review of mistakes with clue quotes and vocabulary notes.

---

## 🎯 Conformity to the Real telc A1 / Start Deutsch 1 Exam

The **Lesen** section consists of **15 tasks (15 points)**:
- **Teil 1 (Tasks 1–5)**: Reading 2 short authentic texts (emails, personal letters, informational notices). Format: **Richtig (+)** / **Falsch (-)**.
- **Teil 2 (Tasks 6–10)**: 5 real-life situations. For each situation, 2 websites/advertisements (**a** and **b**) are provided. Objective: select the website that matches the user's request.
- **Teil 3 (Tasks 11–15)**: 5 authentic notices, signs, and announcements (Schilder, Aushänge). Format: **Richtig (+)** / **Falsch (-)**.

- **Exam Duration**: 25 minutes (in the official exam, the combined "Lesen + Schreiben" module lasts 45 minutes, with ~25 minutes allocated to reading).
- **Passing Score**: **9 out of 15 (60%)** — the official telc benchmark.

---

## ✨ Key Features

1. **Two Full Practice Exams (Modellsatz 1 and 2)**:
   - 30 authentic A1 tasks featuring typical exam traps (*Fallen*).
2. **Official Exam Timer (25:00)**:
   - Real-time countdown display with a color-coded warning during the final 5 minutes.
   - Pause option for untimed practice sessions.
   - Automatic test submission when time expires.
3. **Authentic Interface & Answer Sheet (Antwortbogen S10)**:
   - Realistic email presentation formatting.
   - Teil 2 formatted as modern web snippets and classified ads.
   - Teil 3 formatted as door signs, store notices, and public announcements.
   - Interactive digital telc S10 answer sheet with clickable bubble options `[+] [-]` and `[a] [b]`.
4. **Smart Navigation**:
   - Seamless jumping between exam parts and questions 1–15.
   - Status indicators for answered and unanswered questions.
5. **Detailed Review & Error Analysis**:
   - Final score, percentage, and pass/fail status (**BESTANDEN** / **NICHT BESTANDEN**).
   - Breakdown by section (Teil 1, 2, 3).
   - Filter by incorrect vs. correct answers.
   - Detailed explanation for each question with relevant clue quotes highlighted from the German text.
   - A1 core vocabulary glossary for each task.
   - **"Review Mistakes" Mode** (re-attempt only incorrect questions).
6. **SQLite Database**:
   - Automatic persistence of all exam attempts, completion times, and scores.
   - Attempt history review to track performance and progress over time.

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18 (tested on Node.js v25)
- npm

### Running the Application

```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Build the frontend
npm run build

# 3. Start the server (available at http://localhost:3001)
npm start
```

### Running with Docker

```bash
# Build and run container using Docker Compose
docker compose up --build

# Or using standard Docker commands:
docker build -t telc-a1 .
docker run -d -p 3001:3001 -v telc_data:/app/data --name telc-a1-app telc-a1
```

The application will be accessible at `http://localhost:3001`.
The SQLite database is persisted in the `telc_data` volume.

---

## 📁 Project Structure

```
telcA1/
├── server/
│   ├── db.js            # SQLite database initialization (node:sqlite) and migrations
│   ├── seed-data.js     # Question bank for Modellsatz 1 and 2 with explanations
│   └── index.js         # Express REST API server
├── src/
│   ├── components/
│   │   ├── Header.jsx         # Header with test variant selector and controls
│   │   ├── ExamTimer.jsx      # 25-minute timer with pause and warning alerts
│   │   ├── QuestionNav.jsx    # 1–15 question navigator and part switchers
│   │   ├── Teil1.jsx          # Reading texts, emails, and Richtig/Falsch questions
│   │   ├── Teil2.jsx          # Situations and website options (a / b)
│   │   ├── Teil3.jsx          # Signs, notices, and True/False statements
│   │   ├── Antwortbogen.jsx   # Authentic telc S10 answer sheet
│   │   ├── ResultsView.jsx    # Results screen with scoring, review, and explanations
│   │   └── HistoryModal.jsx   # Attempt history modal
│   ├── App.jsx                # Main application component and exam orchestration
│   ├── main.jsx               # React entry point
│   └── index.css              # Tailwind CSS styles
├── data/
│   └── telc_a1.db             # SQLite database
├── package.json
├── vite.config.js
└── tailwind.config.js
```
