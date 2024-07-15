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
        try {
            this.counter -= 1;
            if (this.counter <= 0) {
                await this.gameEnd();
                return null;
            }
            return new this.levelList[this.counter]
        } catch (error) {
            this.io.emit('error', 'Ошибка загрузки уровня');
        }
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


    async updateCycle(gameObjects) {
        try {
            if (this.gameState) {
                this.cycleTimer = setInterval(async () => {
                    await this.playerService.updatePlayersPosition(this.roomName, gameObjects);
                    await this.levelService.updateLevel(this.players, this.levelObjects);
                    await this.playerService.updateHealth(this.players);
                    await this.levelService.updateScore(this.level);
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
       try {
           await this.playerService.resetPlayersData();
           await this.levelService.resetLevelData(this.levelService.levelName);
           await this.playerService.setPlayersSpawnPoints(this.levelService.levelSpawnPoints)
           this.players = this.playerService.players;
           this.levelObjects = this.levelService.levelObjects;
           this.level = this.levelService.levelMap;
           this.specialObjects = this.levelService.specialObjects
       } catch (error) {
           this.io.emit('error', 'Ошибка обновления данных');
       }
    }

    async gameEnd(){
        this.gameState = false
        this.stopUpdateCycle();
        this.stopGameCycle();
        this.io.emit('endGame');
    }
}

module.exports = GameController;
