// NavButtonsController - Handles all navigation button clicks
export default class NavButtonsController {
    constructor(dataHolder, viewModel, onViewportChange) {
        this.dataHolder = dataHolder;
        this.viewModel = viewModel;
        this.onViewportChange = onViewportChange;
    }

    moveToTop() {
        this.dataHolder.updateViewport(this.viewModel.sheetName, 1, this.viewModel.getStartCol());
        this.onViewportChange();
    }

    moveToBottom() {
        const maxStartRow = this.viewModel.MAX_ROW - this.viewModel.VIEWPORT_HEIGHT_ROWS + 1;
        this.dataHolder.updateViewport(this.viewModel.sheetName, maxStartRow, this.viewModel.getStartCol());
        this.onViewportChange();
    }

    moveToLeft() {
        this.dataHolder.updateViewport(this.viewModel.sheetName, this.viewModel.getStartRow(), 1);
        this.onViewportChange();
    }

    moveToRight() {
        const maxStartCol = this.viewModel.MAX_COL_INDEX - this.viewModel.VIEWPORT_WIDTH_COLS + 1;
        this.dataHolder.updateViewport(this.viewModel.sheetName, this.viewModel.getStartRow(), maxStartCol);
        this.onViewportChange();
    }

        // In NavButtonsController.js
        stepUp() {
            if (this.viewModel.canMoveUp()) {
                const newStartRow = this.viewModel.getStartRow() - 1;
                this.dataHolder.updateViewport(this.viewModel.sheetName, newStartRow, this.viewModel.getStartCol());
                this.onViewportChange();
            }
        }

        stepDown() {
            if (this.viewModel.canMoveDown()) {
                const newStartRow = this.viewModel.getStartRow() + 1;
                this.dataHolder.updateViewport(this.viewModel.sheetName, newStartRow, this.viewModel.getStartCol());
                this.onViewportChange();
            }
        }

        stepLeft() {
            if (this.viewModel.canMoveLeft()) {
                const newStartCol = this.viewModel.getStartCol() - 1;
                this.dataHolder.updateViewport(this.viewModel.sheetName, this.viewModel.getStartRow(), newStartCol);
                this.onViewportChange();
            }
        }

        stepRight() {
            if (this.viewModel.canMoveRight()) {
                const newStartCol = this.viewModel.getStartCol() + 1;
                this.dataHolder.updateViewport(this.viewModel.sheetName, this.viewModel.getStartRow(), newStartCol);
                this.onViewportChange();
            }
        }

    // Helper to get current focus cell from selection manager
    getCurrentFocus() {
        if (this.viewModel.appController?.selectionManager) {
            return this.viewModel.appController.selectionManager.data.getFocus();
        }
        // Default focus if no selection manager
        return { row: this.viewModel.getStartRow(), col: this.viewModel.getStartCol() };
    }

    // Helper to set focus cell
    setFocusCell(row, col) {
        if (this.viewModel.appController?.selectionManager) {
            this.viewModel.appController.selectionManager.data.setFocus(row, col);
            this.viewModel.appController.selectionManager.render();
            this.viewModel.appController.selectionManager.scrollToFocus();
        }
    }
}
