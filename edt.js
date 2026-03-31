// DataHolder - stores sheets data
class DataHolder {
    constructor() {
        this.sheets = {
            "first": {
                start_row: 1,
                start_col: 1,
                cells: [{"cell": "A1", "data": "Some data"}]
            },
            "second": {
                start_row: 3,
                start_col: 2,
                cells: [{"cell": "B3", "data": "other"}]
            }
        };
        this.currentSheet = 'first';
    }

    getCurrentSheet() {
        return this.sheets[this.currentSheet];
    }

    getSheet(name) {
        return this.sheets[name];
    }

    setCurrentSheet(name) {
        if (this.sheets[name]) {
            this.currentSheet = name;
        }
    }

    getSheetNames() {
        return Object.keys(this.sheets);
    }

    updateCell(sheetName, cellId, data) {
        const sheet = this.sheets[sheetName];
        const existingCell = sheet.cells.find(item => item.cell === cellId);
        if (existingCell) {
            if (data === '') {
                // Remove cell if data is empty
                sheet.cells = sheet.cells.filter(item => item.cell !== cellId);
            } else {
                existingCell.data = data;
            }
        } else if (data !== '') {
            sheet.cells.push({ "cell": cellId, "data": data });
        }
    }

    updateViewport(sheetName, start_row, start_col) {
        const sheet = this.sheets[sheetName];
        sheet.start_row = start_row;
        sheet.start_col = start_col;
    }
}

// ViewModel - holds view state and provides computed values
class ViewModel {
    constructor(dataHolder, sheetName) {
        this.dataHolder = dataHolder;
        this.sheetName = sheetName;
        this.MAX_ROW = 999;
        this.MAX_COL_INDEX = 18278; // ZZZ
        this.VIEWPORT_WIDTH_COLS = 7;
        this.VIEWPORT_HEIGHT_ROWS = 7;
    }

    getStartRow() {
        return this.dataHolder.getSheet(this.sheetName).start_row;
    }

    getStartCol() {
        return this.dataHolder.getSheet(this.sheetName).start_col;
    }

    getEndRow() {
        return Math.min(this.getStartRow() + this.VIEWPORT_HEIGHT_ROWS - 1, this.MAX_ROW);
    }

    getEndCol() {
        return Math.min(this.getStartCol() + this.VIEWPORT_WIDTH_COLS - 1, this.MAX_COL_INDEX);
    }

    getCells() {
        return this.dataHolder.getSheet(this.sheetName).cells;
    }

    canMoveUp() {
        return this.getStartRow() > 1;
    }

    canMoveDown() {
        return this.getStartRow() < this.MAX_ROW - this.VIEWPORT_HEIGHT_ROWS + 1;
    }

    canMoveLeft() {
        return this.getStartCol() > 1;
    }

    canMoveRight() {
        return this.getStartCol() < this.MAX_COL_INDEX - this.VIEWPORT_WIDTH_COLS + 1;
    }
}

// SheetView - renders current state of ViewModel
class SheetView {
    constructor(containerId, viewModel, onCellEdit) {
        this.container = document.getElementById(containerId);
        this.viewModel = viewModel;
        this.onCellEdit = onCellEdit;
    }

    getColumnLetter(colIndex) {
        let letter = '';
        let index = colIndex;
        while (index > 0) {
            index--;
            letter = String.fromCharCode(65 + (index % 26)) + letter;
            index = Math.floor(index / 26);
        }
        return letter;
    }

    render() {
        const start_row = this.viewModel.getStartRow();
        const start_col = this.viewModel.getStartCol();
        const end_row = this.viewModel.getEndRow();
        const end_col = this.viewModel.getEndCol();
        const cells = this.viewModel.getCells();

        let table = '<table><thead><tr><th>Row</th>';
        for (let col = start_col; col <= end_col; col++) {
            table += `<th>${this.getColumnLetter(col)}</th>`;
        }
        table += '</tr></thead><tbody>';

        for (let row = start_row; row <= end_row; row++) {
            table += `<tr><td contenteditable="false">${row}</td>`;
            for (let col = start_col; col <= end_col; col++) {
                const cellId = this.getColumnLetter(col) + row;
                const cellData = cells.find(item => item.cell === cellId);
                table += `<td contenteditable="true" data-cell="${cellId}">${cellData ? this.escapeHtml(cellData.data) : ''}</td>`;
            }
            table += '</tr>';
        }
        table += '</tbody></table>';

        this.container.innerHTML = table;
        this.attachEditListeners();
    }

    escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    attachEditListeners() {
        const editableCells = this.container.querySelectorAll('td[contenteditable="true"]');
        editableCells.forEach(cell => {
            cell.removeEventListener('blur', this.handleBlur);
            this.handleBlur = (event) => {
                const cellId = event.target.getAttribute('data-cell');
                const newValue = event.target.textContent;
                if (this.onCellEdit) {
                    this.onCellEdit(cellId, newValue);
                }
            };
            cell.addEventListener('blur', this.handleBlur);
        });
    }
}

// NavButtonsController - handles button clicks for navigation
class NavButtonsController {
    constructor(dataHolder, viewModel, onViewportChange) {
        this.dataHolder = dataHolder;
        this.viewModel = viewModel;
        this.onViewportChange = onViewportChange;
    }

    moveToTop() {
        this.dataHolder.updateViewport(this.viewModel.sheetName, 1, this.viewModel.getStartCol());
        this.onViewportChange();
    }

    moveToBottom() {
        const newStartRow = this.viewModel.MAX_ROW - this.viewModel.VIEWPORT_HEIGHT_ROWS + 1;
        this.dataHolder.updateViewport(this.viewModel.sheetName, newStartRow, this.viewModel.getStartCol());
        this.onViewportChange();
    }

    moveToLeft() {
        this.dataHolder.updateViewport(this.viewModel.sheetName, this.viewModel.getStartRow(), 1);
        this.onViewportChange();
    }

    moveToRight() {
        const newStartCol = this.viewModel.MAX_COL_INDEX - this.viewModel.VIEWPORT_WIDTH_COLS + 1;
        this.dataHolder.updateViewport(this.viewModel.sheetName, this.viewModel.getStartRow(), newStartCol);
        this.onViewportChange();
    }

    stepUp() {
        if (this.viewModel.canMoveUp()) {
            this.dataHolder.updateViewport(this.viewModel.sheetName, this.viewModel.getStartRow() - 1, this.viewModel.getStartCol());
            this.onViewportChange();
        }
    }

    stepDown() {
        if (this.viewModel.canMoveDown()) {
            this.dataHolder.updateViewport(this.viewModel.sheetName, this.viewModel.getStartRow() + 1, this.viewModel.getStartCol());
            this.onViewportChange();
        }
    }

    stepLeft() {
        if (this.viewModel.canMoveLeft()) {
            this.dataHolder.updateViewport(this.viewModel.sheetName, this.viewModel.getStartRow(), this.viewModel.getStartCol() - 1);
            this.onViewportChange();
        }
    }

    stepRight() {
        if (this.viewModel.canMoveRight()) {
            this.dataHolder.updateViewport(this.viewModel.sheetName, this.viewModel.getStartRow(), this.viewModel.getStartCol() + 1);
            this.onViewportChange();
        }
    }
}

// CellsEditablesController - handles editing of table cells
class CellsEditablesController {
    constructor(dataHolder) {
        this.dataHolder = dataHolder;
    }

    handleCellEdit(sheetName, cellId, newValue) {
        this.dataHolder.updateCell(sheetName, cellId, newValue);
    }
}

// Application Controller - orchestrates all components
class AppController {
    constructor() {
        this.dataHolder = new DataHolder();
        this.cellsController = new CellsEditablesController(this.dataHolder);
        this.init();
    }

    init() {
        this.renderSheetsNav();
        this.updateViewAndViewModel();
        this.attachGlobalButtonHandlers();
        this.updatePositionInfo();
    }

    updateViewAndViewModel() {
        this.viewModel = new ViewModel(this.dataHolder, this.dataHolder.currentSheet);
        this.sheetView = new SheetView('table-container', this.viewModel, (cellId, newValue) => {
            this.cellsController.handleCellEdit(this.dataHolder.currentSheet, cellId, newValue);
            this.sheetView.render();
        });
        this.navController = new NavButtonsController(this.dataHolder, this.viewModel, () => {
            this.updateViewAndViewModel();
            this.updatePositionInfo();
        });
        this.sheetView.render();
    }

    renderSheetsNav() {
        const nav = document.getElementById('sheets-nav');
        nav.innerHTML = '';
        this.dataHolder.getSheetNames().forEach(sheetName => {
            const link = document.createElement('span');
            link.className = `sheet-link ${this.dataHolder.currentSheet === sheetName ? 'active' : ''}`;
            link.textContent = sheetName;
            link.onclick = () => this.switchSheet(sheetName);
            nav.appendChild(link);
        });
    }

    switchSheet(sheetName) {
        this.dataHolder.setCurrentSheet(sheetName);
        this.renderSheetsNav();
        this.updateViewAndViewModel();
        this.updatePositionInfo();
    }

    attachGlobalButtonHandlers() {
        window.moveToTop = () => this.navController.moveToTop();
        window.moveToBottom = () => this.navController.moveToBottom();
        window.stepUp = () => this.navController.stepUp();
        window.stepDown = () => this.navController.stepDown();
        window.moveToLeft = () => this.navController.moveToLeft();
        window.moveToRight = () => this.navController.moveToRight();
        window.stepLeft = () => this.navController.stepLeft();
        window.stepRight = () => this.navController.stepRight();
    }

    getColumnLetter(colIndex) {
        let letter = '';
        let index = colIndex;
        while (index > 0) {
            index--;
            letter = String.fromCharCode(65 + (index % 26)) + letter;
            index = Math.floor(index / 26);
        }
        return letter;
    }

    updatePositionInfo() {
        const sheet = this.dataHolder.getCurrentSheet();
        const end_row = sheet.start_row + 6; // VIEWPORT_HEIGHT_ROWS - 1
        const end_col = sheet.start_col + 6; // VIEWPORT_WIDTH_COLS - 1
        document.getElementById('position-info').textContent =
            `Viewport: Rows ${sheet.start_row}-${end_row}, Cols ${sheet.start_col}-${end_col} (${this.getColumnLetter(sheet.start_col)}-${this.getColumnLetter(end_col)})`;
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AppController();
});
