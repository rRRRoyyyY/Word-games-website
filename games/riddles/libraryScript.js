// ---- Riddle Library Script (Unified Difficulty Version) ----
// Usage: riddlesLibrary.html?difficulty=normal

// Get difficulty from URL parameter, default to 'normal' if missing
const urlParams = new URLSearchParams(window.location.search);
const difficulty = urlParams.get('difficulty') || 'normal';

const gamePage = `riddlesStart.html?difficulty=${difficulty}`;

// Pick the correct JSON per difficulty.
const dataFile = {
    easy: './riddles_easy.json',
    normal: './riddles_normal.json',
    hard: './riddles_hard.json',
    lunatic: './riddles_lunatic.json',
}[difficulty] || './riddles_normal.json';

loadGameData(dataFile).then(() => {
    const container = document.getElementById('libraryContainer');
    container.innerHTML = "";

    gameData.forEach(item => {
        const lives = getSavedTries('riddle', item.id);
        const locked = isItemLocked('riddle', item.id);

        const card = document.createElement('a');
        card.className = "gameCard";
        card.href = `${gamePage}&id=${item.id}`;

        card.innerHTML = `
            <div class="cardHeader">
                <span>By: ${item.owner}</span>
                <span>${formatHearts(lives)}</span>
            </div>
            <p class="cardQuestion">${item.question}</p>
            <span class="cardAction">${locked ? "Locked" : "Solve Now →"}</span>
        `;

        container.appendChild(card);
    });
});



