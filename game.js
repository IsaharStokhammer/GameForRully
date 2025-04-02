// קוד המשחק עם שאלות לפי קטגוריות (כולל טוויסט כקטגוריה)
let players = [];
let currentPlayer = 0;
let pointsToWin = 5;
let currentCategory = "מביך";

const questions = {
  "מביך": [
    "מה הדבר הכי מביך שקרה לך בכיתה?",
    "ספר/י על פדיחה מהילדות שאף פעם לא סיפרת לאף אחד.",
    "מה היית עושה אם היית מפליץ באמצע מבחן שקט?",
    "איזו אפליקציה אתה מתבייש שיש לך?",
    "מה הפדיחה הכי טרייה שקרתה לך לאחרונה?"
  ],
  "מצחיק": [
    "מה הבדיחה הכי גרועה שאתה מכיר?",
    "מה הסיפור הכי מצחיק שקרה לך בקניות?",
    "אם היית דמות מסרט קומדיה – מי היית?",
    "ספר/י על פעם שצחקת כל כך חזק שבכית."
  ],
  "אישי": [
    "מה אתה הכי אוהב בעצמך?",
    "על מה אתה הכי מתחרט?",
    "מה הפחד הכי גדול שלך?",
    "אם היית יכול לדבר עם עצמך בגיל 10 – מה היית אומר?"
  ],
  "מה היית עושה אם...": [
    "מה היית עושה אם היית בלתי נראה ליום אחד?",
    "מה היית עושה אם היית מתעורר בגוף של מישהו אחר?",
    "מה היית עושה אם זכית פתאום ב-10 מיליון שקל?",
    'מה היית עושה אם היית נוחת בטעות בזמן התנ"ך?'
  ],
  "טוויסט": [
    "קלף טוויסט: העבר את השאלה למישהו אחר!",
    "קלף טוויסט: אתה עונה במקום מישהו אחר!",
    "קלף טוויסט: גנוב נקודה מהשחקן שלידך!"
  ]
};

function playMusic() {
  const audio = document.getElementById('bg-music');
  audio.src = "assets/victory.mp3";
  audio.volume = 0.5;
  audio.play().catch(() => {
    showToast("יש לאפשר אודיו בדפדפן על ידי לחיצה");
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.display = 'block';
  playClick();
  setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

function addPlayerInput() {
  const div = document.getElementById('player-inputs');
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = `שחקן ${div.children.length + 1}`;
  input.className = 'form-control';
  div.appendChild(input);
}

function startGame() {
  playClick();
  const inputs = document.querySelectorAll('#player-inputs input');
  const names = Array.from(inputs).map(i => i.value.trim()).filter(n => n.length > 0);
  const uniqueNames = [...new Set(names)];
  if (names.length < 2 || names.length !== uniqueNames.length) {
    alert("ודא שכל השמות תקינים ואינם כפולים");
    return;
  }
  players = uniqueNames.map(name => ({ name, score: 0 }));
  const pts = parseInt(document.getElementById('pointsToWin').value);
  if (!isNaN(pts) && pts > 0) pointsToWin = pts;
  document.getElementById('player-setup').classList.add('hidden');
  document.getElementById('game').classList.remove('hidden');
  updatePlayerStatus();
  updateScoreBoard();
  fillTransferSelect();
  changeQuestionCategory();
}

function updatePlayerStatus() {
  document.getElementById('current-player-name').textContent = `תור: ${players[currentPlayer].name}`;
  updateScoreBoard();
  fillTransferSelect();
}

function updateScoreBoard() {
  const ul = document.getElementById('score-board');
  ul.innerHTML = players.map(p => `<li>${p.name}: ${p.score}</li>`).join('');
}

function nextPlayer() {
  currentPlayer = (currentPlayer + 1) % players.length;
  updatePlayerStatus();
  const keys = Object.keys(questions);
  currentCategory = keys[Math.floor(Math.random() * keys.length)];
  document.getElementById("question-type-label").textContent = `קטגוריה: ${currentCategory}`;
  showQuestion();
}

function addPoint() {
  players[currentPlayer].score++;
  updatePlayerStatus();
  showToast(`${players[currentPlayer].name} הרוויח נקודה!`);
  checkWinner();
}

function toggleTransfer() {
  const container = document.getElementById('transferContainer');
  container.classList.toggle('hidden');
}

function fillTransferSelect() {
  const select = document.getElementById('transferTarget');
  if (!select) return;
  select.innerHTML = players.map((p, i) => i !== currentPlayer ? `<option value="${i}">${p.name}</option>` : '').join('');
}

function transferPoint() {
  playClick();
  const toIndex = parseInt(document.getElementById('transferTarget').value);
  if (players[currentPlayer].score > 0 && toIndex !== currentPlayer) {
    players[currentPlayer].score--;
    players[toIndex].score++;
    updatePlayerStatus();
    showToast(`${players[currentPlayer].name} העביר נקודה ל-${players[toIndex].name}!`);
    checkWinner();
  } else {
    alert("אין מספיק נקודות להעברה");
  }
}

function checkWinner() {
  const winner = players.find(p => p.score >= pointsToWin);
  if (winner) {
    confetti();
    playWinnerSound();
    const modal = document.getElementById('winner-modal');
    modal.innerHTML = `
      <h2>🎉 ${winner.name} ניצח/ה את המשחק! 🎉</h2>
      <button class='btn btn-dark mt-3' onclick='resetGame()'>משחק חדש</button>
    `;
    modal.style.display = 'block';
  }
}

function changeQuestionCategory() {
  const keys = Object.keys(questions);
  const currentIndex = keys.indexOf(currentCategory);
  currentCategory = keys[(currentIndex + 1) % keys.length];
  document.getElementById("question-type-label").textContent = `קטגוריה: ${currentCategory}`;
  showQuestion();
}

function showQuestion() {
  const qList = questions[currentCategory];
  const q = qList[Math.floor(Math.random() * qList.length)];
  const qElement = document.getElementById('question');
  if (!qElement) return;
  qElement.classList.remove('fade-in');
  void qElement.offsetWidth;
  qElement.textContent = q;
  qElement.classList.add('fade-in');
}

function addCustomQuestion() {
  const input = document.getElementById('customQuestion');
  const val = input.value.trim();
  if (val.length < 3) return;

  const categorySelect = document.getElementById('categorySelect');
  let category = categorySelect?.value;

  if (!category) {
    alert("יש לבחור קטגוריה או להזין אחת חדשה");
    return;
  }

  if (category === "new") {
    category = document.getElementById('newCategoryInput').value.trim();
    if (!category) {
      alert("יש להזין שם קטגוריה חדשה");
      return;
    }

    if (!questions[category]) {
      questions[category] = [];
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categorySelect.insertBefore(option, categorySelect.lastElementChild);
    }
  }

  if (!questions[category]) questions[category] = [];
  questions[category].push(val);
  playClick();
  showToast("השאלה נוספה לקטגוריה " + category);
  input.value = "";
  document.getElementById('newCategoryInput').classList.add('hidden');
  categorySelect.value = "";
}

function toggleNewCategoryInput(value) {
  const newCatInput = document.getElementById('newCategoryInput');
  if (value === 'new') {
    newCatInput.classList.remove('hidden');
  } else {
    newCatInput.classList.add('hidden');
  }
}

function resetGame() {
  location.reload();
}

function pauseMusic() {
  const audio = document.getElementById('bg-music');
  audio.pause();
}

function setMusicVolume(value) {
  const audio = document.getElementById('bg-music');
  audio.volume = parseFloat(value);
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  document.body.style.background = isDark
    ? 'linear-gradient(135deg, #121212, #343a40)'
    : 'linear-gradient(135deg, #f72585, #7209b7)';
  document.body.style.color = isDark ? 'white' : 'white';
}

const clickSound = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_5fd96a7611.mp3');
const winnerSound = new Audio('https://cdn.pixabay.com/audio/2023/03/07/audio_8ce9e09c86.mp3');
let sfxVolume = 1;

function setSfxVolume(value) {
  sfxVolume = parseFloat(value);
}

function playClick() {
  clickSound.volume = sfxVolume;
  clickSound.currentTime = 0;
  clickSound.play();
}

function playWinnerSound() {
  winnerSound.volume = sfxVolume;
  winnerSound.currentTime = 0;
  winnerSound.play();
}