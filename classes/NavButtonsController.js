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
        this.dataHolder.updateViewport(this.viewModel.sheetName, this.viewModel.MAX_ROW - this.viewModel.VIEWPORT_HEIGHT_ROWS + 1, this.viewModel.getStartCol());
        this.onViewportChange();
    }

    moveToLeft() {
        this.dataHolder.updateViewport(this.viewModel.sheetName, this.viewModel.getStartRow(), 1);
        this.onViewportChange();
    }

    moveToRight() {
        this.dataHolder.updateViewport(this.viewModel.sheetName, this.viewModel.getStartRow(), this.viewModel.MAX_COL_INDEX - this.viewModel.VIEWPORT_WIDTH_COLS + 1);
        this.onViewportChange();
    }

    stepUp() {
        if (this.viewModel.canMoveUp()) {
            this.dataHolder.updateViewport(this.viewModel.sheetName, this.viewModel.getStartRow() - 1, this.viewModel.getStartCol());
            this.onViewportChange();
        }
    }

    stepDown() {
        if (this.viewModel.canMoveDown()) {
            this.dataHolder.updateViewport(this.viewModel.sheetName, this.viewModel.getStartRow() + 1, this.viewModel.getStartCol());
            this.onViewportChange();
        }
    }

    stepLeft() {
        if (this.viewModel.canMoveLeft()) {
            this.dataHolder.updateViewport(this.viewModel.sheetName, this.viewModel.getStartRow(), this.viewModel.getStartCol() - 1);
            this.onViewportChange();
        }
    }

    stepRight() {
        if (this.viewModel.canMoveRight()) {
            this.dataHolder.updateViewport(this.viewModel.sheetName, this.viewModel.getStartRow(), this.viewModel.getStartCol() + 1);
            this.onViewportChange();
        }
    }
}
