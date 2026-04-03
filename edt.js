// edt.js - Refactored with dynamic class loading and MainMenu integration
// Main entry point that dynamically loads all required classes

// ==================== Dynamic Class Loader ====================
class ClassLoader {
    constructor() {
        this.classes = new Map();
        this.loadingPromises = new Map();
        this.classPathMap = {
            // Core classes
            'ASTNode': './classes/ASTNode.js',
            'FormulaTokenizer': './classes/FormulaTokenizer.js',
            'FormulaParser': './classes/FormulaParser.js',
            'FunctionRegistry': './classes/FunctionRegistry.js',
            'ASTEvaluator': './classes/ASTEvaluator.js',
            'ComputationEngine': './classes/ComputationEngine.js',
            'DataHolder': './classes/DataHolder.js',
            'ViewModel': './classes/ViewModel.js',
            'SheetView': './classes/SheetView.js',
            'NavButtonsController': './classes/NavButtonsController.js',
            'CellsEditablesController': './classes/CellsEditablesController.js',
            'AppController': './classes/AppController.js',
            'MainMenu': './classes/MainMenu.js',
            'CommandLine': './classes/CommandLine.js',

            // File actions
            'OpenAction': './actions/OpenAction.js',
            'SaveAction': './actions/SaveAction.js',
            'ExportCSVAction': './actions/ExportCSVAction.js',

            // Navigation actions - Edge movements
            'ActionMoveToTop': './actions/ActionMoveToTop.js',
            'ActionMoveToBottom': './actions/ActionMoveToBottom.js',
            'ActionMoveToLeft': './actions/ActionMoveToLeft.js',
            'ActionMoveToRight': './actions/ActionMoveToRight.js',

            // Navigation actions - Step movements
            'ActionStepUp': './actions/ActionStepUp.js',
            'ActionStepDown': './actions/ActionStepDown.js',
            'ActionStepLeft': './actions/ActionStepLeft.js',
            'ActionStepRight': './actions/ActionStepRight.js'
        };
    }

    async loadClass(className) {
        // Check if already loaded
        if (this.classes.has(className)) {
            return this.classes.get(className);
        }

        // Check if currently loading
        if (this.loadingPromises.has(className)) {
            return this.loadingPromises.get(className);
        }

        // Get the file path
        const filePath = this.classPathMap[className];
        if (!filePath) {
            throw new Error(`Unknown class: ${className}`);
        }

        // Load the class module dynamically
        const loadPromise = import(filePath)
            .then(module => {
                const cls = module.default;
                this.classes.set(className, cls);
                this.loadingPromises.delete(className);
                return cls;
            })
            .catch(error => {
                this.loadingPromises.delete(className);
                console.error(`Failed to load class ${className} from ${filePath}:`, error);
                throw new Error(`Class ${className} not available: ${error.message}`);
            });

        this.loadingPromises.set(className, loadPromise);
        return loadPromise;
    }

    async getInstance(className, ...args) {
        const ClassRef = await this.loadClass(className);
        return new ClassRef(...args);
    }
}

// Global class loader instance
window.classLoader = new ClassLoader();

// ==================== Application Initialization ====================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const AppController = await window.classLoader.loadClass('AppController');
        window.app = new AppController();
    } catch (error) {
        console.error('Failed to initialize application:', error);
        const container = document.getElementById('table-container');
        if (container) {
            container.innerHTML = '<div style="color: red; padding: 20px; text-align: center;">Failed to load application. Please check that all class files exist and you are running from a web server.</div>';
        }
    }
});
