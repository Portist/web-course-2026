let secretNumber = "";
let history = [];
let isGameOver = false;

const elements = {
    input: document.getElementById("guess-input"),
    checkBtn: document.getElementById("check-btn"),
    newGameBtn: document.getElementById("new-game-btn"),
    message: document.getElementById("message"),
    attemptsCount: document.getElementById("attempts-count"),
    historyList: document.getElementById("history-list")
};

function initGame() {
    secretNumber = generateSecretNumber();
    history = [];
    isGameOver = false;

    elements.input.value = "";
    elements.input.disabled = false;
    elements.checkBtn.disabled = false;
    showMessage("", "");

    elements.input.focus();

    render();
}

function generateSecretNumber() {
    const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let result = "";

    for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        result += digits[randomIndex];
        digits.splice(randomIndex, 1);
    }

    return result;
}

function validateInput(guess) {
    if (guess.length !== 4) {
        return "Введите ровно 4 цифры.";
    }
    if (!/^\d{4}$/.test(guess)) {
        return "Ввод должен содержать только цифры без пробелов и букв.";
    }
    const uniqueDigits = new Set(guess.split(''));
    if (uniqueDigits.size !== 4) {
        return "Все 4 цифры должны быть разными.";
    }
    return null;
}

function calculateBullsAndCows(guess, secret) {
    let bulls = 0;
    let cows = 0;

    for (let i = 0; i < 4; i++) {
        if (guess[i] === secret[i]) {
            bulls++;
        } else if (secret.includes(guess[i])) {
            cows++;
        }
    }

    return { bulls, cows };
}

function getDeclension(number, words) {
    const value = Math.abs(number) % 100;
    const num = value % 10;
    if (value > 10 && value < 20) return words[2];
    if (num > 1 && num < 5) return words[1];
    if (num === 1) return words[0];
    return words[2];
}

function handleGuess() {
    if (isGameOver) return;

    const guess = elements.input.value.trim();
    const errorMsg = validateInput(guess);

    if (errorMsg) {
        showMessage(errorMsg, "error");
        return;
    }

    showMessage("", "");

    const { bulls, cows } = calculateBullsAndCows(guess, secretNumber);

    history.unshift({ guess, bulls, cows });

    if (bulls === 4) {
        isGameOver = true;
        elements.input.disabled = true;
        elements.checkBtn.disabled = true;
        showMessage(`Победа! Угадано за ${history.length} ${getDeclension(history.length, ['попытку', 'попытки', 'попыток'])}`, "success");
    } else {
        elements.input.value = "";
        elements.input.focus();
    }

    render();
}

function showMessage(text, type) {
    elements.message.textContent = text;
    elements.message.className = `message ${type}`;
}

function render() {
    elements.attemptsCount.textContent = history.length;

    elements.historyList.innerHTML = "";

    history.forEach(item => {
        const li = document.createElement("li");

        const bullWord = getDeclension(item.bulls, ['бык', 'быка', 'быков']);
        const cowWord = getDeclension(item.cows, ['корова', 'коровы', 'коров']);

        li.innerHTML = `
            <span class="guess-number">${item.guess}</span> 
            <span>&rarr; ${item.bulls} ${bullWord}, ${item.cows} ${cowWord}</span>
        `;

        elements.historyList.appendChild(li);
    });
}

elements.checkBtn.addEventListener("click", handleGuess);
elements.newGameBtn.addEventListener("click", initGame);

elements.input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        handleGuess();
    }
});

initGame();