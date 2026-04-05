// SelectAllCellsAction - Selects all cells in the entire sheet
export default class SelectAllCellsAction {
    constructor(selectionManager) {
        this.selectionManager = selectionManager;
    }

    execute() {
        const viewModel = this.selectionManager.appController.viewModel;
        const MAX_ROWS = 999;
        const MAX_COLS = viewModel?.MAX_COL_INDEX || 18278;

        // Set selectionAll flag to true
        this.selectionManager.data.setSelectionAll(true);

        // Clear any existing selections
        const selection = this.selectionManager.data.getCurrent();
        if (selection) {
            selection.selectedColumns.clear();
            selection.selectedRows.clear();
            selection.selectedRanges = [];
            selection.selectedCellsMap.clear();
        }

        // Focus stays where it was (don't move to A1)

        // Re-render to show selection
        this.selectionManager.render();
        this.selectionManager.notifySelectionChange();

        console.log('SelectAllCellsAction executed: all cells selected');

        return true;
    }
}
