# UPSC Preparation Platform

A responsive multi-page UPSC study platform built with HTML, CSS, HTMX, Alpine.js and vanilla JavaScript. Each main section has its own HTML page and loads content from separate partial files.

## Features

- Separate Home, Exams, Mock Test and Dashboard pages
- HTMX loads reusable page partials from `partials/`
- Alpine.js manages reactive UI, filters, answer selection and mock tests
- 54 sample practice questions across seven subjects
- Topic-wise practice with instant feedback and explanations
- Search and filter by category and difficulty
- Save questions for later revision
- Configurable mock tests with 5, 10, 20 or 30 questions
- Countdown timer and automatic submission
- Previous and next question navigation
- Score, attempted count and answer review
- Subject-wise accuracy and mock test history
- LocalStorage persistence for answers, bookmarks and tests
- Reset progress option
- Responsive desktop and mobile layout

## Project structure

```text
upsc-prep-htmx-alpine/
├── index.html
├── home.html
├── exam.html
├── mock.html
├── dashboard.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   └── data.js
└── partials/
    ├── home-content.html
    ├── exam-content.html
    ├── mock-content.html
    └── dashboard-content.html
```


## Library usage

- **HTMX** loads page content from the `partials/` directory.
- **Alpine.js** handles reactive page state, filters, answer selection and mock test interactions.
- **JavaScript** stores the question bank and shared application logic.
- **localStorage** saves progress in the current browser.

The application scripts are loaded before Alpine.js so `upscApp()` and `mockPanel()` are available when Alpine initializes.

## Add a question

Add an object to `window.UPSC_QUESTIONS` in `js/data.js`:

```javascript
{
  id: 55,
  category: "Polity",
  year: 2025,
  difficulty: "Medium",
  text: "Write your question here.",
  options: ["Option A", "Option B", "Option C", "Option D"],
  answer: 0,
  explanation: "Explain why the correct option is right."
}
```

Every question needs a unique numeric ID. The category must match an item in `window.UPSC_CATEGORIES`. The answer is a zero-based option index. Difficulty should be `Easy`, `Medium` or `Hard`.

## Progress storage

Practice answers, saved questions and mock test history are stored in browser `localStorage`. They are local to the current browser and do not sync between devices. Clearing browser site data removes this progress.

## Content note

The included questions are sample practice material. They are not represented as official UPSC previous-year questions. Verify facts against trusted references and official UPSC papers when preparing for the examination.

## External dependencies

HTMX and Alpine.js are loaded from public CDNs. Internet access is required unless you download and host those library files locally.
