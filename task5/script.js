const PHASE = {
    IDLE: "idle",
    SHOWING: "showing",
    INPUT: "input"
};

const CONFIG = {
    padCount: 4,
    startDelay: 600,
    flashDuration: 500,
    pauseDuration: 250,
    playerFlashDuration: 250,
    nextRoundDelay: 900,
    frequencies: [261.63, 329.63, 392, 523.25],
    errorFrequency: 110,
    errorDuration: 400
};

const game = {
    sequence: [],
    playerIndex: 0,
    level: 0,
    phase: PHASE.IDLE,
    runId: 0,
    timers: new Set(),
    soundEnabled: true,
    audioContext: null
};

const elements = {
    pads: document.querySelectorAll(".pad"),
    startBtn: document.getElementById("start-btn"),
    soundToggle: document.getElementById("sound-toggle"),
    level: document.getElementById("level"),
    status: document.getElementById("status")
};

function wait(ms) {
    return new Promise(resolve => {
        const timerId = setTimeout(() => {
            game.timers.delete(timerId);
            resolve();
        }, ms);

        game.timers.add(timerId);
    });
}

function clearTimers() {
    game.timers.forEach(timerId => clearTimeout(timerId));
    game.timers.clear();
}

function randomPadIndex() {
    return Math.floor(Math.random() * CONFIG.padCount);
}

function setStatus(text) {
    elements.status.textContent = text;
}

function renderLevel() {
    elements.level.textContent = game.level;
}

function setPadsDisabled(disabled) {
    elements.pads.forEach(pad => {
        pad.disabled = disabled;
    });
}

function clearPadHighlights() {
    elements.pads.forEach(pad => {
        pad.classList.remove("active");
    });
}

function getAudioContext() {
    if (!game.audioContext) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) {
            return null;
        }

        game.audioContext = new AudioContextClass();
    }

    if (game.audioContext.state === "suspended") {
        game.audioContext.resume();
    }

    return game.audioContext;
}

function playTone(frequency, duration, type = "sine") {
    if (!game.soundEnabled) {
        return;
    }

    const context = getAudioContext();

    if (!context) {
        return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    const end = now + duration / 1000;

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(now);
    oscillator.stop(end);
}

async function flashPad(index, duration) {
    const pad = elements.pads[index];

    pad.classList.add("active");
    playTone(CONFIG.frequencies[index], duration);

    await wait(duration);

    pad.classList.remove("active");
}

async function showSequence(runId) {
    game.phase = PHASE.SHOWING;
    setStatus("Запоминайте последовательность");

    await wait(CONFIG.startDelay);

    for (const padIndex of game.sequence) {
        if (runId !== game.runId) {
            return;
        }

        await flashPad(padIndex, CONFIG.flashDuration);

        if (runId !== game.runId) {
            return;
        }

        await wait(CONFIG.pauseDuration);
    }

    if (runId !== game.runId) {
        return;
    }

    game.phase = PHASE.INPUT;
    setStatus("Ваш ход");
}

async function startNextRound(runId) {
    game.level++;
    game.sequence.push(randomPadIndex());
    game.playerIndex = 0;

    renderLevel();

    await showSequence(runId);
}

async function finishRound(runId) {
    game.phase = PHASE.SHOWING;
    setStatus("Верно!");

    await wait(CONFIG.nextRoundDelay);

    if (runId !== game.runId) {
        return;
    }

    await startNextRound(runId);
}

function stopGame() {
    game.runId++;
    game.phase = PHASE.IDLE;

    clearTimers();
    clearPadHighlights();
    setPadsDisabled(true);
}

function endGame() {
    const reachedLevel = game.level;

    stopGame();

    playTone(CONFIG.errorFrequency, CONFIG.errorDuration, "sawtooth");
    setStatus(`Игра окончена. Вы дошли до уровня ${reachedLevel}`);
}

function startGame() {
    stopGame();
    getAudioContext();

    game.sequence = [];
    game.playerIndex = 0;
    game.level = 0;

    renderLevel();
    setPadsDisabled(false);

    startNextRound(game.runId);
}

function handlePadClick(index) {
    if (game.phase !== PHASE.INPUT) {
        return;
    }

    if (index !== game.sequence[game.playerIndex]) {
        endGame();
        return;
    }

    flashPad(index, CONFIG.playerFlashDuration);
    game.playerIndex++;

    if (game.playerIndex === game.sequence.length) {
        finishRound(game.runId);
    }
}

elements.startBtn.addEventListener("click", startGame);

elements.soundToggle.addEventListener("change", () => {
    game.soundEnabled = elements.soundToggle.checked;
});

elements.pads.forEach((pad, index) => {
    pad.addEventListener("click", () => {
        handlePadClick(index);
    });
});

setPadsDisabled(true);
renderLevel();
