// let dataFile = [];

function loadGameData(path) {
    return fetch(path)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            dataFile = data; 
            return dataFile; 
        })
        .catch(error => console.error("Failed to load game data:", error));
}

function getSavedTries(gameType, id) {
    if (!id || !gameType) return 3;
    const saved = localStorage.getItem(`tries_${gameType}_${id}`);
    return saved ? parseInt(saved) : 3; 
}

function isItemLocked(gameType, id) {
    if (!id || !gameType) return false;
    const lockTime = localStorage.getItem(`lockout_${gameType}_${id}`);
    return !!(lockTime && Date.now() < Number(lockTime));
}

function formatHearts(count) {
    if (count <= 0) {
        return "💔💔💔 🔒"; 
    }
    const fullHearts = "❤️".repeat(count);
    const brokenHearts = "💔".repeat(3 - count);
    return fullHearts + brokenHearts;
}
