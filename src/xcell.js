import {el, clearNode } from './common';
import Coord from './coord';

export default class XCell {
    #rootElement;

    #data;

    #columns;

    #rowHeaders;

    #coords;

    #isLeftButtonHolded;

    /**
     * @param {Element} element 
     * @param {Array} data 
     * @param {Array<Object>} columns
     * @param {Array<String>} rowHeaders
     */
    constructor (element, data, columns, rowHeaders) {
        this.#rootElement = element;
        this.#data = data;
        this.#columns = columns;
        this.#rowHeaders = rowHeaders ?? [];
        this.#coords = new Coord();

        this.#render();

        this.#isLeftButtonHolded = false;
    }

    destroy() {
        this.removeEventListeners();
        clearNode(this.#rootElement);
    }

    setData(data) {
        this.#data = [...data];
        this.#renderRows();
    }

    #renderRows() {
        const countRows = this.#data.length;
        const countColumns = this.#columns.length;
        const rowsFragment = document.createDocumentFragment();

        for (let irow = 0; irow < countRows; irow += 1 ) {
            const columnsFragment = document.createDocumentFragment();

            if (this.#rowHeaders.length > 0) {
                let val = irow;
                if (irow <= this.#rowHeaders.length - 1) {
                    val = this.#rowHeaders[irow];
                }
                columnsFragment.appendChild(el('th', {}, val));
            }

            for (let icol = 0; icol < countColumns; icol += 1 ) {
                const elTagname = 'td';
                let cellValue = '';

                if (
                    irow <= this.#data.length - 1
                    && icol <= this.#data[irow].length - 1
                ) {
                    cellValue = (this.#data[irow][icol]).toString();
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

        const tbody = this.#rootElement.querySelector('table tbody');
        if (tbody) {
            clearNode(tbody);
            tbody.appendChild(rowsFragment);
        }
        
    }

    #render() {
        const headerColumnsFragment = document.createDocumentFragment();
        if (this.#rowHeaders.length > 0) {
            headerColumnsFragment.appendChild(el('th', {}));
        }

        this.#columns.forEach((col) => {
            headerColumnsFragment.appendChild(
                el('th', {}, col.title),
            );
        });

        const colGroupsFragment = document.createDocumentFragment();

        if (this.#rowHeaders.length) {
            colGroupsFragment.appendChild(el('colgroup', { width: '150' }));
        }

        const colGroupEl = el('colgroup');
        this.#columns.forEach((column, index) => {
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
            el('tbody', {})
        ]);

        clearNode(this.#rootElement);
        this.#rootElement.appendChild(tableEl);

        this.#renderRows();

        this.#markActiveCells();
        this.#addEventListeners();
        tableEl.focus();
    }

    #addEventListeners() {
        this.#rootElement.addEventListener('click', this.#onClick.bind(this));
        this.#rootElement.addEventListener('dblclick', this.#onDoubleClick.bind(this));
        this.#rootElement.addEventListener('mousedown', this.#onMouseDown.bind(this));
        this.#rootElement.addEventListener('mouseup', this.#onMouseUp.bind(this));
        this.#rootElement.addEventListener('mouseover', this.#onMouseOver.bind(this));
        this.#rootElement.addEventListener('blur', this.#onBlur.bind(this), true);
        this.#rootElement.addEventListener('keydown', this.#onKeydown.bind(this));
        this.#rootElement.querySelector('table').addEventListener('copy', this.#onCopy.bind(this));
        this.#rootElement.querySelector('table').addEventListener('paste', this.#onPaste.bind(this));
    }

    #removeEventListeners() {
        this.#rootElement.removeEventListener('click', this.#onClick.bind(this));
        this.#rootElement.removeEventListener('dblclick', this.#onDoubleClick.bind(this));
        this.#rootElement.removeEventListener('mousedown', this.#onMouseDown.bind(this));
        this.#rootElement.removeEventListener('mouseup', this.#onMouseUp.bind(this));
        this.#rootElement.removeEventListener('mouseover', this.#onMouseOver.bind(this));
        this.#rootElement.removeEventListener('blur', this.#onBlur.bind(this), true);
        this.#rootElement.removeEventListener('keydown', this.#onKeydown.bind(this));
        this.#rootElement.querySelector('table').removeEventListener('copy', this.#onCopy.bind(this));
        this.#rootElement.querySelector('table').removeEventListener('paste', this.#onPaste.bind(this));
    }

    /**
     * @param {MouseEvent} event 
     */
    #onClick(event) {
        const { target } = event;
        const currentCell = target.closest('tr > td.x-cell');

        if (currentCell) {
            const row = parseInt(currentCell.dataset.row, 10);
            const col = parseInt(currentCell.dataset.col, 10);

            if (event.shiftKey) {
                const [ lastRow, lastColumn ] = this.#coords.getLastCoord();
                this.selectOnRange([lastRow, lastColumn], [row, col]);
            } else if (event.ctrlKey) {
                this.#coords.addCoord([row, col]);
            } else {
                this.#coords.setCoords([[row, col]]);
            }

            this.#markActiveCells();
        }
    }

    /**
     * @param {MouseEvent} event 
     */
    #onDoubleClick(event) {
        const { target } = event;
        const currentCell = target.closest('tr > td.x-cell');
        if (currentCell) {
            this.#editCell(currentCell);
        }
    }

    /**
     * @param {Element} cell 
     */
    #editCell(cell) {
        if (cell) {
            const cellType = this.#columns[cell.dataset.col].type;
            if (cellType !== 'readonly') {
                const cellValue = this.#data[cell.dataset.row][cell.dataset.col] ?? '';
                const span = cell.querySelector('span');
                span.innerText = '';
                const inputEl = el('input', { type: this.#columns[cell.dataset.col]?.type ?? 'text', value: cellValue,  thousandsSeparator: ' '});
                span.appendChild(inputEl);
                inputEl.focus();
                inputEl.select();
            }
        }
    }

    /**
     * @param {Element} cell 
     */
    #removeEditCell(cell) {
        if (cell) {
            const cellSpan = cell.querySelector('span');
            const input = cell.querySelector('input');
            
            try {
                const newValue = input.value;

                if (newValue !== (this.#data[cell.dataset.row][cell.dataset.col]).toString()) {
                    this.#data[cell.dataset.row][cell.dataset.col] = newValue;
                    this.#emitEvent();
                }

                cellSpan.removeChild(input);
                cellSpan.innerText = this.#data[cell.dataset.row][cell.dataset.col];
            }
            catch (err) {
                // eslint-disable-next-line no-console
                console.log(err);
            }
        }
    }

    /**
     * @param {FocusEvent} event 
     */
    #onBlur(event) {
        const { target } = event;
        const currentCell = target.closest('tr > td.x-cell');
        this.#removeEditCell(currentCell);
    }

    /**
     * @param {KeyboardEvent} event
     */
    #onKeydown(event) {
        let cell;
        const coord = this.#coords.getFirstCoord();

        switch (true) {
            case event.key === 'ArrowUp':
            case event.key === 'ArrowDown':
            case event.key === 'ArrowLeft':
            case event.key === 'ArrowRight':
                this.#onMoving(event);
            break;
            case event.key === 'Enter':
                cell = this.getCellByCoord(coord[0], coord[1]);

                if (cell.querySelector('span > input')) {
                    cell.querySelector('span > input').blur();
                    this.#rootElement.querySelector('.x-table').focus();
                } else {
                    this.#editCell(cell);
                }
            break;
            default:
                if (!['Control', 'Shift', 'Alt'].includes(event.key) && !event.ctrlKey) {
                    const firstCoord = this.#coords.getFirstCoord();
                    cell = this.getCellByCoord(firstCoord[0], firstCoord[1]);

                    if (!cell.querySelector('span > input')) {
                        this.editCell(cell);
                    }
                }
        }
    }

    /**
     * @param {MouseEvent} event 
     */
    #onMouseDown(event) {
        this.#isLeftButtonHolded = event.button === 0;
        const { target } = event;

        if (this.#isLeftButtonHolded && !event.shiftKey) {
            const cell = target.closest('tr > td.x-cell');

            if (cell) {
                const row = parseInt(cell.dataset.row, 10); 
                const col = parseInt(cell.dataset.col, 10);

                this.#coords.setCoords([[row, col]]);

                this.#markActiveCells();
            }
        }
    }

    /**
     * @param {MouseEvent} event 
     */
    #onMouseUp(event) {
        this.#isLeftButtonHolded = !(event.button === 0);
    }

    /**
     * @param {MouseEvent} event 
     */
    #onMouseOver(event) {
        const { target } = event;
        if (this.#isLeftButtonHolded) {
            const cell = target.closest('tr > td.x-cell');

            if (cell) {
                this.#coords.addCoord(parseInt(cell.dataset.row, 10), parseInt(cell.dataset.col, 10));
                const [ minRow, minColumn, maxRow, maxColumn ] = this.#coords.getRect();

                for (let iRow = minRow; iRow <= maxRow; iRow += 1) {
                    for (let iColumn = minColumn; iColumn <= maxColumn; iColumn += 1) {
                        this.#coords.addCoord(iRow, iColumn);
                    }
                }

                this.#markActiveCells();
            }
        }
    }

    /**
     * @param {KeyboardEvent} event 
     */
    #onMoving(event) {
        let deltaX = 0;
        let deltaY = 0;

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
            default:
        }

        const [ firstActiveCoord ] = this.#coords.getCoords();
        const cell = this.getCellByCoord(firstActiveCoord[0], firstActiveCoord[1]);

        if (cell.querySelector('input')) {
            return;
        }

        if (cell && cell.querySelector('input')) {
            cell.querySelector('input').blur();
            this.#rootElement.querySelector('.x-table').focus();
        }

        firstActiveCoord[0] += deltaY;
        firstActiveCoord[1] += deltaX;
        if (firstActiveCoord[0] < 0) {
            firstActiveCoord[0] = 0;
        }

        if (firstActiveCoord[0] > this.#data.length - 1) {
            firstActiveCoord[0] = this.#data.length - 1;
        }

        if (firstActiveCoord[1] < 0) {
            firstActiveCoord[1] = 0;
        }

        if (firstActiveCoord[1] > this.#columns.length - 1) {
            firstActiveCoord[1] = this.#columns.length - 1;
        }

        this.#coords.setCoords([firstActiveCoord]);
        this.#markActiveCells();
    }

    /**
     * @param {ClipboardEvent} event 
     */
    #onCopy(event) {
        event.preventDefault();
        event.clipboardData.setData('text/plain', this.#getValuesActiveCoordsForClipboard());
    }

    /**
     * @param {ClipboardEvent} event 
     */
    #onPaste(event) {
        event.preventDefault();
        this.#pasteFromClipboard(String(event.clipboardData.getData('text/plain')).trim());
    }

    /**
     * 
     * @param {Number} row 
     * @param {Number} column 
     * @returns {?Element}
     */
    getCellByCoord(row, column) {
        return this.#rootElement.querySelector(`td.x-cell[data-row="${row}"][data-col="${column}"]`);
    }

    getValuesActiveCoords() {
        const result = [];
        this.#coords.getCoords().sort().forEach((coord) => {
            result.push(this.#data[coord[0]][coord[1]]);
        });

        return result;
    }

    /**
     * @returns {String}
     */
    #getValuesActiveCoordsForClipboard() {
        const result = [];
        const sortResult = this.#coords.getCoords()
            .sort((a, b) => parseInt(`${a[0]}${a[1]}`, 10) - parseInt(`${b[0]}${b[1]}`, 10));

        let prevRow = null;
        sortResult
            .forEach((coord) => {
                const sym = prevRow === null || prevRow === coord[0] ? "\t" : "\n";

                if (prevRow !== null) {
                    result.push(sym);
                }

                result.push(this.#data[coord[0]][coord[1]]);

                [ prevRow ] = coord;
            });

        return result.join('');
    }

    /**
     * 
     * @param {Array} firstCoord 
     * @param {Array} lastCoord 
     */
    #selectOnRange(firstCoord, lastCoord) {
        const firstRow = firstCoord[0];
        const firstColumn = firstCoord[1];
        const lastRow = lastCoord[0];
        const lastColumn = lastCoord[1];

        const rowEdges = [firstRow, lastRow].sort((a, b) => a - b);
        const columnEdges = [firstColumn, lastColumn].sort((a, b) => a - b);

        const rows = [];
        const columns = [];

        for (let iRow = rowEdges[0]; iRow <= rowEdges[1]; iRow += 1) {
            rows.push(iRow);
        }

        for (let iColumn = columnEdges[0]; iColumn <= columnEdges[1]; iColumn += 1) {
            columns.push(iColumn);
        }

        for (let i = 0; i < rows.length; i += 1) {
            for (let j = 0; j < columns.length; j += 1) {
                this.#coords.addCoord(rows[i], columns[j]);
            }
        }
    }

    /**
     * @param {String} clipText 
     */
    #pasteFromClipboard(clipText) {
        let totalCountItems = 0;
        const res = clipText.split("\n")
            .map((row) => {
                const subRes = row.split("\t");
                totalCountItems += subRes.length;

                return subRes;
            });

        if (totalCountItems > 1) {
            const sortedCoords = this.#coords
                .getCoords()
                .sort((a, b) => parseInt(`${a[0]}${a[1]}`, 10) - parseInt(`${b[0]}${b[1]}`, 10));

            const [firstRow, firstColumn] = sortedCoords.length > 0 ? sortedCoords[0] : [0, 0];

            let isChanged = false;
            res.forEach((rowClip, rowIndex) => {
                rowClip.forEach((colClip, colIndex) => {
                    const cell = this.getCellByCoord(firstRow + rowIndex, firstColumn + colIndex);
                    if (cell) {
                        this.#data[firstRow + rowIndex][firstColumn + colIndex] = colClip;
                        cell.querySelector('span').innerText = colClip;
                        isChanged = true;
                    }
                });
            });

            if (isChanged) {
                this.emitEvent();
            }
        } else if (totalCountItems === 1) {
            let isChanged = false;
            const cellVal = res[0][0];
            this.#coords.getCoords().forEach(([row, column]) => {
                const cell = this.getCellByCoord(row, column);
                if (cell) {
                    this.#data[row][column] = cellVal;
                    cell.querySelector('span').innerText = cellVal;
                    isChanged = true;
                }
            });

            if (isChanged) {
                this.emitEvent();
            }
        }
    }

    #markActiveCells() {
        let timer;
        
        (() => {
            if (timer) {
                clearTimeout(timer);
            }

            timer = setTimeout(() => {
                this.#rootElement.querySelectorAll('td.x-cell.active').forEach((node) => { node.classList.remove('active') });
                this.#coords.getCoords().forEach((coord) => {
                    const cell = this.#rootElement.querySelector(`td.x-cell[data-row="${coord[0]}"][data-col="${coord[1]}"]`);
                    if (cell) {
                        cell.classList.add('active');
                    }
                });
            });
        })();
    }

    #emitEvent() {
        let timer;
        
        (() => {
            if (timer) {
                clearTimeout(timer);
            }

            timer = setTimeout(() => {
                const event = new CustomEvent('changeData', {
                    detail: { data: this.#data }
                });

                this.#rootElement.dispatchEvent(event);
            });
        })();
    }
}
