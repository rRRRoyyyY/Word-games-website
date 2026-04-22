let currentItem = null;
let triesLeft = 3;
let countdownInterval;

const urlParams = new URLSearchParams(window.location.search);
const difficulty = urlParams.get('difficulty') || 'normal';
let dataFile = {
    easy: './JSONs/rebus_easy.json',
    normal: './JSONs/rebus_normal.json',
    hard: './JSONs/rebus_hard.json',
    lunatic: './JSONs/rebus_lunatic.json',
}[difficulty] || './JSONs/rebus_normal.json';

function updateBackLink(specificId) {
    const backBtn = document.getElementById('backBtnLink');
    if (backBtn) {
        if (specificId) {
            backBtn.href = `rebusLibrary.html?difficulty=${difficulty}`;
        } else {
            backBtn.href = "rebusDifficulty.html";
        }
    }
}

function renderItem() {
    if (countdownInterval) clearInterval(countdownInterval);

    const urlParams = new URLSearchParams(window.location.search);
    const specificId = urlParams.get('id');

    updateBackLink(specificId);

    if (specificId) {
        currentItem = dataFile.find(riddle => String(rebus.id) === String(specificId));
    } else {
        const randomIndex = Math.floor(Math.random() * dataFile.length);
        currentItem = dataFile[randomIndex];
    }

    triesLeft = getSavedTries('rebus', currentItem.id); 

    document.getElementById('questionDisplay').innerHTML = `<img src="${currentItem.question}" alt="Rebus Puzzle">`;
    document.getElementById('itemCredit').innerText = currentItem.owner;
    document.getElementById('userGuess').value = "";
    
    document.getElementById('triesDisplay').innerText = formatHearts(triesLeft);

    document.getElementById('answerDisplay').classList.add('hidden');
    document.getElementById('inputArea').classList.remove('hidden');
    document.getElementById('lockoutArea').classList.add('hidden');
    document.getElementById('feedbackDisplay').innerText = "";

    checkItemLock(); 
}

function showAnswerGiveUp() {
    const answerBox = document.getElementById('answerDisplay');
    const feedback = document.getElementById('feedbackDisplay');
    answerBox.innerText = currentItem.answer;
    answerBox.classList.remove('hidden');
    document.getElementById('inputArea').classList.add('hidden');
    let secondsLeft = 10;
    feedback.innerText = `Revealing answer for ${secondsLeft} seconds...`;
    const sneakPeekInterval = setInterval(() => {
        secondsLeft--;
        feedback.innerText = `Revealing answer for ${secondsLeft} seconds...`;
        if (secondsLeft <= 0) {
            clearInterval(sneakPeekInterval); 
            answerBox.classList.add('hidden');
            answerBox.innerText = "";
            triesLeft = 0;
            localStorage.setItem(`tries_rebus_${currentItem.id}`, 0);
            document.getElementById('triesDisplay').innerText = formatHearts(0);
            handleSoftLock(); 
        }
    }, 1000); 
}
document.getElementById('showAnswerBtn').addEventListener('click', showAnswerGiveUp);

function showAnswer() {
    const answerBox = document.getElementById('answerDisplay');
    answerBox.innerText = currentItem.answer;
    answerBox.classList.remove('hidden');
}

function checkGuess() {
    if (triesLeft <= 0) return;
    let userInput = document.getElementById('userGuess').value.toLowerCase().trim();
    if (userInput === "") {
        document.getElementById('feedbackDisplay').innerText = "Please type an answer first!";
        return; 
    }
    let correctKey = currentItem.answer.toLowerCase().replace(/^(the|a|an)\s+/i, "");
    if (userInput.includes(correctKey)) {
        localStorage.removeItem(`tries_rebus_${currentItem.id}`);
        document.getElementById('feedbackDisplay').innerText = "Correct! 🎉";
        showAnswer();
    }
    else {
        triesLeft--;
        localStorage.setItem(`tries_rebus_${currentItem.id}`, triesLeft);
        document.getElementById('triesDisplay').innerText = formatHearts(triesLeft);
        if (triesLeft > 0) {
            document.getElementById('feedbackDisplay').innerText = "Not quite! Try again.";
        } else {
            handleSoftLock(); 
        }
    }
}
document.getElementById('submitGuessBtn').addEventListener('click', checkGuess);

function handleSoftLock() {
    document.getElementById('inputArea').classList.add('hidden');
    document.getElementById('lockoutArea').classList.remove('hidden');
    document.getElementById('feedbackDisplay').innerText = "";
    const unlockTime = Date.now() + (24 * 60 * 60 * 1000);
    localStorage.setItem(`lockout_rebus_${currentItem.id}`, unlockTime);
    startCountdown(unlockTime);
}
function checkItemLock() {
    const lockTime = localStorage.getItem(`lockout_rebus_${currentItem.id}`);
    if (lockTime) {
        if (Date.now() < lockTime) {
            document.getElementById('inputArea').classList.add('hidden');
            document.getElementById('lockoutArea').classList.remove('hidden');
            startCountdown(lockTime);
        } else {
            unlockRebus();
        }
    }
}
function startCountdown(unlockTime) {
    if (countdownInterval) clearInterval(countdownInterval);
    const timerDisplay = document.getElementById('rebusTimer');
    countdownInterval = setInterval(() => {
        const now = Date.now();
        const distance = unlockTime - now;
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        const h = hours.toString().padStart(2, '0');
        const m = minutes.toString().padStart(2, '0');
        const s = seconds.toString().padStart(2, '0');
        timerDisplay.innerText = `${h}:${m}:${s}`;
        if (distance <= 0) {
            clearInterval(countdownInterval);
            unlockRebus();
        }
    }, 1000);
}
function unlockRebus() {
    localStorage.removeItem(`lockout_rebus_${currentItem.id}`);
    document.getElementById('inputArea').classList.remove('hidden');
    document.getElementById('lockoutArea').classList.add('hidden');
    triesLeft = 3;
    document.getElementById('triesDisplay').innerText = formatHearts(triesLeft);
    document.getElementById('feedbackDisplay').innerText = "";
}

function handleNextClick() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('id')) {
        const currentIndex = dataFile.findIndex(item => String(item.id) === String(currentItem.id));
        const nextIndex = currentIndex + 1;
        if (nextIndex < dataFile.length) {
            const nextItem = dataFile[nextIndex];
            window.location.href = `${window.location.pathname}?difficulty=${difficulty}&id=${nextItem.id}`;
        } else {
            window.location.href = `${window.location.pathname}?difficulty=${difficulty}&id=${dataFile[0].id}`;
        }
    } else {
        renderItem();
    }
}
document.getElementById('nextQuestionBtn').addEventListener('click', handleNextClick);

loadGameData(dataFile).then(() => {
    renderItem();
});