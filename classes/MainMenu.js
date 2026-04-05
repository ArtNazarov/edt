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
                <div class="menu-item" data-menu="selection">
                    Selection
                    <div class="submenu" data-submenu="selection">
                        <div class="submenu-item" data-action="select-all">
                            <span class="menu-icon">✅</span> Select All
                            <span class="menu-shortcut">Ctrl+A</span>
                        </div>
                        <div class="submenu-divider"></div>
                        <div class="submenu-item" data-action="clear-selection">
                            <span class="menu-icon">❌</span> Clear Selection
                            <span class="menu-shortcut">Esc</span>
                        </div>
                    </div>
                </div>
                <div class="menu-item" data-menu="navigation">
                    Navigation
                    <div class="submenu" data-submenu="navigation">
                        <div class="submenu-item" data-action="move-to-top">
                            <span class="menu-icon">⬆️</span> Move to Top
                            <span class="menu-shortcut">Page Up</span>
                        </div>
                        <div class="submenu-item" data-action="move-to-bottom">
                            <span class="menu-icon">⬇️</span> Move to Bottom
                            <span class="menu-shortcut">Page Down</span>
                        </div>
                        <div class="submenu-divider"></div>
                        <div class="submenu-item" data-action="move-to-left">
                            <span class="menu-icon">⬅️</span> Move to Left Edge
                            <span class="menu-shortcut">Home</span>
                        </div>
                        <div class="submenu-item" data-action="move-to-right">
                            <span class="menu-icon">➡️</span> Move to Right Edge
                            <span class="menu-shortcut">End</span>
                        </div>
                        <div class="submenu-divider"></div>
                        <div class="submenu-item" data-action="step-up">
                            <span class="menu-icon">⬆️</span> Step Up
                            <span class="menu-shortcut">Ctrl+Page Up</span>
                        </div>
                        <div class="submenu-item" data-action="step-down">
                            <span class="menu-icon">⬇️</span> Step Down
                            <span class="menu-shortcut">Ctrl+Page Down</span>
                        </div>
                        <div class="submenu-item" data-action="step-left">
                            <span class="menu-icon">⬅️</span> Step Left
                            <span class="menu-shortcut">Ctrl+Home</span>
                        </div>
                        <div class="submenu-item" data-action="step-right">
                            <span class="menu-icon">➡️</span> Step Right
                            <span class="menu-shortcut">Ctrl+End</span>
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
            case 'select-all':
                this.appController.selectionManager?.selectAll();
                break;
            case 'clear-selection':
                this.appController.selectionManager?.clearAllSelections();
                break;
            case 'move-to-top':
                this.appController.navController?.moveToTop();
                break;
            case 'move-to-bottom':
                this.appController.navController?.moveToBottom();
                break;
            case 'move-to-left':
                this.appController.navController?.moveToLeft();
                break;
            case 'move-to-right':
                this.appController.navController?.moveToRight();
                break;
            case 'step-up':
                this.appController.navController?.stepUp();
                break;
            case 'step-down':
                this.appController.navController?.stepDown();
                break;
            case 'step-left':
                this.appController.navController?.stepLeft();
                break;
            case 'step-right':
                this.appController.navController?.stepRight();
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
                    <p><strong>Version:</strong> 1.6.0</p>
                    <p><strong>Features:</strong></p>
                    <ul>
                        <li>AST-based formula computation engine</li>
                        <li>Support for SUM, AVG, MAX, MIN, COUNT, SUMPRODUCT, VLOOKUP</li>
                        <li>Cross-sheet references</li>
                        <li>Multiple worksheets</li>
                        <li>7x7 viewport with keyboard navigation</li>
                        <li>Cell tips and comments</li>
                        <li>Selection management (columns, rows, ranges)</li>
                        <li>Open/Save .edt files with metadata</li>
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
                        <tr><td colspan="2"><hr></td></tr>
                        <tr><td><kbd>Ctrl</kbd> + <kbd>C</kbd></td><td>Copy selected cell</td></tr>
                        <tr><td><kbd>Ctrl</kbd> + <kbd>X</kbd></td><td>Cut selected cell</td></tr>
                        <tr><td><kbd>Ctrl</kbd> + <kbd>V</kbd></td><td>Paste to selected cell</td></tr>
                        <tr><td colspan="2"><hr></td></tr>
                        <tr><td><kbd>Ctrl</kbd> + <kbd>A</kbd></td><td>Select all cells</td></tr>
                        <tr><td><kbd>Esc</kbd></td><td>Clear all selections</td></tr>
                        <tr><td colspan="2"><hr></td></tr>
                        <tr><td><kbd>Page Up</kbd></td><td>Move to top edge</td></tr>
                        <tr><td><kbd>Page Down</kbd></td><td>Move to bottom edge</td></tr>
                        <tr><td><kbd>Home</kbd></td><td>Move to left edge</td></tr>
                        <tr><td><kbd>End</kbd></td><td>Move to right edge</td></tr>
                        <tr><td><kbd>Ctrl</kbd> + <kbd>Page Up</kbd></td><td>Step up one row</td></tr>
                        <tr><td><kbd>Ctrl</kbd> + <kbd>Page Down</kbd></td><td>Step down one row</td></tr>
                        <tr><td><kbd>Ctrl</kbd> + <kbd>Home</kbd></td><td>Step left one column</td></tr>
                        <tr><td><kbd>Ctrl</kbd> + <kbd>End</kbd></td><td>Step right one column</td></tr>
                        <tr><td colspan="2"><hr></td></tr>
                        <tr><td><kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd></td><td>Move focus (auto-scroll)</td></tr>
                        <tr><td><kbd>Shift</kbd> + <kbd>↑↓←→</kbd></td><td>Extend range selection</td></tr>
                        <tr><td colspan="2"><hr></td></tr>
                        <tr><td><kbd>Double-click</kbd></td><td>Edit cell content</td></tr>
                        <tr><td><kbd>Ctrl</kbd> + <kbd>\`</kbd></td><td>Toggle command line</td></tr>
                        <tr><td><kbd>F5</kbd></td><td>Refresh view</td></tr>
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
