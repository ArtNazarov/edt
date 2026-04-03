// MainMenu - Creates and manages the application's main menu bar
export default class MainMenu {
    constructor(containerId, appController) {
        this.container = document.getElementById(containerId);
        this.appController = appController;
        this.menuItems = [];
        this.activeMenu = null;
        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="main-menu">
                <div class="menu-item" data-menu="file">
                    File
                    <div class="submenu" data-submenu="file">
                        <div class="submenu-item" data-action="open">
                            <span class="menu-icon">📂</span> Open .edt
                            <span class="menu-shortcut">Ctrl+O</span>
                        </div>
                        <div class="submenu-divider"></div>
                        <div class="submenu-item" data-action="save">
                            <span class="menu-icon">💾</span> Save .edt
                            <span class="menu-shortcut">Ctrl+S</span>
                        </div>
                        <div class="submenu-divider"></div>
                        <div class="submenu-item" data-action="export-csv">
                            <span class="menu-icon">📊</span> Export to CSV
                            <span class="menu-shortcut">Ctrl+E</span>
                        </div>
                    </div>
                </div>
                <div class="menu-item" data-menu="edit">
                    Edit
                    <div class="submenu" data-submenu="edit">
                        <div class="submenu-item" data-action="formulas-mode">
                            <span class="menu-icon">📝</span> Formulas Mode
                        </div>
                        <div class="submenu-item" data-action="results-mode">
                            <span class="menu-icon">🔢</span> Results Mode
                        </div>
                    </div>
                </div>
                <div class="menu-item" data-menu="view">
                    View
                    <div class="submenu" data-submenu="view">
                        <div class="submenu-item" data-action="refresh">
                            <span class="menu-icon">🔄</span> Refresh
                            <span class="menu-shortcut">F5</span>
                        </div>
                    </div>
                </div>
                <div class="menu-item" data-menu="help">
                    Help
                    <div class="submenu" data-submenu="help">
                        <div class="submenu-item" data-action="about">
                            <span class="menu-icon">ℹ️</span> About
                        </div>
                        <div class="submenu-item" data-action="shortcuts">
                            <span class="menu-icon">⌨️</span> Keyboard Shortcuts
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Menu item hover events
        const menuItems = this.container.querySelectorAll('.menu-item');

        menuItems.forEach(item => {
            item.addEventListener('mouseenter', (e) => {
                this.closeAllSubmenus();
                const menuName = item.getAttribute('data-menu');
                const submenu = this.container.querySelector(`.submenu[data-submenu="${menuName}"]`);
                if (submenu) {
                    submenu.classList.add('active');
                    this.activeMenu = menuName;
                }
            });
        });

        // Close submenus when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.closeAllSubmenus();
            }
        });

        // Submenu item click events
        const submenuItems = this.container.querySelectorAll('.submenu-item');
        submenuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = item.getAttribute('data-action');
                this.handleAction(action);
                this.closeAllSubmenus();
            });
        });

        // Prevent submenu from closing when clicking inside
        const submenus = this.container.querySelectorAll('.submenu');
        submenus.forEach(submenu => {
            submenu.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });
    }

    handleAction(action) {
        switch (action) {
            case 'open':
                this.appController.executeAction('open');
                break;
            case 'save':
                this.appController.executeAction('save');
                break;
            case 'export-csv':
                this.appController.executeAction('export-csv');
                break;
            case 'formulas-mode':
                this.appController.setFormulasMode(true);
                break;
            case 'results-mode':
                this.appController.setFormulasMode(false);
                break;
            case 'refresh':
                this.appController.refreshView();
                break;
            case 'about':
                this.showAboutDialog();
                break;
            case 'shortcuts':
                this.showShortcutsDialog();
                break;
            default:
                console.warn(`Unknown action: ${action}`);
        }
    }

    closeAllSubmenus() {
        const submenus = this.container.querySelectorAll('.submenu');
        submenus.forEach(submenu => {
            submenu.classList.remove('active');
        });
        this.activeMenu = null;
    }

    showAboutDialog() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-header">
                    <h3>About Editable Table Viewport</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>Version:</strong> 1.3.0</p>
                    <p><strong>Features:</strong></p>
                    <ul>
                        <li>AST-based formula computation engine</li>
                        <li>Support for SUM, AVG, MAX, MIN, COUNT, SUMPRODUCT, VLOOKUP</li>
                        <li>Cross-sheet references</li>
                        <li>Multiple worksheets</li>
                        <li>7x7 viewport with navigation</li>
                        <li>Open/Save .edt files</li>
                    </ul>
                    <p><strong>License:</strong> MIT</p>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn modal-btn-primary">OK</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.modal-close');
        const okBtn = modal.querySelector('.modal-btn-primary');

        const closeModal = () => {
            modal.remove();
        };

        closeBtn.addEventListener('click', closeModal);
        okBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    showShortcutsDialog() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-header">
                    <h3>Keyboard Shortcuts</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <table class="shortcuts-table">
                        <tr><td><kbd>Ctrl</kbd> + <kbd>O</kbd></td><td>Open .edt file</td></tr>
                        <tr><td><kbd>Ctrl</kbd> + <kbd>S</kbd></td><td>Save .edt file</td></tr>
                        <tr><td><kbd>Ctrl</kbd> + <kbd>E</kbd></td><td>Export to CSV</td></tr>
                        <tr><td><kbd>F5</kbd></td><td>Refresh view</td></tr>
                        <tr><td><kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd></td><td>Navigate viewport (Step)</td></tr>
                        <tr><td><kbd>Shift</kbd> + <kbd>↑</kbd></td><td>Move to top edge</td></tr>
                        <tr><td><kbd>Shift</kbd> + <kbd>↓</kbd></td><td>Move to bottom edge</td></tr>
                        <tr><td><kbd>Shift</kbd> + <kbd>←</kbd></td><td>Move to left edge</td></tr>
                        <tr><td><kbd>Shift</kbd> + <kbd>→</kbd></td><td>Move to right edge</td></tr>
                    </table>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn modal-btn-primary">OK</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.modal-close');
        const okBtn = modal.querySelector('.modal-btn-primary');

        const closeModal = () => {
            modal.remove();
        };

        closeBtn.addEventListener('click', closeModal);
        okBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }
}
