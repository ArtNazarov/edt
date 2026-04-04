// OpenAction - Handles opening .edt JSON files with metadata
export default class OpenAction {
    constructor(appController) {
        this.appController = appController;
    }

    execute() {
        return new Promise((resolve) => {
            // Create file input element
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.edt,application/json';
            fileInput.style.display = 'none';

            fileInput.addEventListener('change', async (event) => {
                const file = event.target.files[0];
                if (!file) {
                    resolve(false);
                    return;
                }

                try {
                    const text = await this.readFile(file);
                    const data = JSON.parse(text);

                    // Validate the data structure
                    if (this.validateData(data)) {
                        await this.appController.loadSheetData(data);

                        // Report metadata info if present
                        const tipCount = this.countTotalTips(data);
                        const metadataInfo = data.metadata ? ` (v${data.metadata.appVersion || 'unknown'})` : '';
                        this.showMessage(`Successfully opened file: ${file.name}${metadataInfo}${tipCount > 0 ? ` - ${tipCount} tips loaded` : ''}`, 'success');
                        resolve(true);
                    } else {
                        this.showMessage('Invalid .edt file format', 'error');
                        resolve(false);
                    }
                } catch (error) {
                    console.error('Error opening file:', error);
                    this.showMessage(`Error opening file: ${error.message}`, 'error');
                    resolve(false);
                } finally {
                    document.body.removeChild(fileInput);
                }
            });

            document.body.appendChild(fileInput);
            fileInput.click();
        });
    }

    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e.target.error);
            reader.readAsText(file);
        });
    }

    countTotalTips(data) {
        let tipCount = 0;
        if (data.sheets) {
            for (const sheetName of Object.keys(data.sheets)) {
                const sheet = data.sheets[sheetName];
                if (sheet.cells) {
                    for (const cell of sheet.cells) {
                        if (cell.metadata && cell.metadata.tip) {
                            tipCount++;
                        }
                    }
                }
            }
        }
        return tipCount;
    }

    validateData(data) {
        // Check if data has required structure
        if (!data || typeof data !== 'object') return false;
        if (!data.version) return false;
        if (!data.sheets || typeof data.sheets !== 'object') return false;
        if (!data.currentSheet || typeof data.currentSheet !== 'string') return false;

        // Validate sheets structure
        for (const [sheetName, sheetData] of Object.entries(data.sheets)) {
            if (!sheetData.start_row || typeof sheetData.start_row !== 'number') return false;
            if (!sheetData.start_col || typeof sheetData.start_col !== 'number') return false;
            if (!Array.isArray(sheetData.cells)) return false;

            // Validate cells array (allow metadata field)
            for (const cell of sheetData.cells) {
                if (!cell.cell || typeof cell.cell !== 'string') return false;
                if (cell.data === undefined) return false;
                // metadata is optional, so we don't strictly validate it
                if (cell.metadata && typeof cell.metadata !== 'object') return false;

                // If tip metadata exists, validate its structure
                if (cell.metadata && cell.metadata.tip) {
                    if (typeof cell.metadata.tip.text !== 'string') return false;
                    if (typeof cell.metadata.tip.visible !== 'boolean') return false;
                }
            }
        }

        return true;
    }

    showMessage(message, type = 'info') {
        // Create temporary message element
        const msgDiv = document.createElement('div');
        msgDiv.className = `action-message action-${type}`;
        msgDiv.textContent = message;
        msgDiv.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            border-radius: 4px;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;

        // Add animation styles if not present
        if (!document.querySelector('#action-message-styles')) {
            const style = document.createElement('style');
            style.id = 'action-message-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(msgDiv);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            msgDiv.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (msgDiv.parentNode) {
                    msgDiv.parentNode.removeChild(msgDiv);
                }
            }, 300);
        }, 3000);
    }
}
