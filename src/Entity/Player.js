class Player {
    constructor(id, username, x, y, size, color = 'grey', collision = true, visible = true, statement = true) {
        this._id = id;
        this._username = username;
        this._x = x;
        this._y = y;
        this._size = size;
        this._color = color;
        this._collision = collision;
        this._visible = visible;
        this._statement = statement;
        this._lastActive = Date.now();
        this._movement = { x: 0, y: 0};
        this._onGround = true;
        this._vy = 0;
    }

    get id() {
        return this._id;
    }

    get username() {
        return this._username;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get size() {
        return this._size;
    }

    get color() {
        return this._color;
    }

    get collision() {
        return this._collision;
    }

    get visible() {
        return this._visible;
    }

    get statement() {
        return this._statement;
    }

    get lastActive() {
        return this._lastActive;
    }

    get movement() {
        return this._movement;
    }

    get onGround() {
        return this._onGround;
    }

    get vy() {
        return this._vy;
    }

    set id(value) {
        this._id = value;
    }

    set username(value) {
        this._username = value;
    }

    set x(value) {
        this._x = value;
    }

    set y(value) {
        this._y = value;
    }

    set size(value) {
        this._size = value;
    }

    set color(value) {
        this._color = value;
    }

    set collision(value) {
        this._collision = value;
    }

    set visible(value) {
        this._visible = value;
    }

    set statement(value) {
        this._statement = value;
    }

    set lastActive(value) {
        this._lastActive = value;
    }

    set movement(value) {
        this._movement = value;
    }

    set onGround(value) {
        this._onGround = value;
    }

    set vy(value) {
        this._vy = value;
    }
}

module.exports = Player;
