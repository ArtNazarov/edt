// MoveFocusLeftAction - Handles moving focus left one column
export default class MoveFocusLeftAction {
    constructor(selectionManager) {
        this.selectionManager = selectionManager;
    }

    execute() {
        const viewModel = this.selectionManager.appController.viewModel;
        const currentRow = this.selectionManager.data.getFocus().row;
        const currentCol = this.selectionManager.data.getFocus().col;

        let newCol = currentCol - 1;
        let needsViewportMove = false;
        let newStartCol = viewModel.getStartCol();

        // Check if we can move left
        if (currentCol <= 1) {
            return { moved: false, needsViewportMove: false };
        }

        // Check if current cell is in the first column of viewport
        if (currentCol === viewModel.getStartCol()) {
            // Need to step viewport left
            if (viewModel.canMoveLeft()) {
                newStartCol = viewModel.getStartCol() - 1;
                needsViewportMove = true;
                newCol = currentCol - 1;
            } else {
                newCol = 1;
            }
        } else {
            // Normal move within viewport
            newCol = currentCol - 1;
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
