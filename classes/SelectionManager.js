// SelectionManager - Handles selection events and coordinates between data and view
import SelectionDataHolder from './SelectionDataHolder.js';
import SelectionViewDrawer from './SelectionViewDrawer.js';
import ViewModel from './ViewModel.js';
import MoveFocusUpAction from '../actions/MoveFocusUpAction.js';
import MoveFocusDownAction from '../actions/MoveFocusDownAction.js';
import MoveFocusLeftAction from '../actions/MoveFocusLeftAction.js';
import MoveFocusRightAction from '../actions/MoveFocusRightAction.js';
import SelectAllCellsAction from '../actions/SelectAllCellsAction.js';

export default class SelectionManager {
    constructor(appController, tableContainer) {
        this.appController = appController;
        this.tableContainer = tableContainer;
        this.data = new SelectionDataHolder();
        this.view = new SelectionViewDrawer();
        this.onSelectionChange = null;

        // Initialize move actions
        this.moveUpAction = new MoveFocusUpAction(this);
        this.moveDownAction = new MoveFocusDownAction(this);
        this.moveLeftAction = new MoveFocusLeftAction(this);
        this.moveRightAction = new MoveFocusRightAction(this);

        // Initialize select all action
        this.selectAllAction = new SelectAllCellsAction(this);

        // Set current sheet
        const currentSheet = this.appController.dataHolder.currentSheet;
        this.data.setCurrentSheet(currentSheet);

        this.init();
    }

    init() {
        this.attachEventListeners();
    }

    // Call this when switching sheets
    onSheetSwitch(sheetName) {
        this.data.setCurrentSheet(sheetName);
        this.render();
        this.notifySelectionChange();
    }

    // Get viewport column index for a cell (1-based position within viewport)
    getViewportCol(cellCol) {
        const startCol = this.appController.viewModel.getStartCol();
        const endCol = this.appController.viewModel.getEndCol();

        if (cellCol < startCol || cellCol > endCol) return -1;
        return cellCol - startCol + 1;
    }

    // Get viewport row index for a cell (1-based position within viewport)
    getViewportRow(cellRow) {
        const startRow = this.appController.viewModel.getStartRow();
        const endRow = this.appController.viewModel.getEndRow();

        if (cellRow < startRow || cellRow > endRow) return -1;
        return cellRow - startRow + 1;
    }

    attachEventListeners() {
        if (!this.tableContainer) return;

        // Keyboard handling on document
        document.addEventListener('keydown', (e) => {
            // Only handle if no input/textarea is focused
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.getAttribute('contenteditable') === 'true')) {
                return;
            }

            const key = e.key;
            const shiftKey = e.shiftKey;
            const ctrlKey = e.ctrlKey || e.metaKey;

            // Handle Page Up / Page Down
            if (key === 'PageUp') {
                e.preventDefault();
                this.moveToTop();
                return;
            }
            if (key === 'PageDown') {
                e.preventDefault();
                this.moveToBottom();
                return;
            }

            // Handle Home / End
            if (key === 'Home') {
                e.preventDefault();
                if (ctrlKey) {
                    this.moveToFirstCell();
                } else {
                    this.moveToLeftEdge();
                }
                return;
            }
            if (key === 'End') {
                e.preventDefault();
                if (ctrlKey) {
                    this.moveToLastDataCell();
                } else {
                    this.moveToRightEdge();
                }
                return;
            }

            // Handle Arrow keys
            if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
                e.preventDefault();

                let moveResult = null;
                if (key === 'ArrowUp') moveResult = this.moveUpAction.execute();
                else if (key === 'ArrowDown') moveResult = this.moveDownAction.execute();
                else if (key === 'ArrowLeft') moveResult = this.moveLeftAction.execute();
                else if (key === 'ArrowRight') moveResult = this.moveRightAction.execute();

                if (moveResult && moveResult.moved) {
                    this.applyMoveFocus(moveResult, shiftKey);
                }
                return;
            }

            // Ctrl + A (select all)
            if (ctrlKey && key === 'a') {
                e.preventDefault();
                this.selectAll();
                return;
            }

            // Escape key clear all
            if (key === 'Escape') {
                e.preventDefault();
                this.clearAllSelections();
                return;
            }
        });

        this.attachCellEventListeners();
    }

    async applyMoveFocus(moveResult, shiftKey) {
        const currentRow = this.data.getFocus().row;
        const currentCol = this.data.getFocus().col;
        const { newRow, newCol, needsViewportMove, newStartRow, newStartCol } = moveResult;

        if (needsViewportMove) {
            // Update the viewport in DataHolder
            this.appController.dataHolder.updateViewport(
                this.appController.dataHolder.currentSheet,
                newStartRow,
                newStartCol
            );

            // Update the view model to reflect new viewport
            const newViewModel = new ViewModel(
                this.appController.dataHolder,
                this.appController.dataHolder.currentSheet,
                this.appController.computationEngine,
                this.appController.showFormulas
            );
            newViewModel.appController = this.appController;

            // Update all references
            this.appController.viewModel = newViewModel;
            this.appController.sheetView.viewModel = newViewModel;

            // Re-render the sheet
            await this.appController.sheetView.render();

            // Update table container reference
            this.tableContainer = document.getElementById('table-container');

            // Set focus to the new cell
            this.data.setFocus(newRow, newCol);
            this.render();
            this.scrollToFocus();
            this.notifySelectionChange();
        } else {
            // Just update focus within same viewport
            if (shiftKey) {
                // SHIFT + ARROW: extend range selection
                if (!this.data.getRangeAnchor()) {
                    this.data.setRangeAnchor(currentRow, currentCol);
                }
                this.data.setFocus(newRow, newCol);
                this.data.updateRangeFromAnchor();
            } else {
                // normal arrow: remove range if exists, reset anchor
                if (this.data.getSelectedRanges().length > 0) {
                    this.data.clearRanges();
                }
                if (this.data.isSelectionAll()) {
                    this.data.setSelectionAll(false);
                }
                this.data.clearRangeAnchor();
                this.data.setFocus(newRow, newCol);
            }

            this.render();
            this.scrollToFocus();
            this.notifySelectionChange();
        }
    }

    attachCellEventListeners() {
        if (!this.tableContainer) return;

        // Column header clicks (th elements, skip first row header column)
        const headers = this.tableContainer.querySelectorAll('thead th');
        headers.forEach((th, idx) => {
            if (idx === 0) return;
            const colIndex = parseInt(th.getAttribute('data-col'));
            if (isNaN(colIndex)) return;

            th.removeEventListener('click', this.handleColumnClick);
            this.handleColumnClick = (e) => {
                e.stopPropagation();
                this.toggleColumn(colIndex);
            };
            th.addEventListener('click', this.handleColumnClick);
        });

        // Row header clicks
        const rowHeaders = this.tableContainer.querySelectorAll('tbody td.row-header-cell');
        rowHeaders.forEach((cell) => {
            const rowIndex = parseInt(cell.getAttribute('data-row'));
            if (isNaN(rowIndex)) return;

            cell.removeEventListener('click', this.handleRowClick);
            this.handleRowClick = (e) => {
                e.stopPropagation();
                this.toggleRow(rowIndex);
            };
            cell.addEventListener('click', this.handleRowClick);
        });
    }

    refreshEventListeners() {
        // Event listeners are re-attached on each render via SheetView
    }

    toggleColumn(colIdx) {
        if (this.data.isSelectionAll()) {
            this.data.setSelectionAll(false);
        }
        this.data.toggleColumn(colIdx);
        this.render();
        this.notifySelectionChange();
    }

    toggleRow(rowIdx) {
        if (this.data.isSelectionAll()) {
            this.data.setSelectionAll(false);
        }
        this.data.toggleRow(rowIdx);
        this.render();
        this.notifySelectionChange();
    }

    toggleCell(rowIdx, colIdx) {
        if (this.data.isSelectionAll()) {
            this.data.setSelectionAll(false);
        }
        this.data.toggleCell(rowIdx, colIdx);
        this.render();
        this.notifySelectionChange();
    }

    selectAll() {
        // Use the SelectAllCellsAction
        this.selectAllAction.execute();
    }

    clearAllSelections() {
        this.data.clearAllSelections();
        this.render();
        this.notifySelectionChange();
    }

    getViewportRowCount() {
        return this.appController.viewModel.VIEWPORT_HEIGHT_ROWS;
    }

    getViewportColCount() {
        return this.appController.viewModel.VIEWPORT_WIDTH_COLS;
    }

    // Move to top edge (row 1)
    moveToTop() {
        const currentCol = this.data.getFocus().col;
        const viewModel = this.appController.viewModel;

        if (viewModel.getStartRow() > 1) {
            this.appController.dataHolder.updateViewport(
                this.appController.dataHolder.currentSheet,
                1,
                viewModel.getStartCol()
            );
            this.appController.updateViewAndViewModel();
        }

        this.data.setFocus(1, currentCol);
        this.scrollToFocus();
        this.render();
        this.notifySelectionChange();
    }

    // Move to bottom edge (last row)
    moveToBottom() {
        const currentCol = this.data.getFocus().col;
        const viewModel = this.appController.viewModel;
        const maxStartRow = viewModel.MAX_ROW - viewModel.VIEWPORT_HEIGHT_ROWS + 1;

        if (viewModel.getStartRow() < maxStartRow) {
            this.appController.dataHolder.updateViewport(
                this.appController.dataHolder.currentSheet,
                maxStartRow,
                viewModel.getStartCol()
            );
            this.appController.updateViewAndViewModel();
        }

        const maxRow = this.getMaxDataRow();
        this.data.setFocus(maxRow, currentCol);
        this.scrollToFocus();
        this.render();
        this.notifySelectionChange();
    }

    // Move to left edge (column 1)
    moveToLeftEdge() {
        const currentRow = this.data.getFocus().row;
        const viewModel = this.appController.viewModel;

        if (viewModel.getStartCol() > 1) {
            this.appController.dataHolder.updateViewport(
                this.appController.dataHolder.currentSheet,
                viewModel.getStartRow(),
                1
            );
            this.appController.updateViewAndViewModel();
        }

        this.data.setFocus(currentRow, 1);
        this.scrollToFocus();
        this.render();
        this.notifySelectionChange();
    }

    // Move to right edge (last column)
    moveToRightEdge() {
        const currentRow = this.data.getFocus().row;
        const viewModel = this.appController.viewModel;
        const maxStartCol = viewModel.MAX_COL_INDEX - viewModel.VIEWPORT_WIDTH_COLS + 1;

        if (viewModel.getStartCol() < maxStartCol) {
            this.appController.dataHolder.updateViewport(
                this.appController.dataHolder.currentSheet,
                viewModel.getStartRow(),
                maxStartCol
            );
            this.appController.updateViewAndViewModel();
        }

        const maxCol = this.getMaxDataCol();
        this.data.setFocus(currentRow, maxCol);
        this.scrollToFocus();
        this.render();
        this.notifySelectionChange();
    }

    // Move to first cell (A1)
    moveToFirstCell() {
        const viewModel = this.appController.viewModel;

        if (viewModel.getStartRow() > 1 || viewModel.getStartCol() > 1) {
            this.appController.dataHolder.updateViewport(
                this.appController.dataHolder.currentSheet,
                1,
                1
            );
            this.appController.updateViewAndViewModel();
        }

        this.data.setFocus(1, 1);
        this.scrollToFocus();
        this.render();
        this.notifySelectionChange();
    }

    // Move to last cell with data
    moveToLastDataCell() {
        const viewModel = this.appController.viewModel;
        const maxRow = this.getMaxDataRow();
        const maxCol = this.getMaxDataCol();
        const maxStartRow = viewModel.MAX_ROW - viewModel.VIEWPORT_HEIGHT_ROWS + 1;
        const maxStartCol = viewModel.MAX_COL_INDEX - viewModel.VIEWPORT_WIDTH_COLS + 1;

        let newStartRow = viewModel.getStartRow();
        let newStartCol = viewModel.getStartCol();

        if (maxRow > viewModel.getEndRow()) {
            newStartRow = Math.min(maxStartRow, maxRow - Math.floor(viewModel.VIEWPORT_HEIGHT_ROWS / 2));
        }
        if (maxCol > viewModel.getEndCol()) {
            newStartCol = Math.min(maxStartCol, maxCol - Math.floor(viewModel.VIEWPORT_WIDTH_COLS / 2));
        }

        if (newStartRow !== viewModel.getStartRow() || newStartCol !== viewModel.getStartCol()) {
            this.appController.dataHolder.updateViewport(
                this.appController.dataHolder.currentSheet,
                newStartRow,
                newStartCol
            );
            this.appController.updateViewAndViewModel();
        }

        this.data.setFocus(maxRow, maxCol);
        this.scrollToFocus();
        this.render();
        this.notifySelectionChange();
    }

    // Get the maximum row that has data
    getMaxDataRow() {
        const currentSheet = this.appController.dataHolder.currentSheet;
        const sheet = this.appController.dataHolder.getSheet(currentSheet);
        let maxRow = 1;

        if (sheet && sheet.cells) {
            for (const cell of sheet.cells) {
                const rowMatch = cell.cell.match(/[0-9]+/);
                if (rowMatch) {
                    const row = parseInt(rowMatch[0]);
                    if (row > maxRow) maxRow = row;
                }
            }
        }

        const viewportRows = this.getMaxRows();
        if (viewportRows > maxRow) maxRow = viewportRows;

        return Math.min(maxRow, 999);
    }

    // Get the maximum column that has data
    getMaxDataCol() {
        const currentSheet = this.appController.dataHolder.currentSheet;
        const sheet = this.appController.dataHolder.getSheet(currentSheet);
        let maxCol = 1;

        if (sheet && sheet.cells) {
            for (const cell of sheet.cells) {
                const colMatch = cell.cell.match(/[A-Z]+/);
                if (colMatch) {
                    const col = this.columnToNumber(colMatch[0]);
                    if (col > maxCol) maxCol = col;
                }
            }
        }

        const viewportCols = this.getMaxCols();
        if (viewportCols > maxCol) maxCol = viewportCols;

        return Math.min(maxCol, this.appController.viewModel?.MAX_COL_INDEX || 100);
    }

    // Helper: Convert column letter to number
    columnToNumber(col) {
        let result = 0;
        for (let i = 0; i < col.length; i++) {
            result = result * 26 + (col.charCodeAt(i) - 64);
        }
        return result;
    }

    getMaxRows() {
        const rows = this.tableContainer?.querySelectorAll('tbody tr');
        return rows ? rows.length : 0;
    }

    getMaxCols() {
        const headers = this.tableContainer?.querySelectorAll('thead th');
        return headers ? headers.length - 1 : 0;
    }

    scrollToFocus() {
        const focus = this.data.getFocus();
        const focusCell = this.tableContainer?.querySelector(`td[data-row="${focus.row}"][data-col="${focus.col}"]`);
        if (focusCell) {
            focusCell.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }

    render() {
        if (this.tableContainer) {
            this.view.render(this.data, this.tableContainer);
        }
    }

    updateFocus() {
        if (this.tableContainer) {
            this.view.updateFocus(this.data, this.tableContainer);
        }
    }

 notifySelectionChange() {
    // Update the selection status display
    const statusElement = document.getElementById('selection-status-text');
    if (statusElement) {
        statusElement.textContent = this.getSelectionStatusText();
    }

    if (this.onSelectionChange) {
        this.onSelectionChange(this.getSelectionInfo());
    }
}

 getSelectionInfo() {
        const focus = this.data.getFocus();
        const isAllSelected = this.data.isSelectionAll();

        return {
            selectedColumns: this.data.getSelectedColumns(),
            selectedRows: this.data.getSelectedRows(),
            selectedRanges: this.data.getSelectedRanges(),
            selectedCells: this.data.getSelectedCells(),
            focusRow: focus.row,
            focusCol: focus.col,
            selectionAll: isAllSelected,
            totalCells: isAllSelected ? 'ALL' : this.getSelectionValues().length
        };
    }

    getSelectionValues() {
        if (this.data.isSelectionAll()) {
            const currentSheet = this.appController.dataHolder.currentSheet;
            const sheet = this.appController.dataHolder.getSheet(currentSheet);
            const values = [];

            if (sheet && sheet.cells) {
                for (const cell of sheet.cells) {
                    const colMatch = cell.cell.match(/[A-Z]+/);
                    const rowMatch = cell.cell.match(/[0-9]+/);
                    if (colMatch && rowMatch) {
                        const row = parseInt(rowMatch[0]);
                        const col = this.columnToNumber(colMatch[0]);
                        values.push({ row, col, value: cell.data });
                    }
                }
            }
            return values;
        }

        const values = [];
        const maxRows = this.getMaxRows();
        const maxCols = this.getMaxCols();
        const addedCells = new Set();
        const selection = this.data.getCurrent();

        if (!selection) return values;

        const addCell = (row, col) => {
            if (row < 1 || row > maxRows) return;
            if (col < 1 || col > maxCols) return;
            const key = `${row},${col}`;
            if (addedCells.has(key)) return;
            addedCells.add(key);

            const cellElement = this.tableContainer?.querySelector(`td[data-row="${row}"][data-col="${col}"]`);
            const value = cellElement?.textContent || '';
            values.push({ row, col, value });
        };

        for (const col of selection.selectedColumns) {
            for (let row = 1; row <= maxRows; row++) {
                addCell(row, col);
            }
        }

        for (const row of selection.selectedRows) {
            for (let col = 1; col <= maxCols; col++) {
                addCell(row, col);
            }
        }

        for (const range of selection.selectedRanges) {
            for (let row = range.startRow; row <= range.endRow; row++) {
                for (let col = range.startCol; col <= range.endCol; col++) {
                    addCell(row, col);
                }
            }
        }

        for (const cell of this.data.getSelectedCells()) {
            addCell(cell.row, cell.col);
        }

        return values;
    }

    serialize() {
        return this.data.serialize();
    }

    deserialize(data) {
        this.data.deserialize(data);
        this.render();
        this.notifySelectionChange();
    }

    // Add this method to get selection status text
getSelectionStatusText() {
    const selection = this.data.getCurrent();
    if (!selection) return 'None';

    if (selection.selectionAll === true) {
        return '✅ All Cells Selected (entire sheet)';
    }

    const parts = [];
    if (selection.selectedColumns && selection.selectedColumns.size > 0) {
        const cols = Array.from(selection.selectedColumns).map(c => this.appController.getColumnLetter(c)).join(', ');
        parts.push(`Columns: ${cols}`);
    }
    if (selection.selectedRows && selection.selectedRows.size > 0) {
        const rows = Array.from(selection.selectedRows).join(', ');
        parts.push(`Rows: ${rows}`);
    }
    if (selection.selectedRanges && selection.selectedRanges.length > 0) {
        const ranges = selection.selectedRanges.map(r => {
            const startCol = this.appController.getColumnLetter(r.startCol);
            const endCol = this.appController.getColumnLetter(r.endCol);
            return `${startCol}${r.startRow}:${endCol}${r.endRow}`;
        }).join(', ');
        parts.push(`Range: ${ranges}`);
    }
    if (selection.selectedCellsMap && selection.selectedCellsMap.size > 0) {
        const cells = Array.from(selection.selectedCellsMap.keys()).map(key => {
            const [row, col] = key.split(',').map(Number);
            return `${this.appController.getColumnLetter(col)}${row}`;
        }).join(', ');
        parts.push(`Cells: ${cells}`);
    }

    return parts.length > 0 ? parts.join(' | ') : 'None';
}
}
