// script.js
const bucket = document.getElementById("bucket");
const gameArea = document.getElementById("game-area");
const scoreDisplay = document.getElementById("score");
const levelDisplay = document.getElementById("level");
const timeDisplay = document.getElementById("time");

// Title screen elements
const titleScreen = document.getElementById("title-screen");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");

const successScreen = document.getElementById("success-screen");
const failScreen = document.getElementById("fail-screen");
const successResetBtn = document.getElementById("success-reset-btn");
const failResetBtn = document.getElementById("fail-reset-btn");
const goalPointsDisplay = document.getElementById("goal-points");

const quitBtn = document.getElementById("quit-btn");
const successQuitBtn = document.getElementById("success-quit-btn");
const failQuitBtn = document.getElementById("fail-quit-btn");
const titleQuitBtn = document.getElementById("title-quit-btn");
const nextLevelBtn = document.getElementById("next-level-btn");

const congratsScreen = document.getElementById("congrats-screen");
const congratsResetBtn = document.getElementById("congrats-reset-btn");
const congratsQuitBtn = document.getElementById("congrats-quit-btn");

const successResetLevelBtn = document.getElementById("success-reset-level-btn");
const successResetGameBtn = document.getElementById("success-reset-game-btn");
const congratsResetLevelBtn = document.getElementById("congrats-reset-level-btn");
const congratsResetGameBtn = document.getElementById("congrats-reset-game-btn");

let score = 0;
let level = 1;
let time = 30;
let gameInterval;
let dropletInterval;
let goalPoints = 50;

// Restore original level goals
let levelGoals = [50, 75, 100];

// Track scores for each level
let levelScores = [0, 0, 0];

// Add difficulty dropdown
const difficultySelect = document.getElementById("difficulty-select");

// --- GOAL message elements ---
const goalMessage = document.getElementById("goal-message");
const goalConfetti = document.getElementById("goal-confetti");
let goalShown = false;

// --- Water droplet sounds ---
const dropletSound = new Audio('sounds/droplet.mp3'); // Clean droplet
const dirtySound = new Audio('sounds/dirty droplet.mp3'); // Dirty droplet

// Unlock audio on first user interaction (mobile compatibility)
function unlockAudio() {
  [dropletSound, dirtySound].forEach(sound => {
    if (sound && sound.paused) {
      sound.play().catch(() => {}); // Try to play and immediately pause to unlock
      sound.pause();
      sound.currentTime = 0;
    }
  });
  window.removeEventListener("touchstart", unlockAudio, true);
  window.removeEventListener("mousedown", unlockAudio, true);
}
window.addEventListener("touchstart", unlockAudio, true);
window.addEventListener("mousedown", unlockAudio, true);

let difficulty = "easy"; // default
let dropSpeeds = {
  easy: 4,
  medium: 6,
  hard: 8
};
let goalOffsets = {
  easy: 0,
  medium: 10,
  hard: 25
};

function getCurrentDropSpeed() {
  return dropSpeeds[difficulty] + level - 1;
}

function moveBucket(e) {
  const areaWidth = gameArea.clientWidth;
  const bucketWidth = bucket.offsetWidth;
  let x;

  if (e.type === "mousemove") {
    x = e.clientX - bucketWidth / 2;
  } else if (e.type === "touchmove") {
    x = e.touches[0].clientX - bucketWidth / 2;
  }

  x = Math.max(0, Math.min(x, areaWidth - bucketWidth));
  bucket.style.left = `${x}px`;
}

function spawnDroplet() {
  const droplet = document.createElement("div");
  droplet.classList.add("droplet");

  const isClean = Math.random() > 0.4;
  droplet.classList.add(isClean ? "clean" : "dirty");

  droplet.style.left = `${Math.random() * (gameArea.clientWidth - 20)}px`;
  droplet.style.top = "-30px";
  gameArea.appendChild(droplet);

  let y = -30;
  const fall = setInterval(() => {
    y += getCurrentDropSpeed();
    droplet.style.top = `${y}px`;

    const dropletRect = droplet.getBoundingClientRect();
    const bucketRect = bucket.getBoundingClientRect();

    if (
      dropletRect.bottom >= bucketRect.top &&
      dropletRect.left < bucketRect.right &&
      dropletRect.right > bucketRect.left
    ) {
      if (droplet.classList.contains("clean")) {
        score += 10;
        // Play water droplet sound
        if (dropletSound) {
          dropletSound.currentTime = 0;
          dropletSound.play().catch(() => {});
        }
      } else {
        score -= 5;
        // Play dirty droplet sound
        if (dirtySound) {
          dirtySound.currentTime = 0;
          dirtySound.play().catch(() => {});
        }
      }
      scoreDisplay.textContent = score;
      checkGoal();
      droplet.remove();
      clearInterval(fall);
    } else if (y > gameArea.clientHeight) {
      droplet.remove();
      clearInterval(fall);
    }
  }, 30);
}

function checkGoal() {
  if (!goalShown && score >= goalPoints) {
    showGoalMessage();
  }
}

function setGoalForLevel() {
  goalPoints = levelGoals[level - 1] + goalOffsets[difficulty];
  goalPointsDisplay.textContent = `Goal: ${goalPoints}`;
  goalShown = false;
}

function showGoalMessage() {
  if (!goalMessage || goalShown) return;
  goalShown = true;
  goalMessage.textContent = "GOAL!!!";
  goalMessage.style.display = "block";
  showGoalConfetti();
  setTimeout(() => {
    goalMessage.style.display = "none";
    if (goalConfetti) goalConfetti.innerHTML = '';
  }, 1500);
}

function showGoalConfetti() {
  if (!goalConfetti) return;
  goalConfetti.innerHTML = '';
  const colors = ['#3fa9f5', '#7fd3ff', '#f9d423', '#f36f6f', '#2ecc71', '#f7b731'];
  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 90 + 5 + '%';
    confetti.style.top = (Math.random() * 10 + 5) + '%';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = (Math.random() * 0.5) + 's';
    goalConfetti.appendChild(confetti);
  }
  setTimeout(() => { if (goalConfetti) goalConfetti.innerHTML = ''; }, 1800);
}

function updateTime() {
  time--;
  timeDisplay.textContent = time;
  if (time <= 0) {
    clearInterval(gameInterval);
    clearInterval(dropletInterval);
    if (score >= goalPoints) {
      // Save score for this level
      if (level >= 1 && level <= 3) {
        levelScores[level - 1] = score;
      }
      if (level < 3) {
        if (successScreen) {
          successScreen.style.display = "flex";
          showConfetti('success-confetti');
        }
      } else {
        if (congratsScreen) {
          congratsScreen.style.display = "flex";
          showConfetti('congrats-confetti');
          showCongratsLevelScores();
        }
      }
    } else {
      if (failScreen) failScreen.style.display = "flex";
    }
  }
}

// Show level scores on congrats screen
function showCongratsLevelScores() {
  const scoresDiv = document.getElementById("congrats-level-scores");
  if (!scoresDiv) return;
  scoresDiv.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const row = document.createElement('div');
    row.className = 'level-score-row';
    row.textContent = `Level ${i + 1}: ${levelScores[i]} points`;
    scoresDiv.appendChild(row);
  }
}

function startGame() {
  // Hide overlays
  if (titleScreen) titleScreen.style.display = "none";
  if (successScreen) successScreen.style.display = "none";
  if (failScreen) failScreen.style.display = "none";
  if (congratsScreen) congratsScreen.style.display = "none";
  // Reset game state
  score = 0;
  time = 30; // Restore original time
  scoreDisplay.textContent = score;
  levelDisplay.textContent = level;
  timeDisplay.textContent = time;
  setGoalForLevel();
  // Remove all droplets
  const droplets = document.querySelectorAll('.droplet');
  droplets.forEach(droplet => droplet.remove());
  // Start game loops
  clearInterval(gameInterval);
  clearInterval(dropletInterval);
  gameInterval = setInterval(updateTime, 1000);
  dropletInterval = setInterval(spawnDroplet, 800);
  // Only reset scores if starting a new game (level 1)
  if (level === 1) {
    levelScores = [0, 0, 0];
  }
}

function nextLevel() {
  if (level < 3) {
    // Save score for this level before advancing
    if (level >= 1 && level <= 3) {
      levelScores[level - 1] = score;
    }
    level++;
    startGame();
  }
}

function resetGame() {
  // Hide overlays
  if (titleScreen) titleScreen.style.display = "none";
  if (successScreen) successScreen.style.display = "none";
  if (failScreen) failScreen.style.display = "none";
  if (congratsScreen) congratsScreen.style.display = "none";
  // Hide goal message and confetti
  if (goalMessage) goalMessage.style.display = "none";
  if (goalConfetti) goalConfetti.innerHTML = '';
  // Reset game state
  score = 0;
  time = 30; // Restore original time
  scoreDisplay.textContent = score;
  levelDisplay.textContent = level;
  timeDisplay.textContent = time;
  setGoalForLevel();
  // Remove all droplets
  const droplets = document.querySelectorAll('.droplet');
  droplets.forEach(droplet => droplet.remove());
  // Restart game loops
  clearInterval(gameInterval);
  clearInterval(dropletInterval);
  gameInterval = setInterval(updateTime, 1000);
  dropletInterval = setInterval(spawnDroplet, 800);
  // Only reset scores if starting from level 1
  if (level === 1) {
    levelScores = [0, 0, 0];
  }
}

function quitToTitle() {
  // Hide overlays and game area, show title screen
  if (titleScreen) titleScreen.style.display = "flex";
  if (successScreen) successScreen.style.display = "none";
  if (failScreen) failScreen.style.display = "none";
  if (congratsScreen) congratsScreen.style.display = "none";
  // Reset game state
  score = 0;
  level = 1;
  time = 30; // Restore original time
  scoreDisplay.textContent = score;
  levelDisplay.textContent = level;
  timeDisplay.textContent = time;
  goalPointsDisplay.textContent = `Goal: ${goalPoints}`;
  // Remove all droplets
  const droplets = document.querySelectorAll('.droplet');
  droplets.forEach(droplet => droplet.remove());
  // Stop intervals
  clearInterval(gameInterval);
  clearInterval(dropletInterval);
  levelScores = [0, 0, 0];
}

function showConfetti(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  const colors = ['#3fa9f5', '#7fd3ff', '#f9d423', '#f36f6f', '#2ecc71', '#f7b731'];
  for (let i = 0; i < 40; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 90 + 5 + '%';
    confetti.style.top = (Math.random() * 10 + 5) + '%';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = (Math.random() * 0.5) + 's';
    container.appendChild(confetti);
  }
  setTimeout(() => { container.innerHTML = ''; }, 1800);
}

window.addEventListener("mousemove", moveBucket);
window.addEventListener("touchmove", moveBucket);

if (startBtn) {
  startBtn.addEventListener("click", startGame);
  startBtn.addEventListener("click", () => {
    window.addEventListener("mousemove", moveBucket);
    window.addEventListener("touchmove", moveBucket);
  });
}

if (resetBtn) {
  resetBtn.addEventListener("click", resetGame);
}
if (successResetBtn) {
  successResetBtn.addEventListener("click", resetGame);
}
if (failResetBtn) {
  failResetBtn.addEventListener("click", resetGame);
}
if (congratsResetBtn) {
  congratsResetBtn.addEventListener("click", () => {
    level = 1;
    startGame();
  });
}
if (quitBtn) {
  quitBtn.addEventListener("click", quitToTitle);
}
if (successQuitBtn) {
  successQuitBtn.addEventListener("click", quitToTitle);
}
if (failQuitBtn) {
  failQuitBtn.addEventListener("click", quitToTitle);
}
if (titleQuitBtn) {
  titleQuitBtn.addEventListener("click", quitToTitle);
}
if (nextLevelBtn) {
  nextLevelBtn.addEventListener("click", nextLevel);
}
if (successResetLevelBtn) {
  successResetLevelBtn.addEventListener("click", () => {
    startGame();
  });
}
if (successResetGameBtn) {
  successResetGameBtn.addEventListener("click", () => {
    level = 1;
    startGame();
  });
}
if (congratsResetLevelBtn) {
  congratsResetLevelBtn.addEventListener("click", () => {
    startGame();
  });
}
if (congratsResetGameBtn) {
  congratsResetGameBtn.addEventListener("click", () => {
    level = 1;
    startGame();
  });
}
if (congratsQuitBtn) {
  congratsQuitBtn.onclick = quitToTitle;
}
if (difficultySelect) {
  difficultySelect.addEventListener("change", (e) => {
    difficulty = e.target.value;
  });
}

// Set dropdown to current value on load
if (difficultySelect) {
  difficultySelect.value = difficulty;
}
