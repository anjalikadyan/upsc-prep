(() => {
  const storageKey = "upscPrepProgressV3";
  const emptyProgress = () => ({ answered: {}, tests: [], bookmarks: [] });

  function readProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (!saved || typeof saved !== "object") return emptyProgress();
      return {
        answered: saved.answered && typeof saved.answered === "object" ? saved.answered : {},
        tests: Array.isArray(saved.tests) ? saved.tests : [],
        bookmarks: Array.isArray(saved.bookmarks) ? saved.bookmarks : []
      };
    } catch {
      return emptyProgress();
    }
  }

  function saveProgress(progress) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(progress));
      window.dispatchEvent(new CustomEvent("upsc-progress-updated"));
      return true;
    } catch {
      window.dispatchEvent(new CustomEvent("upsc-storage-error"));
      return false;
    }
  }

  window.upscApp = function () {
    return {
      page: "home",
      today: new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
      toast: "",
      categories: window.UPSC_CATEGORIES,
      questions: window.UPSC_QUESTIONS,
      progress: readProgress(),
      toastTimer: null,
      init(page) {
        this.page = page;
        window.addEventListener("upsc-progress-updated", () => this.progress = readProgress());
        window.addEventListener("upsc-storage-error", () => this.notify("Browser storage is full or unavailable."));
      },
      stats() {
        const answers = Object.values(this.progress.answered || {});
        const correct = answers.filter(item => item.correct).length;
        return { attempted: answers.length, correct, accuracy: answers.length ? Math.round(correct / answers.length * 100) : 0, tests: this.progress.tests.length, bookmarks: this.progress.bookmarks.length };
      },
      questionCount(category) {
        return this.questions.filter(item => item.category === category).length;
      },
      filteredQuestions(category, search, difficulty, savedOnly) {
        const term = (search || "").trim().toLowerCase();
        return this.questions.filter(item => {
          const categoryMatch = category === "All" || item.category === category;
          const searchMatch = (item.text + " " + item.category + " " + item.year + " " + (item.difficulty || "")).toLowerCase().includes(term);
          const difficultyMatch = !difficulty || difficulty === "All" || (item.difficulty || "Medium") === difficulty;
          const savedMatch = !savedOnly || this.isBookmarked(item.id);
          return categoryMatch && searchMatch && difficultyMatch && savedMatch;
        });
      },
      answered(id) { return this.progress.answered[id] || null; },
      answerQuestion(question, choice) {
        if (this.progress.answered[question.id]) return;
        this.progress.answered[question.id] = { choice, correct: choice === question.answer, date: new Date().toISOString() };
        saveProgress(this.progress);
      },
      optionClass(question, index) {
        const saved = this.answered(question.id);
        if (!saved) return "";
        if (index === question.answer) return "correct";
        if (index === saved.choice) return "incorrect";
        return "";
      },
      isBookmarked(id) { return this.progress.bookmarks.includes(id); },
      toggleBookmark(id) {
        const exists = this.isBookmarked(id);
        this.progress.bookmarks = exists ? this.progress.bookmarks.filter(item => item !== id) : [...this.progress.bookmarks, id];
        saveProgress(this.progress);
        this.notify(exists ? "Question removed from saved list." : "Question saved for revision.");
      },
      categoryAccuracy(category) {
        const list = this.questions.filter(item => item.category === category && this.progress.answered[item.id]);
        return list.length ? Math.round(list.filter(item => this.progress.answered[item.id].correct).length / list.length * 100) : 0;
      },
      testHistory() { return this.progress.tests || []; },
      resetProgress() {
        if (!confirm("This will clear saved answers, bookmarks and mock test history in this browser. Continue?")) return;
        this.progress = emptyProgress();
        saveProgress(this.progress);
        this.notify("Your progress has been reset.");
      },
      notify(message) {
        this.toast = message;
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => this.toast = "", 2500);
      }
    };
  };

  window.mockPanel = function () {
    return {
      categories: window.UPSC_CATEGORIES,
      category: "All", count: 10, duration: 10, questions: [], answers: {}, index: 0,
      remaining: 0, running: false, result: null, review: [], interval: null,
      current() { return this.questions[this.index] || {}; },
      testHistory() { return readProgress().tests || []; },
      start() {
        const pool = window.UPSC_QUESTIONS.filter(item => this.category === "All" || item.category === this.category);
        if (!pool.length) return;
        this.questions = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(this.count, pool.length));
        this.answers = {};
        this.index = 0;
        this.remaining = this.duration * 60;
        this.result = null;
        this.running = true;
        clearInterval(this.interval);
        this.interval = setInterval(() => {
          if (!this.running) return clearInterval(this.interval);
          this.remaining -= 1;
          if (this.remaining <= 0) this.submit(true);
        }, 1000);
      },
      timeText() {
        const left = Math.max(0, this.remaining);
        return String(Math.floor(left / 60)).padStart(2, "0") + ":" + String(left % 60).padStart(2, "0");
      },
      submit(timeUp) {
        if (!this.running) return;
        clearInterval(this.interval);
        this.running = false;
        const score = this.questions.filter(item => this.answers[item.id] === item.answer).length;
        this.result = { score, total: this.questions.length, timeUp, attempted: Object.keys(this.answers).length };
        this.review = [...this.questions];
        const progress = readProgress();
        progress.tests.push({ date: new Date().toISOString(), score, total: this.questions.length, attempted: Object.keys(this.answers).length, category: this.category, duration: this.duration });
        saveProgress(progress);
      },
      reset() {
        clearInterval(this.interval);
        this.running = false;
        this.result = null;
        this.questions = [];
        this.answers = {};
        this.index = 0;
        this.remaining = 0;
      }
    };
  };
})();
