const Player = require("../Entity/Player");
const CANVAS_WIDTH = 1400;
const CANVAS_HEIGHT = 800;
const GRAVITY = 0.5;
const JUMP_FORCE = -13;
const GROUND_LEVEL = CANVAS_HEIGHT - 50;
const GRID_SIZE = 50;
let colorArray = ['blue', 'green', 'orange', 'purple'];

class PlayerService {
    constructor() {
        this.players = {};
        this.playersStart = {}
    }

    resetPlayersData() {
        Object.values(this.players).forEach(player => {
            player.x = 200;
            player.y = 200;
            player.collision = true;
            player.visible = true;
            player.statement = true;
            player.movement = { x: 0, y: 0};
            player.onGround = true;
            player.vy = 0;
        });
    }

    isStart(clientIp) {
        this.playersStart[clientIp] = true
        return Object.values(this.playersStart).every(value => value === true);
    }

    newPlayer(clientIp, userName, x, y, size, color) {
        return new Player(clientIp, userName, x, y, size, color);
    }

    addPlayerToGame(roomName, userName, clientIp) {
        this.playersStart[clientIp] = false;
        this.players[clientIp] = this.newPlayer(clientIp, userName, 200, 200, 50, this.randomColor());
    }

    handleMovePlayer(clientIp, movementData) {
        this.players[clientIp].movement = movementData;
        if (movementData.jump && this.players[clientIp].onGround) {
            this.players[clientIp].vy = JUMP_FORCE;
            this.players[clientIp].onGround = false;
        }
    }

    updatePlayersPosition(roomName, gameObjectsGrid) {
        Object.values(this.players).forEach(player => {
            this.applyPhysics(player);
        });
    }

    applyPhysics(player) {
        player.x += player.movement.x;
        player.vy += GRAVITY;
        player.y += player.vy;
    }




    randomColor() {
        if (colorArray.length != 0) {
            let colorInd = Math.floor(Math.random() * colorArray.length);
            let color = colorArray[colorInd];
            colorArray.splice(colorInd, 1);
            return color;
        } else {
            return 'grey';
        }
    }
}

module.exports = PlayerService;
