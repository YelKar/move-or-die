class GameController {
    constructor(io, roomName, services) {
        this.io = io;
        this.roomName = roomName;
        this.gameService = services.gameService;
        this.playerService = services.playerService;
        this.levelService = services.levelService;
        this.players = {};
        this.levelObjects = [];
        this.level = [];
        this.cycleTimer = null;
        this.playersScore = {
            blue: 0,
            green: 0,
            yellow: 0,
            purple: 0,
        }
    }

    async isStart(socket) {
        try {
            if (!this.gameState) {
                // await this.levelService.downloadLevelMap('ColorLevel');
                // await this.levelService.getMapGrid(this.levelService.size);
                await this.startGame()
            } else {
                this.gameLoad(socket)
            }
        } catch (err) {
            socket.emit('error', 'Ошибка подготовки к игре');
        }
    }

    gameLoad(socket) {
        socket.emit('gameLoad', this.players, this.level);
    }

    async startGame() {
        try {
            this.gameState = true
            await this.resetGameData();
            await this.levelService.downloadLevelMap(this.levelService.levelName);
            await this.levelService.getMapGrid(this.levelService.size);
            this.io.emit('startRound', this.players, this.level);
            await this.updateCycle(this.levelObjects);
            setTimeout(async () => {
                this.endGame();
            }, 10000);
        } catch (err) {
            socket.emit('error', 'Ошибка запуска игры');
        }
    }

    updatePlayersScore() {
        const score = this.levelService.getStat();
        const total = {};

        for (const color in this.playersScore) {
            total[color] = (this.playersScore[color] || 0) + (score[color] || 0);
        }

        this.playersScore = total;
        this.sortPlayersScore();
    }

    sortPlayersScore() {
        const tmp = this.playersScore;

        this.playersScore = Object.entries(tmp)
            .sort((a, b) => b[1] - a[1]) // Сортировка по второму элементу массива (количество)
            .reduce((result, [key, value]) => ({ ...result, [key]: value }), {}); // Преобразование в объект
        //return this.sortedColoredBlocks;
    }

    endGame() {
        try {
            this.stopUpdateCycle()
            this.updatePlayersScore();
            this.io.emit('endRound', this.playersScore);
            setTimeout(async () => {
                await this.startGame();
            }, 2000);
        } catch (err) {
            socket.emit('error', 'Ошибка запуска игры');
        }
    }

    async updateCycle(gameObjects) {
        try {
            if (this.gameState) {
                this.cycleTimer = setInterval(async () => {
                    await this.playerService.updatePlayersPosition(this.roomName, gameObjects);
                    await this.levelService.updateLevel(this.players, this.levelObjects);
                    await this.playerService.updateHealth(this.players);
                    await this.levelService.updateScore(this.level);
                    this.io.emit('gameUpdate', this.players, this.level);
                    this.io.emit('levelScore', this.levelService.getLevelScore());
                }, 1000 / 60);
            }
        } catch (err) {
            socket.emit('error', 'Ошибка игрового цикла');
        }
    }

    stopUpdateCycle() {
        if (this.cycleTimer) {
            clearInterval(this.cycleTimer);
            this.cycleTimer = null;
        }
    }

    async resetGameData() {
        this.playerService.resetPlayersData();
        await this.levelService.resetLevelData(this.levelService.levelName);
        this.players = this.playerService.players;
        this.levelObjects = this.levelService.levelObjects;
        this.level = this.levelService.levelMap;
    }
}

module.exports = GameController;
