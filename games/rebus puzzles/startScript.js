let currentItem = null;
let triesLeft = 3;
let countdownInterval;
let solvedCount = 0;
let isAlreadySolved;
let sneakPeekInterval;
let hintShownOrNot = "no";


const urlParams = new URLSearchParams(window.location.search);
const difficulty = urlParams.get('difficulty') || 'normal';
let dataFile = {
    easy: './JSONs/rebus_easy.json',
    normal: './JSONs/rebus_normal.json',
    hard: './JSONs/rebus_hard.json',
    lunatic: './JSONs/rebus_lunatic.json',
}[difficulty] || './JSONs/rebus_normal.json';

let questionCount = 0;
let gameData = [];

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
    if (sneakPeekInterval) clearInterval(sneakPeekInterval); 
    document.getElementById('nextQuestionBtn').classList.remove('hidden');
    if (countdownInterval) clearInterval(countdownInterval);
    document.getElementById('showAnswerBtn').classList.remove('hidden');
    document.getElementById('hintBtn').classList.remove('hidden');
    const urlParams = new URLSearchParams(window.location.search);
    const specificId = urlParams.get('id');
    let mode;

    updateBackLink(specificId);

    if (specificId) {
        currentItem = gameData.find(rebus => String(rebus.id) === String(specificId));
        mode = "library"
    } else {
        const availableRebuses = gameData.filter(rebus => getSavedTries('rebus', rebus.id) > 0);
        mode = "start"
        if (availableRebuses.length === 0) {
            document.getElementById('triesDisplay').innerText = ""; 
            document.getElementById('lockoutArea').classList.add('hidden'); 
            
            if (countdownInterval) clearInterval(countdownInterval);

            document.getElementById('questionDisplay').innerHTML = `<span class="allLockedMessage">All puzzles are locked   👋😂</span>`
            document.getElementById('inputArea').classList.add('hidden');
            document.getElementById('itemCredit').innerText = "Check back tomorrow";
            
            return;
        }

        const randomIndex = Math.floor(Math.random() * availableRebuses.length);
        currentItem = availableRebuses[randomIndex];
    }
    
    hintShownOrNot = localStorage.getItem(`hint_rebus_${currentItem.id}`) || "no";
    
    if (hintShownOrNot == "yes") {
        showHint();
    }
    else {
        const hintBox = document.getElementById('hintBox')
        hintBox.classList.add('hidden');
        const hintBtn = document.getElementById('hintBtn')
        hintBtn.classList.remove('hidden');
    }

    document.getElementById('informStatus').classList.add('hidden');
    triesLeft = getSavedTries('rebus', currentItem.id); 
    solvedCount = parseInt(localStorage.getItem(`solved_rebus_total_${difficulty}`)) || 0;

    document.getElementById('questionDisplay').innerHTML = `<img class="questionDisplayStyleImg" src="./${currentItem.question}" alt="Rebus Puzzle">`;
    if (currentItem.owner == "public domain") {
        document.getElementById('itemCredit').innerText = "";
        document.getElementById('userGuess').value = "";
    }
    else {
        document.getElementById('itemCredit').innerText = currentItem.owner;
        document.getElementById('userGuess').value = "";
    }

    document.getElementById('userGuess').value = "";
    document.getElementById('triesDisplay').innerText = `Tries: ${formatHearts(triesLeft)}`;
    document.getElementById('solvedDisplay').innerHTML = formatSolved(solvedCount, questionCount);
    if (solvedCount >= questionCount && questionCount > 0) {
        document.getElementById('completionBadge').classList.remove('hidden');
    } else {
        document.getElementById('completionBadge').classList.add('hidden');
    }

    const giveupCount = localStorage.getItem(`rebus_giveups_${difficulty}`) || 0;
    const hintCount = localStorage.getItem(`rebus_hints_${difficulty}`) || 0;
    document.getElementById('giveupRecord').innerText = `Give Up's Used: ${giveupCount}`;
    document.getElementById('hintRecord').innerText = `Hints Used: ${hintCount}`;

    document.getElementById('answerDisplay').classList.add('hidden');
    document.getElementById('inputArea').classList.remove('hidden');
    document.getElementById('lockoutArea').classList.add('hidden');
    document.getElementById('feedbackDisplay').innerText = "";

    isAlreadySolved = localStorage.getItem(`status_rebus_${currentItem.id}`);

    if (isAlreadySolved === "true") {
        document.getElementById('informStatus').classList.remove('hidden');
    }

    const container = document.getElementById('difficultyContainer');
    container.innerHTML = "";
    container.innerHTML = `<span class="difficultyDisplayStyle">---${difficulty}---</span>`;

    const container2 = document.getElementById('randomOrLibrary')
    if (mode == "library") {
        container2.innerHTML = `<span class="modeDisplayStyle">Library</span>`
    }
    else {
        container2.innerHTML = `<span class="modeDisplayStyle">Random</span>`
    }

    checkItemLock(); 
}

function showAnswerGiveUp() {
    if (isAlreadySolved !== "true") {
        let count = parseInt(localStorage.getItem(`rebus_giveups_${difficulty}`)) || 0;
        count++;
        localStorage.setItem(`rebus_giveups_${difficulty}`, count);
        
        document.getElementById('giveupRecord').innerText = `Give Up's Used: ${count}`;
    }
    document.getElementById('nextQuestionBtn').classList.add('hidden');
    document.getElementById('showAnswerBtn').classList.add('hidden')
    document.getElementById('hintBtn').classList.add('hidden')

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
            document.getElementById('nextQuestionBtn').classList.remove('hidden');
            answerBox.classList.add('hidden');
            answerBox.innerText = "";
            triesLeft = 0;
            localStorage.setItem(`tries_rebus_${currentItem.id}`, 0);
            document.getElementById('triesDisplay').innerText = formatHearts(0);
            handleSoftLock(); 
        }
    }, 1000); 
}

function showHint(){
    if (isAlreadySolved !== "true") {
        let count = parseInt(localStorage.getItem(`rebus_hints_${difficulty}`)) || 0;
        count++;
        localStorage.setItem(`rebus_hints_${difficulty}`, count);
        
        // 2. Update the label immediately
        document.getElementById('hintRecord').innerText = `Hints Used: ${count}`;
    }
    
    localStorage.setItem(`hint_rebus_${currentItem.id}`, "yes");
    hintShownOrNot = localStorage.getItem(`hint_rebus_${currentItem.id}`)
    const hintBox = document.getElementById('hintBox')
    const hintBtn = document.getElementById('hintBtn')
    hintBtn.classList.add('hidden');
    hintBox.innerText = `${currentItem.hint}`;
    hintBox.classList.remove('hidden');

}

function showAnswer() {
    const answerBox = document.getElementById('answerDisplay');
    answerBox.innerText = currentItem.answer;
    answerBox.classList.remove('hidden');
}

function openConfirm(message, onConfirm) {
  const dialog = document.getElementById('confirmDialog');
  const dialogMessage = document.getElementById('dialogMessage');
  const currentBtn = document.getElementById('confirmBtn'); 
  
  dialogMessage.textContent = message; 

  const newConfirmBtn = currentBtn.cloneNode(true);
  currentBtn.replaceWith(newConfirmBtn);
  
  newConfirmBtn.addEventListener('click', () => {
    onConfirm();
    dialog.close();
  });

  dialog.showModal();
}

document.getElementById('cancelBtn').addEventListener('click', () => {
  const dialog = document.getElementById('confirmDialog');
  if (dialog) dialog.close();
})

document.getElementById('showAnswerBtn').addEventListener('click', () => {
  openConfirm("You sure you wanna give up?", showAnswerGiveUp);
});

document.getElementById('hintBtn').addEventListener('click', () => {
  openConfirm("Want a hint?", showHint);
});

function checkGuess() {
    if (triesLeft <= 0) return;
    let userInput = document.getElementById('userGuess').value.toLowerCase().trim();
    if (userInput === "") {
        document.getElementById('feedbackDisplay').innerText = "Please type an answer first!";
        return; 
    }
    let correctKey = currentItem.answer.toLowerCase().replace(/^(the|a|an)\s+/i, "");
    if (userInput.includes(correctKey)) {
        isAlreadySolved = localStorage.getItem(`status_rebus_${currentItem.id}`);
        
        if (!isAlreadySolved) {
            solvedCount++;
            // 2. Save using the SAME key as renderItem
            localStorage.setItem(`solved_rebus_total_${difficulty}`, solvedCount);
            localStorage.setItem(`status_rebus_${currentItem.id}`, "true");
            document.getElementById('informStatus').classList.remove('hidden'); 

            if (solvedCount >= questionCount) {
             document.getElementById('completionBadge').classList.remove('hidden');
             // Optional: Trigger a special alert or sound
             console.log("Difficulty Mastered!");
        }
        }

        localStorage.removeItem(`tries_rebus_${currentItem.id}`);

        document.getElementById('solvedDisplay').innerHTML = formatSolved(solvedCount, questionCount);
        
        document.getElementById('showAnswerBtn').classList.add('hidden');
        document.getElementById('hintBtn').classList.add('hidden');
        document.getElementById('feedbackDisplay').innerText = "Correct! 🎉";
        showAnswer();
    }
    else {
        triesLeft--;
        localStorage.setItem(`tries_rebus_${currentItem.id}`, triesLeft);
        document.getElementById('triesDisplay').innerText = `Tries: ${formatHearts(triesLeft)}`;
        document.getElementById('userGuess').value = "";
        if (triesLeft > 0) {
            document.getElementById('feedbackDisplay').innerText = "Not quite! Try again.";
        } else {
            handleSoftLock(); 
        }
    }
}
document.getElementById('submitGuessBtn').addEventListener('click', checkGuess);

document.getElementById('userGuess').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    checkGuess();
  }
});

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
            document.getElementById('showAnswerBtn').classList.add('hidden');
            document.getElementById('hintBtn').classList.add('hidden');
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
        const currentIndex = gameData.findIndex(item => String(item.id) === String(currentItem.id));
        const nextIndex = currentIndex + 1;
        if (nextIndex < gameData.length) {
            const nextItem = gameData[nextIndex];
            window.location.href = `${window.location.pathname}?difficulty=${difficulty}&id=${nextItem.id}`;
        } else {
            window.location.href = `${window.location.pathname}?difficulty=${difficulty}&id=${gameData[0].id}`;
        }
    } else {
        renderItem();
    }
}
document.getElementById('nextQuestionBtn').addEventListener('click', handleNextClick);

loadGameData(dataFile).then((data) => {
    gameData = data;           
    questionCount = data.length; 
    console.log("Total questions loaded:", questionCount);
    renderItem();
});