import {el, clearNode } from './common';
import Coord from './coord';

export default class XCell {
    /**
     * @param {Element} element 
     * @param {Array} data 
     * @param {Array<Object>} columns
     * @param {Array<String>} rowHeaders
     */
    constructor (element, data, columns, rowHeaders) {
        this.rootElement = element;
        this.data = data;
        this.columns = columns;
        this.rowHeaders = rowHeaders;
        this._coords = new Coord();

        this._render();

        this.isLeftButtonHolded = false;
    }

    destroy() {
        this._removeEventListeners();
        clearNode(this.rootElement);
    }

    _render() {
        const countRows = this.data.length;
        const countColumns = this.columns.length;
        
        const headerColumnsFragment = document.createDocumentFragment();
        if (this.rowHeaders.length > 0) {
            headerColumnsFragment.appendChild(el('th', {}));
        }

        this.columns.forEach((col) => {
            headerColumnsFragment.appendChild(
                el('th', {}, col.title),
            );
        });
        
        const rowsFragment = document.createDocumentFragment();
        for (let irow = 0; irow < countRows; irow++ ) {
            const columnsFragment = document.createDocumentFragment();

            if (this.rowHeaders.length > 0) {
                let val = irow;
                if (irow <= this.rowHeaders.length - 1) {
                    val = this.rowHeaders[irow];
                }
                columnsFragment.appendChild(el('th', {}, val));
            }

            for (let icol = 0; icol < countColumns; icol++ ) {
                const elTagname = 'td';
                let cellValue = '';

                if (
                    irow <= this.data.length - 1
                    && icol <= this.data[irow].length - 1
                ) {
                    cellValue = (this.data[irow][icol]).toString();
                }

                columnsFragment.appendChild(
                    el(elTagname, { 'data-row': irow, 'data-col': icol, class: 'x-cell'}, [
                        el('span', {}, cellValue)
                    ])
                );
            }
            rowsFragment.appendChild(
                el('tr', { 'data-row': irow}, [columnsFragment])
            );
        }

        const colGroupsFragment = document.createDocumentFragment();
        colGroupsFragment.appendChild(el('colgroup', { width: '150' }));

        const colGroupEl = el('colgroup');
        this.columns.forEach((column, index) => {
            if (index === 0) return;

            colGroupEl.appendChild(
                el('col', { align: 'right' })
            );
        });
        colGroupsFragment.appendChild(colGroupEl);

        const tableEl = el('table', { class: 'x-table', tabindex: -1 }, [
            colGroupsFragment,
            el('thead', {}, [
                el('tr', {}, [headerColumnsFragment])
            ]),
            el('tbody', {}, [
                rowsFragment,
            ])
        ]);

        clearNode(this.rootElement);
        this.rootElement.appendChild(tableEl);

        this._markActiveCells();
        this._addEventListeners();
        tableEl.focus();
    }

    _addEventListeners() {
        this.rootElement.addEventListener('click', this._onClick.bind(this));
        this.rootElement.addEventListener('dblclick', this._onDoubleClick.bind(this));
        this.rootElement.addEventListener('mousedown', this._onMouseDown.bind(this));
        this.rootElement.addEventListener('mouseup', this._onMouseUp.bind(this));
        this.rootElement.addEventListener('mouseover', this._onMouseOver.bind(this));
        this.rootElement.addEventListener('blur', this._onBlur.bind(this), true);
        this.rootElement.addEventListener('keydown', this._onKeydown.bind(this));
        this.rootElement.querySelector('table').addEventListener('copy', this._onCopy.bind(this));
        this.rootElement.querySelector('table').addEventListener('paste', this._onPaste.bind(this));
    }

    _removeEventListeners() {
        this.rootElement.removeEventListener('click', this._onClick.bind(this));
        this.rootElement.removeEventListener('dblclick', this._onDoubleClick.bind(this));
        this.rootElement.removeEventListener('mousedown', this._onMouseDown.bind(this));
        this.rootElement.removeEventListener('mouseup', this._onMouseUp.bind(this));
        this.rootElement.removeEventListener('mouseover', this._onMouseOver.bind(this));
        this.rootElement.removeEventListener('blur', this._onBlur.bind(this), true);
        this.rootElement.removeEventListener('keydown', this._onKeydown.bind(this));
        this.rootElement.querySelector('table').removeEventListener('copy', this._onCopy.bind(this));
        this.rootElement.querySelector('table').removeEventListener('paste', this._onPaste.bind(this));
    }

    _markActiveCells() {
        let timer;
        
        (() => {
            if (timer) {
                clearTimeout(timer);
            }

            timer = setTimeout(() => {
                this.rootElement.querySelectorAll('td.x-cell.active').forEach((node) => { node.classList.remove('active') });
                this._coords.getCoords().forEach((coord) => {
                    const cell = this.rootElement.querySelector(`td.x-cell[data-row="${coord[0]}"][data-col="${coord[1]}"]`);
                    if (cell) {
                        cell.classList.add('active');
                    }
                });
            });
        })();
    }

    /**
     * @param {MouseEvent} event 
     */
    _onClick(event) {
        const target = event.target;
        const currentCell = target.closest('tr > td.x-cell');
        if (currentCell) {
            const row = parseInt(currentCell.dataset.row), 
                col = parseInt(currentCell.dataset.col);
            if (event.shiftKey) {
                const [ lastRow, lastColumn ] = this._coords.getLastCoord();
                this._selectOnRange([lastRow, lastColumn], [row, col]);
            } else if (event.ctrlKey) {
                this._coords.addCoord([row, col]);
            } else {
                this._coords.setCoords([[row, col]]);
            }

            this._markActiveCells();
        }
    }

    /**
     * @param {MouseEvent} event 
     */
    _onDoubleClick(event) {
        const target = event.target;
        const currentCell = target.closest('tr > td.x-cell');
        if (currentCell) {
            this._editCell(currentCell);
        }
    }

    /**
     * @param {Element} cell 
     */
    _editCell(cell) {
        if (cell) {
            const cellType = this.columns[cell.dataset.col].type;
            if (cellType !== 'readonly') {
                let cellValue = this.data[cell.dataset.row][cell.dataset.col] ?? '';
                const span = cell.querySelector('span');
                span.innerText = '';
                const inputEl = el('input', { type: this.columns[cell.dataset.col]?.type ?? 'text', value: cellValue });
                span.appendChild(inputEl);
                inputEl.focus();
                inputEl.select();
            }
        }
    }

    /**
     * @param {Element} cell 
     */
    _removeEditCell(cell) {
        if (cell) {
            const cellSpan = cell.querySelector('span');
            const input = cell.querySelector('input');
            
            try {
                const newValue = input.value;
                this.data[cell.dataset.row][cell.dataset.col] = newValue;
                cellSpan.removeChild(input);
                cellSpan.innerText = newValue;
                this._emitEvent();
            }
            catch (err) {
                console.log(err);
            }
        }
    }

    /**
     * @param {FocusEvent} event 
     */
    _onBlur(event) {
        const target = event.target;
        const currentCell = target.closest('tr > td.x-cell');
        this._removeEditCell(currentCell);
    }

    /**
     * @param {KeyboardEvent} event
     */
    _onKeydown(event) {
        let cell;
        switch (true) {
            case event.key === 'ArrowUp':
            case event.key === 'ArrowDown':
            case event.key === 'ArrowLeft':
            case event.key === 'ArrowRight':
                this._onMoving(event);
            break;
            case event.key === 'Enter':
                const coord = this._coords.getFirstCoord();
                cell = this._getCellByCoord(coord[0], coord[1]);
                if (cell.querySelector('span > input')) {
                    cell.querySelector('span > input').blur();
                    this.rootElement.querySelector('.x-table').focus();
                } else {
                    this._editCell(cell);
                }
            break;
            // case event.ctrlKey && ['c', 'C', 'с', 'С'].includes(event.key):
            //     navigator.clipboard.writeText(this._getValuesActiveCoordsForClipboard());
            // break;
            // case event.ctrlKey && ['v', 'V', 'м', 'М'].includes(event.key):
            //     navigator.clipboard
            //         .readText()
            //         .then(this._pasteFromClipboard.bind(this));
            // break;
            default:
                if (!['Control', 'Shift', 'Alt'].includes(event.key) && !event.ctrlKey) {
                    const firstCoord = this._coords.getFirstCoord();
                    cell = this._getCellByCoord(firstCoord[0], firstCoord[1]);
                    if (!cell.querySelector('span > input')) {
                        this._editCell(cell);
                    }
                }
        }
    }

    /**
     * @param {MouseEvent} event 
     */
    _onMouseDown(event) {
        this.isLeftButtonHolded = event.button === 0;

        if (this.isLeftButtonHolded && !event.shiftKey) {
            const target = event.target;
            const cell = target.closest('tr > td.x-cell');

            if (cell) {
                const row = parseInt(cell.dataset.row), 
                    col = parseInt(cell.dataset.col);

                this._coords.setCoords([[row, col]]);

                this._markActiveCells();
            }
            
        }
    }

    /**
     * @param {MouseEvent} event 
     */
    _onMouseUp(event) {
        this.isLeftButtonHolded = !(event.button === 0);
    }

    /**
     * @param {MouseEvent} event 
     */
    _onMouseOver(event) {
        if (this.isLeftButtonHolded) {
            const target = event.target;
            const cell = target.closest('tr > td.x-cell');

            if (cell) {
                this._coords.addCoord(parseInt(cell.dataset.row), parseInt(cell.dataset.col));
                const [ minRow, minColumn, maxRow, maxColumn ] = this._coords.getRect();

                for (let iRow = minRow; iRow <= maxRow; iRow++) {
                    for (let iColumn = minColumn; iColumn <= maxColumn; iColumn++) {
                        this._coords.addCoord(iRow, iColumn);
                    }
                }

                this._markActiveCells();
            }
        }
    }

    /**
     * @param {KeyboardEvent} event 
     */
    _onMoving(event) {
        let deltaX = 0,
            deltaY = 0;

        switch (event.key) {
            case 'ArrowUp':
                deltaY = -1;
            break;
            case 'ArrowDown':
                deltaY = 1;
            break;
            case 'ArrowLeft':
                deltaX = -1;
            break;
            case 'ArrowRight':
                deltaX = 1;
            break;
        }

        const [ firstActiveCoord ] = this._coords.getCoords();
        const cell = this._getCellByCoord(firstActiveCoord[0], firstActiveCoord[1]);
        if (cell && cell.querySelector('input')) {
            cell.querySelector('input').blur();
            this.rootElement.querySelector('.x-table').focus();
        }

        firstActiveCoord[0] += deltaY;
        firstActiveCoord[1] += deltaX;
        if (firstActiveCoord[0] < 0) {
            firstActiveCoord[0] = 0;
        }

        if (firstActiveCoord[0] > this.data.length - 1) {
            firstActiveCoord[0] = this.data.length - 1;
        }

        if (firstActiveCoord[1] < 0) {
            firstActiveCoord[1] = 0;
        }

        if (firstActiveCoord[1] > this.columns.length - 1) {
            firstActiveCoord[1] = this.columns.length - 1;
        }

        this._coords.setCoords([firstActiveCoord]);
        this._markActiveCells();
    }

    /**
     * @param {ClipboardEvent} event 
     */
    _onCopy(event) {
        event.preventDefault();
        event.clipboardData.setData('text/plain', this._getValuesActiveCoordsForClipboard());
    }

    /**
     * @param {ClipboardEvent} event 
     */
    _onPaste(event) {
        event.preventDefault();
        this._pasteFromClipboard(String(event.clipboardData.getData('text/plain')).trim());
    }

    /**
     * 
     * @param {Number} row 
     * @param {Number} column 
     * @returns {?Element}
     */
    _getCellByCoord(row, column) {
        return this.rootElement.querySelector(`td.x-cell[data-row="${row}"][data-col="${column}"]`);
    }

    _getValuesActiveCoords() {
        const result = [];
        this._coords.getCoords().sort().forEach((coord) => {
            result.push(this.data[coord[0]][coord[1]]);
        });

        return result;
    }

    /**
     * @returns {String}
     */
    _getValuesActiveCoordsForClipboard() {
        const result = [];
        const sortResult = this._coords.getCoords()
            .sort((a, b) => parseInt(`${a[0]}${a[1]}`) - parseInt(`${b[0]}${b[1]}`));

        let prevRow = null;
        sortResult
            .forEach((coord) => {
                const sym = prevRow === null || prevRow === coord[0] ? "\t" : "\n";

                if (prevRow !== null) {
                    result.push(sym);
                }

                result.push(this.data[coord[0]][coord[1]]);

                prevRow = coord[0];
            });

        return result.join('');
    }

    /**
     * 
     * @param {Array} firstCoord 
     * @param {Array} lastCoord 
     */
    _selectOnRange(firstCoord, lastCoord) {
        const firstRow = firstCoord[0],
            firstColumn = firstCoord[1],
            lastRow = lastCoord[0],
            lastColumn = lastCoord[1];

        const rowEdges = [firstRow, lastRow].sort((a, b) => a - b);
        const columnEdges = [firstColumn, lastColumn].sort((a, b) => a - b);

        const rows = [];
        const columns = [];

        for (let iRow = rowEdges[0]; iRow <= rowEdges[1]; iRow++) {
            rows.push(iRow);
        }

        for (let iColumn = columnEdges[0]; iColumn <= columnEdges[1]; iColumn++) {
            columns.push(iColumn);
        }

        for (let i = 0; i < rows.length; i++) {
            for (let j = 0; j < columns.length; j++) {
                this._coords.addCoord(rows[i], columns[j]);
            }
        }
    }

    /**
     * @param {String} clipText 
     */
    _pasteFromClipboard(clipText) {
        const hasEditedCell = this.rootElement.querySelectorAll('td.x-cell input').length > 0;

        const res = clipText.split("\n").map((row) => {
            return row.split("\t");
        });

        const sortedCoords = this._coords
            .getCoords()
            .sort((a, b) => parseInt(`${a[0]}${a[1]}`) - parseInt(`${b[0]}${b[1]}`));

        const [firstRow, firstColumn] = sortedCoords.length > 0 ? sortedCoords[0] : [0, 0];

        res.forEach((rowClip, rowIndex) => {
            rowClip.forEach((colClip, colIndex) => {
                const cell = this._getCellByCoord(firstRow + rowIndex, firstColumn + colIndex);
                if (cell) {
                    this.data[firstRow + rowIndex][firstColumn + colIndex] = colClip;
                    cell.querySelector('span').innerText = colClip;
                    this._emitEvent();
                }
            });
        });
    }

    _emitEvent() {
        let timer;
        
        (() => {
            if (timer) {
                clearTimeout(timer);
            }

            timer = setTimeout(() => {
                const event = new CustomEvent('changeData', {
                    detail: {
                        data: this.data,
                    }
                });

                this.rootElement.dispatchEvent(event);
            });
        })();
    }
}
