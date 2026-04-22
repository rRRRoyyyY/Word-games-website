const urlParams = new URLSearchParams(window.location.search);
const difficulty = urlParams.get('difficulty') || 'normal';

const gamePage = `rebusStart.html?difficulty=${difficulty}`;

let dataFile = {
    easy: './JSONs/rebus_easy.json',
    normal: './JSONs/rebus_normal.json',
    hard: './JSONs/rebus_hard.json',
    lunatic: './JSONs/rebus_lunatic.json',
}[difficulty] || './JSONs/rebus_normal.json';

loadGameData(dataFile).then(() => {
    const container = document.getElementById('libraryContainer');
    container.innerHTML = "";
    container.innerHTML = `<span class="difficultyDisplayStyle">---${difficulty}---</span>`;

    dataFile.forEach(item => {
        const lives = getSavedTries('rebus', item.id);
        const locked = isItemLocked('rebus', item.id);

        const card = document.createElement('a');
        card.className = "gameCard";
        card.href = `${gamePage}&id=${item.id}`;

        card.innerHTML = `
            <div class="cardHeader">
                <span>By: ${item.owner}</span>
                <span>${formatHearts(lives)}</span>
            </div>
            <div class="cardImageContainer">
                <img class="questionDisplayStyleImg" src="${item.question}" alt="Rebus Puzzle">
            </div>
            <span class="cardAction">${locked ? "Locked" : "Solve Now →"}</span>
        `;

        container.appendChild(card);
    });

});