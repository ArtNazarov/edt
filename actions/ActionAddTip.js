// ActionAddTip - Adds a tip to the selected cell
export default class ActionAddTip {
    constructor(appController) {
        this.appController = appController;
    }

    async execute(cellId) {
        if (!cellId) {
            this.showMessage('No cell selected', 'error');
            return false;
        }

        // Prompt for tip text
        const tipText = prompt('Enter tip text for cell ' + cellId + ':', '');

        if (tipText === null || tipText.trim() === '') {
            this.showMessage('Tip cancelled or empty', 'warning');
            return false;
        }

        try {
            // Get current cell data
            const sheetName = this.appController.dataHolder.currentSheet;
            const sheet = this.appController.dataHolder.getSheet(sheetName);
            const cell = sheet.cells.find(c => c.cell === cellId);

            // Initialize metadata if not exists
            if (!cell) {
                // Create cell if it doesn't exist
                this.appController.dataHolder.updateCell(sheetName, cellId, '');
            }

            const updatedCell = sheet.cells.find(c => c.cell === cellId);
            if (!updatedCell.metadata) {
                updatedCell.metadata = {};
            }

            // Add tip to metadata
            updatedCell.metadata.tip = {
                text: tipText.trim(),
                visible: true,
                createdAt: new Date().toISOString()
            };

            // Update cell in dataholder
            this.appController.dataHolder.updateCell(sheetName, cellId, updatedCell.data || '');

            // Show the tip using UITip
            if (this.appController.uiTip) {
                this.appController.uiTip.showTip(cellId, tipText.trim(), false);
            }

            this.showMessage(`Tip added to cell ${cellId}`, 'success');
            return true;
        } catch (error) {
            console.error('Error adding tip:', error);
            this.showMessage(`Failed to add tip: ${error.message}`, 'error');
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
