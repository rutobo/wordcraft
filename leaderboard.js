document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('leaderboard')) {
        loadLeaderboard();
    }
    setupLeaderboardButtons();
});

function setupLeaderboardButtons() {
    const backButton = document.getElementById('backButton');
    const resetButton = document.getElementById('resetButton');
    const leaderboardButton = document.getElementById('leaderboardButton');

    if (backButton) {
        backButton.addEventListener('click', () => window.location.href = 'index.html');
    }
    if (resetButton) {
        resetButton.addEventListener('click', resetLeaderboard);
    }
    if (leaderboardButton) {
        leaderboardButton.addEventListener('click', () => window.location.href = 'leaderboard.html');
    }
}

function loadLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('scores')) || [];
    const leaderboard = document.querySelector('#leaderboard tbody');
    scores.sort((a, b) => b.playerOneScore - a.playerOneScore);
    scores.forEach((score, index) => {
        const row = leaderboard.insertRow();
        row.insertCell(0).textContent = index + 1;
        const playerOneCell = row.insertCell(1);
        playerOneCell.textContent = score.playerOneName;
        const playerOneScoreCell = row.insertCell(2);
        playerOneScoreCell.textContent = score.playerOneScore;
        const playerTwoCell = row.insertCell(3);
        playerTwoCell.textContent = score.playerTwoName;
        const playerTwoScoreCell = row.insertCell(4);
        playerTwoScoreCell.textContent = score.playerTwoScore;
        row.insertCell(5).textContent = score.date;
        highlightWinner(playerOneScoreCell, playerTwoScoreCell);
    });
}

function highlightWinner(playerOneScoreCell, playerTwoScoreCell) {
    if (parseInt(playerOneScoreCell.textContent) > parseInt(playerTwoScoreCell.textContent)) {
        playerOneScoreCell.classList.add('winner');
    } else if (parseInt(playerTwoScoreCell.textContent) > parseInt(playerOneScoreCell.textContent)) {
        playerTwoScoreCell.classList.add('winner');
    }
}

function resetLeaderboard() {
    localStorage.removeItem('scores');
    const leaderboard = document.querySelector('#leaderboard tbody');
    while (leaderboard.firstChild) {
        leaderboard.removeChild(leaderboard.firstChild);
    }
}