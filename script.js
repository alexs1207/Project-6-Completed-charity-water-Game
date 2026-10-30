
// ========================================
// CHARITY: WATER - WATER DROP CHALLENGE
// PROJECT 6 FINAL VERSION
// ========================================

// Game settings
let gameRunning = false;
let dropMaker = null;
let countdown = null;
let score = 0;
let timeLeft = 45;
let currentDifficulty = "easy";
let soundEnabled = false;
let audioContext = null;
let reachedMilestones = [];

// Difficulty settings
const difficulties = {
    easy: {
        duration: 45,
        winningScore: 15,
        dropSpeed: 1400,
        fallSpeed: 3.8
    },
    normal: {
        duration: 30,
        winningScore: 20,
        dropSpeed: 1000,
        fallSpeed: 3
    },
    hard: {
        duration: 20,
        winningScore: 25,
        dropSpeed: 650,
        fallSpeed: 2.2
    }
};

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

// Milestone messages
const milestoneMessages = [
    { points: 5, message: "Great start! You collected 5 clean drops!" },
    { points: 10, message: "Halfway there! Keep making a splash!" },
    { points: 15, message: "Amazing! You're a clean water champion!" },
    { points: 20, message: "20 points! You're making waves!" },
    { points: 25, message: "Incredible! You reached 25 points!" }
];

// Find elements in index.html
const startButton = document.getElementById("start-btn");
const resetButton = document.getElementById("reset-btn");
const soundButton = document.getElementById("sound-btn");

const gameContainer = document.getElementById("game-container");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("time");
const goalDisplay = document.getElementById("goal");
const messageDisplay = document.getElementById("message");
const confettiContainer = document.getElementById("confetti-container");
const difficultyInfo = document.getElementById("difficulty-info");
const milestoneDisplay = document.getElementById("milestone-message");

const difficultyButtons = document.querySelectorAll(".difficulty-btn");

// Check that required HTML elements exist
if (
    startButton &&
    resetButton &&
    soundButton &&
    gameContainer &&
    scoreDisplay &&
    timerDisplay &&
    goalDisplay &&
    messageDisplay &&
    confettiContainer &&
    difficultyInfo &&
    milestoneDisplay
) {
    startButton.addEventListener("click", startGame);
    resetButton.addEventListener("click", resetGame);
    soundButton.addEventListener("click", toggleSound);

    difficultyButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            selectDifficulty(button.dataset.mode);
        });
    });

    updateDisplays();
} else {
    console.error("Game setup error: Check the element IDs in index.html.");
}

// Update the score, timer, and goal
function updateDisplays() {
    scoreDisplay.textContent = score;
    timerDisplay.textContent = timeLeft;
    goalDisplay.textContent = difficulties[currentDifficulty].winningScore;
}

// Update difficulty information
function updateDifficultyInfo() {
    const settings = difficulties[currentDifficulty];

    difficultyInfo.textContent =
        settings.duration + " seconds | Goal: " +
        settings.winningScore + " points";
}

// Select a difficulty
function selectDifficulty(mode) {
    if (gameRunning || !difficulties[mode]) return;

    currentDifficulty = mode;

    difficultyButtons.forEach(function (button) {
        const selected = button.dataset.mode === mode;

        button.classList.toggle("active", selected);
        button.setAttribute("aria-pressed", String(selected));
    });

    updateDifficultyInfo();
    resetGame();

    playSound(500, 0.1);
}

// Start the game
function startGame() {
    if (gameRunning) return;

    clearInterval(dropMaker);
    clearInterval(countdown);

    score = 0;
    timeLeft = difficulties[currentDifficulty].duration;
    reachedMilestones = [];

    gameRunning = true;

    updateDisplays();

    messageDisplay.textContent =
        "Go! Catch the clean water drops!";

    milestoneDisplay.textContent = "";
    confettiContainer.innerHTML = "";
    gameContainer.innerHTML = "";

    startButton.disabled = true;
    startButton.textContent = "Game in Progress";

    difficultyButtons.forEach(function (button) {
        button.disabled = true;
    });

    playSound(600, 0.12);

    createDrop();

    dropMaker = setInterval(
        createDrop,
        difficulties[currentDifficulty].dropSpeed
    );

    countdown = setInterval(function () {
        timeLeft--;

        updateDisplays();

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
        (Math.random() * 0.5 + difficulties[currentDifficulty].fallSpeed) + "s";

    gameContainer.appendChild(drop);

    // Handle clicking a water drop
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

            playSound(220, 0.2);

        } else {
            score++;

            drop.textContent = "+1";
            drop.classList.add("collected");

            messageDisplay.textContent =
                "Clean water collected! +1 point!";

            playSound(700, 0.12);

            checkMilestones();
        }

        updateDisplays();

        // Remove the collected drop from the page
        setTimeout(function () {
            drop.remove();
        }, 250);

        // Check whether the player has won
        if (score >= difficulties[currentDifficulty].winningScore) {
            endGame();
        }
    });

    // Remove drops after they fall out of the game area
    drop.addEventListener("animationend", function () {
        drop.remove();
    });
}

// Check for score milestones
function checkMilestones() {
    milestoneMessages.forEach(function (milestone) {
        if (
            score >= milestone.points &&
            !reachedMilestones.includes(milestone.points)
        ) {
            reachedMilestones.push(milestone.points);

            milestoneDisplay.textContent = milestone.message;

            playSound(850, 0.2);
        }
    });
}

// End the game
function endGame() {
    if (!gameRunning) return;

    gameRunning = false;

    clearInterval(dropMaker);
    clearInterval(countdown);

    dropMaker = null;
    countdown = null;

    gameContainer.innerHTML = "";

    startButton.disabled = false;
    startButton.textContent = "Play Again";

    difficultyButtons.forEach(function (button) {
        button.disabled = false;
    });

    const winningScore = difficulties[currentDifficulty].winningScore;
    const won = score >= winningScore;

    if (won) {
        const randomIndex = Math.floor(
            Math.random() * winningMessages.length
        );

        messageDisplay.textContent =
            winningMessages[randomIndex] +
            " Final score: " + score + "!";

        milestoneDisplay.textContent =
            "You did it! Every drop counts!";

        playSound(900, 0.4);
        celebrateWin();

    } else {
        const randomIndex = Math.floor(
            Math.random() * losingMessages.length
        );

        messageDisplay.textContent =
            losingMessages[randomIndex] +
            " Final score: " + score +
            ". You need " + winningScore + " points to win.";

        playSound(250, 0.25);
    }
}

// Reset the game
function resetGame() {
    clearInterval(dropMaker);
    clearInterval(countdown);

    gameRunning = false;

    score = 0;
    timeLeft = difficulties[currentDifficulty].duration;

    reachedMilestones = [];

    updateDisplays();
    updateDifficultyInfo();

    messageDisplay.textContent =
        "Ready to play? Press Start Game!";

    milestoneDisplay.textContent = "";

    gameContainer.innerHTML = "";
    confettiContainer.innerHTML = "";

    startButton.disabled = false;
    startButton.textContent = "Start Game";

    difficultyButtons.forEach(function (button) {
        button.disabled = false;
    });
}

// Turn sound on or off
function toggleSound() {
    soundEnabled = !soundEnabled;

    soundButton.textContent = soundEnabled
        ? "Sound: On"
        : "Sound: Off";

    soundButton.setAttribute(
        "aria-pressed",
        String(soundEnabled)
    );

    if (soundEnabled) {
        playSound(650, 0.15);
    }
}

// Play sound effects using JavaScript
function playSound(frequency, duration) {
    if (!soundEnabled) return;

    try {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) return;

        if (!audioContext) {
            audioContext = new AudioContextClass();
        }

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const volume = audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = frequency;

        volume.gain.setValueAtTime(
            0.08,
            audioContext.currentTime
        );

        volume.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + duration
        );

        oscillator.connect(volume);
        volume.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);

    } catch (error) {
        console.log("Sound could not be played.", error);
    }
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
