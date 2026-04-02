// ViewModel - Provides computed properties for the current view state
export default class ViewModel {
    constructor(dataHolder, sheetName, computationEngine, showFormulas = true) {
        this.dataHolder = dataHolder;
        this.sheetName = sheetName;
        this.computationEngine = computationEngine;
        this.showFormulas = showFormulas;
        this.MAX_ROW = 999;
        this.MAX_COL_INDEX = 18278;
        this.VIEWPORT_WIDTH_COLS = 7;
        this.VIEWPORT_HEIGHT_ROWS = 7;
    }

    setShowFormulas(show) {
        this.showFormulas = show;
        if (!show) {
            this.computationEngine.clearCache(this.sheetName);
        }
    }

    getStartRow() { return this.dataHolder.getSheet(this.sheetName).start_row; }
    getStartCol() { return this.dataHolder.getSheet(this.sheetName).start_col; }
    getEndRow() { return Math.min(this.getStartRow() + this.VIEWPORT_HEIGHT_ROWS - 1, this.MAX_ROW); }
    getEndCol() { return Math.min(this.getStartCol() + this.VIEWPORT_WIDTH_COLS - 1, this.MAX_COL_INDEX); }
    getCells() { return this.dataHolder.getSheet(this.sheetName).cells; }
    canMoveUp() { return this.getStartRow() > 1; }
    canMoveDown() { return this.getStartRow() < this.MAX_ROW - this.VIEWPORT_HEIGHT_ROWS + 1; }
    canMoveLeft() { return this.getStartCol() > 1; }
    canMoveRight() { return this.getStartCol() < this.MAX_COL_INDEX - this.VIEWPORT_WIDTH_COLS + 1; }

    async getDisplayValue(cellData) {
        if (!cellData || !cellData.data) return '';
        if (this.showFormulas) return cellData.data;

        if (cellData.data.toString().startsWith('=')) {
            return await this.computationEngine.computeCellValue(this.sheetName, cellData);
        }
        return cellData.data;
    }
}
