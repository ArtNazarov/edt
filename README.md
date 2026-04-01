# Editable Table Viewport with Formula Support

A JavaScript application that displays an editable spreadsheet-like table with viewport navigation, multiple sheet support, and reactive formula computation.

## Screenshots

![UI](https://dl.dropbox.com/scl/fi/4mk968mznp8w3fyzxrfd0/_20260331_211514.png?rlkey=n1ox5zigg7hxecbjc6nl2u8lr&st=6yladcoe)

![Tests](https://dl.dropbox.com/scl/fi/nohu66bvkuc74yj77h77s/Screenshot-2026-03-31-at-20-56-12-Test-Suite-Editable-Table-AST-Computation-Engine.png?rlkey=utuedizebdso8dp5xw9avi9qv&st=11facr13)

## Features

- **7x7 Viewport:** Displays a fixed 7x7 grid of cells (7 rows × 7 columns)
- **Multiple Sheets:** Supports multiple worksheets with independent data
- **Formula Support:**
  - Basic arithmetic expressions (+, -, *, /)
  - Spreadsheet functions: SUM, AVG, MAX, MIN, COUNT
  - Cell references (e.g., `A1`, `B2`, `ZZ14`)
  - Range references (e.g., `A1:C3`)
  - Cross-sheet references (e.g., `first.A1`, `second.B3`)
  - *See [Expressions and Spreadsheet Functions](#expressions-and-spreadsheet-functions) for detailed documentation*
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
=SUM(first.A1:first.C3)     // Sum range in "first" sheet
=AVG(compute_avg.C17:E17)   // Average range in "compute_avg" sheet
```

#### Mixed Cross-Sheet Expressions
```
=first.A1 + second.B2                   // Add values from two sheets
=(first.A1 + second.B2) * AVG(C1:C10)   // Complex cross-sheet formula
=SUM(first.A1:first.A5) + MAX(second.B1:second.B5)
```

---

### Combined Expressions

Functions and operators can be combined for complex calculations.

```
=SUM(A1:A5) + MAX(B1:B5) - 10
=(first.A1 + second.B2) * AVG(C1:C10)
=SUM(A1:A10) / COUNT(A1:A10)    // Manual average calculation
=MAX(A1:A10) - MIN(A1:A10)      // Range spread
```

---

### Formula Examples by Use Case

#### Financial Calculations
```
=SUM(A1:A12)              // Annual total
=AVG(B1:B12)              // Monthly average
=SUM(C1:C12) * 0.15       // 15% of total
```

#### Data Analysis
```
=MAX(A1:A100) - MIN(A1:A100)    // Range spread
=AVG(A1:A100)                   // Mean value
=COUNT(A1:A100)                 // Sample size
```

#### Cross-Sheet Reporting
```
=SUM(first.A1:first.A10) + SUM(second.A1:second.A10)
=AVG(compute_avg.C17:E17)
=first.A1 * second.B1           // Multiply values from different sheets
```

---

## Architecture

The application follows a clean MVC-like architecture with separate concerns:

### Components

- **FormulaEngine:** Parses and evaluates spreadsheet formulas, handles cell references and ranges, supports cross-sheet references, caches computed values, detects errors.
- **DataHolder:** Stores all sheet data including sheet names, cells, and viewport positions. Provides methods for getting/setting sheet data.
- **ViewModel:** Provides computed properties for the current view state, manages formula display mode, handles boundary checking.
- **SheetView:** Renders the current viewport as an HTML table, converts column indices to letters, attaches edit event listeners, escapes HTML.
- **NavButtonsController:** Handles all navigation button clicks, validates movements against grid boundaries.
- **CellsEditablesController:** Handles cell edit events, updates cell data in the DataHolder.
- **AppController:** Orchestrates all components, manages sheet switching, handles mode switching.

---

## File Structure

```
edt.html          # Main HTML file with UI structure
edt.css           # Styles for the table, navigation, and controls
edt.js            # All JavaScript classes and application logic
README.md         # This documentation
test.html         # Test suite for AST Computation Engine
```

---

## Usage

1. **Open:** Open `edt.html` in a modern web browser.
2. **Mode Switching:**
   - Click **"Switch to Input Formulas Mode"** to view/edit formulas.
   - Click **"Switch to Compute Results Mode"** to see calculated values.
3. **Editing Cells:**
   - Click any cell to edit its content.
   - Enter formulas starting with `=` (e.g., `=SUM(A1:A3)`).
   - Press Tab or click elsewhere to save.
4. **Navigation:**
   - Use the navigation buttons to move the viewport.
   - Move to edges or step one row/column at a time.
5. **Sheet Management:**
   - Click sheet names at the top to switch between sheets.
   - Use cross-sheet references to link data between sheets.

---

## Data Persistence

Cell data is stored in memory in the `DataHolder` object. Example data included:

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

*Empty cells are not stored to optimize memory usage.*

---

## Error Handling

The formula engine includes robust error handling:

| Error Type | Display | Description |
|------------|---------|-------------|
| Circular Reference | `#ERROR: Circular reference detected` | Formula references itself directly or indirectly |
| Invalid Formula | `#ERROR: [message]` | Syntax error in formula |
| Division by Zero | `0` | Returns 0 instead of error |
| Missing Cell | `0` | Empty or non-existent cells return 0 |

Error cells are highlighted in red in Results Mode for easy identification. Console logs provide detailed error information.

---

## Technical Details

- **Column Letter Conversion:** Supports up to 3-letter column codes (A to ZZZ).
- **Grid Size:** 999 rows × 18,278 columns (approximately 18.2 million cells).
- **Viewport:** 7×7 fixed window that can navigate the entire grid.
- **Formula Caching:** Automatic cache clearing when dependencies change.
- **AST-Based Evaluation:** Formulas are parsed into Abstract Syntax Trees for accurate computation.
- **Decimal Handling:** All numeric results are rounded to 2 decimal places to avoid floating-point precision issues.
- **HTML Escaping:** Prevents XSS attacks by escaping special characters.
- **Cross-Sheet References:** Format: `sheetname.cell` (e.g., `first.A1`).

---

## Dependencies

None - pure HTML, CSS, and JavaScript. Works in all modern browsers.

---

## Online demo

[edt](https://apprr.rf.gd/edt/edt.html)

## License

Free to use and modify, MIT
