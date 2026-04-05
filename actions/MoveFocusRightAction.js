// MoveFocusRightAction - Handles moving focus right one column
export default class MoveFocusRightAction {
    constructor(selectionManager) {
        this.selectionManager = selectionManager;
    }

    execute() {
        const viewModel = this.selectionManager.appController.viewModel;
        const maxCols = this.selectionManager.getMaxCols();
        const currentRow = this.selectionManager.data.getFocus().row;
        const currentCol = this.selectionManager.data.getFocus().col;

        let newCol = currentCol + 1;
        let needsViewportMove = false;
        let newStartCol = viewModel.getStartCol();

        // Check if we can move right
		/*
        if (currentCol >= maxCols) {
            return { moved: false, needsViewportMove: false };
        }
        */

        // Check if current cell is in the last column of viewport
        if (currentCol === viewModel.getEndCol()) {
            // Need to step viewport right
            if (viewModel.canMoveRight()) {
                newStartCol = viewModel.getStartCol() + 1;
                needsViewportMove = true;
                newCol = currentCol + 1;
            } else {
                newCol = maxCols;
            }
        } else {
            // Normal move within viewport
            newCol = currentCol + 1;
        }

        return {
            moved: true,
            newRow: currentRow,
            newCol: newCol,
            needsViewportMove: needsViewportMove,
            newStartRow: viewModel.getStartRow(),
            newStartCol: newStartCol
        };
    }
}
