// let dataFile = [];

function loadGameData(path) {
    return fetch(path)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            gameData = data; 
            return gameData; 
        })
        .catch(error => console.error("Failed to load game data:", error));
}

function getSavedTries(gameType, id) {
    if (!id || !gameType) return 3;
    const saved = localStorage.getItem(`tries_${gameType}_${id}`);
    return saved ? parseInt(saved) : 3; 
}

function getSolvedCount(gameType, difficulty) {
    if (!gameType || !difficulty) return 0;
    // Key becomes: solved_riddle_total_normal
    const saved = localStorage.getItem(`solved_${gameType}_total_${difficulty}`);
    return saved ? parseInt(saved) : 0; 
}


function isItemLocked(gameType, id) {
    if (!id || !gameType) return false;
    const lockTime = localStorage.getItem(`lockout_${gameType}_${id}`);
    return !!(lockTime && Date.now() < Number(lockTime));
}

function formatHearts(count) {
    if (count <= 0) {
        return "Locked🔒"; 
    }
    const fullHearts = "❤️".repeat(count);
    const brokenHearts = "🖤".repeat(3 - count);
    return fullHearts + brokenHearts;
}

function formatSolved(count, questionAmount) {
    const solvedCount = Math.max(0, Math.min(count, questionAmount));
    const notSolvedCount = questionAmount - solvedCount;

    const solvedHTML = `<img src="../../images/solved.png" class="statusIcon glow">`.repeat(solvedCount);
    const notSolvedHTML = `<img src="../../images/not solved.png" class="statusIcon">`.repeat(notSolvedCount);
    
    return solvedHTML + notSolvedHTML;
}
