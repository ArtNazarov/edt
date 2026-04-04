// ActionDeleteTip - Deletes the tip from the selected cell
export default class ActionDeleteTip {
    constructor(appController) {
        this.appController = appController;
    }

    async execute(cellId) {
        if (!cellId) {
            this.showMessage('No cell selected', 'error');
            return false;
        }

        // Confirm deletion
        const confirmDelete = confirm(`Are you sure you want to delete the tip for cell ${cellId}?`);
        if (!confirmDelete) {
            this.showMessage('Tip deletion cancelled', 'warning');
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

            // Remove tip from metadata
            delete cell.metadata.tip;

            // If metadata is empty, remove it entirely
            if (Object.keys(cell.metadata).length === 0) {
                delete cell.metadata;
            }

            // Hide and remove the tip from display
            if (this.appController.uiTip) {
                this.appController.uiTip.hideTip(cellId);
            }

            this.showMessage(`Tip deleted for cell ${cellId}`, 'success');
            return true;
        } catch (error) {
            console.error('Error deleting tip:', error);
            this.showMessage(`Failed to delete tip: ${error.message}`, 'error');
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
