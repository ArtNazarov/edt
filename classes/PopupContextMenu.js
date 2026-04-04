// PopupContextMenu - Manages context menu for spreadsheet cells
export default class PopupContextMenu {
    constructor(appController) {
        this.appController = appController;
        this.menuElement = null;
        this.currentCellId = null;
        this.menuItems = [];
        this.init();
    }

    init() {
        this.createMenuElement();
        this.attachGlobalListeners();
        this.injectStyles();
    }

    createMenuElement() {
        this.menuElement = document.createElement('div');
        this.menuElement.id = 'popup-context-menu';
        this.menuElement.className = 'popup-context-menu';
        this.menuElement.style.display = 'none';
        document.body.appendChild(this.menuElement);
    }

    injectStyles() {
        if (document.querySelector('#context-menu-styles')) return;

        const style = document.createElement('style');
        style.id = 'context-menu-styles';
        style.textContent = `
        .popup-context-menu {
            position: fixed;
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            min-width: 180px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 13px;
            background: #fff;
        }

        .popup-context-menu ul {
            margin: 0;
            padding: 6px 0;
            list-style: none;
        }

        .popup-context-menu li {
            padding: 8px 16px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: background 0.1s;
            color: #212529;
        }

        .popup-context-menu li:hover {
            background: #f1f3f5;
        }

        .popup-context-menu .menu-divider {
            height: 1px;
            background: #e9ecef;
            margin: 4px 0;
            padding: 0;
        }

        .popup-context-menu .menu-label {
            flex: 1;
        }

        .popup-context-menu .menu-shortcut {
            font-size: 11px;
            color: #868e96;
            margin-left: 20px;
        }

        .popup-context-menu .submenu-indicator {
            margin-left: 20px;
            font-size: 12px;
            color: #868e96;
        }

        .popup-context-menu .has-submenu {
            position: relative;
        }

        .popup-context-menu .submenu {
            position: absolute;
            left: 100%;
            top: 0;
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            min-width: 160px;
            display: none;
        }

        .popup-context-menu .has-submenu:hover > .submenu {
            display: block;
        }

        .popup-context-menu .disabled {
            color: #adb5bd;
            cursor: not-allowed;
        }

        .popup-context-menu .disabled:hover {
            background: transparent;
        }
        `;
        document.head.appendChild(style);
    }

    attachGlobalListeners() {
        // Hide menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.menuElement && !this.menuElement.contains(e.target)) {
                this.hide();
            }
        });

        // Hide menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.menuElement.style.display === 'block') {
                this.hide();
            }
        });

        // Handle scroll - hide menu
        window.addEventListener('scroll', () => {
            this.hide();
        });
    }

    getTipInfo(cellId) {
        const sheetName = this.appController.dataHolder.currentSheet;
        const sheet = this.appController.dataHolder.getSheet(sheetName);
        const cell = sheet.cells.find(c => c.cell === cellId);

        if (cell && cell.metadata && cell.metadata.tip) {
            return {
                hasTip: true,
                isVisible: cell.metadata.tip.visible === true,
                tipText: cell.metadata.tip.text
            };
        }
        return {
            hasTip: false,
            isVisible: false,
            tipText: null
        };
    }

    buildDynamicMenuItems(cellId) {
        const tipInfo = this.getTipInfo(cellId);

        // Build tips submenu items dynamically based on tip state
        const tipsChildren = [];

        if (!tipInfo.hasTip) {
            // No tip exists - show only Add Tip
            tipsChildren.push(
                { id: 'add-tip', label: '➕ Add Tip', action: 'add-tip' }
            );
        } else {
            // Tip exists - show appropriate items based on visibility
            if (tipInfo.isVisible) {
                tipsChildren.push(
                    { id: 'hide-tip', label: '🙈 Hide Tip', action: 'hide-tip' },
                    { id: 'edit-tip', label: '✏️ Edit Tip', action: 'edit-tip' },
                    { id: 'delete-tip', label: '🗑️ Delete Tip', action: 'delete-tip' }
                );
            } else {
                tipsChildren.push(
                    { id: 'show-tip', label: '👁️ Show Tip', action: 'show-tip' },
                    { id: 'edit-tip', label: '✏️ Edit Tip', action: 'edit-tip' },
                    { id: 'delete-tip', label: '🗑️ Delete Tip', action: 'delete-tip' }
                );
            }
        }

        // Return the complete menu structure
        return [
            {
                id: 'edit',
                label: '✂️ Edit',
                children: [
                    { id: 'copy', label: '📋 Copy', action: 'copy', shortcut: 'Ctrl+C' },
                    { id: 'cut', label: '✂️ Cut', action: 'cut', shortcut: 'Ctrl+X' },
                    { id: 'paste', label: '📌 Paste', action: 'paste', shortcut: 'Ctrl+V' }
                ]
            },
            {
                id: 'tips',
                label: '💡 Tips',
                children: tipsChildren
            }
        ];
    }

    renderMenu(x, y, cellId) {
        this.currentCellId = cellId;
        this.menuElement.innerHTML = '';
        this.menuElement.style.display = 'block';
        this.menuElement.style.left = x + 'px';
        this.menuElement.style.top = y + 'px';

        // Build dynamic menu items based on current cell state
        const menuItems = this.buildDynamicMenuItems(cellId);

        const ul = document.createElement('ul');

        for (const item of menuItems) {
            if (item.children) {
                // Render submenu
                const li = document.createElement('li');
                li.className = 'has-submenu';
                li.innerHTML = `
                <span class="menu-label">${item.label}</span>
                <span class="submenu-indicator">▶</span>
                `;

                const submenu = document.createElement('ul');
                submenu.className = 'submenu';

                for (const child of item.children) {
                    const childLi = document.createElement('li');
                    childLi.innerHTML = `
                    <span class="menu-label">${child.label}</span>
                    ${child.shortcut ? `<span class="menu-shortcut">${child.shortcut}</span>` : ''}
                    `;
                    childLi.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.handleAction(child.action);
                    });
                    submenu.appendChild(childLi);
                }

                li.appendChild(submenu);
                ul.appendChild(li);
                ul.appendChild(this.createDivider());
            } else {
                // Render regular menu item
                const li = document.createElement('li');
                li.innerHTML = `
                <span class="menu-label">${item.label}</span>
                ${item.shortcut ? `<span class="menu-shortcut">${item.shortcut}</span>` : ''}
                `;
                li.addEventListener('click', () => this.handleAction(item.action));
                ul.appendChild(li);
            }
        }

        // Remove last divider if exists
        if (ul.lastChild && ul.lastChild.classList && ul.lastChild.classList.contains('menu-divider')) {
            ul.removeChild(ul.lastChild);
        }

        this.menuElement.appendChild(ul);

        // Adjust position if menu goes out of viewport
        this.adjustPosition(x, y);
    }

    createDivider() {
        const divider = document.createElement('li');
        divider.className = 'menu-divider';
        return divider;
    }

    adjustPosition(x, y) {
        const rect = this.menuElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let newX = x;
        let newY = y;

        if (x + rect.width > viewportWidth) {
            newX = viewportWidth - rect.width - 10;
        }

        if (y + rect.height > viewportHeight) {
            newY = viewportHeight - rect.height - 10;
        }

        if (newX !== x || newY !== y) {
            this.menuElement.style.left = newX + 'px';
            this.menuElement.style.top = newY + 'px';
        }
    }

    async handleAction(actionName) {
        if (this.currentCellId) {
            await this.appController.executeAction(actionName, this.currentCellId);
            // After action, refresh the view to update cell state (for tip indicator)
            await this.appController.updateViewAndViewModel();
        }
        this.hide();
    }

    show(x, y, cellId) {
        this.renderMenu(x, y, cellId);
    }

    hide() {
        if (this.menuElement) {
            this.menuElement.style.display = 'none';
        }
        this.currentCellId = null;
    }
}
