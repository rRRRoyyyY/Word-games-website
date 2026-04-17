const gamePage = "rebusStart.html"; // For Hink Pink, change this to "hinkPinkStart.html"

loadGameData('./rebus.json').then(() => {
    const container = document.getElementById('libraryContainer');
    container.innerHTML = ""; // Clear the 'Loading' text

    gameData.forEach(item => {
        const lives = getSavedTries('rebus',item.id);
        const locked = isItemLocked('rebus',item.id);

        const card = document.createElement('a');
        card.className = "gameCard";
        card.href = `${gamePage}?id=${item.id}`;

        card.innerHTML = `
            <div class="cardHeader">
                <span>By: ${item.owner}</span>
                <span>${formatHearts(lives)}</span>
            </div>
            <img class="cardQuestionImg" src="${item.question}" alt="Question Image">
            <span class="cardAction ${locked ? 'is-locked' : ''}">${locked ? "Locked" : "Solve Now →"}</span>
        `;

        container.appendChild(card);
    });
});