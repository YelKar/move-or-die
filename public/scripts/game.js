// development.yaml-game/public/scripts/game.js
const socket = io();

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomName = urlParams.get('room');
    const userName = urlParams.get('name');

    if (!roomName) {
        window.location.href = '/';
    }

    document.getElementById('roomName').innerText = `Room: ${roomName}`;

    // Здесь можно добавить логику для инициализации canvas игры
    const canvas = document.getElementById('gameCanvas');
    const context = canvas.getContext('2d');
    canvas.width = 1400;
    canvas.height = 800;

    let blue_block = new Image();
    let orange_block = new Image();
    let green_block = new Image();
    let purple_block = new Image();

    let blue_player = new Image();
    let orange_player = new Image();
    let green_player = new Image();
    let purple_player = new Image();

    let blue_score = document.getElementById('blue-score');
    let orange_score = document.getElementById('yellow-score');
    let green_score = document.getElementById('green-score');
    let purple_score = document.getElementById('purple-score');

    let grey_block = new Image();

    let players = {};
    let blocks = [];
    let previousPlayers = {};
    let lastUpdateTime = Date.now();
    let lastServerUpdateTime = Date.now();

    socket.emit('joinRoom', roomName, userName);


    socket.emit('preloadGame', roomName, userName);

    socket.on('levelMap', (data) => {
        blocks = data;
        drawMap();
    });

    socket.on('levelScore', (data) => {
        //console.log(data.blue, data.orange, data.green, data.purple)
        blue_score.textContent = data.blue;
        orange_score.textContent = data.orange;
        green_score.textContent = data.green;
        purple_score.textContent = data.purple;
    });

    function preload(roomName) {
        blue_block.src = '../images/blue-block.png';
        orange_block.src = '../images/yellow-block.png';
        green_block.src = '../images/green-block.png';
        purple_block.src = '../images/purple-block.png';
        grey_block.src = '../images/grey-block.png';

        blue_player.src = '../images/character_blue.png';
        orange_player.src = '../images/character_orange.png';
        green_player.src = '../images/character_green.png';
        purple_player.src = '../images/character_red.png';

        socket.emit('preload', roomName)
    }

    // Функция для рисования игровых объектов
    function drawMap() {
        // Проходимся по каждому игровому объекту и рисуем его
        for (let obj of blocks) {
            switch (obj._color) {
                case 'blue':
                    context.drawImage(blue_block, obj._x, obj._y, obj._size, obj._size);
                    break;
                case 'orange':
                    context.drawImage(orange_block, obj._x, obj._y, obj._size, obj._size);
                    break;
                case 'green':
                    context.drawImage(green_block, obj._x, obj._y, obj._size, obj._size);
                    break;
                case 'purple':
                    context.drawImage(purple_block, obj._x, obj._y, obj._size, obj._size);
                    break;
                case 'grey':
                    context.drawImage(grey_block, obj._x, obj._y, obj._size, obj._size);
                    break;
            }
        }
    }

    function interpolatePlayer(previous, current, t) {
        return {
            x: previous.x + (current.x - previous.x) * t, y: previous.y + (current.y - previous.y) * t
        };
    }

// Функция экстраполяции для предсказания будущего состояния
    function extrapolatePlayer(current, t) {
        return {
            x: current.x + current.movement.x * t, y: current.y + current.vy * t
        };
    }



        // Функция для рисования всех игроков
        function drawPlayers() {
            const now = Date.now();
            const t = (now - lastServerUpdateTime) / (1000 / 60);
            // Очищаем весь canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
            // Рисуем игровые объекты
            // Проходимся по каждому игроку и рисуем его
            Object.entries(players).forEach(([ip, player]) => {
                const previous = previousPlayers[ip];
                const current = player;

                if (previous && current) {
                    let position;
                    // Используем интерполяцию, если прошло мало времени с последнего обновления
                    if (t < 1) {
                        position = interpolatePlayer(previous, current, t);
                    } else {
                        // Используем экстраполяцию, если прошло много времени
                        position = extrapolatePlayer(current, t - 1);
                    }

                    context.fillStyle = player.color; // Устанавливаем цвет для игрока {В дальнейшем будет открисовываться скин игрока}
                    switch (player.color) {
                        case 'blue':
                            context.drawImage(blue_player, position.x, position.y, player.size, player.size);
                            break;
                        case 'orange':
                            context.drawImage(orange_player, position.x, position.y, player.size, player.size);
                            break;
                        case 'green':
                            context.drawImage(green_player, position.x, position.y, player.size, player.size);
                            break;
                        case 'purple':
                            context.drawImage(purple_player, position.x, position.y, player.size, player.size);
                            break;
                    }

                    drawMap();
                }
            });
        }


        const keys = {};

        // Обработка нажатий клавиш для управления движением
        window.addEventListener('keydown', (event) => {
            keys[event.key] = true;
            sendMovement();
        });

        window.addEventListener('keyup', (event) => {
            delete keys[event.key];
            sendMovement();
        });

        //подгружаем звуки для движения
        const upMoveSound = new Audio('../sound/up.mp3');
        const downMoveSound = new Audio('../sound/down.mp3');
        const leftMoveSound = new Audio('../sound/move.mp3');
        const rightMoveSound = new Audio('../sound/move.mp3');

        let sound = null;
        // Отправка данных о движении на сервер
        function sendMovement() {
            const movementData = { x: 0, y: 0, jump: false };

            // Проверяем нажатие клавиш
            if (keys['ArrowUp']) {
                movementData.jump = true;
                sound = upMoveSound;
                playSound(sound); // Вызываем функцию для воспроизведения звука
            }
            if (keys['ArrowDown']) {
                movementData.y += 5;
                sound = downMoveSound;
                playSound(sound);
            }
            if (keys['ArrowLeft']) {
                movementData.x -= 5;
                sound = leftMoveSound;
                playSound(sound);
            }
            if (keys['ArrowRight']) {
                movementData.x += 5;
                sound = rightMoveSound;
                playSound(sound);
            }

            socket.emit('playerMovement', roomName, movementData);
        }

        function playSound(sound) {
            // Проверяем, что звук не воспроизводится в данный момент
            if (!sound.currentTime) {
                sound.play();
            } else {
                // Если звук уже воспроизводится, то перезапускаем его
                sound.currentTime = 0;
                sound.play();
            }
        }
        socket.on('gameStateUpdate', (playersData) => {
            previousPlayers = players;
            players = playersData;
            Object.entries(playersData).forEach(([ip, playerData]) => {
                players[ip] = {};
                for (let key in playerData) {
                    players[ip][key.slice(1)] = playerData[key];
                }
            });
            lastServerUpdateTime = Date.now();
        })


        let isDrawing = true; //флаг для разрешения рисования

        socket.on('gameState', (state) => { //если состояние игры "неактивно", то рисование запрещено
            if (state === 'inactive') {
                isDrawing = false;
            }
        });

        function gameLoop() {
            if (isDrawing) {
                if (Object.keys(players).length !== 0 ) {
                    drawPlayers(); // Рисуем всех игроков
                }

                requestAnimationFrame(gameLoop); // Планируем следующий кадр игрового цикла
            }

        }

        preload(roomName);
        gameLoop();

        // Добавь логику для синхронизации игры через Socket.io

    }

)
    ;
