const container = document.getElementById('container');
const totalSumElement = document.getElementById('totalSum'); // Correct reference to totalSum
const playerOneElement = document.getElementById('playerOne');
const playerTwoElement = document.getElementById('playerTwo');
const wordListPlayerOne = document.getElementById('wordListPlayerOne');
const wordListPlayerTwo = document.getElementById('wordListPlayerTwo');

let numberOfBoxes = 3; // Start with 3 boxes
let currentIndex = 0;
let randomLetters = [];
let assignedNumbers = {};

let lastGeneratedLetter = null; // Variable to store the last generated letter
let previousLetters = Array.from({ length: numberOfBoxes }, () => []);
let isChecking = false; // Flag to prevent multiple checks
let gameScore = 0;
let currentLetterIndexes = Array.from({ length: numberOfBoxes }, () => Math.floor(Math.random() * 26));

// Player management
let currentPlayer = 1;
let playerOneScore = 100;
let playerTwoScore = 100;

// Global object to store assigned numbers for each letter
let letterToNumberMap = {};

const russianLetters = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('');
const englishLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

let currentAlphabet = englishLetters; // Default to English letters
let currentLanguage = 'en'; // Default to English

// Add these variables at the top of the file
let gameDuration = 600; // Default to 10 minutes (in seconds)
let playerOneTime = 300; // Default to 5 minutes per player
let playerTwoTime = 300;
let timerInterval;
let isGameOver = false;

// Add this variable at the top of your script
let lastValidWord = '';

let russianDictionary = [];
let englishDictionary = [];

function loadDictionaries() {
    console.log('Loading dictionaries...');
    return new Promise((resolve) => {
        console.log('Russian dictionary loaded, word count:', russianDictionaryData.length);
        console.log('English dictionary loaded, word count:', englishDictionaryData.length);
        russianDictionary = russianDictionaryData;
        englishDictionary = englishDictionaryData;
        console.log('Sample English words:', englishDictionary.slice(0, 5));
        resolve([new Set(russianDictionaryData), new Set(englishDictionaryData)]);
    });
}

// Modify the fetchWordDefinition function
async function fetchWordDefinition(word) {
    console.log('Checking word:', word);
    console.log('Current language:', currentLanguage);
    
    const currentWordList = currentPlayer === 1 ? wordListPlayerOne : wordListPlayerTwo;
    const wordItems = Array.from(currentWordList.children).map(item => item.textContent);
    if (!wordItems.includes(word)) {
        showLoader();

        try {
            if (currentLanguage === 'en') {
                const isValid = englishDictionary.includes(word.toLowerCase());
                console.log('Is word valid (English):', isValid);
                return isValid;
            } else if (currentLanguage === 'ru') {
                console.log('Checking Russian word:', word);
                const isValid = russianDictionary.includes(word.toLowerCase());
                console.log('Is word valid (Russian):', isValid);
                return isValid;
            }
            return false;
        } catch (error) {
            console.error('Error checking word validity:', error);
            return false;
        } finally {
            hideLoader();
        }
    } else {
        console.log('Word already exists in the list');
        highlightExistingWord(word);
        hideLoader();
        return false;
    }
}

// Modify the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM content loaded');
    // Retrieve player names and game duration from localStorage
    const playerOneName = localStorage.getItem('playerOneName') || 'Player One';
    const playerTwoName = localStorage.getItem('playerTwoName') || 'Player Two';
    const selectedDuration = localStorage.getItem('gameDuration') || '10';

    // Set game duration and player times
    gameDuration = parseInt(selectedDuration) * 60; // Convert minutes to seconds
    playerOneTime = playerTwoTime = gameDuration / 2;

    // Update player name displays
    const playerOneNameElement = document.querySelector('#playerOne .player-name');
    const playerTwoNameElement = document.querySelector('#playerTwo .player-name');

    if (playerOneNameElement) playerOneNameElement.textContent = playerOneName;
    if (playerTwoNameElement) playerTwoNameElement.textContent = playerTwoName;

    switchPlayer(); // Highlight the initial player

    const exitButton = document.getElementById('exitToMainMenu');
    if (exitButton) {
        exitButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    if (container && totalSumElement) {
        // Set the current language
        currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
        currentAlphabet = currentLanguage === 'en' ? englishLetters : russianLetters;

        // Load dictionaries
        await loadDictionaries();

        updatePlayerDisplay(); // Initialize player displays
        startTimer(); // Start the timer for the first player
    }

    initializeLoaders(); // Initialize the loaders

    // Add these variables at the top of your script
    let isPaused = false;
    let pauseOverlay;

    // Update the togglePause function
    function togglePause() {
        isPaused = !isPaused;
        const pauseButton = document.getElementById('pauseGame');

        if (isPaused) {
            clearInterval(timerInterval);
            
            // Create and show pause overlay
            pauseOverlay = document.createElement('div');
            pauseOverlay.className = 'pause-overlay';
            pauseOverlay.innerHTML = `
                <div class="pause-message">
                    <h2>Game Paused</h2>
                    <button id="resumeGame" class="resume-button">Resume</button>
                </div>
            `;
            document.body.appendChild(pauseOverlay);

            // Add event listener to the resume button
            document.getElementById('resumeGame').addEventListener('click', togglePause);
        } else {
            startTimer();
            
            // Remove pause overlay
            if (pauseOverlay) {
                document.body.removeChild(pauseOverlay);
            }
        }
    }

    // Modify your startTimer function
    function startTimer() {
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (!isPaused) {
                if (currentPlayer === 1 && playerOneTime > 0) {
                    playerOneTime--;
                } else if (currentPlayer === 2 && playerTwoTime > 0) {
                    playerTwoTime--;
                }

                updatePlayerDisplay();

                if (playerOneTime === 0 && playerTwoTime === 0) {
                    clearInterval(timerInterval);
                    isGameOver = true;
                    endGame();
                } else if ((currentPlayer === 1 && playerOneTime === 0) || (currentPlayer === 2 && playerTwoTime === 0)) {
                    switchPlayer();
                }
            }
        }, 1000);
    }

    const pauseButton = document.getElementById('pauseGame');
    if (pauseButton) {
        pauseButton.addEventListener('click', togglePause);
    }
});

// Modify the switchPlayer function
function switchPlayer() {
    clearInterval(timerInterval); // Clear the previous timer

    // Check if the other player has time left before switching
    if (currentPlayer === 1 && playerTwoTime > 0) {
        currentPlayer = 2;
    } else if (currentPlayer === 2 && playerOneTime > 0) {
        currentPlayer = 1;
    }
    // If the other player has no time left, don't switch

    lastValidWord = ''; // Reset the last valid word when switching players

    updatePlayerIndicator();

    const playerOneColor = '#4bc9ff';
    const playerTwoColor = '#844bff';

    const playerColor = currentPlayer === 1 ? playerOneColor : playerTwoColor;
    document.getElementById('playerOne').classList.toggle('active', currentPlayer === 1);
    document.getElementById('playerTwo').classList.toggle('active', currentPlayer === 2);
    totalSumElement.style.color = playerColor;

    // Используем setProperty для установки пользовательского CSS-свойства
    document.documentElement.style.setProperty('--background-color', playerColor);

    // Update player name and timer display
    updatePlayerDisplay();

    // Start the timer for the current player
    startTimer();
}

// Add this new function to update player display
function updatePlayerDisplay() {
    const playerOneName = localStorage.getItem('playerOneName') || 'Player One';
    const playerTwoName = localStorage.getItem('playerTwoName') || 'Player Two';

    playerOneElement.innerHTML = `
        <div class="player-score">${Math.round(playerOneScore)}</div>
        <div class="player-name">${playerOneName}</div>
        <div class="player-timer">${formatTime(playerOneTime)}</div>
    `;

    playerTwoElement.innerHTML = `
        <div class="player-score">${Math.round(playerTwoScore)}</div>
        <div class="player-name">${playerTwoName}</div>
        <div class="player-timer">${formatTime(playerTwoTime)}</div>
    `;
}

// Update the startTimer function to use the new duration
function startTimer() {
    clearInterval(timerInterval); // Clear any existing interval
    timerInterval = setInterval(() => {
        if (currentPlayer === 1 && playerOneTime > 0) {
            playerOneTime--;
        } else if (currentPlayer === 2 && playerTwoTime > 0) {
            playerTwoTime--;
        }

        updatePlayerDisplay();

        if (playerOneTime === 0 && playerTwoTime === 0) {
            clearInterval(timerInterval);
            isGameOver = true;
            endGame();
        } else if ((currentPlayer === 1 && playerOneTime === 0) || (currentPlayer === 2 && playerTwoTime === 0)) {
            switchPlayer();
        }
    }, 1000); // Run every 1000 milliseconds (1 second)
}

// Add this new function to format time
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Modify the endGame function
function endGame() {
    clearInterval(timerInterval); // Clear the timer when the game ends
    isGameOver = true;

    const finalScorePlayerOne = playerOneScore;
    const finalScorePlayerTwo = playerTwoScore;

    const playerOneName = localStorage.getItem('playerOneName');
    const playerTwoName = localStorage.getItem('playerTwoName');

    saveScores(playerOneName, finalScorePlayerOne, playerTwoName, finalScorePlayerTwo);

    const resultContainer = document.querySelector('.result-container');
    resultContainer.style.display = 'block';
    document.getElementById('playerOneFinalScore').textContent = `${playerOneName}: ${finalScorePlayerOne}`;
    document.getElementById('playerTwoFinalScore').textContent = `${playerTwoName}: ${finalScorePlayerTwo}`;

    document.getElementById('viewLeaderboardButton').addEventListener('click', () => {
        window.location.href = 'leaderboard.html';
    });

    document.getElementById('rematchButton').addEventListener('click', () => {
        window.location.href = 'game.html';
    });
}

function saveScores(playerOneName, playerOneScore, playerTwoName, playerTwoScore) {
    const scores = JSON.parse(localStorage.getItem('scores')) || [];
    const date = new Date().toLocaleString();
    scores.push({ playerOneName, playerOneScore, playerTwoName, playerTwoScore, date });
    localStorage.setItem('scores', JSON.stringify(scores));
}

function saveScore(playerName, score) {
    const scores = JSON.parse(localStorage.getItem('scores')) || [];
    scores.push({ playerName, score });
    localStorage.setItem('scores', JSON.stringify(scores));
}

let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
let russianAlphabet = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';

function initializeGame() {
    // ... existing code ...

    const language = localStorage.getItem('language') || 'en';
    if (language === 'ru') {
        alphabet = russianAlphabet;
    }

    randomLetters = generateRandomLetters(3);
    updateLetterBoxes();
    // ... rest of the function ...
}

function generateRandomLetters(count) {
    let result = [];
    for (let i = 0; i < count; i++) {
        result.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
    }
    return result;
}

for (let i = 0; i < numberOfBoxes; i++) {
    const letter = getNextLetter(i, 0); // Get the initial random letter
    randomLetters.push(letter);
    previousLetters[i].push(letter);
    createBox(letter, i);
}

function getNextLetter(boxIndex, direction = 1) {
    const alphabetLength = currentAlphabet.length;
    currentLetterIndexes[boxIndex] = (currentLetterIndexes[boxIndex] + direction + alphabetLength) % alphabetLength;
    return currentAlphabet[currentLetterIndexes[boxIndex]];
}


let boxes = document.querySelectorAll('.box');
console.log('Initial boxes:', boxes);

document.addEventListener('keydown', (e) => {
    if (isGameOver) return; // Prevent moves if the game is over

    if ((currentPlayer === 1 && playerOneTime === 0) || (currentPlayer === 2 && playerTwoTime === 0)) {
        return; // Prevent moves if the current player's time has run out
    }

    console.log('Key pressed:', e.key); // Add this line
    if (e.key === 'ArrowRight') {
        moveSelection(1);
    } else if (e.key === 'ArrowLeft') {
        moveSelection(-1);
    } else if (e.key === 'ArrowUp') {
        changeLetterForwards();
    } else if (e.key === 'ArrowDown') {
        changeLetterBackwards();
    } else if (e.key === 'Enter') {
        checkWordValidity(randomLetters.join('').toLowerCase());
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelectedBox();
    }
});

function isLetter(str) {
    return currentAlphabet.includes(str.toUpperCase());
}

// Call this function whenever a new box is created or a new letter is assigned
function assignRandomNumbersToLetters() {
    const alphabetLength = currentAlphabet.length;

    boxes.forEach(box => {
        const letter = box.textContent;

        // Check if the letter already has an assigned number in the current cycle
        if (!letterToNumberMap[letter]) {
            letterToNumberMap[letter] = Math.floor(Math.random() * (alphabetLength - 1)) + 1;
            box.style.color = '#000000'; // Reset color to black if not green
        }

        const assignedNumber = letterToNumberMap[letter];
        box.previousSibling.textContent = assignedNumber;
        assignedNumbers[letter] = assignedNumber;
    });
}

// Call assignRandomNumbersToLetters initially and whenever a new box is created
assignRandomNumbersToLetters();

const congratsMessages = [
    "Great job!",
    "Fantastic word!",
    "You're on fire!",
    "Brilliant move!",
    "Impressive vocabulary!",
    "Keep it up!",
    "Excellent choice!",
    "You're a wordsmith!",
    "Spectacular play!",
    "Genius move!"
];

function showCongratsMessage() {
    const message = congratsMessages[Math.floor(Math.random() * congratsMessages.length)];
    const popup = document.createElement('div');
    popup.classList.add('congrats-popup');
    popup.textContent = message;
    document.body.appendChild(popup);

    // Trigger reflow to ensure the transition works
    popup.offsetHeight;

    popup.classList.add('visible');

    setTimeout(() => {
        popup.classList.remove('visible');
        setTimeout(() => {
            document.body.removeChild(popup);
        }, 300);
    }, 2000);
}

// Modify the handleValidWord function
async function handleValidWord() {
    const totalSum = updateSum(); // Update the total sum
    updatePlayerScore(totalSum); // Update the player score
    highlightValidWord(); // Highlight the valid word
    showCongratsMessage(); // Show congratulatory message
    
    // Add a delay before adding a new box and resetting
    setTimeout(() => {
        addNewBox(); // Add a new box when a valid word is entered
        updateAllCounters(26); // Reset counters
        letterToNumberMap = {}; // Clear the letter-to-number mapping for the new cycle
        resetNumberColors(); // Reset the color of the numbers
        lastValidWord = ''; // Reset the last valid word after handling a valid word

        // Only switch player if the other player has time left
        if ((currentPlayer === 1 && playerTwoTime > 0) || (currentPlayer === 2 && playerOneTime > 0)) {
            switchPlayer(); // Switch the player after a valid word
        }
        updateSum();
    }, 500); // Delay for 0.5 seconds to allow the highlighting to be visible
}

function resetNumberColors() {
    boxes.forEach(box => {
        box.previousSibling.style.color = '#000000'; // Reset number color to black
        box.style.color = '#000000'; // Reset letter color to black
    });
}

function deleteSelectedBox() {
    if (numberOfBoxes > 2) { // Ensure at least 2 boxes remain
        const selectedBox = boxes[currentIndex];
        if (selectedBox) {
            const boxContainer = selectedBox.parentElement;
            container.removeChild(boxContainer);

            // Remove the letter and its history
            randomLetters.splice(currentIndex, 1);
            previousLetters.splice(currentIndex, 1);
            numberOfBoxes--;

            // Update the boxes NodeList and adjust currentIndex if necessary
            boxes = document.querySelectorAll('.box');
            if (currentIndex >= boxes.length) {
                currentIndex = boxes.length - 1;
            }

            // Re-select the box at the current index, if any
            if (boxes.length > 0) {
                boxes[currentIndex].classList.add('selected');
            }
            updateSum();
        }
    }
}

// Ensure that a new box can also have a random number assigned
function createBox(letter, index) {
    const boxContainer = document.createElement('div');
    boxContainer.classList.add('box-container');

    const counter = document.createElement('div');
    counter.classList.add('counter');
    const assignedNumber = getAssignedNumber(letter); // Ensure the number is assigned based on the letter
    counter.textContent = assignedNumber;

    const box = document.createElement('div');
    box.classList.add('box');
    if (index === 0) box.classList.add('selected');
    box.textContent = letter;
    box.dataset.index = index;

    boxContainer.appendChild(counter);
    boxContainer.appendChild(box);
    container.appendChild(boxContainer);
}

// Call assignRandomNumbersToLetters initially and whenever a new box is created
assignRandomNumbersToLetters();

function moveSelection(direction) {
    boxes[currentIndex].classList.remove('selected', 'increasing');
    currentIndex = (currentIndex + direction + boxes.length) % boxes.length;
    boxes[currentIndex].classList.add('selected', 'increasing');
    updatePlayerIndicator(); // Update the player indicator when the selection changes
    updateSum();
    calculateTotalSum();

    // Remove the 'increasing' class after the transition
    setTimeout(() => {
        boxes[currentIndex].classList.remove('increasing');
    }, 200); // Match this duration with the increasing transition duration
}

function getRandomLetter() {
    let newLetter;
    do {
        newLetter = currentAlphabet[Math.floor(Math.random() * currentAlphabet.length)];
    } while (newLetter === lastGeneratedLetter); // Repeat if the new letter is the same as the last one

    lastGeneratedLetter = newLetter; // Update the last generated letter
    return newLetter;
}

function updateLettersToCurrentLanguage() {
    for (let i = 0; i < numberOfBoxes; i++) {
        const newLetter = getNextLetter(i, 0); // Get the new letter for the current box
        randomLetters[i] = newLetter;
        previousLetters[i].push(newLetter);
        boxes[i].textContent = newLetter;
        updateAssignedNumber(i, newLetter);
    }
    updateSum(); // Recalculate the sum with the new letters
}

function changeLetterForwards() {
    const newLetter = getNextLetter(currentIndex); // Move forward alphabetically
    previousLetters[currentIndex].push(newLetter); // Store the new letter
    randomLetters[currentIndex] = newLetter;
    boxes[currentIndex].textContent = newLetter;
    updateAssignedNumber(currentIndex, newLetter);
    updateSum();
    decrementPlayerScore();
}

function changeLetterBackwards() {
    const previousLetter = getNextLetter(currentIndex, -1); // Move backward alphabetically
    previousLetters[currentIndex].push(previousLetter); // Store the new letter
    randomLetters[currentIndex] = previousLetter;
    boxes[currentIndex].textContent = previousLetter;
    updateAssignedNumber(currentIndex, previousLetter);
    updateSum();
    decrementPlayerScore();
}

function updateAssignedNumber(index, letter) {
    const counter = boxes[index].previousSibling;
    const assignedNumber = getAssignedNumber(letter);
    counter.textContent = assignedNumber;
}

function getAssignedNumber(letter) {
    const alphabetLength = currentAlphabet.length;
    if (!letterToNumberMap[letter]) {
        letterToNumberMap[letter] = Math.floor(Math.random() * alphabetLength) + 1;
    }
    return letterToNumberMap[letter];
}

// Modify the updateSum function
function updateSum() {
    let totalSum = 0;

    boxes.forEach(box => {
        const counter = box.previousSibling;
        let assignedNumber = parseInt(counter.textContent);
        totalSum += assignedNumber;
    });

    const selectedBox = document.querySelector('.box.selected');
    if (selectedBox) {
        selectedBox.dataset.sum = totalSum;
        selectedBox.setAttribute('data-sum', totalSum);
    }

    totalSumElement.textContent = `+${totalSum}`; // Update the total sum in the HTML

    return totalSum; // Return the calculated totalSum
}

function decrementPlayerScore() {
    if (currentPlayer === 1) {
        playerOneScore = Math.max(0, playerOneScore - 1);
        updatePlayerScoreDisplay(playerOneElement, playerOneScore);
    } else {
        playerTwoScore = Math.max(0, playerTwoScore - 1);
        updatePlayerScoreDisplay(playerTwoElement, playerTwoScore);
    }
}

function updatePlayerScoreDisplay(playerElement, score) {
    const scoreElement = playerElement.querySelector('.player-score');
    if (scoreElement) {
        scoreElement.textContent = score;
    } else {
        console.warn('Player score element not found');
        // Fallback: update the entire player element
        const playerName = localStorage.getItem(currentPlayer === 1 ? 'playerOneName' : 'playerTwoName') || 'Player';
        playerElement.innerHTML = `
            <div class="player-score">${score}</div>
            <div class="player-name">${playerName}</div>
        `;
    }
}

// Updated function without color handling
async function checkWordValidity(word) {
    console.log('Checking word validity:', word);
    if (isChecking) return;

    isChecking = true;

    if (word === 'reset') {
        resetGame();
        isChecking = false;
        return;
    }

    // Check if the word is the same as the last valid word or exists in any player's word list
    if (word.toLowerCase() === lastValidWord.toLowerCase() || isWordInLists(word)) {
        console.log("Word already exists");
        highlightExistingWord(word);
        // shakeBoxes();
        isChecking = false;
        return;
    }

    const isValid = await fetchWordDefinition(word);
    console.log('Word validity result:', isValid);
    if (isValid) {
        highlightValidWord();
        addWordToList(word);
        await handleValidWord();
        lastValidWord = word;
    } else {
        console.log('Word is not valid');
        highlightInvalidWord();
        shakeBoxes();
    }

    isChecking = false;
}

// Add this new function to apply the shake animation
function shakeBoxes() {
    boxes.forEach(box => {
        box.classList.add('shake');
    });
    setTimeout(() => {
        boxes.forEach(box => {
            box.classList.remove('shake');
        });
    }, 820); // Remove the class after the animation duration
}

function highlightValidWord() {
    boxes.forEach(box => {
        box.style.color = 'rgb(25, 161, 98)'; // Change to the desired green color
    });
    setTimeout(() => {
        boxes.forEach(box => {
            box.style.color = '#000000'; // Reset to black after a delay
        });
    }, 500); // 0.5 second delay
}

function highlightInvalidWord() {
    boxes.forEach(box => {
        box.style.color = '#ff0000'; // Red color
    });
    setTimeout(() => {
        boxes.forEach(box => {
            box.style.color = '#000000'; // Reset to black after a delay
        });
    }, 500); // 1 second delay
}

function highlightExistingWord(word) {
    const playerOneWords = Array.from(wordListPlayerOne.children);
    const playerTwoWords = Array.from(wordListPlayerTwo.children);
    
    const highlightWord = (wordElement, container) => {
        const originalFontSize = window.getComputedStyle(wordElement).fontSize;
        const originalColor = wordElement.style.color;
        const originalZIndex = wordElement.style.zIndex;
        const originalLeft = wordElement.style.left;
        const originalTop = wordElement.style.top;

        // Calculate the center of the screen
        const screenCenterX = window.innerWidth / 2;
        const screenCenterY = window.innerHeight / 2;

        // Calculate the current position of the word
        const rect = wordElement.getBoundingClientRect();
        const wordCenterX = rect.left + rect.width / 2;
        const wordCenterY = rect.top + rect.height / 2;

        // Calculate the direction and distance to move (20% towards the center)
        const moveX = (screenCenterX - wordCenterX) * 0.1;
        const moveY = (screenCenterY - wordCenterY) * 0.1;

        // Add transition property for smooth animation
        wordElement.style.transition = 'all 0.25s ease-in-out';
        
        // Apply changes
        wordElement.style.color = '#3d8b42'; // Green color for existing words
        wordElement.style.fontSize = `calc(${originalFontSize} * 2.5)`; // Increase size 2.5 times
        wordElement.style.zIndex = '500'; // Bring the word to the front
        wordElement.style.left = `calc(${originalLeft} + ${moveX}px)`;
        wordElement.style.top = `calc(${originalTop} + ${moveY}px)`;

        setTimeout(() => {
            // Reset styles
            wordElement.style.color = originalColor;
            wordElement.style.fontSize = originalFontSize;
            wordElement.style.zIndex = originalZIndex;
            wordElement.style.left = originalLeft;
            wordElement.style.top = originalTop;
            
            // Remove transition after animation is complete
            setTimeout(() => {
                wordElement.style.transition = '';
            }, 250); // This should match the transition duration
        }, 250);
    };

    playerOneWords.forEach(wordElement => {
        if (wordElement.textContent.toLowerCase() === word.toLowerCase()) {
            highlightWord(wordElement, wordListPlayerOne);
        }
    });

    playerTwoWords.forEach(wordElement => {
        if (wordElement.textContent.toLowerCase() === word.toLowerCase()) {
            highlightWord(wordElement, wordListPlayerTwo);
        }
    });
}

function isWordInLists(word) {
    const playerOneWords = Array.from(wordListPlayerOne.children).map(item => item.textContent.toLowerCase());
    const playerTwoWords = Array.from(wordListPlayerTwo.children).map(item => item.textContent.toLowerCase());
    return playerOneWords.includes(word.toLowerCase()) || playerTwoWords.includes(word.toLowerCase());
}

// Example usage within the resetGame function
function resetGame() {
    // Temporarily hide word-list items
    const playerOneWords = Array.from(wordListPlayerOne.children);
    const playerTwoWords = Array.from(wordListPlayerTwo.children);

    playerOneWords.forEach(item => {
        item.style.visibility = 'hidden';
    });

    playerTwoWords.forEach(item => {
        item.style.visibility = 'hidden';
    });

    // Use a timeout to make the word-list items reappear after 2 seconds with a fade-in effect
    setTimeout(() => {
        playerOneWords.forEach(item => {
            item.style.visibility = 'visible';
            item.classList.add('fade-in');
            setTimeout(() => item.classList.remove('fade-in'), 2000); // Remove the class after the animation
        });

        playerTwoWords.forEach(item => {
            item.style.visibility = 'visible';
            item.classList.add('fade-in');
            setTimeout(() => item.classList.remove('fade-in'), 2000); // Remove the class after the animation
        });
    }, 2000);

    // Clear the letter-to-number mapping for the new cycle
    letterToNumberMap = {};

    // Reset the game state
    const totalSum = updateSum(); // Update the total sum
    updatePlayerScore(totalSum); // Update the player score
    addNewBox(); // Add a new box when a valid CSS color is entered
    updateAllCounters(26); // Reset counters
    assignRandomNumbersToLetters(); // Assign new random numbers to the letters
    switchPlayer(); // Switch the player after a valid word
    updateSum();
}

function updateAllCounters(value) {
    boxes.forEach((box, index) => {
        if (index < numberOfBoxes - 1) { // Exclude the last added box
            const counter = box.previousSibling;
            let changesRemaining = parseInt(counter.textContent);
            counter.textContent = changesRemaining;
        }
    });
    calculateTotalSum(); // Call to update the total sum
}

function addNewBox() {
    if (numberOfBoxes < 9) { // Ensure no more than 9 boxes
        currentLetterIndexes.push(0); // Initialize the new box's letter index
        const letter = getNextLetter(numberOfBoxes); // Get the initial letter for the new box
        randomLetters.push(letter);
        previousLetters.push([letter]);
        createBox(letter, numberOfBoxes); // Create the new box with the correct letter and assigned number
        numberOfBoxes++;

        // Update the boxes NodeList
        boxes = document.querySelectorAll('.box');
        calculateTotalSum(); // Call to update the total sum
    }
}

// Loader functions
let loaderPosition = { x: 0, y: 0 }; // Track loader position

function showLoader() {
    const currentWordList = currentPlayer === 1 ? wordListPlayerOne : wordListPlayerTwo;
    const loaderId = `loader${currentPlayer === 1 ? 'PlayerOne' : 'PlayerTwo'}`;
    
    let loader = document.getElementById(loaderId);
    if (!loader) {
        loader = document.createElement('div');
        loader.id = loaderId;
        loader.classList.add('loader');
        currentWordList.appendChild(loader);
    }

    // Calculate position for the loader within the word list container
    const wordListRect = currentWordList.getBoundingClientRect();
    const safeArea = 20; // Safe area from the borders
    const loaderWidth = 50; // Assuming loader width is 50px
    const loaderHeight = 50; // Assuming loader height is 50px

    // Calculate max bounds for the loader
    const maxX = wordListRect.width - loaderWidth - safeArea;
    const maxY = wordListRect.height - loaderHeight - safeArea;

    // Generate random position within the word list
    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;

    loader.style.left = `${randomX}px`;
    loader.style.top = `${randomY}px`;
    loader.style.display = 'block';

    // Hide the other player's loader
    const otherLoaderId = `loader${currentPlayer === 1 ? 'PlayerTwo' : 'PlayerOne'}`;
    const otherLoader = document.getElementById(otherLoaderId);
    if (otherLoader) {
        otherLoader.style.display = 'none';
    }
}

function hideLoader() {
    const loaderPlayerOne = document.getElementById('loaderPlayerOne');
    const loaderPlayerTwo = document.getElementById('loaderPlayerTwo');
    
    if (loaderPlayerOne) loaderPlayerOne.style.display = 'none';
    if (loaderPlayerTwo) loaderPlayerTwo.style.display = 'none';
}

// Add this function to initialize the loaders
function initializeLoaders() {
    const loaderPlayerOne = document.createElement('div');
    loaderPlayerOne.id = 'loaderPlayerOne';
    loaderPlayerOne.classList.add('loader');
    wordListPlayerOne.appendChild(loaderPlayerOne);

    const loaderPlayerTwo = document.createElement('div');
    loaderPlayerTwo.id = 'loaderPlayerTwo';
    loaderPlayerTwo.classList.add('loader');
    wordListPlayerTwo.appendChild(loaderPlayerTwo);
}

function hideLoader() {
    const loaderPlayerOne = document.getElementById('loaderPlayerOne');
    const loaderPlayerTwo = document.getElementById('loaderPlayerTwo');
    
    if (loaderPlayerOne) loaderPlayerOne.style.display = 'none';
    if (loaderPlayerTwo) loaderPlayerTwo.style.display = 'none';
}

function addWordToList(word) {
    const currentWordList = currentPlayer === 1 ? wordListPlayerOne : wordListPlayerTwo;
    const wordItems = Array.from(currentWordList.children);
    const existingWordItem = wordItems.find(item => item.textContent === word);

    // Check if the word exists in the other player's list
    const otherWordList = currentPlayer === 1 ? wordListPlayerTwo : wordListPlayerOne;
    const otherWordItems = Array.from(otherWordList.children);
    const existingWordItemInOtherList = otherWordItems.find(item => item.textContent === word);

    // If the word exists in either list, highlight and exit
    if (existingWordItem || existingWordItemInOtherList) {
        if (existingWordItem) {
            existingWordItem.classList.add('highlight');
            setTimeout(() => {
                existingWordItem.classList.remove('highlight');
            }, 300);
        }

        if (existingWordItemInOtherList) {
            existingWordItemInOtherList.classList.add('highlight');
            setTimeout(() => {
                existingWordItemInOtherList.classList.remove('highlight');
            }, 300);
        }
        return false; // Indicate that the word already exists
    }

    const wordItem = document.createElement('div');
    wordItem.classList.add('word-item');
    wordItem.textContent = word;

    // Use the loader's last position for the word
    const loader = currentWordList.querySelector('.loader');
    if (loader) {
        wordItem.style.left = loader.style.left;
        wordItem.style.top = loader.style.top;
        currentWordList.removeChild(loader); // Remove the loader once the word is added
    } else {
        const wordListRect = currentWordList.getBoundingClientRect();
        const maxX = wordListRect.width - 100;
        const maxY = wordListRect.height - 30;
        const randomX = Math.random() * maxX;
        const randomY = Math.random() * maxY;

        wordItem.style.left = `${randomX}px`;
        wordItem.style.top = `${randomY}px`;
    }

    currentWordList.appendChild(wordItem); // Add the word to the current player's word list
    return true; // Indicate that the word was successfully added
}

function updatePlayerIndicator() {
    const selectedBox = document.querySelector('.box.selected');
    if (selectedBox && totalSumElement.textContent) {
        const totalSum = parseFloat(totalSumElement.textContent.replace('+', '')) || 0;
        selectedBox.setAttribute('data-average-score', totalSum.toFixed(2));
    }
}

function updatePlayerScore(totalSum) {
    const playerOneName = localStorage.getItem('playerOneName') || 'Player One';
    const playerTwoName = localStorage.getItem('playerTwoName') || 'Player Two';
    
    if (currentPlayer === 1) {
        playerOneScore += totalSum;
        playerOneElement.innerHTML = `
            <div class="player-score">${Math.round(playerOneScore)}</div>
            <div class="player-name">${playerOneName}</div>
            <div class="player-timer">${formatTime(playerOneTime)}</div>
        `;
    } else {
        playerTwoScore += totalSum;
        playerTwoElement.innerHTML = `
            <div class="player-score">${Math.round(playerTwoScore)}</div>
            <div class="player-name">${playerTwoName}</div>
            <div class="player-timer">${formatTime(playerTwoTime)}</div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    switchPlayer(); // Highlight the initial player

    const exitButton = document.getElementById('exitToMainMenu');
    if (exitButton) {
        exitButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    if (container && totalSumElement) {
        // This is the game page
        updatePlayerDisplay(); // Initialize player displays
        startTimer(); // Start the timer for the first player
        
        // ... existing code ...
    }
});

function switchPlayer() {
    clearInterval(timerInterval); // Clear the previous timer

    // Check if the other player has time left before switching
    if (currentPlayer === 1 && playerTwoTime > 0) {
        currentPlayer = 2;
    } else if (currentPlayer === 2 && playerOneTime > 0) {
        currentPlayer = 1;
    }
    // If the other player has no time left, don't switch

    updatePlayerIndicator();

    const playerOneColor = '#4bc9ff';
    const playerTwoColor = '#844bff';

    const playerColor = currentPlayer === 1 ? playerOneColor : playerTwoColor;
    document.getElementById('playerOne').classList.toggle('active', currentPlayer === 1);
    document.getElementById('playerTwo').classList.toggle('active', currentPlayer === 2);
    totalSumElement.style.color = playerColor;

    // Используем setProperty для установки пользовательского CSS-свойства
    document.documentElement.style.setProperty('--background-color', playerColor);

    // Update player name and timer display
    updatePlayerDisplay();

    // Start the timer for the current player
    startTimer();
}

function updatePlayerDisplay() {
    const playerOneName = localStorage.getItem('playerOneName') || 'Player One';
    const playerTwoName = localStorage.getItem('playerTwoName') || 'Player Two';

    playerOneElement.innerHTML = `
        <div class="player-score">${Math.round(playerOneScore)}</div>
        <div class="player-name">${playerOneName}</div>
        <div class="player-timer">${formatTime(playerOneTime)}</div>
    `;

    playerTwoElement.innerHTML = `
        <div class="player-score">${Math.round(playerTwoScore)}</div>
        <div class="player-name">${playerTwoName}</div>
        <div class="player-timer">${formatTime(playerTwoTime)}</div>
    `;
}

function startTimer() {
    clearInterval(timerInterval); // Clear any existing interval
    timerInterval = setInterval(() => {
        if (currentPlayer === 1 && playerOneTime > 0) {
            playerOneTime--;
        } else if (currentPlayer === 2 && playerTwoTime > 0) {
            playerTwoTime--;
        }

        updatePlayerDisplay();

        if (playerOneTime === 0 && playerTwoTime === 0) {
            clearInterval(timerInterval);
            endGame();
        } else if ((currentPlayer === 1 && playerOneTime === 0) || (currentPlayer === 2 && playerTwoTime === 0)) {
            switchPlayer();
        }
    }, 1000); // Run every 1000 milliseconds (1 second)
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function endGame() {
    clearInterval(timerInterval); // Clear the timer when the game ends
    isGameOver = true;

    const finalScorePlayerOne = playerOneScore;
    const finalScorePlayerTwo = playerTwoScore;

    const playerOneName = localStorage.getItem('playerOneName');
    const playerTwoName = localStorage.getItem('playerTwoName');

    saveScores(playerOneName, finalScorePlayerOne, playerTwoName, finalScorePlayerTwo);

    const resultContainer = document.querySelector('.result-container');
    resultContainer.style.display = 'block';
    document.getElementById('playerOneFinalScore').textContent = `${playerOneName}: ${finalScorePlayerOne}`;
    document.getElementById('playerTwoFinalScore').textContent = `${playerTwoName}: ${finalScorePlayerTwo}`;

    document.getElementById('viewLeaderboardButton').addEventListener('click', () => {
        window.location.href = 'leaderboard.html';
    });

    document.getElementById('rematchButton').addEventListener('click', () => {
        window.location.href = 'game.html';
    });
}

function calculateTotalSum() {
    let totalSum = 0;
    boxes.forEach(box => {
        const counter = box.previousSibling;
        let assignedNumber = parseInt(counter.textContent);
        totalSum += assignedNumber;
    });
    totalSumElement.textContent = `+${totalSum}`; // Update the total sum in the HTML
    return totalSum;
}