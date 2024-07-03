const GameService = require("../Service/GameService");

class GameController {
    constructor(io, roomRepository, services) {
        this.io = io;
        this.roomService = services.roomService;
        this.gameService = services.gameService;
        this.playerService = services.playerService;
    }

    // update(roomName, eventData) {
    //     const room = this.gameService.handleGameEvent(roomName, socket.ip, eventData);
    //     if (room) {
    //         this.io.to(roomName).emit('gameStateUpdate', room);
    //     }
    // }

    handleMove(roomName, clientIp, moveData) {
        this.gameService.handleMovePlayer(roomName, clientIp, moveData);
    }

    updatePlayers(roomName) {
        this.gameService.updatePlayersPosition(roomName);
    }

    updateState(roomName) {
        this.updatePlayers(roomName);
        const players = this.gameService.getPlayersInRoom(roomName);
        this.io.of('/game').to(roomName).emit('gameStateUpdate', players);
        // this.io.emit('gameStateUpdate', players);
    }
}

module.exports = GameController;
