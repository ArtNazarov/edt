# Editable Table Viewport with Formula Support

A JavaScript application that displays an editable spreadsheet-like table with viewport navigation, multiple sheet support, reactive formula computation, main menu, command line interface, and file operations.

## Screenshots

![UI](https://dl.dropbox.com/scl/fi/dscmmzcglgb2axoekwpnt/updateduiwithmenu.png?rlkey=q23ikdea1y5hzwwb1iuigbqw1&st=893kf158)

![Tests](https://dl.dropbox.com/scl/fi/vvj660ptyqiab597h4qro/sumproduct_test.png?rlkey=pagckitohaibwb1mjpe77shqs&st=zuraol74)

## Features

- **7x7 Viewport:** Displays a fixed 7x7 grid of cells (7 rows × 7 columns)
- **Multiple Sheets:** Supports multiple worksheets with independent data
- **Formula Support:**
  - Basic arithmetic expressions (+, -, *, /)
  - Spreadsheet functions: SUM, AVG, MAX, MIN, COUNT, SUMPRODUCT, VLOOKUP
  - Cell references (e.g., `A1`, `B2`, `ZZ14`)
  - Range references (e.g., `A1:C3`)
  - Cross-sheet references (e.g., `first.A1`, `second.B3`)
- **Main Menu Bar:** File, Edit, View, Help menus with keyboard shortcuts
- **Command Line Interface:** Execute commands with history and auto-completion
- **File Operations:** Open/Save `.edt` files, Export to CSV
- **Dual Mode Display:**
  - **Formulas Mode:** Shows actual formulas (e.g., `=SUM(A1:A3)`)
  - **Results Mode:** Shows computed values
- **Reactive Computation:** Formulas automatically recalculate when referenced cells change
- **Cell Editing:** Click any cell to edit its content
- **Viewport Navigation:** Move the viewport around a virtual grid:
  - Move to top/bottom/left/right edges
  - Step up/down/left/right one row/column at a time
- **Large Virtual Grid:** Supports up to 999 rows and columns up to ZZZ (18,278 columns)
- **Position Indicator:** Shows current viewport range and active mode

---

## Main Menu

The application features a comprehensive main menu bar with the following menus and items:

### File Menu

| Menu Item | Action | Keyboard Shortcut | Description |
|-----------|--------|-------------------|-------------|
| Open .edt | Open file dialog | `Ctrl+O` | Open a previously saved `.edt` spreadsheet file |
| Save .edt | Save current data | `Ctrl+S` | Save all sheets data to an `.edt` file |
| Export to CSV | Export current sheet | `Ctrl+E` | Export the current sheet to CSV format |

### Edit Menu

| Menu Item | Action | Description |
|-----------|--------|-------------|
| Formulas Mode | Switch to formulas view | Display cell formulas instead of computed values |
| Results Mode | Switch to results view | Display computed values instead of formulas |

### View Menu

| Menu Item | Action | Keyboard Shortcut | Description |
|-----------|--------|-------------------|-------------|
| Refresh | Refresh the view | `F5` | Refresh the current view and recalculate all formulas |

### Help Menu

| Menu Item | Action | Description |
|-----------|--------|-------------|
| About | Show about dialog | Display application information and version |
| Keyboard Shortcuts | Show shortcuts dialog | Display all available keyboard shortcuts |

---

## Command Line Interface

The command line interface provides a developer-friendly way to control the spreadsheet. Press `Ctrl+`` (backtick) to focus the command input.

### Available Commands

#### File Commands

| Command | Usage | Description |
|---------|-------|-------------|
| `open` | `open` | Open an `.edt` file |
| `save` | `save [filename]` | Save spreadsheet to `.edt` file |
| `export` | `export [filename]` | Export current sheet to CSV |

#### View Commands

| Command | Usage | Description |
|---------|-------|-------------|
| `formulas` | `formulas` | Switch to Formulas Mode |
| `results` | `results` | Switch to Results Mode |
| `refresh` | `refresh` | Refresh the current view |

#### Navigation Commands

| Command | Usage | Description |
|---------|-------|-------------|
| `goto` | `goto <cell>` | Move viewport to specific cell (e.g., `goto A1`) |
| `sheet` | `sheet <sheetname>` | Switch to a different sheet |

#### Info Commands

| Command | Usage | Description |
|---------|-------|-------------|
| `ls` | `ls` | List all available sheets |
| `info` | `info` | Show current spreadsheet information |
| `help` | `help [command]` | Show available commands or help for specific command |

#### System Commands

| Command | Usage | Description |
|---------|-------|-------------|
| `clear` | `clear` | Clear the command line output |
| `history` | `history` | Show command history |
| `exit` | `exit` | Close the command line interface |

### Command Line Features

- **Command History:** Use `↑` and `↓` arrow keys to navigate through command history
- **Output Coloring:** Different message types have distinct colors:
  - `info` - Blue
  - `success` - Green
  - `error` - Red
  - `warning` - Orange
- **Collapsible Output:** Click the header to minimize/hide command history
- **Keyboard Shortcut:** `Ctrl+`` (backtick) to focus the command input
- **Clear Output:** Use the `⌧` button or `clear` command

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+O` | Open .edt file |
| `Ctrl+S` | Save .edt file |
| `Ctrl+E` | Export to CSV |
| `F5` | Refresh view |
| `Ctrl+`` ` | Focus command line |
| `↑` | Move viewport up one row |
| `↓` | Move viewport down one row |
| `←` | Move viewport left one column |
| `→` | Move viewport right one column |
| `Shift+↑` | Move to top edge |
| `Shift+↓` | Move to bottom edge |
| `Shift+←` | Move to left edge |
| `Shift+→` | Move to right edge |
| `Esc` (in command line) | Clear input or hide command line |

---

## Expressions and Spreadsheet Functions

The Editable Table Viewport supports a powerful formula engine with AST-based computation. Below is comprehensive documentation on supported expressions and functions.

### Basic Arithmetic Expressions

All formulas must start with the `=` character.

| Operation | Syntax | Example | Result |
|-----------|--------|---------|--------|
| Addition | `=value + value` | `=10 + 20` | `30` |
| Subtraction | `=value - value` | `=50 - 25` | `25` |
| Multiplication | `=value * value` | `=5 * 6` | `30` |
| Division | `=value / value` | `=100 / 4` | `25` |
| Combined | `=(value + value) * value` | `=(10 + 20) * 5` | `150` |
| Nested Parentheses | `=((a + b) * c) / d` | `=((10 + 20) * 5) / 2` | `75` |

#### Supported Operands
- **Numbers:** Integers and decimals (e.g., `42`, `3.14`, `10.5`)
- **Cell References:** Single cells (e.g., `A1`, `B2`, `ZZ14`)
- **Cross-Sheet References:** Cells from other sheets (e.g., `first.A1`, `second.B3`)

---

### Spreadsheet Functions

The following built-in functions are available for data computation:

#### SUM
Calculates the sum of all numeric values in a range or list of arguments.

```
=SUM(range)
=SUM(value1, value2, ...)
```

**Examples:**
| Formula | Description | Result |
|---------|-------------|--------|
| `=SUM(A1:A10)` | Sum of values in range A1 through A10 | Sum of 10 cells |
| `=SUM(A1:C3)` | Sum of values in rectangular range | Sum of 9 cells |
| `=SUM(A1, B2, C3)` | Sum of specific cells | A1 + B2 + C3 |
| `=SUM(first.A1:first.A5)` | Cross-sheet range sum | Sum from another sheet |

---

#### AVG
Calculates the arithmetic mean (average) of all numeric values in a range.

```
=AVG(range)
=AVG(value1, value2, ...)
```

**Examples:**
| Formula | Description | Result |
|---------|-------------|--------|
| `=AVG(A1:A5)` | Average of values in range A1 through A5 | Sum / Count |
| `=AVG(C17:E17)` | Average of cells C17, D17, E17 | (C17+D17+E17)/3 |
| `=AVG(compute_avg.C17:compute_avg.E17)` | Cross-sheet average | Average from compute_avg sheet |

**Note:** Empty cells and non-numeric values are excluded from the calculation.

---

#### MAX
Returns the maximum (largest) numeric value in a range.

```
=MAX(range)
=MAX(value1, value2, ...)
```

**Examples:**
| Formula | Description | Result |
|---------|-------------|--------|
| `=MAX(A1:A100)` | Maximum value in range A1 through A100 | Highest value |
| `=MAX(C1:C10)` | Maximum of 10 cells | Highest of C1-C10 |
| `=MAX(first.A1, second.B2)` | Maximum across sheets | Larger of two values |

---

#### MIN
Returns the minimum (smallest) numeric value in a range.

```
=MIN(range)
=MIN(value1, value2, ...)
```

**Examples:**
| Formula | Description | Result |
|---------|-------------|--------|
| `=MIN(D1:D10)` | Minimum value in range D1 through D10 | Lowest value |
| `=MIN(A1:C3)` | Minimum of rectangular range | Lowest of 9 cells |

---

#### COUNT
Counts the number of numeric values in a range.

```
=COUNT(range)
=COUNT(value1, value2, ...)
```

**Examples:**
| Formula | Description | Result |
|---------|-------------|--------|
| `=COUNT(E1:E20)` | Count of numeric values in range | Number of cells with numbers |
| `=COUNT(A1, B2, C3)` | Count of specific cells | 3 (if all numeric) |

---

#### SUMPRODUCT
Multiplies corresponding components in the given arrays and returns the sum of those products.

```
=SUMPRODUCT(range1, range2)
=SUMPRODUCT(range1, range2, range3, ...)
```

**Key Features:**
- Supports 2 or more ranges
- Ranges must have the same dimensions (same number of cells)
- Empty cells are treated as 0
- Non-numeric values are ignored
- Supports cross-sheet references
- Works with single row, single column, and rectangular ranges

**Examples:**

| Formula | Description | Calculation | Result |
|---------|-------------|-------------|--------|
| `=SUMPRODUCT(A1:A3, B1:B3)` | Two vertical ranges | A1×B1 + A2×B2 + A3×B3 | Sum of products |
| `=SUMPRODUCT(A1:C1, A2:C2)` | Two horizontal ranges | A1×A2 + B1×B2 + C1×C2 | Sum of products |
| `=SUMPRODUCT(A1:A2, B1:B2, C1:C2)` | Three ranges | (A1×B1×C1) + (A2×B2×C2) | Sum of triple products |
| `=SUMPRODUCT(first.A1:A3, second.B1:B3)` | Cross-sheet ranges | Multiplies values across sheets | Sum of cross-sheet products |

**Practical Examples:**

```excel
=SUMPRODUCT(A1:A5, B1:B5)           ' Weighted sum: quantity × price
=SUMPRODUCT(A1:A3, B1:B3, C1:C3)    ' Volume calculation: length × width × height
=SUMPRODUCT((A1:A10>10), B1:B10)    ' Conditional sum (Boolean logic)
```

**Use Cases:**
- **Weighted Averages:** `=SUMPRODUCT(weights, values) / SUM(weights)`
- **Dot Product:** Calculate vector dot product of two ranges
- **Conditional Sums:** Combine with Boolean expressions
- **Cross-Sheet Analysis:** Aggregate data from multiple worksheets
- **Multi-dimensional Calculations:** Multiply three or more ranges for volume/area calculations

---

#### VLOOKUP
Looks up a value in the first column of a table and returns a value in the same row from a specified column.

```
=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])
```

**Arguments:**

| Argument | Description | Required |
|----------|-------------|----------|
| `lookup_value` | The value to search for in the first column of the table | Yes |
| `table_array` | The range of cells that contains the lookup table | Yes |
| `col_index_num` | The column number in the table from which to return a value (1-indexed) | Yes |
| `range_lookup` | Optional. TRUE = approximate match (default), FALSE = exact match | No |

**Key Features:**
- **Exact Match (FALSE/0):** Finds exact match, returns #N/A if not found
- **Approximate Match (TRUE/1):** Finds closest match (requires first column sorted ascending)
- **Cross-Sheet Support:** Can reference tables from other sheets
- **Case-Insensitive:** String matching is case-insensitive
- **Type Handling:** Properly handles numbers, strings, and mixed types

**Examples:**

| Formula | Description | Result |
|---------|-------------|--------|
| `=VLOOKUP("Product B", A1:B3, 2, FALSE)` | Exact match for Product B | Returns 200 |
| `=VLOOKUP(85, A1:B6, 2, TRUE)` | Approximate match for grade | Returns "B" |
| `=VLOOKUP(A1, prices.A1:B100, 2, FALSE)` | Cross-sheet exact lookup | Returns price |

**Error Messages:**

| Error | Cause |
|-------|-------|
| `#ERROR: VLOOKUP requires at least 3 arguments` | Missing required arguments |
| `#ERROR: Invalid column index number` | Column index < 1 or not a number |
| `#ERROR: Invalid table range` | Table array is not a valid range |
| `#ERROR: Column index exceeds table width` | Column number > table columns |
| `#N/A` | No exact match found |

---

### Cell References

#### Single Cell Reference
Reference a specific cell by its column letter and row number.

```
=A1        // Column A, Row 1
=B2        // Column B, Row 2
=ZZ14      // Column ZZ, Row 14
```

#### Range Reference
Reference a rectangular range of cells using the colon (`:`) separator.

```
=A1:C3     // From A1 to C3 (9 cells total)
=A1:A10    // Column A, rows 1 through 10
=B5:Z5     // Row 5, columns B through Z
```

---

### Cross-Sheet References

Reference cells from other worksheets using the `sheetname.cell` format.

#### Single Cell Cross-Sheet
```
=first.A1           // Value from sheet "first", cell A1
=second.B3 + 100    // Value from sheet "second" plus 100
```

#### Range Cross-Sheet
```
=SUM(first.A1:first.C3)         // Sum range in "first" sheet
=AVG(compute_avg.C17:E17)       // Average range in "compute_avg" sheet
=SUMPRODUCT(first.A1:A5, second.B1:B5)  // SUMPRODUCT across sheets
=VLOOKUP(A1, prices.A1:B100, 2, FALSE)  // VLOOKUP across sheets
```

---

## Architecture

The application follows a clean modular MVC-like architecture with separate concerns. The codebase is organized into several directories:

### Core Components (`/classes`)

| Class | Description |
|-------|-------------|
| `ASTNode` | Represents nodes in the Abstract Syntax Tree |
| `FormulaTokenizer` | Converts formula strings into tokens |
| `FormulaParser` | Parses token streams into AST nodes |
| `FunctionRegistry` | Dynamically loads spreadsheet functions |
| `ASTEvaluator` | Evaluates AST nodes and handles cell references |
| `ComputationEngine` | Main entry point for formula computation |
| `DataHolder` | Stores all sheet data and provides CRUD operations |
| `ViewModel` | Provides computed properties for view state |
| `SheetView` | Renders the 7x7 viewport as an HTML table |
| `NavButtonsController` | Handles viewport navigation button clicks |
| `CellsEditablesController` | Manages cell edit events |
| `AppController` | Orchestrates all components |
| `MainMenu` | Creates and manages the main menu bar |
| `CommandLine` | Provides command line interface |

### Actions (`/actions`)

| Action | Description |
|--------|-------------|
| `OpenAction` | Open .edt JSON files |
| `SaveAction` | Save spreadsheet as .edt |
| `ExportCSVAction` | Export current sheet to CSV |
| `ActionMoveToTop/Bottom/Left/Right` | Edge navigation actions |
| `ActionStepUp/Down/Left/Right` | Step navigation actions |

### Spreadsheet Functions (`/functions`)

| File | Function | Description |
|------|----------|-------------|
| `sum.js` | SUM | Sums all numeric values |
| `avg.js` | AVG | Calculates arithmetic mean |
| `max.js` | MAX | Returns maximum value |
| `min.js` | MIN | Returns minimum value |
| `count.js` | COUNT | Counts numeric values |
| `sumproduct.js` | SUMPRODUCT | Multiplies and sums products |
| `vlookup.js` | VLOOKUP | Looks up values in a table |

---

## File Structure

```
/
├── edt.html              # Main application HTML
├── edt.css               # Core application styles
├── mainmenu.css          # Main menu and modal styles
├── commandline.css       # Command line interface styles
├── edt.js                # Main entry point (dynamic class loader)
├── test.html             # Test suite HTML
├── README.md             # This documentation
├── classes/              # Core application classes
│   ├── ASTNode.js
│   ├── FormulaTokenizer.js
│   ├── FormulaParser.js
│   ├── FunctionRegistry.js
│   ├── ASTEvaluator.js
│   ├── ComputationEngine.js
│   ├── DataHolder.js
│   ├── ViewModel.js
│   ├── SheetView.js
│   ├── NavButtonsController.js
│   ├── CellsEditablesController.js
│   ├── AppController.js
│   ├── MainMenu.js
│   └── CommandLine.js
├── actions/              # Action components
│   ├── OpenAction.js
│   ├── SaveAction.js
│   ├── ExportCSVAction.js
│   ├── ActionMoveToTop.js
│   ├── ActionMoveToBottom.js
│   ├── ActionMoveToLeft.js
│   ├── ActionMoveToRight.js
│   ├── ActionStepUp.js
│   ├── ActionStepDown.js
│   ├── ActionStepLeft.js
│   └── ActionStepRight.js
├── functions/            # Spreadsheet function implementations
│   ├── sum.js
│   ├── avg.js
│   ├── max.js
│   ├── min.js
│   ├── count.js
│   ├── sumproduct.js
│   └── vlookup.js
└── testing/              # Test suite files
    ├── tests.css
    └── tests.js
```

---

## Usage

1. **Setup:** Start a local HTTP server in the project directory:
   ```bash
   python3 -m http.server 8000
   ```

2. **Open:** Navigate to `http://localhost:8000/edt.html` in a modern web browser.

3. **Main Menu:**
   - Click **File → Open .edt** to load a saved spreadsheet
   - Click **File → Save .edt** to save your work
   - Click **File → Export to CSV** to export the current sheet

4. **Command Line:**
   - Press `Ctrl+`` (backtick) to focus the command input
   - Type `help` to see available commands
   - Use `↑` and `↓` to navigate command history

5. **Mode Switching:**
   - Click **Edit → Formulas Mode** to view/edit formulas
   - Click **Edit → Results Mode** to see calculated values

6. **Editing Cells:**
   - Click any cell to edit its content
   - Enter formulas starting with `=` (e.g., `=SUM(A1:A3)`)
   - Press Tab or click elsewhere to save

7. **Navigation:**
   - Use the navigation buttons or arrow keys to move the viewport
   - Use Shift+Arrow keys to move to edges

8. **Sheet Management:**
   - Click sheet names at the top to switch between sheets
   - Use cross-sheet references to link data between sheets

---

## Data Persistence

Cell data is stored in memory and can be saved to/loaded from `.edt` JSON files. Example data included:

**First Sheet:**
- A1: `"Some data"`
- A2: `10`
- A3: `20`
- B2: `30`
- C2: `=SUM(A2:B2)` → `40`
- D2: `=A2 + B2` → `40`
- E2: `=AVG(A2:A3)` → `15`

**Second Sheet:**
- B3: `"other"`
- C3: `100`
- D3: `200`
- E3: `=first.C2 + 50` → `90` (cross-sheet reference)
- F3: `=SUM(first.A2:first.A4)` → `60.5`

**SumProduct Sheet:**
- A1: `2`, A2: `3`
- B1: `4`, B2: `5`
- C1: `6`, C2: `7`
- E2: `=SUMPRODUCT(A1:A2, B1:B2, C1:C2)` → `153`

**VLOOKUP Sheet:**
- A1: `"Product A"`, B1: `100`
- A2: `"Product B"`, B2: `200`
- A3: `"Product C"`, B3: `300`
- D1: `"Product B"`
- E1: `=VLOOKUP(D1, A1:B3, 2, FALSE)` → `200`

---

## Error Handling

The formula engine includes robust error handling:

| Error Type | Display | Description |
|------------|---------|-------------|
| Circular Reference | `#ERROR: Circular reference detected` | Formula references itself directly or indirectly |
| Invalid Formula | `#ERROR: [message]` | Syntax error in formula |
| Division by Zero | `0` | Returns 0 instead of error |
| Missing Cell | `0` | Empty or non-existent cells return 0 |
| SUMPRODUCT Dimension Mismatch | `#ERROR: SUMPRODUCT ranges must have the same size` | Ranges have different numbers of cells |
| VLOOKUP No Match | `#N/A` | Exact match not found |

Error cells are highlighted in red in Results Mode for easy identification.

---

## Technical Details

- **Column Letter Conversion:** Supports up to 3-letter column codes (A to ZZZ)
- **Grid Size:** 999 rows × 18,278 columns (approximately 18.2 million cells)
- **Viewport:** 7×7 fixed window that can navigate the entire grid
- **Formula Caching:** Automatic cache clearing when dependencies change
- **AST-Based Evaluation:** Formulas are parsed into Abstract Syntax Trees for accurate computation
- **Decimal Handling:** All numeric results are rounded to 2 decimal places
- **HTML Escaping:** Prevents XSS attacks by escaping special characters
- **Cross-Sheet References:** Format: `sheetname.cell` (e.g., `first.A1`)
- **Dynamic Module Loading:** Classes and functions are loaded on-demand using ES6 dynamic imports
- **Modular Architecture:** Each component is in its own file for maintainability

---

## Testing

The application includes a comprehensive test suite (`test.html`) that validates all formula functionality:

- **33+ Test Cases** covering arithmetic, cell references, functions, cross-sheet references, SUMPRODUCT, and VLOOKUP
- **Visual Test Results** with pass/fail indicators
- **Report Generation** for failed tests
- **Filtering** options (show all, passed only, failed only)

Run `test.html` from the HTTP server to validate the formula engine.

---

## Online Demo

[Editable Table Viewport Demo](https://apprr.rf.gd/edt/edt.html)

---

## License

Free to use and modify, MIT License

---

## Version History

### v1.4.0 (Current)
- Added Main Menu bar with File, Edit, View, Help menus
- Added Command Line Interface with command history
- Added File operations: Open/Save `.edt` files, Export to CSV
- Added Navigation actions as modular components
- Added keyboard shortcuts for all major operations
- Added modal dialogs for About and Keyboard Shortcuts
- Refactored styles into separate CSS files

### v1.3.0
- Refactored codebase into modular architecture with separate class files
- Added dynamic class loading system
- Added VLOOKUP function with exact and approximate match support

### v1.2.0
- Added SUMPRODUCT function with support for 2+ ranges
- Enhanced cross-sheet reference support

### v1.1.0
- Added cross-sheet reference support
- Implemented range references for all functions

### v1.0.0
- Initial release with basic arithmetic and spreadsheet functions
- Viewport navigation and multiple sheet support
- Dual mode display (formulas/results)
