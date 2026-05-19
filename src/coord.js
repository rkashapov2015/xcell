
export default class Coord {
    /**
     * @param {Array<Array>} defaultValue 
     */
    constructor(defaultValue) {
        this._coords = defaultValue ? defaultValue : [[0, 0]];
        this._map = new Map();

        this.minRow = 100000;
        this.minColumn = 100000;
        this.maxRow = 0;
        this.maxColumn = 0;

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

            if (row < this.minRow) {
                this.minRow = row;
            }

            if (row > this.maxRow) {
                this.maxRow = row;
            }

            if (column < this.minColumn) {
                this.minColumn = column;
            }

            if (column > this.maxColumn) {
                this.maxColumn = column;
            }
        }
    }

    /**
     * @param {Array} coords 
     */
    setCoords(coords) {
        this._coords = coords;
        this._updateMap();

        let minRow = 100000;
        let maxRow = 0;
        let minColumn = 100000;
        let maxColumn = 0;

        this._coords.forEach(([ row, column ]) => {
            if (row < minRow) {
                minRow = row;
            }

            if (row > maxRow) {
                maxRow = row;
            }

            if (column < minColumn) {
                minColumn = column;
            }

            if (column > maxColumn) {
                maxColumn = column;
            }
        });

        this.minRow = minRow;
        this.maxRow = maxRow;
        this.minColumn = minColumn;
        this.maxColumn = maxColumn;
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

    /**
     * @returns {Array}
     */
    getRect() {
        return [
            this.minRow, this.minColumn,
            this.maxRow, this.maxColumn,
        ];
    }
}
