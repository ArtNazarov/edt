// SaveAction - Handles saving spreadsheet data to .edt JSON files with metadata
export default class SaveAction {
    constructor(appController) {
        this.appController = appController;
    }

    execute() {
        return new Promise((resolve) => {
            try {
                // Get all sheet data including metadata
                const data = this.appController.getAllSheetData();

                // Add metadata version and save timestamp
                data.metadata = {
                    savedAt: new Date().toISOString(),
                    appVersion: data.version,
                    includesTips: true,
                    includesCellMetadata: true
                };

                // Convert to JSON string with pretty formatting
                const jsonString = JSON.stringify(data, null, 2);

                // Create blob and download
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);

                // Generate filename with timestamp
                const timestamp = this.getTimestamp();
                const filename = `spreadsheet_${timestamp}.edt`;

                // Create download link
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();

                // Cleanup
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);

                // Count total tips for feedback
                const tipCount = this.countTotalTips(data);
                this.showMessage(`Successfully saved to: ${filename}${tipCount > 0 ? ` (${tipCount} tips included)` : ''}`, 'success');
                resolve(true);
            } catch (error) {
                console.error('Error saving file:', error);
                this.showMessage(`Error saving file: ${error.message}`, 'error');
                resolve(false);
            }
        });
    }

    countTotalTips(data) {
        let tipCount = 0;
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
        return tipCount;
    }

    getTimestamp() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${year}${month}${day}_${hours}${minutes}${seconds}`;
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
