const urlParams = new URLSearchParams(window.location.search);
const difficulty = urlParams.get('difficulty') || 'normal';

const gamePage = `riddlesStart.html?difficulty=${difficulty}`;

let dataFile = {
    easy: './JSONs/riddles_easy.json',
    normal: './JSONs/riddles_normal.json',
    hard: './JSONs/riddles_hard.json',
    lunatic: './JSONs/riddles_lunatic.json',
}[difficulty] || './JSONs/riddles_normal.json';

loadGameData(dataFile).then((gameData) => {
    const container = document.getElementById('libraryContainer');
    const solvedDisplay = document.getElementById('solvedDisplay'); // Target hard-coded ID
    const container2 = document.getElementById('difficultyContainer');
    const giveupCount = localStorage.getItem(`riddles_giveups_${difficulty}`) || 0;
    const hintCount = localStorage.getItem(`riddles_hints_${difficulty}`) || 0;
    document.getElementById('giveupRecord').innerText = `Give Up's Used: ${giveupCount}`;
    document.getElementById('hintRecord').innerText = `Hints Used: ${hintCount}`;

    if (!container) return;

    // 1. Get the data counts
    const questionCount = gameData.length;
    const solvedCount = getSolvedCount('riddle', difficulty);

    if (solvedCount >= questionCount) {
             document.getElementById('completionBadge').classList.remove('hidden');
             // Optional: Trigger a special alert or sound
             console.log("Difficulty Mastered!");}

    if (solvedDisplay) {
        solvedDisplay.innerHTML = formatSolved(solvedCount, questionCount);
    }

    container2.innerHTML = `<span class="difficultyDisplayStyle">---${difficulty}---</span>`;
    container.innerHTML = "";
    
    gameData.forEach(item => {
        const lives = getSavedTries('riddle', item.id);
        const locked = isItemLocked('riddle', item.id);
        const isSolved = localStorage.getItem(`status_riddle_${item.id}`) === "true";

        const card = document.createElement('a');
        card.className = "gameCard";
        card.href = `${gamePage}&id=${item.id}`;
        
        if (locked) card.classList.add('cardLocked');
        // Optional: Add a 'solved' class for styling if you want
        if (isSolved) card.classList.add('cardSolved');

        let actionText = "Solve Now →";
        if (isSolved) {
            actionText = "Already Solved ✅";
        } else if (locked) {
            actionText = "Locked 🔒";
        }

        if (item.owner == "public domain") {
            card.innerHTML = `
                <div class="cardHeader">
                    <span></span>
                    <span>${formatHearts(lives)}</span>
                </div>
                <p class="cardQuestion">${item.question}</p>
                <span class="cardAction">${actionText}</span>
            `;
        }
        else {
            card.innerHTML = `
                <div class="cardHeader">
                    <div>By: ${item.owner}</div>
                    <span>${formatHearts(lives)}</span>
                </div>
                <p class="cardQuestion">${item.question}</p>
                <span class="cardAction">${locked ? "Locked 🔒" : "Solve Now →"}</span>
            `;
        }

        container.appendChild(card);
    });
});
