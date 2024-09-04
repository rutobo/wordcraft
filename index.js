document.addEventListener('DOMContentLoaded', () => {
    const playerForm = document.getElementById('playerForm');
    if (playerForm) {
        playerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const playerOneName = document.getElementById('playerOneName').value;
            const playerTwoName = document.getElementById('playerTwoName').value;
            const selectedLanguage = document.getElementById('languageSelect').value;
            const selectedDuration = document.getElementById('durationSelect').value;

            // Store player names, language, and duration in localStorage
            localStorage.setItem('playerOneName', playerOneName);
            localStorage.setItem('playerTwoName', playerTwoName);
            localStorage.setItem('selectedLanguage', selectedLanguage);
            localStorage.setItem('gameDuration', selectedDuration);

            // Redirect to game.html
            window.location.href = 'game.html';
        });
    }

    const leaderboardButton = document.getElementById('leaderboardButton');
    if (leaderboardButton) {
        leaderboardButton.addEventListener('click', () => {
            window.location.href = 'leaderboard.html';
        });
    }
});
