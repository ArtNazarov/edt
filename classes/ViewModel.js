// ViewModel - Provides computed properties for the current view state
export default class ViewModel {
    constructor(dataHolder, sheetName, computationEngine, showFormulas = true) {
        this.dataHolder = dataHolder;
        this.sheetName = sheetName;
        this.computationEngine = computationEngine;
        this.showFormulas = showFormulas;
        this.MAX_ROW = 999;
        // Convert 'ZZZ' to column number: 26^3 + 26^2 + 26 = 18278
        this.MAX_COL_INDEX = this.colNameToColNumber('ZZZ');
        this.VIEWPORT_WIDTH_COLS = 7;
        this.VIEWPORT_HEIGHT_ROWS = 7;
    }

    // Convert Excel column letter to number (A=1, B=2, Z=26, AA=27, ZZZ=18278)
    colNameToColNumber(colName) {
        let result = 0;
        for (let i = 0; i < colName.length; i++) {
            result = result * 26 + (colName.charCodeAt(i) - 64);
        }
        return result;
    }

    // Convert column number to Excel column letter
    colNumberToColName(colNum) {
        let result = '';
        let num = colNum;
        while (num > 0) {
            num--;
            result = String.fromCharCode(65 + (num % 26)) + result;
            num = Math.floor(num / 26);
        }
        return result;
    }

    setShowFormulas(show) {
        this.showFormulas = show;
        if (!show) {
            this.computationEngine.clearCache(this.sheetName);
        }
    }

    getStartRow() {
        const sheet = this.dataHolder.getSheet(this.sheetName);
        let startRow = sheet ? sheet.start_row : 1;
        // Ensure startRow is within bounds
        const maxStartRow = this.MAX_ROW - this.VIEWPORT_HEIGHT_ROWS + 1;
        return Math.max(1, Math.min(startRow, maxStartRow));
    }

    getStartCol() {
        const sheet = this.dataHolder.getSheet(this.sheetName);
        let startCol = sheet ? sheet.start_col : 1;
        // Ensure startCol is within bounds
        const maxStartCol = this.MAX_COL_INDEX - this.VIEWPORT_WIDTH_COLS + 1;
        return Math.max(1, Math.min(startCol, maxStartCol));
    }

    getEndRow() {
        return Math.min(this.getStartRow() + this.VIEWPORT_HEIGHT_ROWS - 1, this.MAX_ROW);
    }

   getEndCol() {
    // The end column should be start_col + 6 (since 7 columns total, indices 0-6)
    // But we need to ensure we don't exceed MAX_COL_INDEX
    const endCol = this.getStartCol() + this.VIEWPORT_WIDTH_COLS - 1;
    return Math.min(endCol, this.MAX_COL_INDEX);
}

    getCells() {
        const sheet = this.dataHolder.getSheet(this.sheetName);
        return sheet ? sheet.cells : [];
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

    async getDisplayValue(cellData) {
        if (!cellData || !cellData.data) return '';
        if (this.showFormulas) return cellData.data;

        if (cellData.data.toString().startsWith('=')) {
            return await this.computationEngine.computeCellValue(this.sheetName, cellData);
        }
        return cellData.data;
    }
}
