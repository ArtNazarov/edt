// ActionEditTip - Edits the tip for the selected cell
export default class ActionEditTip {
    constructor(appController) {
        this.appController = appController;
    }

    async execute(cellId) {
        if (!cellId) {
            this.showMessage('No cell selected', 'error');
            return false;
        }

        try {
            // Get current cell data
            const sheetName = this.appController.dataHolder.currentSheet;
            const sheet = this.appController.dataHolder.getSheet(sheetName);
            const cell = sheet.cells.find(c => c.cell === cellId);

            if (!cell || !cell.metadata || !cell.metadata.tip) {
                this.showMessage(`No tip found for cell ${cellId}`, 'warning');
                return false;
            }

            const currentText = cell.metadata.tip.text;

            // Prompt for new tip text
            const newTipText = prompt('Edit tip text for cell ' + cellId + ':', currentText);

            if (newTipText === null || newTipText.trim() === '') {
                this.showMessage('Tip edit cancelled', 'warning');
                return false;
            }

            // Update metadata
            cell.metadata.tip.text = newTipText.trim();
            cell.metadata.tip.updatedAt = new Date().toISOString();

            // Update the tip display
            if (this.appController.uiTip) {
                if (this.appController.uiTip.hasTip(cellId)) {
                    this.appController.uiTip.updateTip(cellId, newTipText.trim());
                } else if (cell.metadata.tip.visible) {
                    this.appController.uiTip.showTip(cellId, newTipText.trim(), false);
                }
            }

            this.showMessage(`Tip updated for cell ${cellId}`, 'success');
            return true;
        } catch (error) {
            console.error('Error editing tip:', error);
            this.showMessage(`Failed to edit tip: ${error.message}`, 'error');
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
