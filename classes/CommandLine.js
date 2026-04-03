// CommandLine - Provides a command line interface for executing text commands
export default class CommandLine {
    constructor(containerId, appController) {
        this.container = document.getElementById(containerId);
        this.appController = appController;
        this.isVisible = false;
        this.commandHistory = [];
        this.historyIndex = -1;
        this.commands = new Map();
        this.init();
    }

    init() {
        this.registerCommands();
        this.render();
        this.attachEventListeners();
        this.attachGlobalShortcut();
    }

    registerCommands() {
        // File commands
        this.commands.set('open', {
            description: 'Open .edt file',
            usage: 'open',
            execute: async () => {
                await this.appController.executeAction('open');
                this.addToHistory('open', 'File opened successfully');
            }
        });

        this.commands.set('save', {
            description: 'Save .edt file',
            usage: 'save [filename]',
            execute: async (args) => {
                const filename = args[0] || 'spreadsheet.edt';
                await this.appController.executeAction('save');
                this.addToHistory(`save ${filename}`, `File saved as ${filename}`);
            }
        });

        this.commands.set('export', {
            description: 'Export to CSV',
            usage: 'export [filename]',
            execute: async (args) => {
                const filename = args[0] || 'export.csv';
                await this.appController.executeAction('export-csv');
                this.addToHistory(`export ${filename}`, `Exported to ${filename}`);
            }
        });

        // View commands
        this.commands.set('formulas', {
            description: 'Switch to Formulas Mode',
            usage: 'formulas',
            execute: async () => {
                await this.appController.setFormulasMode(true);
                this.addToHistory('formulas', 'Switched to Formulas Mode');
            }
        });

        this.commands.set('results', {
            description: 'Switch to Results Mode',
            usage: 'results',
            execute: async () => {
                await this.appController.setFormulasMode(false);
                this.addToHistory('results', 'Switched to Results Mode');
            }
        });

        this.commands.set('refresh', {
            description: 'Refresh the view',
            usage: 'refresh',
            execute: async () => {
                await this.appController.refreshView();
                this.addToHistory('refresh', 'View refreshed');
            }
        });

        // Navigation commands
        this.commands.set('goto', {
            description: 'Go to specific cell',
            usage: 'goto <cell> (e.g., goto A1)',
            execute: async (args) => {
                if (args.length === 0) {
                    this.printMessage('Usage: goto <cell> (e.g., goto A1)', 'error');
                    return;
                }

                const cellRef = args[0].toUpperCase();
                const colMatch = cellRef.match(/[A-Z]+/);
                const rowMatch = cellRef.match(/[0-9]+/);

                if (!colMatch || !rowMatch) {
                    this.printMessage(`Invalid cell reference: ${cellRef}`, 'error');
                    return;
                }

                const col = this.columnToNumber(colMatch[0]);
                const row = parseInt(rowMatch[0]);

                // Calculate viewport position to show this cell
                const viewportWidth = 7;
                const viewportHeight = 7;
                const newStartCol = Math.max(1, Math.min(col - Math.floor(viewportWidth / 2),
                    this.appController.viewModel.MAX_COL_INDEX - viewportWidth + 1));
                const newStartRow = Math.max(1, Math.min(row - Math.floor(viewportHeight / 2),
                    this.appController.viewModel.MAX_ROW - viewportHeight + 1));

                this.appController.dataHolder.updateViewport(
                    this.appController.dataHolder.currentSheet,
                    newStartRow,
                    newStartCol
                );
                await this.appController.updateViewAndViewModel();
                this.addToHistory(`goto ${cellRef}`, `Moved to cell ${cellRef}`);
            }
        });

        this.commands.set('sheet', {
            description: 'Switch to a different sheet',
            usage: 'sheet <sheetname>',
            execute: async (args) => {
                if (args.length === 0) {
                    const sheets = this.appController.dataHolder.getSheetNames();
                    this.printMessage(`Available sheets: ${sheets.join(', ')}`, 'info');
                    return;
                }

                const sheetName = args[0];
                const sheets = this.appController.dataHolder.getSheetNames();

                if (sheets.includes(sheetName)) {
                    await this.appController.switchSheet(sheetName);
                    this.addToHistory(`sheet ${sheetName}`, `Switched to sheet: ${sheetName}`);
                } else {
                    this.printMessage(`Sheet not found: ${sheetName}. Available: ${sheets.join(', ')}`, 'error');
                }
            }
        });

        // Info commands
        this.commands.set('ls', {
            description: 'List all sheets',
            usage: 'ls',
            execute: async () => {
                const sheets = this.appController.dataHolder.getSheetNames();
                const currentSheet = this.appController.dataHolder.currentSheet;
                this.printMessage(`Sheets (current: ${currentSheet}):`, 'info');
                sheets.forEach(sheet => {
                    this.printMessage(`  ${sheet}${sheet === currentSheet ? ' (active)' : ''}`, 'info');
                });
                this.addToHistory('ls', `Listed ${sheets.length} sheets`);
            }
        });

        this.commands.set('info', {
            description: 'Show current spreadsheet info',
            usage: 'info',
            execute: async () => {
                const currentSheet = this.appController.dataHolder.currentSheet;
                const sheet = this.appController.dataHolder.getCurrentSheet();
                const cellCount = sheet.cells.length;
                const startRow = sheet.start_row;
                const startCol = sheet.start_col;
                const modeText = this.appController.showFormulas ? 'Formulas' : 'Results';

                this.printMessage('=== Spreadsheet Info ===', 'info');
                this.printMessage(`Current Sheet: ${currentSheet}`, 'info');
                this.printMessage(`Non-empty Cells: ${cellCount}`, 'info');
                this.printMessage(`Viewport: Rows ${startRow}-${startRow + 6}, Cols ${this.numberToColumn(startCol)}-${this.numberToColumn(startCol + 6)}`, 'info');
                this.printMessage(`Mode: ${modeText}`, 'info');
                this.printMessage(`Version: 1.3.0`, 'info');
                this.addToHistory('info', 'Displayed spreadsheet information');
            }
        });

        this.commands.set('help', {
            description: 'Show available commands',
            usage: 'help [command]',
            execute: (args) => {
                if (args.length > 0) {
                    const cmdName = args[0].toLowerCase();
                    const cmd = this.commands.get(cmdName);
                    if (cmd) {
                        this.printMessage(`=== ${cmdName.toUpperCase()} ===`, 'info');
                        this.printMessage(`Description: ${cmd.description}`, 'info');
                        this.printMessage(`Usage: ${cmd.usage}`, 'info');
                    } else {
                        this.printMessage(`Unknown command: ${cmdName}`, 'error');
                    }
                } else {
                    this.printMessage('=== Available Commands ===', 'info');
                    this.printMessage('Type "help <command>" for more details on a specific command.', 'info');
                    this.printMessage('');

                    const categories = new Map();
                    categories.set('File', ['open', 'save', 'export']);
                    categories.set('View', ['formulas', 'results', 'refresh']);
                    categories.set('Navigation', ['goto', 'sheet']);
                    categories.set('Info', ['ls', 'info', 'help']);
                    categories.set('System', ['clear', 'history', 'exit']);

                    for (const [category, cmds] of categories) {
                        this.printMessage(`--- ${category} ---`, 'info');
                        for (const cmdName of cmds) {
                            const cmd = this.commands.get(cmdName);
                            if (cmd) {
                                this.printMessage(`  ${cmdName.padEnd(12)} - ${cmd.description}`, 'info');
                            }
                        }
                        this.printMessage('', 'info');
                    }
                }
                this.addToHistory('help', 'Displayed help information');
            }
        });

        // System commands
        this.commands.set('clear', {
            description: 'Clear the command line output',
            usage: 'clear',
            execute: () => {
                this.clearOutput();
                this.addToHistory('clear', 'Cleared output');
            }
        });

        this.commands.set('history', {
            description: 'Show command history',
            usage: 'history',
            execute: () => {
                if (this.commandHistory.length === 0) {
                    this.printMessage('No commands in history', 'info');
                } else {
                    this.printMessage('=== Command History ===', 'info');
                    this.commandHistory.forEach((item, index) => {
                        this.printMessage(`${index + 1}. ${item.command} -> ${item.result}`, 'info');
                    });
                }
                this.addToHistory('history', 'Displayed command history');
            }
        });

        this.commands.set('exit', {
            description: 'Close the command line',
            usage: 'exit',
            execute: () => {
                this.hide();
                this.addToHistory('exit', 'Command line closed');
            }
        });
    }

    columnToNumber(col) {
        let result = 0;
        for (let i = 0; i < col.length; i++) {
            result = result * 26 + (col.charCodeAt(i) - 64);
        }
        return result;
    }

    numberToColumn(num) {
        let result = '';
        let index = num;
        while (index > 0) {
            index--;
            result = String.fromCharCode(65 + (index % 26)) + result;
            index = Math.floor(index / 26);
        }
        return result;
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="command-line ${this.isVisible ? 'visible' : ''}">
                <div class="command-line-header">
                    <span class="command-line-title">📟 Command Line</span>
                    <div class="command-line-controls">
                        <button class="cmd-minimize" title="Minimize">−</button>
                        <button class="cmd-clear" title="Clear">⌧</button>
                        <button class="cmd-close" title="Close">✕</button>
                    </div>
                </div>
                <div class="command-line-output">
                    <div class="cmd-welcome">
                        Welcome to Editable Table Command Line v1.0
                        Type 'help' to see available commands.
                    </div>
                </div>
                <div class="command-line-input-container">
                    <span class="cmd-prompt">$></span>
                    <input type="text" class="command-line-input" placeholder="Type a command...">
                </div>
            </div>
        `;

        this.outputDiv = this.container.querySelector('.command-line-output');
        this.inputField = this.container.querySelector('.command-line-input');

        if (this.inputField) {
            this.inputField.addEventListener('keydown', (e) => this.handleKeyDown(e));
        }

        const minimizeBtn = this.container.querySelector('.cmd-minimize');
        const clearBtn = this.container.querySelector('.cmd-clear');
        const closeBtn = this.container.querySelector('.cmd-close');

        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => this.minimize());
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearOutput());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }
    }

    attachEventListeners() {
        // Click outside to keep focus
        document.addEventListener('click', (e) => {
            if (this.isVisible && this.container && !this.container.contains(e.target)) {
                // Don't hide, just blur input
                if (this.inputField) {
                    this.inputField.blur();
                }
            }
        });
    }

    attachGlobalShortcut() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+` or Ctrl+~ to toggle command line
            if ((e.ctrlKey || e.metaKey) && e.key === '`') {
                e.preventDefault();
                this.toggle();
            }
            // Esc to clear input or hide
            else if (e.key === 'Escape' && this.isVisible) {
                if (this.inputField && this.inputField.value.trim() !== '') {
                    this.inputField.value = '';
                } else {
                    this.hide();
                }
            }
        });
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    show() {
        this.isVisible = true;
        if (this.container) {
            this.container.querySelector('.command-line').classList.add('visible');
            this.inputField?.focus();
        }
        this.printMessage('Command line opened. Type "help" for available commands.', 'info');
    }

    hide() {
        this.isVisible = false;
        if (this.container) {
            this.container.querySelector('.command-line').classList.remove('visible');
        }
    }

    minimize() {
        if (this.container) {
            this.container.querySelector('.command-line').classList.toggle('minimized');
        }
    }

    clearOutput() {
        if (this.outputDiv) {
            this.outputDiv.innerHTML = '';
        }
    }

    handleKeyDown(e) {
        if (e.key === 'Enter') {
            const command = this.inputField.value.trim();
            if (command) {
                this.executeCommand(command);
                this.inputField.value = '';
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.navigateHistory(-1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.navigateHistory(1);
        }
    }

    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;

        if (direction === -1) { // Up
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
            }
        } else { // Down
            if (this.historyIndex > -1) {
                this.historyIndex--;
            }
        }

        if (this.historyIndex >= 0) {
            const historyItem = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
            this.inputField.value = historyItem.command;
        } else {
            this.inputField.value = '';
        }
    }

    async executeCommand(commandLine) {
        const parts = commandLine.trim().split(/\s+/);
        const commandName = parts[0].toLowerCase();
        const args = parts.slice(1);

        const command = this.commands.get(commandName);

        if (command) {
            try {
                await command.execute(args);
            } catch (error) {
                this.printMessage(`Error executing command: ${error.message}`, 'error');
            }
        } else {
            this.printMessage(`Unknown command: ${commandName}. Type 'help' to see available commands.`, 'error');
            this.addToHistory(commandLine, `Unknown command: ${commandName}`);
        }
    }

    printMessage(message, type = 'info') {
        if (!this.outputDiv) return;

        const line = document.createElement('div');
        line.className = `cmd-line cmd-${type}`;

        const timestamp = new Date().toLocaleTimeString();
        line.innerHTML = `<span class="cmd-time">[${timestamp}]</span> ${message}`;

        this.outputDiv.appendChild(line);
        line.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    addToHistory(command, result) {
        this.commandHistory.unshift({ command, result, timestamp: new Date() });
        // Keep only last 50 commands
        if (this.commandHistory.length > 50) {
            this.commandHistory.pop();
        }
        this.historyIndex = -1;
    }
}
