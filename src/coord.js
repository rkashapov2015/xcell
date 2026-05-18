
export default class Coord {
    /**
     * @param {Array<Array>} defaultValue 
     */
    constructor(defaultValue) {
        this._coords = defaultValue ? defaultValue : [[0, 0]];
        this._map = new Map();

        this._updateMap();
    }

    /**
     * @returns {Array}
     */
    getCoords() {
        return this._coords;
    }

    _updateMap() {
        this._map.clear();
        this._coords.forEach((coord) => this._map.set(`${coord[0]}_${coord[1]}`, true));
    }

    /**
     * @param {Number} row 
     * @param {Number} column 
     */
    addCoord(row, column) {
        const key = `${row}_${column}`;
        if (!this._map.has(key)) {
            this._coords.push([row, column]);
            this._map.set(key, true);
        }
    }

    /**
     * @param {Array} coords 
     */
    setCoords(coords) {
        this._coords = coords;
        this._updateMap();
    }

    /**
     * @param {Number} row 
     * @param {Number} column 
     * @returns {Boolean}
     */
    hasCoords(row, column) {
        const key = `${row}_${column}`;

        return this._map.has(key);
    }

    /**
     * @returns {Array}
     */
    getFirstCoord() {
        return this._coords[0];
    }

    /**
     * @returns {Array}
     */
    getLastCoord() {
        return this._coords[this._coords.length-1];
    }
}
