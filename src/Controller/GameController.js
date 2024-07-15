class GameController {
    constructor(io, roomName, services) {
        this.io = io;
        this.roomName = roomName;
        this.gameService = services.gameService;
        this.playerService = services.playerService;
        this.levelService = {}
        this.players = {};
        this.levelObjects = [];
        this.level = [];
        this.specialObjects = [];
        this.levelList = {}
        this.roundTimer = null;
        this.cycleTimer = null;
        this.gameState = false;
        this.playersScore = {
            blue: 0,
            green: 0,
            yellow: 0,
            purple: 0,
        }
    }

    async getCurrLevel() {
        this.counter -= 1;
        return new this.levelList[this.counter]
    }

    async isStart(socket) {
        try {
            if (!this.gameState) {
                this.gameState = true
                this.counter = this.levelList.length;
                await this.startRound();
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

    async startRound() {
        try {
            setTimeout(async () => {
                this.levelService = await this.getCurrLevel()
                await this.setGameData();
                this.io.emit('startRound', this.players, this.level);
                await this.updateCycle(this.levelObjects);
                this.roundTimer = setTimeout(async () => {
                    this.endRound();
                }, 20000);
            }, 3000);
        } catch (err) {
            this.io.emit('error', 'Ошибка запуска игры');
        }
    }

    updatePlayersScore() {
        const score = this.levelService.getStat(this.players);
        const total = {};
        for (const color in this.playersScore) {
            total[color] = (this.playersScore[color] || 0) + (score[color] || 0);
        }
        this.playersScore = total;
        this.sortPlayersScore();
    }

    sortPlayersScore() {
        this.playersScore = Object.entries(this.playersScore)
            .sort((a, b) => b[1] - a[1])
            .reduce((result, [key, value]) => ({...result, [key]: value}), {});
    }

    endRound() {
        try {
            this.stopUpdateCycle()
            this.updatePlayersScore();
            this.io.emit('endRound', this.playersScore);
            setTimeout(async () => {
                await this.startRound();
            }, 2000);
        } catch (err) {
            this.io.emit('error', 'Ошибка остановки игры');
        }
    }

    async updateCycle(gameObjects) {
        try {
            if (this.gameState) {
                this.cycleTimer = setInterval(async () => {
                    await this.playerService.updatePlayersPosition(this.roomName, gameObjects);
                    await this.levelService.updateLevel(this.players, this.levelObjects, this.io);
                    await this.playerService.updateHealth(this.players);
                    await this.levelService.updateScore(this.level, this.players);
                    await this.isRoundEnd();
                    this.io.emit('gameUpdate', this.players, this.level, this.specialObjects);
                    this.io.emit('levelScore', this.levelService.getLevelScore());
                }, 1000 / 60);
            }
        } catch (err) {
            this.io.emit('error', 'Ошибка игрового цикла');
        }
    }

    async isRoundEnd() {
        if (await this.playerService.isAllDie() || this.players.length === 0) {
            this.stopUpdateCycle();
            this.stopGameCycle()
            this.endRound();
        }
    }

    stopUpdateCycle() {
        if (this.cycleTimer) {
            clearInterval(this.cycleTimer);
            this.cycleTimer = null;
        }
    }

    stopGameCycle() {
        if (this.roundTimer) {
            clearTimeout(this.roundTimer)
            this.roundTimer = null;
        }
    }

    async setGameData() {
        await this.playerService.resetPlayersData();
        await this.levelService.resetLevelData(this.levelService.levelName);
        await this.playerService.setPlayersSpawnPoints(this.levelService.levelSpawnPoints)
        this.players = this.playerService.players;
        this.levelObjects = this.levelService.levelObjects;
        this.level = this.levelService.levelMap;
        this.specialObjects = this.levelService.specialObjects
    }
}

module.exports = GameController;
