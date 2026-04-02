import DataHolder from './DataHolder.js';
import ComputationEngine from './ComputationEngine.js';
import CellsEditablesController from './CellsEditablesController.js';
import ViewModel from './ViewModel.js';
import SheetView from './SheetView.js';
import NavButtonsController from './NavButtonsController.js';

// AppController - Orchestrates all components
export default class AppController {
    constructor() {
        this.dataHolder = new DataHolder();
        this.computationEngine = new ComputationEngine(this.dataHolder);
        this.cellsController = new CellsEditablesController(this.dataHolder, this.computationEngine);
        this.showFormulas = true;
        this.init();
    }

    init() {
        this.renderSheetsNav();
        this.updateViewAndViewModel();
        this.attachGlobalButtonHandlers();
        this.attachModeButtonHandlers();
        this.updatePositionInfo();
        this.updateModeButtons();
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
        window.moveToTop = () => this.navController.moveToTop();
        window.moveToBottom = () => this.navController.moveToBottom();
        window.stepUp = () => this.navController.stepUp();
        window.stepDown = () => this.navController.stepDown();
        window.moveToLeft = () => this.navController.moveToLeft();
        window.moveToRight = () => this.navController.moveToRight();
        window.stepLeft = () => this.navController.stepLeft();
        window.stepRight = () => this.navController.stepRight();
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
        document.getElementById('position-info').textContent = `${modeText} | Viewport: Rows ${sheet.start_row}-${end_row}, Cols ${this.getColumnLetter(sheet.start_col)}-${this.getColumnLetter(end_col)}`;
    }
}
