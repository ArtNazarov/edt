// MoveFocusDownAction - Handles moving focus down one row
export default class MoveFocusDownAction {
    constructor(selectionManager) {
        this.selectionManager = selectionManager;
    }

    execute() {
        const viewModel = this.selectionManager.appController.viewModel;
        const maxRows = this.selectionManager.getMaxRows();
        const currentRow = this.selectionManager.data.getFocus().row;
        const currentCol = this.selectionManager.data.getFocus().col;

        let newRow = currentRow + 1;
        let needsViewportMove = false;
        let newStartRow = viewModel.getStartRow();
		console.log("Прокрутка вниз");
		console.log("maxRows:", maxRows);
		console.log("currentRow:", currentRow);

        // Check if we can move down
		/*
        if (currentRow >= maxRows) {
            return { moved: false, needsViewportMove: false };
        }
		*/
        // Check if current cell is in the last row of viewport
        if (currentRow === viewModel.getEndRow()) {
            // Need to step viewport down
            if (viewModel.canMoveDown()) {
                newStartRow = viewModel.getStartRow() + 1;
                needsViewportMove = true;
                newRow = currentRow + 1;
            } else {
                newRow = maxRows;
            }
        } else {
            // Normal move within viewport
            newRow = currentRow + 1;
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
