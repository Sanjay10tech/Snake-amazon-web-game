var canvas = document.getElementById('game-canvas');
var context = canvas.getContext('2d');
var startButton = document.getElementById('startButton');
var startGameModal = document.getElementById('startGameModal')
var gameOverModal = document.getElementById('gameOverModal');
var scoreText = document.getElementById('score');
var highscoreText = document.getElementById('highscore');
var pauseIcon = document.getElementById("pauseIcon");
var playIcon = document.getElementById("playIcon");
var pauseKey = document.getElementById("pause-key"); // on mobile
var playKey = document.getElementById("play-key"); // on mobile
var closeModal = document.getElementsByClassName("close")[0];
var playerName; // untuk menyimpan nama pleyer
var playerLevel; // untuk menyimpan level pleyer

var grid = 16;

var snake = {
    x: 160,
    y: 160,
    dx: grid,
    dy: 0,
    cells: [],
    maxCells: 4
};

var count = 0;

var apple = {
    x: 320,
    y: 320
};

var pizza = {
    x: getRandomInt(0, 25) * grid,
    y: getRandomInt(0, 25) * grid
};

var bomb = {
    x: getRandomInt(0, 25) * grid,
    y: getRandomInt(0, 25) * grid

};

var pizzaCount = 0;
var bombCount = 0;

var isPlaying = false;
var gameInterval;

var score = 0;
var highscore = 0;
var isPaused = false;

function fadeIn(audioElement, duration, volume = 0.9) {
    audioElement.volume = 0;
    audioElement.play();
    let fadeInInterval = 10;
    let targetVolume = volume;

    let volumeStep = 1 / (duration / fadeInInterval);

    const fadeInterval = setInterval(() => {
        if (audioElement.volume < targetVolume) {
            audioElement.volume += volumeStep;
        } else {
            clearInterval(fadeInterval);
        }
    }, fadeInInterval);
}

function playBgm() {
    var bgmAudio = document.getElementById('bgm');
    fadeIn(bgmAudio, 8000, 0.3)
}
playBgm()

function playBackgroundSound() {
    var bgAudio = document.getElementById('bgAudio');
    fadeIn(bgAudio, 2000, 0.7)
}

function playEatSound() {
    var eatAudio = document.getElementById('eatAudio');
    eatAudio.play();
}

function playBombSound() {
    var bombAudio = document.getElementById('bombAudio');
    bombAudio.play();
}

function playCDSound() {
    var CDAudio = document.getElementById('CDAudio');
    CDAudio.play();
    CDAudio.volume = 0.4
}

function clickSfx() {
    var clickSfx = document.getElementById('clickSfx');
    clickSfx.play();
    clickSfx.volume = 0.4
}

function pauseOrPlay(pause) {
    if (pause === true) {
        isPlaying = true
        isPaused = true
        pauseIcon.style.display = 'none';
        playIcon.style.display = 'block';
        pauseKey.style.display = 'none'; // on mobile
        playKey.style.display = 'block'; // on mobile
        pauseIcon.style.zIndex = '1'
        playIcon.style.zIndex = '1'
        var bgAudio = document.getElementById('bgAudio');
        fadeIn(bgAudio, 800, 0.2)
        clickSfx()

        // Tampilkan other menu
        document.querySelector('.music-mute-icon').style.display = 'block'
        document.querySelector('.sound-mute-icon').style.display = 'block'
        document.querySelector('#replayIcon').style.display = 'block'
        document.querySelector('#homeIcon').style.display = 'block'
    }
    if (pause === false) {
        isPlaying = true
        isPaused = false;
        pauseIcon.style.display = 'block';
        playIcon.style.display = 'none';
        pauseKey.style.display = 'block'; // on mobile
        playKey.style.display = 'none'; // on mobile
        pauseIcon.style.zIndex = '0'
        playIcon.style.zIndex = '0'
        var bgAudio = document.getElementById('bgAudio');
        fadeIn(bgAudio, 800, 0.7)
        clickSfx()

        // Sembunyikan other menu
        document.querySelector('.music-mute-icon').style.display = 'none'
        document.querySelector('.sound-mute-icon').style.display = 'none'
        document.querySelector('#replayIcon').style.display = 'none'
        document.querySelector('#homeIcon').style.display = 'none'
    }
}

function muteMusic(mute) {
    var bgAudio = document.getElementById('bgAudio');
    bgAudio.muted = mute;
    if (mute === true) {
        document.querySelector('#musicIcon').style.display = 'none'
        document.querySelector('#musicSlashIcon').style.display = 'block'
    }
    if (mute === false) {
    var eatAudio = document.getElementById('eatAudio');
    eatAudio.muted = mute;
        document.querySelector('#musicIcon').style.display = 'block'
        document.querySelector('#musicSlashIcon').style.display = 'none'
    }
}

function muteSound(mute) {
    var soundEffects = document.querySelectorAll('.sound-effect');

    // Mengatur properti 'muted' untuk semua elemen audio efek suara
    soundEffects.forEach(function(audioElement) {
        audioElement.muted = mute;
    });

    if (mute === true) {
        document.querySelector('#soundIcon').style.display = 'none'
        document.querySelector('#soundSlashIcon').style.display = 'block'
    }
    if (mute === false) {
        document.querySelector('#soundIcon').style.display = 'block'
        document.querySelector('#soundSlashIcon').style.display = 'none'
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

let lastTime = 0; // Time var comparer

function loop(timestamp) {
    if (!isPlaying) {
        // requestAnimationFrame(loop);
        return;
    }

    requestAnimationFrame(loop);

    // nilai default kecepatan ular
    let countThreshold = 15;

    // Menyesuaikan countThreshold berdasarkan level
    if (playerLevel === "easy") {
        countThreshold = 15;
    } else if (playerLevel === "medium") {
        countThreshold = 10;
    } else if (playerLevel === "high") {
        countThreshold = 5;
    }

    if (++count < countThreshold) {
        return;
    }

    if (isPaused) {
        return;
    }

    count = 0;
    context.clearRect(0, 0, canvas.width, canvas.height);

    snake.x += snake.dx;
    snake.y += snake.dy;

    if (snake.x < 0 || snake.x >= canvas.width || snake.y < 0 || snake.y >= canvas.height) {
        playBombSound();
        gameOver();
        return;
    }

    snake.cells.unshift({
        x: snake.x,
        y: snake.y
    });

    if (snake.cells.length > snake.maxCells) {
        snake.cells.pop();
    }

    snake.cells.forEach(function (cell, index) {
        context.fillStyle = (index === 0) ? '#E79D56' : '#386858';
        context.fillRect(cell.x, cell.y, grid - 1, grid - 1);

        if (index !== 0 && cell.x === snake.x && cell.y === snake.y) {
            playBombSound();
            gameOver();
            return;
        }

        if (cell.x === apple.x && cell.y === apple.y) {
            snake.maxCells++;
            var newAppleX, newAppleY;

            do {
                newAppleX = getRandomInt(0, 25) * grid;
                newAppleY = getRandomInt(0, 25) * grid;
            } while (
                (newAppleX === pizza.x && newAppleY === pizza.y) ||
                (newAppleX === bomb.x && newAppleY === bomb.y) ||
                isCollidingWithSnake(newAppleX, newAppleY)
            );

            apple.x = newAppleX;
            apple.y = newAppleY;
            // apple.x = getRandomInt(0, 25) * grid;
            // apple.y = getRandomInt(0, 25) * grid;
            score++;
            scoreText.textContent = 'Score: ' + score;
            playEatSound(); // Mainkan suara saat memakan apel
        }

        if (cell.x === pizza.x && cell.y === pizza.y) {
            snake.maxCells += 5;
            // pizza.x = getRandomInt(0, 25) * grid;
            // pizza.y = getRandomInt(0, 25) * grid;
            // updatePizza()
            score += 5;
            scoreText.textContent = 'Score: ' + score;
            pizzaCount = 0;
            playEatSound(); // Mainkan suara saat memakan pizza
            pizza.x = -grid;
            pizza.y = -grid;
            setTimeout(function () {
                pizza.x = getRandomInt(0, 25) * grid;
                pizza.y = getRandomInt(0, 25) * grid;
            }, getRandomInt(10, 15) * 1000);
        }

        if (cell.x === bomb.x && cell.y === bomb.y) {
            playBombSound(); // Mainkan suara saat memakan bom
            gameOver();
            return;
        }
    });

    var appleImage = new Image();
    appleImage.src = 'assets/item/apple.svg';
    context.drawImage(appleImage, apple.x, apple.y, grid - 1, grid - 1);

    var pizzaImage = new Image();
    pizzaImage.src = 'assets/pizza.svg';
    context.drawImage(pizzaImage, pizza.x, pizza.y, grid - 1, grid - 1);

    var bombImage = new Image();
    bombImage.src = 'assets/item/bomb.svg';
    context.drawImage(bombImage, bomb.x, bomb.y, grid - 1, grid - 1);

    // Trace game loop speed
    const deltaTime = Math.ceil(timestamp - lastTime);
    lastTime = timestamp;
    console.log(`Kecepatan loop game ${deltaTime}ms`);
}

//Agar item tidak stack dengan sesama
function initializeItem(item) {
    let newItemX, newItemY;

    do {
        newItemX = getRandomInt(0, 25) * grid;
        newItemY = getRandomInt(0, 25) * grid;
    } while (
        (newItemX === snake.x && newItemY === snake.y) ||
        (newItemX === apple.x && newItemY === apple.y) ||
        (newItemX === pizza.x && newItemY === pizza.y) ||
        (newItemX === bomb.x && newItemY === bomb.y) ||
        isCollidingWithSnake(newItemX, newItemY)
    );

    item.x = newItemX;
    item.y = newItemY;
}

// Kemudian, gunakan fungsi ini untuk menginisialisasi item:
initializeItem(apple);
initializeItem(pizza);
initializeItem(bomb);

function isCollidingWithSnake(x, y) {
    // Cek apakah koordinat (x, y) bertabrakan dengan tubuh ular
    for (let i = 0; i < snake.cells.length; i++) {
        if (snake.cells[i].x === x && snake.cells[i].y === y) {
            return true; // Ada tumpang tindih dengan tubuh ular
        }
    }
    return false; // Tidak ada tumpang tindih dengan tubuh ular
}

function updatePizza() {
    pizzaCount++;

    if (pizzaCount >= 4) {
        var newPizzaX, newPizzaY;

        do {
            newPizzaX = getRandomInt(0, 25) * grid;
            newPizzaY = getRandomInt(0, 25) * grid;
        } while (
            (newPizzaX === apple.x && newPizzaY === apple.y) ||
            (newPizzaX === bomb.x && newPizzaY === bomb.y) ||
            isCollidingWithSnake(newPizzaX, newPizzaY)
        );

        pizza.x = newPizzaX;
        pizza.y = newPizzaY;
        pizzaCount = 0;
        // console.log('pizza pindah');
    }
}

function updateBomb() {
    bombCount++;

    if (bombCount >= 5) {
        var newBombX, newBombY;

        do {
            newBombX = getRandomInt(0, 25) * grid;
            newBombY = getRandomInt(0, 25) * grid;
        } while (
            (newBombX === apple.x && newBombY === apple.y) ||
            (newBombX === pizza.x && newBombY === pizza.y) ||
            isCollidingWithSnake(newBombX, newBombY)
        );

        bomb.x = newBombX;
        bomb.y = newBombY;
        bombCount = 0;
        // console.log('bom pindah');
    }
}

function startGame() {
    isPlaying = true;
    canvas.style.display = 'block';
    startGameModal.style.display = 'none';
    gameOverModal.style.display = 'none';
    pizzaCount = 0;
    bombCount = 0;
    score = 0;
    scoreText.textContent = 'Score: 0';
    snake.x = 160;
    snake.y = 160;
    snake.cells = [];
    snake.maxCells = 4;
    snake.dx = grid;
    snake.dy = 0;

    // Periksa dan atur ulang posisi bom jika berada di posisi yang sama dengan snake
    do {
        bomb.x = getRandomInt(0, 25) * grid;
        bomb.y = getRandomInt(0, 25) * grid;
    } while (
        (bomb.x === apple.x && bomb.y === apple.y) ||
        (bomb.x === pizza.x && bomb.y === pizza.y) ||
        isCollidingWithSnake(bomb.x, bomb.y)
    );

    apple.x = getRandomInt(0, 25) * grid;
    apple.y = getRandomInt(0, 25) * grid;

    playBackgroundSound();
    setInterval(updatePizza, 5000);
    setInterval(updateBomb, 5000);
    loop();
}

function replayGame(){
    isPlaying = false;
    document.querySelector('.start-game-content').style.transform = 'scale(0)'
    document.querySelector('.start-game-content').style.opacity = '0'
    setTimeout(() => {
        gameOverModal.style.display = 'none'
        startGameModal.style.display = 'block';
        modalShowTransition(document.querySelector('.start-game-content'), 1)
    }, 200)
    isPaused = false;
    pauseIcon.style.display = 'block';
    playIcon.style.display = 'none';
    document.querySelector('.music-mute-icon').style.display = 'none'
    document.querySelector('.sound-mute-icon').style.display = 'none'
    document.querySelector('#replayIcon').style.display = 'none'
    document.querySelector('#homeIcon').style.display = 'none'
    return;
    
}

function gameOver() {
    isPlaying = false;
    // Menghentikan suara latar belakang
    document.getElementById("bgAudio").pause();
    playBgm()

    // Simpan Nama, Level, dan Skor ke localStorage
    var playerData = {
        name: playerName,
        level: playerLevel,
        score: score
    };

    var allPlayers = JSON.parse(localStorage.getItem('players')) || [];

    // Cari indeks pemain dengan nama yang sama
    var playerIndex = allPlayers.findIndex(function (player) {
        return player.name === playerName;
    });

    if (playerIndex !== -1) {
        // Jika pemain dengan nama yang sama ditemukan
        if (score > allPlayers[playerIndex].score) {
            allPlayers[playerIndex].score = score;
        }
        if (playerLevel > allPlayers[playerIndex].level) {
            allPlayers[playerIndex].level = playerLevel;
        }
    } else {
        // Tambahkan pemain baru jika nama tidak ada dalam local storage
        allPlayers.push(playerData);
    }

    // Simpan kembali data pemain ke local storage
    localStorage.setItem('players', JSON.stringify(allPlayers));

    if (score > highscore) {
        highscore = score; // Perbarui high score jika skor saat ini lebih tinggi
        highscoreText.textContent = 'Highscore: ' + highscore; // Perbarui teks high score di layar

        // Simpan high score ke local storage
        localStorage.setItem('highscore', highscore);
    }

    // Tampilkan modal Game Over
    displayGameOver();
}


function displayGameOver() {
    // Ambil data pemain dari localStorage
    var allPlayers = JSON.parse(localStorage.getItem('players')) || [];

    // Urutkan pemain berdasarkan skor (descending)
    allPlayers.sort(function (a, b) {
        return b.score - a.score;
    });

    // Batasi hasil ke 5 pemain teratas
    var topPlayers = allPlayers.slice(0, 5);

    // Dapatkan elemen untuk menampilkan data pemain
    var tabel = document.querySelector('.top-players-data');

    tabel.innerHTML = '';
    if (topPlayers.length > 0) {
        topPlayers.forEach(function (player) {
            tabel.innerHTML +=
                `<tr>
                    <td>${player.name}</td>
                    <td>${player.level}</td>
                    <td>${player.score}</td>
                </tr>`;
        });
    }

    // Tampilkan modal Game Over
    gameOverModal.style.display = 'block';
    // contoh penggunaan transisi menampilkan modal dg fungsi modalShowTransition()
    // perkecil element modal dari style defaultnya 
    document.querySelector('.game-over-content').style.transform = 'scale(0)'
    document.querySelector('.game-over-content').style.opacity = '0'
    // (element, scale,   opacity, delay)
    // (element, default, default, 1    ) gunakan 1 untuk tanpa delay
    modalShowTransition(document.querySelector('.game-over-content'), 1)
}


function startCountdown() {
    const countdownElement = document.getElementById('countdown');
    const startButton = document.getElementById('startButton');
    countdownElement.style.display = 'flex'

    let countdown = 3;
    let countdownInterval;
    document.getElementById("bgm").pause()
    playCDSound()

    countdownElement.style.fontSize = '17vh'
    countdownElement.style.color = 'white'
    countdownElement.textContent = countdown;

    function updateCountdown() {
        countdown--;
        countdownElement.textContent = countdown;
        if (countdown <= 0) {
            countdownElement.textContent = 'Mulai!';
            countdownElement.style.fontSize = '10vh'
            countdownElement.style.color = '#cd2900'
            if (countdown < 0) {
                clearInterval(countdownInterval);
                startButton.disabled = false
                startGame();
                countdownElement.style.display = 'none'
            }
        }
    }
    countdownElement.style.fontSize = '23vh'

    countdownInterval = setInterval(updateCountdown, 1000)
    startButton.disabled = true
    isPlaying = true
}


function closeLandingPage() {
    clickSfx()
    var landingPage = document.querySelector('.landing-page');
    landingPage.style.opacity = '0';
    // setelah 0.5s ubah ke none
    // 500 => samakan dengan efek transisi di css
    setTimeout(function () {
        landingPage.style.display = 'none';
    }, 500);
}

startButton.addEventListener('click', function () {
    clickSfx()
    playerName = document.getElementById('name').value; // mengambil name value
    playerLevel = document.getElementById('level').value; // mengambil level value

    if (playerName === '') {
        document.querySelector('.input-info').innerText = 'Anda belum memasukkan nama.'
        return
    } else if (usernameCheck(playerName)) {
        document.querySelector('.input-info').innerText = ''

        modalHideTransition(document.querySelector('.start-game-content'), 1)
        setTimeout(() => {
            startGameModal.style.display = 'none';
        }, 200)

        setTimeout(() => {
            startCountdown();
        }, 200);
    } else {
        document.querySelector('.input-info').innerText = `Nama '${playerName}' mengandung kata tidak pantas.`
        return
    }
});

document.addEventListener('keydown', function (e) {
    if (e.which === 32) {
        if (!isPlaying) {
            playerName = document.getElementById('name').value; // mengambil name value
            if (document.activeElement === document.getElementById('name')) {
                return;
            }
            if (playerName === '') {
                document.querySelector('.input-info').innerHTML = 'Anda belum memasukkan nama.'
                return
            } else if (usernameCheck(playerName)) {
                document.querySelector('.input-info').innerHTML = ''

                modalHideTransition(document.querySelector('.start-game-content'), 1)
                setTimeout(() => {
                    startGameModal.style.display = 'none';
                }, 200)
                if (startGameModal.style.display = 'none') {
                    modalHideTransition(document.querySelector('.game-over-content'), 1)
                    setTimeout(() => {
                        gameOverModal.style.display = 'none';
                    }, 200)
                }
                
                setTimeout(() => {
                    startCountdown();
                }, 200);
            } else {
                document.querySelector('.input-info').innerHTML = `Nama ${playerName} mengandung kata tidak pantas.`
                return
            }
        } else if (!isPaused) {
            pauseOrPlay(true)
        } else {
            pauseOrPlay(false)
        }
    }
    if (isPlaying) {
        if (e.which === 37 && snake.dx === 0) {
            snake.dx = -grid;
            snake.dy = 0;
        } else if (e.which === 38 && snake.dy === 0) {
            snake.dy = -grid;
            snake.dx = 0;
        } else if (e.which === 39 && snake.dx === 0) {
            snake.dx = grid;
            snake.dy = 0;
        } else if (e.which === 40 && snake.dy === 0) {
            snake.dy = grid;
            snake.dx = 0;
        }
    }
});

document.querySelector(".close").addEventListener("click", function () {
    clickSfx()
    modalHideTransition(document.querySelector('.game-over-content'))

    document.querySelector('.start-game-content').style.transform = 'scale(0)'
    document.querySelector('.start-game-content').style.opacity = '0'
    setTimeout(() => {
        gameOverModal.style.display = 'none'
        startGameModal.style.display = 'block';
        modalShowTransition(document.querySelector('.start-game-content'), 1)
    }, 200)

});

function modalHideTransition(element, delay=1, scale='scale(0)', opacity='0', animationDuration=0.2) {
    element.style.transition = `all ${animationDuration}s`
    setTimeout(() => {
        element.style.transform = scale
        element.style.opacity = opacity
    }, delay)
}

function modalShowTransition(element, delay=200, scale='scale(1)', opacity='1', animationDuration=0.2) {
    element.style.transition = `all ${animationDuration}s`
    setTimeout(() => {
        element.style.transform = scale
        element.style.opacity = opacity
    }, delay)
}

// ________[Preloader]________
document.onreadystatechange = function () {
    if (document.readyState === "loading") {
        document.querySelector(".loading-animation").style.display = "block";
    } else {
        setTimeout(() => {
            document.querySelector(".loading-animation").style.opacity = "0";
            setTimeout(() => {
                document.querySelector(".loading-animation").style.display = "none";
                document.querySelector(".ring").innerHTML = ''
            }, 2000);
        }, 1200);
    }
}
window.addEventListener("load", function () {
    setTimeout(() => {
        document.querySelector(".loading-animation").style.display = "none";
    }, 2000);
});

// ________[Badword]________
function usernameCheck(username) {
    const lowerCaseUsername = username.toLowerCase();
    for (const badWord of badWordList) {
        if (lowerCaseUsername.includes(badWord)) {
            // console.log('mulut anda kotorr!!');
            return false;
        }
    }
    // console.log('sip namamu bagus');
    return true;
}
// usernameCheck(document.getElementById('name').value)

// function updateHighscore() {
//     if (localStorage.getItem('highscore') !== null) {
//         highscore = parseInt(localStorage.getItem('highscore'));
//     } else {
//         highscore = 0;
//     }
//     highscoreText.textContent = 'Highscore: ' + highscore;
// }


// window.onload = function () {
//     updateHighscore();
// };

// ARROW KEYS ON MOBILE
var keyUp = document.getElementById('key-up');
var keyDown = document.getElementById('key-down');
var keyLeft = document.getElementById('key-left');
var keyRight = document.getElementById('key-right');


// Efek klik keyUp
keyUp.addEventListener("touchstart", function () {
    keyUp.style.opacity = "0.5"
});
keyUp.addEventListener("touchend", function () {
    keyUp.style.opacity = "1"
});
// Turn up
keyUp.addEventListener("click", function () {
    if (snake.dy === 0) {
        snake.dy = -grid;
        snake.dx = 0;
    }
});


// Efek klik keyDown
keyDown.addEventListener("touchstart", function () {
    keyDown.style.opacity = "0.5"
});
keyDown.addEventListener("touchend", function () {
    keyDown.style.opacity = "1"
});
// Turn down
keyDown.addEventListener("click", function () {
    if (snake.dy === 0) {
        snake.dy = grid;
        snake.dx = 0;
    }
});


// Efek klik keyLeft
keyLeft.addEventListener("touchstart", function () {
    keyLeft.style.opacity = "0.5"
});
keyLeft.addEventListener("touchend", function () {
    keyLeft.style.opacity = "1"
});
// Turn left
keyLeft.addEventListener("click", function () {
    if (snake.dx === 0) {
        snake.dx = -grid;
        snake.dy = 0;
    }
});


// Efek klik keyRight
keyRight.addEventListener("touchstart", function () {
    keyRight.style.opacity = "0.5"
});
keyRight.addEventListener("touchend", function () {
    keyRight.style.opacity = "1"
});
// Turn right
keyRight.addEventListener("click", function () {
    if (snake.dx === 0) {
        snake.dx = grid;
        snake.dy = 0;
    }
});

