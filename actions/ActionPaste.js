// ActionPaste - Pastes clipboard content to the selected cell
export default class ActionPaste {
    constructor(appController) {
        this.appController = appController;
    }

    async execute(cellId) {
        if (!cellId) {
            this.showMessage('No cell selected', 'error');
            return false;
        }

        try {
            const sheetName = this.appController.dataHolder.currentSheet;

            // Try to get clipboard data from the copy/cut actions first
            let pasteData = null;
            let sourceAction = null;

            // Check ActionCopy clipboard
            const copyAction = this.appController.actions.get('copy');
            if (copyAction && copyAction.getClipboardData) {
                pasteData = copyAction.getClipboardData();
                if (pasteData) sourceAction = 'copy';
            }

            // Check ActionCut clipboard (cut has priority if both exist)
            const cutAction = this.appController.actions.get('cut');
            if (cutAction && cutAction.getClipboardData) {
                const cutData = cutAction.getClipboardData();
                if (cutData) {
                    pasteData = cutData;
                    sourceAction = 'cut';
                }
            }

            // If no internal clipboard data, try system clipboard
            let pasteText = '';
            if (!pasteData) {
                try {
                    pasteText = await navigator.clipboard.readText();
                } catch (clipboardError) {
                    // System clipboard might not be accessible (permissions)
                    console.warn('Cannot read system clipboard:', clipboardError);
                }
            }

            // Determine what to paste
            let newValue = '';
            let newMetadata = null;

            if (pasteData && pasteData.data !== undefined) {
                // Paste from internal clipboard (copy/cut)
                newValue = pasteData.data;
                newMetadata = pasteData.metadata ? { ...pasteData.metadata } : null;

                // If this was a cut operation, clear the source cell's clipboard data after paste
                if (sourceAction === 'cut' && cutAction && cutAction.clearClipboard) {
                    cutAction.clearClipboard();
                }
            } else if (pasteText) {
                // Paste from system clipboard
                newValue = pasteText;
            } else {
                this.showMessage('Nothing to paste', 'warning');
                return false;
            }

            // Update the cell with new value
            this.appController.dataHolder.updateCell(sheetName, cellId, newValue);

            // Update metadata if present
            if (newMetadata) {
                const sheet = this.appController.dataHolder.getSheet(sheetName);
                const cell = sheet.cells.find(c => c.cell === cellId);
                if (cell) {
                    if (!cell.metadata) cell.metadata = {};
                    Object.assign(cell.metadata, newMetadata);
                }
            }

            // Clear cache and refresh
            this.appController.computationEngine.clearCache(sheetName);
            await this.appController.updateViewAndViewModel();

            // Handle tip display if metadata contains tip
            if (newMetadata && newMetadata.tip && newMetadata.tip.visible && this.appController.uiTip) {
                this.appController.uiTip.showTip(cellId, newMetadata.tip.text, false);
            }

            this.showMessage(`Pasted to cell ${cellId}`, 'success');
            return true;
        } catch (error) {
            console.error('Error pasting to cell:', error);
            this.showMessage(`Failed to paste: ${error.message}`, 'error');
            return false;
        }
    }

    showMessage(message, type = 'info') {
        const msgDiv = document.createElement('div');
        msgDiv.className = `action-message action-${type}`;
        msgDiv.textContent = message;
        msgDiv.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196F3'};
        color: white;
        border-radius: 4px;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;

        if (!document.querySelector('#action-message-styles')) {
            const style = document.createElement('style');
            style.id = 'action-message-styles';
            style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(msgDiv);
        setTimeout(() => {
            msgDiv.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (msgDiv.parentNode) msgDiv.parentNode.removeChild(msgDiv);
            }, 300);
        }, 2000);
    }
}
