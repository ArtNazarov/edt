import DataHolder from './DataHolder.js';
import ComputationEngine from './ComputationEngine.js';
import CellsEditablesController from './CellsEditablesController.js';
import ViewModel from './ViewModel.js';
import SheetView from './SheetView.js';
import NavButtonsController from './NavButtonsController.js';
import MainMenu from './MainMenu.js';
import CommandLine from './CommandLine.js';
import UITip from './UITip.js';
import SelectionManager from './SelectionManager.js';

// AppController - Orchestrates all components
export default class AppController {
    constructor() {
        this.dataHolder = new DataHolder();
        this.computationEngine = new ComputationEngine(this.dataHolder);
        this.cellsController = new CellsEditablesController(this.dataHolder, this.computationEngine);
        this.showFormulas = true;
        this.actions = new Map();
        this.mainMenu = null;
        this.commandLine = null;
        this.uiTip = null;
        this.contextMenu = null;
        this.selectionManager = null;
        this.navController = null;
        this.viewModel = null;
        this.sheetView = null;
        this.init();
    }

    async init() {
        await this.loadActions();
        this.renderMainMenu();
        this.renderCommandLine();
        this.renderSheetsNav();
        await this.updateViewAndViewModel();
        this.attachModeButtonHandlers();
        this.attachKeyboardShortcuts();
        this.updatePositionInfo();
        this.updateModeButtons();

        // Initialize UITip after everything else
        this.uiTip = new UITip(this);
        this.uiTip.attachListeners();

        // Initialize Context Menu
        this.initContextMenu();

        // Ensure window.app is set for global access
        if (!window.app) {
            window.app = this;
        }

        console.log('AppController initialized successfully');
    }

    initContextMenu() {
        // Import PopupContextMenu dynamically
        import('./PopupContextMenu.js').then(module => {
            const PopupContextMenu = module.default;
            this.contextMenu = new PopupContextMenu(this);
            console.log('Context menu initialized successfully');
        }).catch(error => {
            console.error('Failed to load PopupContextMenu:', error);
        });
    }

    initSelectionManager() {
        const tableContainer = document.getElementById('table-container');
        if (tableContainer) {
            this.selectionManager = new SelectionManager(this, tableContainer);
            this.selectionManager.onSelectionChange = (selectionInfo) => {
                this.updateSelectionInfo(selectionInfo);
            };
            console.log('Selection Manager initialized successfully');
        }
    }

    refreshSelectionManager() {
        if (this.selectionManager) {
            const tableContainer = document.getElementById('table-container');
            this.selectionManager.tableContainer = tableContainer;
            this.selectionManager.refreshEventListeners();
            this.selectionManager.render();
        }
    }

    updateSelectionInfo(selectionInfo) {
        // Update position info with selection details (optional)
        const positionInfo = document.getElementById('position-info');
        if (positionInfo && selectionInfo) {
            // Can be used to display selection info in status bar
            // console.log('Selection updated:', selectionInfo);
        }
    }

    handleContextMenu(event, cellId) {
        event.preventDefault();
        event.stopPropagation();

        console.log('handleContextMenu called for cell:', cellId, 'at position:', event.pageX, event.pageY);

        if (this.contextMenu) {
            this.contextMenu.show(event.pageX, event.pageY, cellId);
        } else {
            console.warn('Context menu not yet loaded, attempting lazy load...');
            import('./PopupContextMenu.js').then(module => {
                const PopupContextMenu = module.default;
                this.contextMenu = new PopupContextMenu(this);
                this.contextMenu.show(event.pageX, event.pageY, cellId);
                console.log('Context menu lazy loaded and shown');
            }).catch(error => {
                console.error('Failed to load context menu:', error);
                alert('Failed to load context menu. Please refresh the page.');
            });
        }
    }

    async loadActions() {
        try {
            // File actions
            const OpenAction = await window.classLoader.loadClass('OpenAction');
            const SaveAction = await window.classLoader.loadClass('SaveAction');
            const ExportCSVAction = await window.classLoader.loadClass('ExportCSVAction');

            // Navigation actions - Edge movements
            const ActionMoveToTop = await window.classLoader.loadClass('ActionMoveToTop');
            const ActionMoveToBottom = await window.classLoader.loadClass('ActionMoveToBottom');
            const ActionMoveToLeft = await window.classLoader.loadClass('ActionMoveToLeft');
            const ActionMoveToRight = await window.classLoader.loadClass('ActionMoveToRight');

            // Navigation actions - Step movements
            const ActionStepUp = await window.classLoader.loadClass('ActionStepUp');
            const ActionStepDown = await window.classLoader.loadClass('ActionStepDown');
            const ActionStepLeft = await window.classLoader.loadClass('ActionStepLeft');
            const ActionStepRight = await window.classLoader.loadClass('ActionStepRight');

            // Tip actions
            const ActionAddTip = await window.classLoader.loadClass('ActionAddTip');
            const ActionShowTip = await window.classLoader.loadClass('ActionShowTip');
            const ActionHideTip = await window.classLoader.loadClass('ActionHideTip');
            const ActionEditTip = await window.classLoader.loadClass('ActionEditTip');
            const ActionDeleteTip = await window.classLoader.loadClass('ActionDeleteTip');

            // Edit actions (Copy, Cut, Paste)
            const ActionCopy = await window.classLoader.loadClass('ActionCopy');
            const ActionCut = await window.classLoader.loadClass('ActionCut');
            const ActionPaste = await window.classLoader.loadClass('ActionPaste');

            // Register all actions
            this.actions.set('open', new OpenAction(this));
            this.actions.set('save', new SaveAction(this));
            this.actions.set('export-csv', new ExportCSVAction(this));

            this.actions.set('move-to-top', new ActionMoveToTop(this));
            this.actions.set('move-to-bottom', new ActionMoveToBottom(this));
            this.actions.set('move-to-left', new ActionMoveToLeft(this));
            this.actions.set('move-to-right', new ActionMoveToRight(this));

            this.actions.set('step-up', new ActionStepUp(this));
            this.actions.set('step-down', new ActionStepDown(this));
            this.actions.set('step-left', new ActionStepLeft(this));
            this.actions.set('step-right', new ActionStepRight(this));

            // Register tip actions
            this.actions.set('add-tip', new ActionAddTip(this));
            this.actions.set('show-tip', new ActionShowTip(this));
            this.actions.set('hide-tip', new ActionHideTip(this));
            this.actions.set('edit-tip', new ActionEditTip(this));
            this.actions.set('delete-tip', new ActionDeleteTip(this));

            // Register edit actions
            this.actions.set('copy', new ActionCopy(this));
            this.actions.set('cut', new ActionCut(this));
            this.actions.set('paste', new ActionPaste(this));

            console.log('All actions loaded successfully');
        } catch (error) {
            console.error('Failed to load actions:', error);
        }
    }

    async executeAction(actionName, ...args) {
        const action = this.actions.get(actionName);
        if (action) {
            console.log(`Executing action: ${actionName}`, args);
            return await action.execute(...args);
        } else {
            console.warn(`Action not found: ${actionName}`);
            return false;
        }
    }

    renderMainMenu() {
        const menuContainer = document.getElementById('main-menu-container');
        if (menuContainer) {
            this.mainMenu = new MainMenu('main-menu-container', this);
        }
    }

    renderCommandLine() {
        const commandLineContainer = document.getElementById('command-line-container');
        if (commandLineContainer) {
            this.commandLine = new CommandLine('command-line-container', this);
        }
    }

    async setFormulasMode(showFormulas) {
        this.showFormulas = showFormulas;
        await this.updateViewAndViewModel();
        this.updateModeButtons();
        this.updatePositionInfo();
    }

    async refreshView() {
        this.computationEngine.clearCache();
        await this.updateViewAndViewModel();
        this.updatePositionInfo();
    }

    async updateViewAndViewModel() {
        // Create ViewModel with appController reference
        this.viewModel = new ViewModel(this.dataHolder, this.dataHolder.currentSheet, this.computationEngine, this.showFormulas);
        this.viewModel.appController = this; // Pass reference for NavButtonsController

        // Create SheetView
        this.sheetView = new SheetView('table-container', this.viewModel, async (cellId, newValue) => {
            await this.cellsController.handleCellEdit(this.dataHolder.currentSheet, cellId, newValue);
            await this.updateViewAndViewModel();
            this.updatePositionInfo();
        }, this);

        // Create NavButtonsController
        this.navController = new NavButtonsController(this.dataHolder, this.viewModel, async () => {
            await this.updateViewAndViewModel();
            this.updatePositionInfo();
        });

        await this.sheetView.render();

        // Initialize or refresh selection manager after view update
        if (!this.selectionManager) {
            this.initSelectionManager();
        } else {
            this.refreshSelectionManager();
        }

        // Restore tips after view update
        if (this.uiTip) {
            this.restoreTipsForCurrentSheet();
        }
    }

    restoreTipsForCurrentSheet() {
        // Clear all existing tips first
        if (this.uiTip) {
            this.uiTip.removeAllTips();
        }

        // Then restore tips from metadata for current sheet only
        const sheet = this.dataHolder.getCurrentSheet();
        if (!sheet || !sheet.cells) return;

        console.log('Restoring tips for current sheet:', this.dataHolder.currentSheet);

        for (const cell of sheet.cells) {
            if (cell.metadata && cell.metadata.tip && cell.metadata.tip.visible) {
                setTimeout(() => {
                    this.uiTip.showTip(cell.cell, cell.metadata.tip.text, false);
                }, 50);
            }
        }
    }

    restoreTips() {
        this.restoreTipsForCurrentSheet();
    }

    renderSheetsNav() {
        const nav = document.getElementById('sheets-nav');
        if (!nav) return;

        nav.innerHTML = '';
        this.dataHolder.getSheetNames().forEach(sheetName => {
            const link = document.createElement('span');
            link.className = `sheet-link ${this.dataHolder.currentSheet === sheetName ? 'active' : ''}`;
            link.textContent = sheetName;
            link.onclick = async () => await this.switchSheet(sheetName);
            nav.appendChild(link);
        });
    }

    async switchSheet(sheetName) {
        console.log('Switching to sheet:', sheetName);

        // Clear all tips before switching
        if (this.uiTip) {
            this.uiTip.removeAllTips();
        }

        this.dataHolder.setCurrentSheet(sheetName);
        this.renderSheetsNav();
        await this.updateViewAndViewModel();
        this.updatePositionInfo();

        // Update selection manager for new sheet
        if (this.selectionManager) {
            this.selectionManager.data.setCurrentSheet(sheetName);
            this.selectionManager.render();
        }

        // Restore tips for the new sheet
        if (this.uiTip) {
            this.restoreTipsForCurrentSheet();
        }
    }

    attachModeButtonHandlers() {
        const formulasBtn = document.getElementById('formulas-mode-btn');
        const resultsBtn = document.getElementById('results-mode-btn');

        if (formulasBtn) {
            formulasBtn.addEventListener('click', async () => {
                this.showFormulas = true;
                await this.updateViewAndViewModel();
                this.updateModeButtons();
                this.updatePositionInfo();
            });
        }

        if (resultsBtn) {
            resultsBtn.addEventListener('click', async () => {
                this.showFormulas = false;
                await this.updateViewAndViewModel();
                this.updateModeButtons();
                this.updatePositionInfo();
            });
        }
    }

    attachKeyboardShortcuts() {
        document.addEventListener('keydown', async (e) => {
            const ctrlKey = e.ctrlKey || e.metaKey;

            // Ctrl+O: Open file
            if (ctrlKey && e.key === 'o') {
                e.preventDefault();
                await this.executeAction('open');
            }
            // Ctrl+S: Save file
            else if (ctrlKey && e.key === 's') {
                e.preventDefault();
                await this.executeAction('save');
            }
            // Ctrl+E: Export CSV
            else if (ctrlKey && e.key === 'e') {
                e.preventDefault();
                await this.executeAction('export-csv');
            }
            // Ctrl+C: Copy
            else if (ctrlKey && e.key === 'c') {
                e.preventDefault();
                const activeCell = document.activeElement;
                if (activeCell && activeCell.getAttribute('data-cell')) {
                    await this.executeAction('copy', activeCell.getAttribute('data-cell'));
                }
            }
            // Ctrl+X: Cut
            else if (ctrlKey && e.key === 'x') {
                e.preventDefault();
                const activeCell = document.activeElement;
                if (activeCell && activeCell.getAttribute('data-cell')) {
                    await this.executeAction('cut', activeCell.getAttribute('data-cell'));
                }
            }
            // Ctrl+V: Paste
            else if (ctrlKey && e.key === 'v') {
                e.preventDefault();
                const activeCell = document.activeElement;
                if (activeCell && activeCell.getAttribute('data-cell')) {
                    await this.executeAction('paste', activeCell.getAttribute('data-cell'));
                }
            }
            // F5: Refresh
            else if (e.key === 'F5') {
                e.preventDefault();
                await this.refreshView();
            }
            // Page Up: Move to top
            else if (e.key === 'PageUp' && !ctrlKey) {
                e.preventDefault();
                this.navController?.moveToTop();
            }
            // Page Down: Move to bottom
            else if (e.key === 'PageDown' && !ctrlKey) {
                e.preventDefault();
                this.navController?.moveToBottom();
            }
            // Home: Move to left edge
            else if (e.key === 'Home' && !ctrlKey) {
                e.preventDefault();
                this.navController?.moveToLeft();
            }
            // End: Move to right edge
            else if (e.key === 'End' && !ctrlKey) {
                e.preventDefault();
                this.navController?.moveToRight();
            }
            // Ctrl+Page Up: Step up
            else if (ctrlKey && e.key === 'PageUp') {
                e.preventDefault();
                this.navController?.stepUp();
            }
            // Ctrl+Page Down: Step down
            else if (ctrlKey && e.key === 'PageDown') {
                e.preventDefault();
                this.navController?.stepDown();
            }
            // Ctrl+Home: Step left
            else if (ctrlKey && e.key === 'Home') {
                e.preventDefault();
                this.navController?.stepLeft();
            }
            // Ctrl+End: Step right
            else if (ctrlKey && e.key === 'End') {
                e.preventDefault();
                this.navController?.stepRight();
            }
            // Ctrl+` or Ctrl+~: Toggle command line
            else if (ctrlKey && e.key === '`') {
                e.preventDefault();
                this.commandLine?.toggle();
            }
        });
    }

    updateModeButtons() {
        const formulasBtn = document.getElementById('formulas-mode-btn');
        const resultsBtn = document.getElementById('results-mode-btn');

        if (formulasBtn && resultsBtn) {
            if (this.showFormulas) {
                formulasBtn.classList.add('active');
                resultsBtn.classList.remove('active');
            } else {
                formulasBtn.classList.remove('active');
                resultsBtn.classList.add('active');
            }
        }
    }

    getColumnLetter(colIndex) {
        let letter = '';
        let index = colIndex;
        while (index > 0) {
            index--;
            letter = String.fromCharCode(65 + (index % 26)) + letter;
            index = Math.floor(index / 26);
        }
        return letter;
    }

    updatePositionInfo() {
        const sheet = this.dataHolder.getCurrentSheet();
        const end_row = sheet.start_row + 6;
        const end_col = sheet.start_col + 6;
        const modeText = this.showFormulas ? 'Formulas Mode' : 'Results Mode';
        const positionInfo = document.getElementById('position-info');

        if (positionInfo) {
            positionInfo.textContent = `${modeText} | Viewport: Rows ${sheet.start_row}-${end_row}, Cols ${this.getColumnLetter(sheet.start_col)}-${this.getColumnLetter(end_col)}`;
        }
    }

    // Method to get all sheet data for save/export (includes metadata)
    getAllSheetData() {
        const sheetsData = {};

        for (const [sheetName, sheet] of Object.entries(this.dataHolder.sheets)) {
            sheetsData[sheetName] = {
                start_row: sheet.start_row,
                start_col: sheet.start_col,
                cells: sheet.cells.map(cell => ({
                    cell: cell.cell,
                    data: cell.data,
                    metadata: cell.metadata || null
                }))
            };
        }

        const exportData = {
            version: '1.6.0',
            currentSheet: this.dataHolder.currentSheet,
            sheets: sheetsData
        };

        // Add selection data if available
        if (this.selectionManager) {
            exportData.selection = this.selectionManager.serialize();
        }

        return exportData;
    }

    // Method to load sheet data from external source
    async loadSheetData(data) {
        if (data.version && data.sheets) {
            // Validate and load the data
            for (const [sheetName, sheetData] of Object.entries(data.sheets)) {
                if (!this.dataHolder.sheets[sheetName]) {
                    this.dataHolder.sheets[sheetName] = {
                        start_row: sheetData.start_row || 1,
                        start_col: sheetData.start_col || 1,
                        cells: []
                    };
                } else {
                    this.dataHolder.sheets[sheetName].start_row = sheetData.start_row || 1;
                    this.dataHolder.sheets[sheetName].start_col = sheetData.start_col || 1;
                }

                // Load cells with metadata
                this.dataHolder.sheets[sheetName].cells = (sheetData.cells || []).map(cell => ({
                    cell: cell.cell,
                    data: cell.data,
                    metadata: cell.metadata || null
                }));
            }

            if (data.currentSheet && this.dataHolder.sheets[data.currentSheet]) {
                this.dataHolder.currentSheet = data.currentSheet;
            }

            this.computationEngine.clearCache();
            this.renderSheetsNav();
            await this.updateViewAndViewModel();
            this.updatePositionInfo();

            // Restore selection data if available
            if (data.selection && this.selectionManager) {
                this.selectionManager.deserialize(data.selection);
            }

            return true;
        }
        return false;
    }
}

// Make handleContextMenu available globally for fallback
window.handleContextMenuGlobal = (event, cellId) => {
    if (window.app) {
        window.app.handleContextMenu(event, cellId);
    } else {
        console.error('App not initialized yet');
        alert('Application not fully initialized. Please refresh the page.');
    }
};
