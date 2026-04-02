// CellsEditablesController - Handles cell edit events
export default class CellsEditablesController {
    constructor(dataHolder, computationEngine) {
        this.dataHolder = dataHolder;
        this.computationEngine = computationEngine;
    }

    async handleCellEdit(sheetName, cellId, newValue) {
        this.dataHolder.updateCell(sheetName, cellId, newValue);
        this.computationEngine.clearCache(sheetName);
    }
}
