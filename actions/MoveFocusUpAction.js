// MoveFocusUpAction - Handles moving focus up one row
export default class MoveFocusUpAction {
    constructor(selectionManager) {
        this.selectionManager = selectionManager;
    }

    execute() {
        const viewModel = this.selectionManager.appController.viewModel;
        const currentRow = this.selectionManager.data.getFocus().row;
        const currentCol = this.selectionManager.data.getFocus().col;

        let newRow = currentRow - 1;
        let needsViewportMove = false;
        let newStartRow = viewModel.getStartRow();

        // Check if we can move up
        if (currentRow <= 1) {
            return { moved: false, needsViewportMove: false };
        }

        // Check if current cell is in the first row of viewport
        if (currentRow === viewModel.getStartRow()) {
            // Need to step viewport up
            if (viewModel.canMoveUp()) {
                newStartRow = viewModel.getStartRow() - 1;
                needsViewportMove = true;
                newRow = currentRow - 1;
            } else {
                newRow = 1;
            }
        } else {
            // Normal move within viewport
            newRow = currentRow - 1;
        }

        return {
            moved: true,
            newRow: newRow,
            newCol: currentCol,
            needsViewportMove: needsViewportMove,
            newStartRow: newStartRow,
            newStartCol: viewModel.getStartCol()
        };
    }
}
