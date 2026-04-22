const urlParams = new URLSearchParams(window.location.search);
const difficulty = urlParams.get('difficulty') || 'normal';

const gamePage = `riddlesStart.html?difficulty=${difficulty}`;

let dataFile = {
    easy: './JSONs/riddles_easy.json',
    normal: './JSONs/riddles_normal.json',
    hard: './JSONs/riddles_hard.json',
    lunatic: './JSONs/riddles_lunatic.json',
}[difficulty] || './JSONs/riddles_normal.json';

loadGameData(dataFile).then(() => {
    const container = document.getElementById('libraryContainer');
    container.innerHTML = "";

    dataFile.forEach(item => {
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



