let level = 1;
let timer;
let timeLeft = 10;
let correctAnswer = 0;
let maxTime = 10;
let mode = null;
let streak = 0;
let currentMode = ''; 

const $ = (id) => document.getElementById(id);

function startGame() {
  $("startPage").style.display = "none";
  $("result").style.display = "none";
  $("modeSelect").style.display = "block";
  $("game").style.display = "none";
  mode = null;
}

function goBackToStart() {
  $('modeSelect').style.display = 'none';
  $('startPage').style.display = 'block';
}

function selectMode(selectedMode) {
  mode = selectedMode;
  currentMode = selectedMode; 
  $("modeSelect").style.display = "none";
  $("result").style.display = "none";
  $("game").style.display = "block";

  switch (mode) {
    case "easy": maxTime = 15; break;
    case "medium": maxTime = 13; break;
    case "hard": maxTime = 10; break;
    case "practice": maxTime = 0; break;
    case "challenge": maxTime = 10; break;
    default: maxTime = 10;
  }

  level = 1;
  generateQuestion();
  maxTime > 0 ? startTimer() : $("timer").textContent = "∞";
  updateTimerBar(1);
}


function goToStart() {
  clearInterval(timer);
  $("result").style.display = "none";
  $("game").style.display = "none";
  $("modeSelect").style.display = "none";
  $("startPage").style.display = "block";
  level = 1;
  mode = null;
  currentMode = '';
  maxTime = 10;
  $("timer").textContent = "";
  updateTimerBar(0);
}

function generateQuestion() {
  const equationEl = $("equation");
  equationEl.classList.remove("shake", "glow");
  $("answer").classList.remove("shake", "glow");
  $("explanation")?.remove();

  $("level").textContent = level;
  $("level").style.animation = "none";
  void $("level").offsetWidth;
  $("level").style.animation = "popLevel 0.5s ease-in-out";

  let operations = ["+", "-", "*"];
  let min = 1, max = 10;

  if (mode === "easy") {
    operations = ["+"];
    max = 10;
  } else if (mode === "medium") {
    operations = ["+", "-", "*"];
    max = 20;
  } else if (mode === "hard") {
    operations = ["+", "-", "*"];
    min = 10; max = 50;
  } else if (mode === "practice" || mode === "challenge") {
    operations = ["+", "-", "*"];
    max = 50;
  }

  let op = (mode === "challenge")
    ? operations[randomInt(0, operations.length - 1)]
    : operations[Math.min(level - 1, operations.length - 1)];

  let a = randomInt(min, max);
  let b = randomInt(min, max);
  let result;

  switch (op) {
    case "+": result = a + b; break;
    case "-": result = a - b; break;
    case "*": result = a * b; break;
  }

  let reverse = Math.random() < 0.3;
  let hideLeft = Math.random() < 0.5;

  if (reverse) {
    correctAnswer = result;
    equationEl.textContent = `${a} ${op} ${b} = ?`;
  } else if (hideLeft) {
    correctAnswer = a;
    equationEl.textContent = `? ${op} ${b} = ${result}`;
  } else {
    correctAnswer = b;
    equationEl.textContent = `${a} ${op} ? = ${result}`;
  }

  $("answer").value = "";
  $("answer").focus();

  timeLeft = maxTime;
  $("timer").textContent = maxTime === 0 ? "∞" : timeLeft;
  updateTimerBar(1);
}



function submitAnswer() {
  let userAnswer = parseInt($("answer").value);
  if (isNaN(userAnswer)) {
    shakeWrong();
    streak = 0;
    return;
  }

  if (userAnswer === correctAnswer) {
    streak++;
    showCombo(streak);
    clearInterval(timer);
    glowCorrect();
    level++;
    if (level > 10) {
      winGame();
    } else {
      setTimeout(() => {
        generateQuestion();
        if (maxTime > 0) startTimer();
        else $("timer").textContent = "∞";
      }, 800);
    }
  } else {
    streak = 0;
    shakeWrong();

    if (mode === "practice") {
      showExplanation();
    }
  }
}

function glowCorrect() {
  $("equation").classList.add("glow");
  $("answer").classList.add("glow");
  setTimeout(() => {
    $("equation").classList.remove("glow");
    $("answer").classList.remove("glow");
  }, 800);
}

function shakeWrong() {
  $("equation").classList.add("shake");
  $("answer").classList.add("shake");
  setTimeout(() => {
    $("equation").classList.remove("shake");
    $("answer").classList.remove("shake");
  }, 500);
}

function showCombo(count) {
  if (count < 2) return;
  const comboText = document.createElement("div");
  comboText.textContent = `🔥 Combo x${count}!`;
  comboText.className = "combo";
  document.body.appendChild(comboText);
  setTimeout(() => comboText.remove(), 1000);
}



function startTimer() {
  clearInterval(timer);
  if (maxTime === 0) return;

  timer = setInterval(() => {
    timeLeft--;
    $("timer").textContent = timeLeft;
    updateTimerBar(timeLeft / maxTime);
    if (timeLeft <= 0) {
      clearInterval(timer);
      failGame(" Time's up!");
    }
  }, 1000);
}

function updateTimerBar(fraction) {
  const bar = $("timerBar");
  bar.style.width = (fraction * 100) + "%";
  bar.style.background = fraction <= 0.3 ? "#ff5252" : "#00c9ff";
}



function failGame(message) {
  alert(message);
  goToStart();
}

function winGame() {
  $("game").style.display = "none";
  $("result").style.display = "block";
  $("resultMessage").textContent = " Congratulations! You finished all 10 puzzles!";
  $("nameEntry").style.display = "block";
  $("playerName").value = "";
  $("playerName").focus();
  $("leaderboardList").innerHTML = "";
}


function savePlayerScore() {
  const name = $("playerName").value.trim();
  if (!name) {
    alert("Please enter your name to save your score.");
    return;
  }

  const key = `guessGameScores_${currentMode}`;
  let scores = JSON.parse(localStorage.getItem(key) || "[]");

  scores.push({
    name,
    score: level - 1,
    date: new Date().toISOString()
  });

  scores.sort((a, b) => b.score - a.score);
  scores = scores.slice(0, 3);
  localStorage.setItem(key, JSON.stringify(scores));

  $("nameEntry").style.display = "none";
  showLeaderboard(currentMode); 
}

function showLeaderboard(mode) {
  const key = `guessGameScores_${mode}`;
  let scores = JSON.parse(localStorage.getItem(key) || "[]");
  let list = $("leaderboardList");
  list.innerHTML = "";

  if (scores.length === 0) {
    list.innerHTML = "<li>No scores yet for this mode</li>";
    return;
  }

  const capitalizedMode = mode.charAt(0).toUpperCase() + mode.slice(1);
  const header = document.createElement("h3");
  header.textContent = `Top 3 Players - ${capitalizedMode} Mode`;
  const container = document.querySelector(".leaderboard");
  container.querySelector("h3").replaceWith(header); 
  scores.forEach(({ name, score, date }) => {
    const d = new Date(date);
    const li = document.createElement("li");
    li.textContent = `${name} — Level ${score} — ${d.toLocaleDateString()}`;
    list.appendChild(li);
  });
}



function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function showExplanation() {
  const explanation = document.createElement("div");
  explanation.id = "explanation";
  explanation.className = "explanation";
  explanation.textContent = `💡 Correct Answer: ${correctAnswer}`;
  $("game").appendChild(explanation);
}


$("answer")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") submitAnswer();
});
