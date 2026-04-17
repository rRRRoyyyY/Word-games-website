let currentItem = null;
let triesLeft = 3;
let countdownInterval;




function renderItem() {
    if (countdownInterval) clearInterval(countdownInterval);

    const urlParams = new URLSearchParams(window.location.search);
    const specificId = urlParams.get('id');

    const backBtn = document.getElementById('backBtnLink');

    if (backBtn) {
        if (specificId) {
            backBtn.href = "riddlesLibrary.html";
        } else {
            backBtn.href = "riddles.html";
        }
    }

    if (specificId) {
        currentItem = gameData.find(riddle => riddle.id == specificId);
    } else {
        const randomIndex = Math.floor(Math.random() * gameData.length);
        currentItem = gameData[randomIndex];
    }

    triesLeft = getSavedTries('riddle', currentItem.id); 

    document.getElementById('questionDisplay').innerText = currentItem.question;
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
            localStorage.setItem(`tries_riddle_${currentItem.id}`, 0);
            document.getElementById('triesDisplay').innerText = formatHearts(0);
            
            handleSoftLock(); 
        }
    }, 1000); 
}


const showAnswerBtn = document.getElementById('showAnswerBtn');
showAnswerBtn.addEventListener('click', showAnswerGiveUp);

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
        localStorage.removeItem(`tries_riddle_${currentItem.id}`);
        document.getElementById('feedbackDisplay').innerText = "Correct! 🎉";
        showAnswer();
    }
    else {
        triesLeft--;

        localStorage.setItem(`tries_riddle_${currentItem.id}`, triesLeft);

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
    localStorage.setItem(`lockout_riddle_${currentItem.id}`, unlockTime);
    
    startCountdown(unlockTime);
}

function checkItemLock() {
    const lockTime = localStorage.getItem(`lockout_riddle_${currentItem.id}`);
    
    if (lockTime) {
        if (Date.now() < lockTime) {
            document.getElementById('inputArea').classList.add('hidden');
            document.getElementById('lockoutArea').classList.remove('hidden');
            startCountdown(lockTime);
        } else {
            unlockRiddle();
        }
    }
}


function startCountdown(unlockTime) {
    if (countdownInterval) clearInterval(countdownInterval);

    const timerDisplay = document.getElementById('riddleTimer');

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
            unlockRiddle();
        }
    }, 1000);
}


function unlockRiddle() {
    localStorage.removeItem(`lockout_riddle_${currentItem.id}`);
    document.getElementById('inputArea').classList.remove('hidden');
    document.getElementById('lockoutArea').classList.add('hidden');
    
    triesLeft = 3;
    document.getElementById('triesDisplay').innerText = formatHearts(triesLeft);

    document.getElementById('feedbackDisplay').innerText = "";
}



function handleNextClick() {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('id')) {
        const currentIndex = gameData.findIndex(item => item.id === currentItem.id);
        const nextIndex = currentIndex + 1;

        if (nextIndex < gameData.length) {
            const nextItem = gameData[nextIndex];
            window.location.href = `${window.location.pathname}?id=${nextItem.id}`;
        } else {
            window.location.href = `${window.location.pathname}?id=${gameData[0].id}`;
        }
    } else {
        renderItem();
    }
}


document.getElementById('nextQuestionBtn').addEventListener('click', handleNextClick);






// VERY BOTTOM
loadGameData('./riddles.json').then(() => {
    renderItem();
});