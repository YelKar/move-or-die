// src/Controller/LevelController.js
const levelColorService = require('../Service/Level/LevelColorService');
const fallingBlocksService = require('../Service/Level/FallingBlocksService');
const BombTagService = require('../Service/Level/BombTagService');
const LevelService = require("../Service/LevelService");
const LEVEL_ARRAY = [levelColorService, fallingBlocksService, BombTagService]

class LevelController {
    constructor(io) {
        this.io = io;
    }

    getLevelList() {
        const shuffled = LEVEL_ARRAY.sort(() => 0.5 - Math.random());
        const result = [];
        while (result.length < 10) {
            result.push(...shuffled);
        }
        return result.slice(0, 10);
    }
}

module.exports = LevelController;