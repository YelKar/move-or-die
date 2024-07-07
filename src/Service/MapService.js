/*
    X - блок,
    0 - пусто 

    Сервис для получения массива объектов карты какого-либо уровня
*/
const Block = require('../Entity/Block');
const MapRepository = require('../Repository/MapRepository');

class MapService {
    constructor() {
        this.map = [];
        this.size = 50;
        this.mapObjects = [];
        this.mapRepository = new MapRepository();
    }

    downloadMap(levelName) {
        return new Promise((resolve, reject) => {
            this.mapRepository.findMapByLevelName(levelName, (error, results, fields) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (results.length > 0) {
                    const levelMap = results[0].level_map;
                    this.map = levelMap;
                    this.mapObjects = [];
                    this.setMap();
                    resolve(this.mapObjects); // Передаем результат в промис
                } else {
                    reject('Карта не найдена');
                }
            });
        });
    }


    setMap() {
        for(let i = 0; i < this.map.length; i++){
            let col = this.map[i];
            for(let j = 0; j < col.length; j++) {
                if (this.map[i][j] === 'X') {
                    this.mapObjects.push(new Block(j * this.size, i * this.size, this.size));
                }
            }
        }
        console.log('OK');
    }
}

module.exports = new MapService();