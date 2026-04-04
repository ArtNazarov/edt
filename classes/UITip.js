// UITip - Manages tooltip-like tips near spreadsheet cells
export default class UITip {
    constructor(appController) {
        this.appController = appController;
        this.activeTips = new Map(); // Map of cellId -> tip element
        this.tipTimeout = null;
        this.init();
    }

    init() {
        this.injectStyles();
    }

    injectStyles() {
        if (document.querySelector('#uitip-styles')) return;

        const style = document.createElement('style');
        style.id = 'uitip-styles';
        style.textContent = `
        .ui-tip {
            position: fixed;
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 8px 14px;
            font-size: 12px;
            font-family: Arial, sans-serif;
            color: #856404;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            z-index: 1000;
            max-width: 280px;
            word-wrap: break-word;
            pointer-events: auto;
            transition: opacity 0.2s ease;
            backdrop-filter: blur(2px);
            line-height: 1.4;
        }

        .ui-tip::before {
            content: '';
            position: absolute;
            bottom: -6px;
            left: 16px;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 6px solid #fff3cd;
        }

        .ui-tip::after {
            content: '';
            position: absolute;
            bottom: -7px;
            left: 16px;
            border-left: 7px solid transparent;
            border-right: 7px solid transparent;
            border-top: 7px solid #ffeaa7;
            z-index: -1;
        }

        /* Tip positioned above the cell (default) */
        .ui-tip.tip-above::before {
            top: -6px;
            bottom: auto;
            border-top: none;
            border-bottom: 6px solid #fff3cd;
        }

        .ui-tip.tip-above::after {
            top: -7px;
            bottom: auto;
            border-top: none;
            border-bottom: 7px solid #ffeaa7;
        }

        .ui-tip .tip-content {
            margin: 0;
            line-height: 1.4;
        }

        .ui-tip .tip-close {
            position: absolute;
            top: 4px;
            right: 8px;
            cursor: pointer;
            font-size: 12px;
            color: #856404;
            opacity: 0.6;
            transition: opacity 0.2s;
        }

        .ui-tip .tip-close:hover {
            opacity: 1;
        }

        .ui-tip.tip-hidden {
            display: none;
        }

        .ui-tip.tip-visible {
            display: block;
        }
        `;
        document.head.appendChild(style);
    }

    /**
     * Shows a tip near the specified cell
     * @param {string} cellId - Cell identifier (e.g., "A1")
     * @param {string} tipText - Text content of the tip
     * @param {boolean} autoHide - Whether to auto-hide after 5 seconds
     */
    showTip(cellId, tipText, autoHide = false) {
        // Remove existing tip for this cell if any
        this.hideTip(cellId);

        // Get cell element
        const cellElement = this.getCellElement(cellId);
        if (!cellElement) {
            console.warn(`Cell element not found for ${cellId}`);
            return;
        }

        // Create tip element
        const tip = document.createElement('div');
        tip.className = 'ui-tip tip-visible';
        tip.setAttribute('data-cell', cellId);
        tip.innerHTML = `
        <div class="tip-content">💡 ${this.escapeHtml(tipText)}</div>
        <span class="tip-close">&times;</span>
        `;

        // Position tip near the cell
        this.positionTip(tip, cellElement);

        // Add close button handler
        const closeBtn = tip.querySelector('.tip-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.hideTip(cellId);
            // Also update metadata to hide tip
            this.updateTipVisibilityInMetadata(cellId, false);
        });

        document.body.appendChild(tip);
        this.activeTips.set(cellId, tip);

        // Auto-hide if requested
        if (autoHide) {
            setTimeout(() => {
                this.hideTip(cellId);
            }, 5000);
        }

        return tip;
    }

    /**
     * Updates tip visibility in metadata when close button is clicked
     */
    updateTipVisibilityInMetadata(cellId, visible) {
        const sheetName = this.appController.dataHolder.currentSheet;
        const sheet = this.appController.dataHolder.getSheet(sheetName);
        const cell = sheet.cells.find(c => c.cell === cellId);
        if (cell && cell.metadata && cell.metadata.tip) {
            cell.metadata.tip.visible = visible;
        }
    }

    /**
     * Hides the tip for a specific cell
     * @param {string} cellId - Cell identifier
     */
    hideTip(cellId) {
        const existingTip = this.activeTips.get(cellId);
        if (existingTip && existingTip.parentNode) {
            existingTip.parentNode.removeChild(existingTip);
            this.activeTips.delete(cellId);
        }
    }

    /**
     * Updates tip text for a specific cell
     * @param {string} cellId - Cell identifier
     * @param {string} newText - New tip text
     */
    updateTip(cellId, newText) {
        const tip = this.activeTips.get(cellId);
        if (tip) {
            const contentDiv = tip.querySelector('.tip-content');
            if (contentDiv) {
                contentDiv.innerHTML = `💡 ${this.escapeHtml(newText)}`;
            }
        }
    }

    /**
     * Toggles tip visibility
     * @param {string} cellId - Cell identifier
     * @param {boolean} visible - Whether tip should be visible
     */
    toggleTipVisibility(cellId, visible) {
        const tip = this.activeTips.get(cellId);
        if (tip) {
            if (visible) {
                tip.classList.remove('tip-hidden');
                tip.classList.add('tip-visible');
            } else {
                tip.classList.remove('tip-visible');
                tip.classList.add('tip-hidden');
            }
        }
    }

    /**
     * Positions tip near the cell element
     * @param {HTMLElement} tip - Tip element
     * @param {HTMLElement} cellElement - Cell element
     */
    positionTip(tip, cellElement) {
        const rect = cellElement.getBoundingClientRect();
        const tipRect = tip.getBoundingClientRect();

        // Default: position above the cell with offset
        let top = rect.top - tipRect.height - 31; // Increased offset (was -8)
        let left = rect.left + 47; // Shift right by 8px (was rect.left)

        // Check if tip would go above viewport
        if (top < 10) {
            // Position below the cell instead
            top = rect.bottom + 12;
            tip.classList.add('tip-above');
        } else {
            tip.classList.remove('tip-above');
        }

        // Adjust if too far right
        if (left + tipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tipRect.width - 10;
        }

        // Adjust if too far left
        if (left < 10) {
            left = 10;
        }

        tip.style.top = `${top}px`;
        tip.style.left = `${left}px`;

        // Adjust arrow position to point to the cell
        const arrowOffset = rect.left - left + (rect.width / 2);
        if (arrowOffset > 15 && arrowOffset < tipRect.width - 15) {
            tip.style.setProperty('--arrow-offset', `${arrowOffset}px`);
        }
    }

    /**
     * Gets the DOM element for a cell
     * @param {string} cellId - Cell identifier
     * @returns {HTMLElement|null}
     */
    getCellElement(cellId) {
        // Find cell in the rendered table
        const cell = document.querySelector(`td[data-cell="${cellId}"]`);
        return cell;
    }

    /**
     * Repositions all active tips (call on scroll/resize)
     */
    repositionAllTips() {
        this.activeTips.forEach((tip, cellId) => {
            const cellElement = this.getCellElement(cellId);
            if (cellElement) {
                this.positionTip(tip, cellElement);
            } else {
                // Cell no longer exists, remove tip
                this.hideTip(cellId);
            }
        });
    }

    /**
     * Removes all tips
     */
    removeAllTips() {
        this.activeTips.forEach((tip, cellId) => {
            if (tip && tip.parentNode) {
                tip.parentNode.removeChild(tip);
            }
        });
        this.activeTips.clear();
    }

    /**
     * Checks if a cell has a tip
     * @param {string} cellId - Cell identifier
     * @returns {boolean}
     */
    hasTip(cellId) {
        return this.activeTips.has(cellId);
    }

    /**
     * Gets tip text for a cell
     * @param {string} cellId - Cell identifier
     * @returns {string|null}
     */
    getTipText(cellId) {
        const tip = this.activeTips.get(cellId);
        if (tip) {
            const contentDiv = tip.querySelector('.tip-content');
            if (contentDiv) {
                return contentDiv.textContent.replace('💡', '').trim();
            }
        }
        return null;
    }

    /**
     * Escapes HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string}
     */
    escapeHtml(text) {
        if (!text) return '';
        return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    /**
     * Attaches scroll/resize listeners for tip repositioning
     */
    attachListeners() {
        window.addEventListener('scroll', () => {
            requestAnimationFrame(() => this.repositionAllTips());
        });

        window.addEventListener('resize', () => {
            requestAnimationFrame(() => this.repositionAllTips());
        });
    }
}
