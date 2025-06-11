class Game {
  constructor() {
    this.level = 1;
    this.maxTime = 10;
    this.timer = null;
    this.timeLeft = 0;
    this.correctAnswer = 0;
    this.mode = null;
    this.streak = 0;

    // Cache DOM elements
    this.startPage = document.getElementById("startPage");
    this.modeSelect = document.getElementById("modeSelect");
    this.gameScreen = document.getElementById("game");
    this.resultScreen = document.getElementById("result");

    this.levelSpan = document.getElementById("level");
    this.equationDiv = document.getElementById("equation");
    this.answerInput = document.getElementById("answer");
    this.timerSpan = document.getElementById("timer");
    this.timerBar = document.getElementById("timerBar");
    this.resultMessage = document.getElementById("resultMessage");
    this.saveBtn = document.getElementById("saveBtn");
    this.playAgainBtn = document.getElementById("playAgainBtn");
    this.submitBtn = document.getElementById("submitBtn");
    this.playerNameInput = document.getElementById("playerName");
    this.leaderboardList = document.getElementById("leaderboardList");

    // Bind event listeners
    this.submitBtn.addEventListener("click", () => this.submitAnswer());
    this.playAgainBtn.addEventListener("click", () => this.restart());
    this.saveBtn.addEventListener("click", () => this.saveScore());
    this.answerInput.addEventListener("keydown", e => { if (e.key === "Enter") this.submitAnswer(); });
  }

  showModeSelection() {
    this.startPage.style.display = "none";
    this.resultScreen.style.display = "none";
    this.modeSelect.style.display = "block";
    this.gameScreen.style.display = "none";
  }

  selectMode(mode) {
    this.mode = mode;
    this.modeSelect.style.display = "none";
    this.startGame();
  }

  startGame() {
    this.level = 1;
    this.streak = 0;
    this.maxTime = this.getMaxTimeForMode();
    this.gameScreen.style.display = "block";
    this.resultScreen.style.display = "none";
    this.nextQuestion();
  }

  getMaxTimeForMode() {
    const times = {
      easy: 15,
      medium: 10,
      hard: 7,
      practice: 0,
      challenge: 10
    };
    return times[this.mode] ?? 10;
  }

  nextQuestion() {
    if (this.level > 10) return this.winGame();
    this.levelSpan.textContent = this.level;
    this.generateQuestion();
    this.answerInput.value = "";
    this.answerInput.focus();
    this.startTimer();
  }

  generateQuestion() {
    let operations = ["+", "-", "*"];
    let min = 1, max = 10;

    if (this.mode === "easy") operations = ["+"];
    else if (this.mode === "medium") operations = ["+", "-"], max = 20;
    else if (this.mode === "hard") min = 10, max = 50;
    else if (["practice", "challenge"].includes(this.mode)) max = 50;

    const op = this.mode === "challenge"
      ? operations[Math.floor(Math.random() * operations.length)]
      : operations[Math.min(this.level-1, operations.length - 1)];

    const a = this.randomInt(min, max);
    const b = this.randomInt(min, max);
    let result;
    switch (op) {
      case "+": result = a + b; break;
      case "-": result = a - b; break;
      case "*": result = a * b; break;
    }

    const hideLeft = Math.random() < 0.5;
    const hideRight = !hideLeft;

    if (Math.random() < 0.3) {
      this.correctAnswer = result;
      this.equationDiv.textContent = `${a} ${op} ${b} = ?`;
    } else if (hideLeft) {
      this.correctAnswer = a;
      this.equationDiv.textContent = `? ${op} ${b} = ${result}`;
    } else {
      this.correctAnswer = b;
      this.equationDiv.textContent = `${a} ${op} ? = ${result}`;
    }
  }

  submitAnswer() {
    const userAnswer = parseInt(this.answerInput.value);
    if (isNaN(userAnswer)) return this.shakeWrong();

    if (userAnswer === this.correctAnswer) {
      clearInterval(this.timer);
      this.level++;
      this.streak++;
      setTimeout(() => this.nextQuestion(), 300);
    } else {
      this.streak = 0;
      this.shakeWrong();
    }
  }

  startTimer() {
    clearInterval(this.timer);
    if (this.maxTime === 0) {
      this.timerSpan.textContent = "∞";
      this.timerBar.style.width = "100%";
      return;
    }
    this.timeLeft = this.maxTime;
    this.timerSpan.textContent = this.timeLeft;
    this.timerBar.style.width = "100%";

    this.timer = setInterval(() => {
      this.timeLeft--;
      this.timerSpan.textContent = this.timeLeft;
      this.timerBar.style.width = (this.timeLeft / this.maxTime * 100) + "%";
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.endGame("⏰ Time's up!");
      }
    }, 1000);
  }

  endGame(msg) {
    this.gameScreen.style.display = "none";
    this.resultScreen.style.display = "block";
    this.resultMessage.textContent = msg;
  }

  winGame() {
    this.endGame("🎉 You Win!");
  }

  shakeWrong() {
    this.equationDiv.classList.add("shake");
    this.answerInput.classList.add("shake");
    setTimeout(() => {
      this.equationDiv.classList.remove("shake");
      this.answerInput.classList.remove("shake");
    }, 500);
  }

  saveScore() {
    const name = this.playerNameInput.value.trim();
    if (!name) return;
    const leaderboard = JSON.parse(localStorage.getItem("guessGameScores") || "[]");
    leaderboard.push({ name, score: this.level - 1 });
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem("guessGameScores", JSON.stringify(leaderboard.slice(0,3)));
    this.showLeaderboard();
  }

  showLeaderboard() {
    while (this.leaderboardList.firstChild) this.leaderboardList.removeChild(this.leaderboardList.firstChild);
    const leaderboard = JSON.parse(localStorage.getItem("guessGameScores") || "[]");
    leaderboard.forEach(obj => {
      const li = document.createElement("li");
      li.textContent = `${obj.name} — Level ${obj.score}`;
      this.leaderboardList.appendChild(li);
    });
  }

  restart() {
    this.showModeSelection();
  }

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

// Setup event listeners after DOM load
document.addEventListener("DOMContentLoaded", () => {
  const game = new Game();

  document.getElementById("startBtn").onclick = () => game.showModeSelection();

  document.querySelectorAll(".mode").forEach(btn => {
    btn.onclick = () => game.selectMode(btn.dataset.mode);
  });
});
