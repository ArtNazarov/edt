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
            'UITip': './classes/UITip.js',
            'PopupContextMenu': './classes/PopupContextMenu.js',

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
            'ActionStepRight': './actions/ActionStepRight.js',

            // Tips actions
            'ActionAddTip': './actions/ActionAddTip.js',
            'ActionShowTip': './actions/ActionShowTip.js',
            'ActionHideTip': './actions/ActionHideTip.js',
            'ActionEditTip': './actions/ActionEditTip.js',
            'ActionDeleteTip': './actions/ActionDeleteTip.js',

            // Edit actions
            'ActionCopy': './actions/ActionCopy.js',
            'ActionCut': './actions/ActionCut.js',
            'ActionPaste': './actions/ActionPaste.js'
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
            console.log(`Class loaded: ${className}`);
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

// Global variable for app instance
window.app = null;

// ==================== Application Initialization ====================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Content Loaded, initializing application...');

    // Show loading indicator
    const container = document.getElementById('table-container');
    if (container) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">Loading application... Please wait.</div>';
    }

    try {
        // Load AppController class
        const AppController = await window.classLoader.loadClass('AppController');
        console.log('AppController class loaded, creating instance...');

        // Create app instance
        const app = new AppController();
        window.app = app;

        console.log('Application initialized successfully', window.app);

        // Remove loading indicator (already replaced by actual content)
        if (container && container.innerHTML.includes('Loading application')) {
            // The actual render will replace this
        }

    } catch (error) {
        console.error('Failed to initialize application:', error);

        // Show error message to user
        const errorContainer = document.getElementById('table-container');
        if (errorContainer) {
            errorContainer.innerHTML = `
            <div style="color: red; padding: 20px; text-align: center; background: #ffe6e6; border: 1px solid #ffcccc; border-radius: 8px; margin: 20px;">
            <h3>Failed to load application</h3>
            <p>Please check the following:</p>
            <ul style="text-align: left; display: inline-block;">
            <li>All class files exist in the <code>/classes</code> folder</li>
            <li>All action files exist in the <code>/actions</code> folder</li>
            <li>You are running from a web server (not file:// protocol)</li>
            <li>Check the browser console for more details</li>
            </ul>
            <p><strong>Error:</strong> ${error.message}</p>
            <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; cursor: pointer;">Reload Page</button>
            </div>
            `;
        }

        // Also show error in sheets nav if exists
        const sheetsNav = document.getElementById('sheets-nav');
        if (sheetsNav) {
            sheetsNav.innerHTML = '<span style="color: red;">Error loading application</span>';
        }
    }
});

// Optional: Add a timeout to detect if initialization is taking too long
setTimeout(() => {
    if (!window.app) {
        console.warn('Application initialization is taking longer than expected...');
        const container = document.getElementById('table-container');
        if (container && container.innerHTML.includes('Loading application')) {
            container.innerHTML = `
            <div style="color: #856404; padding: 20px; text-align: center; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; margin: 20px;">
            <h3>Loading taking longer than expected...</h3>
            <p>Please check your network connection and ensure all files are accessible.</p>
            <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; cursor: pointer;">Reload Page</button>
            </div>
            `;
        }
    }
}, 10000); // 10 second timeout
