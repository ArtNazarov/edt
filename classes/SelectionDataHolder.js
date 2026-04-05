// SelectionDataHolder - Stores selection data (cells, columns, rows, ranges) per sheet
export default class SelectionDataHolder {
    constructor() {
        // Store selections per sheet
        this.sheetSelections = new Map(); // sheetName -> selection data
        this.currentSheet = null;
    }

    // Get or create selection for a sheet
    getSheetSelection(sheetName) {
        if (!this.sheetSelections.has(sheetName)) {
            this.sheetSelections.set(sheetName, {
                selectedColumns: new Set(),
                selectedRows: new Set(),
                selectedRanges: [],
                selectedCellsMap: new Map(),
                focusRow: 1,
                focusCol: 1,
                rangeAnchor: null,
                selectionAll: false  // Flag for "Select All" state
            });
        }
        return this.sheetSelections.get(sheetName);
    }

    setCurrentSheet(sheetName) {
        this.currentSheet = sheetName;
    }

    // Get current selection data
    getCurrent() {
        if (!this.currentSheet) return null;
        return this.getSheetSelection(this.currentSheet);
    }

    // ---- Selection All flag ----
    setSelectionAll(enabled) {
        const selection = this.getCurrent();
        selection.selectionAll = enabled;
        if (enabled) {
            // Clear other selections when Select All is active
            selection.selectedColumns.clear();
            selection.selectedRows.clear();
            selection.selectedRanges = [];
            selection.selectedCellsMap.clear();
        }
    }

    isSelectionAll() {
        const selection = this.getCurrent();
        return selection ? selection.selectionAll : false;
    }

    // ---- Column operations ----
    toggleColumn(colIdx) {
        const selection = this.getCurrent();
        if (selection.selectionAll) {
            selection.selectionAll = false;
            selection.selectedRanges = [];
        }
        if (selection.selectedColumns.has(colIdx)) {
            selection.selectedColumns.delete(colIdx);
        } else {
            selection.selectedColumns.add(colIdx);
        }
    }

    isColumnSelected(colIdx) {
        const selection = this.getCurrent();
        return selection ? selection.selectedColumns.has(colIdx) : false;
    }

    getSelectedColumns() {
        const selection = this.getCurrent();
        return selection ? Array.from(selection.selectedColumns) : [];
    }

    // ---- Row operations ----
    toggleRow(rowIdx) {
        const selection = this.getCurrent();
        if (selection.selectionAll) {
            selection.selectionAll = false;
            selection.selectedRanges = [];
        }
        if (selection.selectedRows.has(rowIdx)) {
            selection.selectedRows.delete(rowIdx);
        } else {
            selection.selectedRows.add(rowIdx);
        }
    }

    isRowSelected(rowIdx) {
        const selection = this.getCurrent();
        return selection ? selection.selectedRows.has(rowIdx) : false;
    }

    getSelectedRows() {
        const selection = this.getCurrent();
        return selection ? Array.from(selection.selectedRows) : [];
    }

    // ---- Cell operations ----
    toggleCell(rowIdx, colIdx) {
        const selection = this.getCurrent();
        if (selection.selectionAll) {
            selection.selectionAll = false;
            selection.selectedRanges = [];
        }
        const key = `${rowIdx},${colIdx}`;
        if (selection.selectedCellsMap.has(key)) {
            selection.selectedCellsMap.delete(key);
        } else {
            selection.selectedCellsMap.set(key, true);
        }
    }

    isCellSelected(rowIdx, colIdx) {
        const selection = this.getCurrent();
        return selection ? selection.selectedCellsMap.has(`${rowIdx},${colIdx}`) : false;
    }

    getSelectedCells() {
        const selection = this.getCurrent();
        if (!selection) return [];
        const cells = [];
        for (const key of selection.selectedCellsMap.keys()) {
            const [row, col] = key.split(',').map(Number);
            cells.push({ row, col });
        }
        return cells;
    }

    // ---- Range operations ----
    setRange(startRow, startCol, endRow, endCol) {
        const selection = this.getCurrent();
        selection.selectionAll = false;
        selection.selectedRanges = [{
            startRow: Math.min(startRow, endRow),
            startCol: Math.min(startCol, endCol),
            endRow: Math.max(startRow, endRow),
            endCol: Math.max(startCol, endCol)
        }];
    }

    clearRanges() {
        const selection = this.getCurrent();
        selection.selectedRanges = [];
    }

    getSelectedRanges() {
        const selection = this.getCurrent();
        return selection ? [...selection.selectedRanges] : [];
    }

    // ---- Focus management ----
    setFocus(row, col) {
        const selection = this.getCurrent();
        selection.focusRow = row;
        selection.focusCol = col;
    }

    getFocus() {
        const selection = this.getCurrent();
        return selection ? { row: selection.focusRow, col: selection.focusCol } : { row: 1, col: 1 };
    }

    setRangeAnchor(row, col) {
        const selection = this.getCurrent();
        selection.rangeAnchor = { row, col };
    }

    getRangeAnchor() {
        const selection = this.getCurrent();
        return selection.rangeAnchor ? { ...selection.rangeAnchor } : null;
    }

    clearRangeAnchor() {
        const selection = this.getCurrent();
        selection.rangeAnchor = null;
    }

    // Update range from anchor to current focus
    updateRangeFromAnchor() {
        const selection = this.getCurrent();
        if (!selection.rangeAnchor) return;
        this.setRange(selection.rangeAnchor.row, selection.rangeAnchor.col, selection.focusRow, selection.focusCol);
    }

    // Clear all selections for current sheet
    clearAllSelections() {
        const selection = this.getCurrent();
        selection.selectedColumns.clear();
        selection.selectedRows.clear();
        selection.selectedRanges = [];
        selection.selectedCellsMap.clear();
        selection.selectionAll = false;
        selection.rangeAnchor = null;
    }

    // Get all selected cell values with their coordinates
    getAllSelectedCells() {
        const selection = this.getCurrent();
        if (!selection) return [];

        const cells = [];

        if (selection.selectionAll) {
            cells.push({ type: 'all' });
            return cells;
        }

        // Add selected columns
        for (const col of selection.selectedColumns) {
            cells.push({ type: 'column', col });
        }

        // Add selected rows
        for (const row of selection.selectedRows) {
            cells.push({ type: 'row', row });
        }

        // Add selected ranges
        for (const range of selection.selectedRanges) {
            cells.push({ type: 'range', ...range });
        }

        // Add selected individual cells
        for (const [key] of selection.selectedCellsMap) {
            const [row, col] = key.split(',').map(Number);
            cells.push({ type: 'cell', row, col });
        }

        return cells;
    }

    // Get serialized data for saving
    serialize() {
        const allSheetsData = {};
        for (const [sheetName, selection] of this.sheetSelections) {
            allSheetsData[sheetName] = {
                selectedColumns: Array.from(selection.selectedColumns),
                selectedRows: Array.from(selection.selectedRows),
                selectedRanges: selection.selectedRanges.map(r => ({ ...r })),
                selectedCells: Array.from(selection.selectedCellsMap.keys()),
                focusRow: selection.focusRow,
                focusCol: selection.focusCol,
                selectionAll: selection.selectionAll || false
            };
        }
        return {
            currentSheet: this.currentSheet,
            sheets: allSheetsData
        };
    }

    // Deserialize from saved data
    deserialize(data) {
        if (!data) return;

        this.sheetSelections.clear();
        if (data.sheets) {
            for (const [sheetName, sheetData] of Object.entries(data.sheets)) {
                const selection = {
                    selectedColumns: new Set(sheetData.selectedColumns || []),
                    selectedRows: new Set(sheetData.selectedRows || []),
                    selectedRanges: (sheetData.selectedRanges || []).map(r => ({ ...r })),
                    selectedCellsMap: new Map(),
                    focusRow: sheetData.focusRow || 1,
                    focusCol: sheetData.focusCol || 1,
                    rangeAnchor: null,
                    selectionAll: sheetData.selectionAll || false
                };
                if (sheetData.selectedCells) {
                    for (const key of sheetData.selectedCells) {
                        selection.selectedCellsMap.set(key, true);
                    }
                }
                this.sheetSelections.set(sheetName, selection);
            }
        }
        this.currentSheet = data.currentSheet || null;
    }
}
