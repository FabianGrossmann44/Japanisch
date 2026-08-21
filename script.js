let vocabulary = [];

let currentIndex = 0;
let score = 0;
let answered = false;

// Falsch beantwortete Vokabeln
let mistakes = [];

// --------------------------------------------------
// Elemente aus dem HTML
// --------------------------------------------------

const episodeSelect = document.getElementById("episodeSelect");
const startButton = document.getElementById("startButton");

const quiz = document.getElementById("quiz");
const finished = document.getElementById("finished");

const japaneseWord = document.getElementById("japaneseWord");
const answerInput = document.getElementById("answer");
const checkButton = document.getElementById("checkButton");
const nextButton = document.getElementById("nextButton");

const result = document.getElementById("result");

const currentQuestion = document.getElementById("currentQuestion");
const totalQuestions = document.getElementById("totalQuestions");

const scoreElement = document.getElementById("score");
const finalScore = document.getElementById("finalScore");

const restartButton = document.getElementById("restartButton");

const mistakesSection = document.getElementById("mistakesSection");
const mistakesList = document.getElementById("mistakesList");

// --------------------------------------------------
// Episode laden
// --------------------------------------------------

async function loadEpisode() {
  const file = episodeSelect.value;

  if (!file) {
    alert("Bitte wähle zuerst eine Episode aus.");
    return false;
  }

  try {
    const response = await fetch("data/" + file);

    if (!response.ok) {
      throw new Error("JSON-Datei konnte nicht geladen werden.");
    }

    const data = await response.json();

    vocabulary = data.vocabulary || [];

    if (vocabulary.length === 0) {
      alert("Diese Episode enthält noch keine Vokabeln.");
      return false;
    }

    return true;
  } catch (error) {
    console.error(error);

    alert("Fehler beim Laden der Episode.");

    return false;
  }
}

// --------------------------------------------------
// Array mischen
// --------------------------------------------------

function shuffle(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

// --------------------------------------------------
// Lernrunde starten
// --------------------------------------------------

async function startQuiz() {
  const loaded = await loadEpisode();

  if (!loaded) {
    return;
  }

  vocabulary = shuffle(vocabulary);

  currentIndex = 0;
  score = 0;
  mistakes = [];

  scoreElement.textContent = score;
  totalQuestions.textContent = vocabulary.length;

  finished.classList.add("hidden");
  quiz.classList.remove("hidden");

  showQuestion();
}

// --------------------------------------------------
// Frage anzeigen
// --------------------------------------------------

function showQuestion() {
  if (currentIndex >= vocabulary.length) {
    finishQuiz();
    return;
  }

  const word = vocabulary[currentIndex];

  japaneseWord.textContent = word.japanese;

  currentQuestion.textContent = currentIndex + 1;

  answerInput.value = "";
  answerInput.disabled = false;

  checkButton.disabled = false;

  result.classList.add("hidden");
  nextButton.classList.add("hidden");

  answered = false;

  answerInput.focus();
}

// --------------------------------------------------
// Antwort normalisieren
// --------------------------------------------------

function normalizeAnswer(text) {
  return text.toLowerCase().trim().replace(/\s+/g, " ");
}

// --------------------------------------------------
// Richtige Antworten aus JSON holen
// --------------------------------------------------

function getCorrectAnswers(word) {
  // Neues Format:
  //
  // "answers": [
  //   "Student",
  //   "Studentin"
  // ]

  if (Array.isArray(word.answers)) {
    return word.answers.map((answer) => normalizeAnswer(answer));
  }

  // Unterstützung für das alte Format:
  //
  // "german": "Student|Studentin"

  if (typeof word.german === "string") {
    return word.german.split("|").map((answer) => normalizeAnswer(answer));
  }

  return [];
}

// --------------------------------------------------
// Antwort überprüfen
// --------------------------------------------------

function checkAnswer() {
  if (answered) {
    return;
  }

  const userAnswer = normalizeAnswer(answerInput.value);

  if (userAnswer === "") {
    alert("Bitte gib zuerst eine Antwort ein.");
    return;
  }

  const word = vocabulary[currentIndex];

  const correctAnswers = getCorrectAnswers(word);

  const correct = correctAnswers.includes(userAnswer);

  answered = true;

  answerInput.disabled = true;
  checkButton.disabled = true;

  // --------------------------------------------------
  // Richtig
  // --------------------------------------------------

  if (correct) {
    score++;

    scoreElement.textContent = score;

    result.innerHTML = "✅ <strong>Richtig!</strong>";

    result.className = "result correct";
  }

  // --------------------------------------------------
  // Falsch
  // --------------------------------------------------
  else {
    mistakes.push({
      japanese: word.japanese,
      answers: correctAnswers,
      userAnswer: answerInput.value.trim(),
    });

    result.innerHTML = `
      ❌ <strong>Leider falsch.</strong>
      <br>
      Deine Antwort:
      <strong>
        ${escapeHtml(answerInput.value.trim())}
      </strong>
      <br>
      Richtige Antwort:
      <strong>
        ${escapeHtml(correctAnswers.join(" / "))}
      </strong>
    `;

    result.className = "result wrong";
  }

  result.classList.remove("hidden");

  nextButton.classList.remove("hidden");

  nextButton.focus();
}

// --------------------------------------------------
// Nächste Frage
// --------------------------------------------------

function nextQuestion() {
  currentIndex++;

  showQuestion();
}

// --------------------------------------------------
// Quiz beenden
// --------------------------------------------------

function finishQuiz() {
  quiz.classList.add("hidden");

  finished.classList.remove("hidden");

  finalScore.textContent = score + " / " + vocabulary.length;

  showMistakes();
}

// --------------------------------------------------
// Falsche Antworten anzeigen
// --------------------------------------------------

function showMistakes() {
  mistakesList.innerHTML = "";

  // Alles richtig beantwortet
  if (mistakes.length === 0) {
    mistakesSection.classList.remove("hidden");

    mistakesList.innerHTML = `
      <div class="all-correct">
        🎉 <strong>Perfekt!</strong>
        Du hast alle Vokabeln richtig beantwortet.
      </div>
    `;

    return;
  }

  mistakesSection.classList.remove("hidden");

  mistakes.forEach((mistake) => {
    const mistakeElement = document.createElement("div");

    mistakeElement.className = "mistake";

    mistakeElement.innerHTML = `
      <div class="mistake-japanese">
        ${escapeHtml(mistake.japanese)}
      </div>

      <div class="mistake-details">

        <div class="mistake-your-answer">
          Deine Antwort:
          <strong>
            ${escapeHtml(mistake.userAnswer)}
          </strong>
        </div>

        <div class="mistake-correct-answer">
          Richtig:
          <strong>
            ${escapeHtml(mistake.answers.join(" / "))}
          </strong>
        </div>

      </div>
    `;

    mistakesList.appendChild(mistakeElement);
  });
}

// --------------------------------------------------
// HTML escapen
// --------------------------------------------------

function escapeHtml(text) {
  const div = document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}

// --------------------------------------------------
// Events
// --------------------------------------------------

startButton.addEventListener("click", startQuiz);

checkButton.addEventListener("click", checkAnswer);

nextButton.addEventListener("click", nextQuestion);

restartButton.addEventListener("click", startQuiz);

// --------------------------------------------------
// Enter = Antwort prüfen
// --------------------------------------------------

answerInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !answered) {
    checkAnswer();
  }
});
