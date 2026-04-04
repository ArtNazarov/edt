// ActionCopy - Copies the content of the selected cell to clipboard
export default class ActionCopy {
    constructor(appController) {
        this.appController = appController;
        this.clipboardData = null;
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

            // Store data in clipboard
            this.clipboardData = {
                type: 'copy',
                cellId: cellId,
                data: cell ? cell.data : '',
                metadata: cell && cell.metadata ? { ...cell.metadata } : null,
                timestamp: new Date().toISOString()
            };

            // Also copy to system clipboard
            const textToCopy = cell && cell.data ? cell.data.toString() : '';
            await navigator.clipboard.writeText(textToCopy);

            this.showMessage(`Copied cell ${cellId}: "${textToCopy.substring(0, 50)}${textToCopy.length > 50 ? '...' : ''}"`, 'success');
            return true;
        } catch (error) {
            console.error('Error copying cell:', error);
            this.showMessage(`Failed to copy: ${error.message}`, 'error');
            return false;
        }
    }

    getClipboardData() {
        return this.clipboardData;
    }

    clearClipboard() {
        this.clipboardData = null;
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
