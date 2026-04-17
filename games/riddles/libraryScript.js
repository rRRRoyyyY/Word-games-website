const gamePage = "riddlesStart.html";

loadGameData('./riddles.json').then(() => {
    const container = document.getElementById('libraryContainer');
    container.innerHTML = ""; 

    gameData.forEach(item => {
        const lives = getSavedTries('riddle',item.id);
        const locked = isItemLocked('riddle',item.id);

        const card = document.createElement('a');
        card.className = "gameCard";
        card.href = `${gamePage}?id=${item.id}`;

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



