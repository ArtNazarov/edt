// edt.js - Refactored with dynamic class loading
// Main entry point that dynamically loads all required classes

// ==================== Dynamic Class Loader ====================
class ClassLoader {
    constructor() {
        this.classes = new Map();
        this.loadingPromises = new Map();
        this.classPathMap = {
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
            'AppController': './classes/AppController.js'
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
                console.error(`Failed to load class ${className}:`, error);
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
        document.getElementById('table-container').innerHTML =
            '<div style="color: red; padding: 20px;">Failed to load application. Please check that all class files exist in the "classes" folder and you are running from a web server.</div>';
    }
});
