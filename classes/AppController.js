import DataHolder from './DataHolder.js';
import ComputationEngine from './ComputationEngine.js';
import CellsEditablesController from './CellsEditablesController.js';
import ViewModel from './ViewModel.js';
import SheetView from './SheetView.js';
import NavButtonsController from './NavButtonsController.js';
import MainMenu from './MainMenu.js';
import CommandLine from './CommandLine.js';

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
        this.init();
    }

    async init() {
        await this.loadActions();
        this.renderMainMenu();
        this.renderCommandLine();
        this.renderSheetsNav();
        await this.updateViewAndViewModel();
        this.attachGlobalButtonHandlers();
        this.attachModeButtonHandlers();
        this.attachKeyboardShortcuts();
        this.updatePositionInfo();
        this.updateModeButtons();
    }

    async loadActions() {
        try {
            const OpenAction = await window.classLoader.loadClass('OpenAction');
            const SaveAction = await window.classLoader.loadClass('SaveAction');
            const ExportCSVAction = await window.classLoader.loadClass('ExportCSVAction');

            this.actions.set('open', new OpenAction(this));
            this.actions.set('save', new SaveAction(this));
            this.actions.set('export-csv', new ExportCSVAction(this));
        } catch (error) {
            console.error('Failed to load actions:', error);
        }
    }

    async executeAction(actionName) {
        const action = this.actions.get(actionName);
        if (action) {
            await action.execute();
        } else {
            console.warn(`Action not found: ${actionName}`);
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
        this.viewModel = new ViewModel(this.dataHolder, this.dataHolder.currentSheet, this.computationEngine, this.showFormulas);
        this.sheetView = new SheetView('table-container', this.viewModel, async (cellId, newValue) => {
            await this.cellsController.handleCellEdit(this.dataHolder.currentSheet, cellId, newValue);
            await this.updateViewAndViewModel();
            this.updatePositionInfo();
        });
        this.navController = new NavButtonsController(this.dataHolder, this.viewModel, async () => {
            await this.updateViewAndViewModel();
            this.updatePositionInfo();
        });
        await this.sheetView.render();
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
        this.dataHolder.setCurrentSheet(sheetName);
        this.renderSheetsNav();
        await this.updateViewAndViewModel();
        this.updatePositionInfo();
    }

    attachGlobalButtonHandlers() {
        window.moveToTop = () => this.navController?.moveToTop();
        window.moveToBottom = () => this.navController?.moveToBottom();
        window.stepUp = () => this.navController?.stepUp();
        window.stepDown = () => this.navController?.stepDown();
        window.moveToLeft = () => this.navController?.moveToLeft();
        window.moveToRight = () => this.navController?.moveToRight();
        window.stepLeft = () => this.navController?.stepLeft();
        window.stepRight = () => this.navController?.stepRight();
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
            // Ctrl+O: Open file
            if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
                e.preventDefault();
                await this.executeAction('open');
            }
            // Ctrl+S: Save file
            else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                await this.executeAction('save');
            }
            // Ctrl+E: Export CSV
            else if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                await this.executeAction('export-csv');
            }
            // F5: Refresh
            else if (e.key === 'F5') {
                e.preventDefault();
                await this.refreshView();
            }
            // Ctrl+` or Ctrl+~: Toggle command line
            else if ((e.ctrlKey || e.metaKey) && e.key === '`') {
                e.preventDefault();
                this.commandLine?.toggle();
            }
            // Shift+Arrow keys for edge navigation
            else if (e.shiftKey && e.key === 'ArrowUp') {
                e.preventDefault();
                this.navController?.moveToTop();
            }
            else if (e.shiftKey && e.key === 'ArrowDown') {
                e.preventDefault();
                this.navController?.moveToBottom();
            }
            else if (e.shiftKey && e.key === 'ArrowLeft') {
                e.preventDefault();
                this.navController?.moveToLeft();
            }
            else if (e.shiftKey && e.key === 'ArrowRight') {
                e.preventDefault();
                this.navController?.moveToRight();
            }
            // Arrow keys for step navigation
            else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navController?.stepUp();
            }
            else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navController?.stepDown();
            }
            else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.navController?.stepLeft();
            }
            else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.navController?.stepRight();
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

    // Method to get all sheet data for save/export
    getAllSheetData() {
        const sheetsData = {};

        for (const [sheetName, sheet] of Object.entries(this.dataHolder.sheets)) {
            sheetsData[sheetName] = {
                start_row: sheet.start_row,
                start_col: sheet.start_col,
                cells: sheet.cells.map(cell => ({ cell: cell.cell, data: cell.data }))
            };
        }

        return {
            version: '1.3.0',
            currentSheet: this.dataHolder.currentSheet,
            sheets: sheetsData
        };
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

                this.dataHolder.sheets[sheetName].cells = sheetData.cells || [];
            }

            if (data.currentSheet && this.dataHolder.sheets[data.currentSheet]) {
                this.dataHolder.currentSheet = data.currentSheet;
            }

            this.computationEngine.clearCache();
            this.renderSheetsNav();
            await this.updateViewAndViewModel();
            this.updatePositionInfo();

            return true;
        }
        return false;
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
    } catch (error) {
        console.error('Failed to load actions:', error);
    }
}


}
