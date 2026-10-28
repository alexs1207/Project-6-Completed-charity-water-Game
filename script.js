// ========================================
// CHARITY: WATER - WATER DROP CHALLENGE
// ========================================

// Game settings
let gameRunning = false;
let dropMaker = null;
let countdown = null;
let score = 0;
let timeLeft = 30;

const WINNING_SCORE = 20;
const GAME_DURATION = 30;

// Winning messages
const winningMessages = [
    "Amazing work! Every drop counts!",
    "You're a Water Champion!",
    "Fantastic! Keep making waves!",
    "Great job! Small actions make a big difference!"
];

// Losing messages
const losingMessages = [
    "Good try! Every drop counts. Try again!",
    "Don't give up! You can do it!",
    "Keep practicing and make a splash next time!",
    "Almost there! Give it another try!"
];

// Find elements already in index.html
const startButton = document.getElementById("start-btn");
const resetButton = document.getElementById("reset-btn");
const gameContainer = document.getElementById("game-container");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("time");
const messageDisplay = document.getElementById("message");
const confettiContainer = document.getElementById("confetti-container");

// Check that all required HTML elements exist
if (
    startButton &&
    resetButton &&
    gameContainer &&
    scoreDisplay &&
    timerDisplay &&
    messageDisplay &&
    confettiContainer
) {
    startButton.addEventListener("click", startGame);
    resetButton.addEventListener("click", resetGame);
} else {
    console.error(
        "Game setup error: Check the element IDs in index.html."
    );
}

// Start the game
function startGame() {
    if (gameRunning) return;

    clearInterval(dropMaker);
    clearInterval(countdown);

    score = 0;
    timeLeft = GAME_DURATION;
    gameRunning = true;

    scoreDisplay.textContent = score;
    timerDisplay.textContent = timeLeft;
    messageDisplay.textContent = "Go! Catch the clean water drops!";
    confettiContainer.innerHTML = "";
    gameContainer.innerHTML = "";

    startButton.disabled = true;
    startButton.textContent = "Game in Progress";

    createDrop();
    dropMaker = setInterval(createDrop, 800);

    countdown = setInterval(function () {
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// Create a falling water drop
function createDrop() {
    if (!gameRunning) return;

    const drop = document.createElement("button");
    const isDirty = Math.random() < 0.25;

    drop.type = "button";
    drop.className = isDirty
        ? "water-drop dirty-drop"
        : "water-drop";

    drop.textContent = isDirty ? "!" : "💧";

    drop.setAttribute(
        "aria-label",
        isDirty
            ? "Dirty water: lose one point"
            : "Clean water: earn one point"
    );

    const size = Math.random() * 25 + 45;

    drop.style.width = size + "px";
    drop.style.height = size + "px";

    const maxLeft = Math.max(
        0,
        gameContainer.clientWidth - size
    );

    drop.style.left = Math.random() * maxLeft + "px";
    drop.style.animationDuration =
        (Math.random() * 1.5 + 3) + "s";

    gameContainer.appendChild(drop);

    // Score points when a drop is clicked
    drop.addEventListener("click", function () {
        if (!gameRunning || drop.dataset.collected === "true") {
            return;
        }

        drop.dataset.collected = "true";
        drop.disabled = true;

        if (isDirty) {
            score = Math.max(0, score - 1);
            drop.textContent = "-1";
            drop.classList.add("hit-feedback");
            messageDisplay.textContent =
                "Dirty water! You lost 1 point.";
        } else {
            score++;
            drop.textContent = "+1";
            drop.classList.add("collected");
            messageDisplay.textContent =
                "Clean water collected! +1 point!";
        }

        scoreDisplay.textContent = score;

        setTimeout(function () {
            drop.remove();
        }, 250);
    });

    // Remove drops when their falling animation ends
    drop.addEventListener("animationend", function () {
        drop.remove();
    });
}

// End the game
function endGame() {
    if (!gameRunning) return;

    gameRunning = false;

    clearInterval(dropMaker);
    clearInterval(countdown);

    gameContainer.innerHTML = "";

    startButton.disabled = false;
    startButton.textContent = "Play Again";

    const won = score >= WINNING_SCORE;
    const messages = won ? winningMessages : losingMessages;

    const randomIndex = Math.floor(
        Math.random() * messages.length
    );

    if (won) {
        messageDisplay.textContent =
            messages[randomIndex] +
            " Final score: " + score + "!";

        celebrateWin();
    } else {
        messageDisplay.textContent =
            messages[randomIndex] +
            " Final score: " + score +
            ". You need 20 points to win.";
    }
}

// Reset the game
function resetGame() {
    clearInterval(dropMaker);
    clearInterval(countdown);

    gameRunning = false;
    score = 0;
    timeLeft = GAME_DURATION;

    scoreDisplay.textContent = score;
    timerDisplay.textContent = timeLeft;
    messageDisplay.textContent =
        "Ready to play? Press Start Game!";

    gameContainer.innerHTML = "";
    confettiContainer.innerHTML = "";

    startButton.disabled = false;
    startButton.textContent = "Start Game";
}

// Celebrate a win with confetti
function celebrateWin() {
    confettiContainer.innerHTML = "";

    const colors = [
        "#FFC907",
        "#2E9DF7",
        "#8BD1CB",
        "#159A48",
        "#FF902A"
    ];

    for (let i = 0; i < 60; i++) {
        const piece = document.createElement("span");

        piece.className = "confetti";
        piece.textContent = "●";
        piece.style.left = Math.random() * 100 + "%";
        piece.style.animationDelay =
            Math.random() * 1.5 + "s";

        const colorIndex = Math.floor(
            Math.random() * colors.length
        );

        piece.style.color = colors[colorIndex];

        confettiContainer.appendChild(piece);
    }
}