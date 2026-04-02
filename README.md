# Editable Table Viewport with Formula Support

A JavaScript application that displays an editable spreadsheet-like table with viewport navigation, multiple sheet support, and reactive formula computation.

## Screenshots

![UI](https://dl.dropbox.com/scl/fi/4mk968mznp8w3fyzxrfd0/_20260331_211514.png?rlkey=n1ox5zigg7hxecbjc6nl2u8lr&st=6yladcoe)

![Tests](https://dl.dropbox.com/scl/fi/ra9espm550lnagbgltbf4/vlookup.png?rlkey=wpscbb22e3igtnbhim0990aom&st=x2ehzx85)

## Features

- **7x7 Viewport:** Displays a fixed 7x7 grid of cells (7 rows × 7 columns)
- **Multiple Sheets:** Supports multiple worksheets with independent data
- **Formula Support:**
  - Basic arithmetic expressions (+, -, *, /)
  - Spreadsheet functions: SUM, AVG, MAX, MIN, COUNT, SUMPRODUCT, VLOOKUP
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
| `=VLOOKUP(D1, inventory.A1:C500, 3, TRUE)` | Approximate match with default | Returns closest match |

**Practical Examples:**

```excel
' Product Price Lookup (Exact Match)
=VLOOKUP("PRD-001", A1:B100, 2, FALSE)

' Grade Assignment (Approximate Match)
' Table: 0=F, 60=D, 70=C, 80=B, 90=A
=VLOOKUP(85, A1:B6, 2, TRUE)  ' Returns "B"

' Employee Directory
=VLOOKUP(emp_id, employees.A1:F1000, 4, FALSE)

' Tax Bracket Calculation
=VLOOKUP(income, tax_table.A1:B5, 2, TRUE) * income

' Commission Rate Lookup
=VLOOKUP(sales_amount, commission_rates.A1:B10, 2, TRUE)
```

**Lookup Behavior:**

| Match Type | Behavior | When to Use | Sorted Required |
|------------|----------|-------------|-----------------|
| FALSE (Exact) | Finds exact match only, returns #N/A if not found | Product codes, IDs, exact strings | No |
| TRUE (Approx) | Finds largest value ≤ lookup_value | Grades, tax brackets, tiers | Yes (ascending) |

**Example Tables:**

**Grade Lookup Table (Approximate Match):**
| A | B |
|---|---|
| 0 | F |
| 60 | D |
| 70 | C |
| 80 | B |
| 90 | A |

```javascript
=VLOOKUP(85, A1:B6, 2, TRUE)  // Returns "B"
```

**Product Catalog (Exact Match):**
| A | B | C |
|---|---|---|
| SKU | Product | Price |
| A100 | Laptop | 999 |
| B200 | Mouse | 25 |
| C300 | Keyboard | 75 |

```javascript
=VLOOKUP("B200", A1:C4, 3, FALSE)  // Returns 25
```

**Error Messages:**

| Error | Cause |
|-------|-------|
| `#ERROR: VLOOKUP requires at least 3 arguments` | Missing required arguments |
| `#ERROR: Invalid column index number` | Column index < 1 or not a number |
| `#ERROR: Invalid table range` | Table array is not a valid range |
| `#ERROR: Column index exceeds table width` | Column number > table columns |
| `#N/A` | No exact match found (range_lookup=FALSE) |

**Use Cases:**
- **Price Lookup:** Find product prices from a catalog
- **Employee Directory:** Retrieve employee information by ID
- **Grade Calculation:** Assign letter grades from numeric scores
- **Tax Brackets:** Calculate tax rates based on income levels
- **Commission Rates:** Determine commission percentages from sales tiers
- **Inventory Management:** Look up product details by SKU
- **Data Validation:** Verify if values exist in reference tables

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

#### Mixed Cross-Sheet Expressions
```
=first.A1 + second.B2                   // Add values from two sheets
=(first.A1 + second.B2) * AVG(C1:C10)   // Complex cross-sheet formula
=SUM(first.A1:first.A5) + MAX(second.B1:second.B5)
=SUMPRODUCT(first.A1:A3, second.B1:B3, third.C1:C3)  // Multi-sheet product
=VLOOKUP(D1, inventory.A1:C500, 3, FALSE)  // VLOOKUP with cross-sheet table
```

---

### Combined Expressions

Functions and operators can be combined for complex calculations.

```
=SUM(A1:A5) + MAX(B1:B5) - 10
=(first.A1 + second.B2) * AVG(C1:C10)
=SUM(A1:A10) / COUNT(A1:A10)    // Manual average calculation
=MAX(A1:A10) - MIN(A1:A10)      // Range spread
=SUMPRODUCT(A1:A5, B1:B5) / SUM(B1:B5)  // Weighted average
=IF(ISNA(VLOOKUP(A1, B1:C10, 2, FALSE)), "Not found", VLOOKUP(A1, B1:C10, 2, FALSE))
```

---

### Formula Examples by Use Case

#### Financial Calculations
```
=SUM(A1:A12)              // Annual total
=AVG(B1:B12)              // Monthly average
=SUM(C1:C12) * 0.15       // 15% of total
=SUMPRODUCT(A1:A12, B1:B12)  // Weighted portfolio return
=VLOOKUP(invoice_id, prices.A1:B100, 2, FALSE)  // Price lookup
```

#### Data Analysis
```
=MAX(A1:A100) - MIN(A1:A100)    // Range spread
=AVG(A1:A100)                   // Mean value
=COUNT(A1:A100)                 // Sample size
=SUMPRODUCT((A1:A100>50), B1:B100)  // Sum of values where condition met
=VLOOKUP(employee_id, employees.A1:F500, 4, FALSE)  // Employee data lookup
```

#### Cross-Sheet Reporting
```
=SUM(first.A1:first.A10) + SUM(second.A1:second.A10)
=AVG(compute_avg.C17:E17)
=first.A1 * second.B1           // Multiply values from different sheets
=SUMPRODUCT(first.A1:A5, second.B1:B5)  // Cross-sheet weighted sum
=VLOOKUP(A1, sales_data.A1:C1000, 3, FALSE)  // Cross-sheet lookup
```

#### Engineering & Scientific
```
=SUMPRODUCT(A1:A3, B1:B3)       // Dot product of two vectors
=SUMPRODUCT(A1:A3, B1:B3, C1:C3)  // Triple product for volume
=SUMPRODUCT(weights, values) / SUM(weights)  // Weighted average
=VLOOKUP(material_id, material_properties.A1:D500, 4, FALSE)  // Material lookup
```

---

## Architecture

The application follows a clean MVC-like architecture with separate concerns:

### Components

- **FormulaEngine:** Parses and evaluates spreadsheet formulas, handles cell references and ranges, supports cross-sheet references, caches computed values, detects errors.
- **FunctionRegistry:** Dynamically loads spreadsheet functions from separate modules, supports lazy loading and caching.
- **DataHolder:** Stores all sheet data including sheet names, cells, and viewport positions. Provides methods for getting/setting sheet data.
- **ViewModel:** Provides computed properties for the current view state, manages formula display mode, handles boundary checking.
- **SheetView:** Renders the current viewport as an HTML table, converts column indices to letters, attaches edit event listeners, escapes HTML.
- **NavButtonsController:** Handles all navigation button clicks, validates movements against grid boundaries.
- **CellsEditablesController:** Handles cell edit events, updates cell data in the DataHolder.
- **AppController:** Orchestrates all components, manages sheet switching, handles mode switching.

---

## File Structure

```
/
├── edt.html          # Main HTML file with UI structure
├── edt.css           # Styles for the table, navigation, and controls
├── edt.js            # Core engine with AST parser and dynamic function loader
├── test.html         # Comprehensive test suite (33+ test cases)
├── README.md         # This documentation
└── functions/        # Modular spreadsheet function implementations
    ├── sum.js        # SUM function
    ├── avg.js        # AVG function
    ├── max.js        # MAX function
    ├── min.js        # MIN function
    ├── count.js      # COUNT function
    ├── sumproduct.js # SUMPRODUCT function
    └── vlookup.js    # VLOOKUP function
```

---

## Usage

1. **Open:** Open `edt.html` in a modern web browser (requires HTTP server for module loading)
2. **Mode Switching:**
   - Click **"Switch to Input Formulas Mode"** to view/edit formulas.
   - Click **"Switch to Compute Results Mode"** to see calculated values.
3. **Editing Cells:**
   - Click any cell to edit its content.
   - Enter formulas starting with `=` (e.g., `=SUM(A1:A3)`, `=SUMPRODUCT(A1:A5, B1:B5)`, `=VLOOKUP(D1, A1:B10, 2, FALSE)`).
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
| SUMPRODUCT Dimension Mismatch | `#ERROR: SUMPRODUCT ranges must have the same size` | Ranges have different numbers of cells |
| VLOOKUP Invalid Arguments | `#ERROR: VLOOKUP requires at least 3 arguments` | Missing required parameters |
| VLOOKUP Invalid Column | `#ERROR: Invalid column index number` | Column index < 1 or not numeric |
| VLOOKUP Column Out of Range | `#ERROR: Column index exceeds table width` | Column number > table columns |
| VLOOKUP No Match | `#N/A` | Exact match not found |

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
- **Dynamic Module Loading:** Functions are loaded on-demand using ES6 dynamic imports.
- **Modular Architecture:** Each spreadsheet function is in its own file for maintainability.

---

## Testing

The application includes a comprehensive test suite (`test.html`) that validates all formula functionality:

- **33+ Test Cases** covering arithmetic, cell references, functions, cross-sheet references, SUMPRODUCT, and VLOOKUP
- **SUMPRODUCT Tests:**
  - Basic two-range multiplication
  - Three-range multiplication
  - Decimal values
  - Cross-sheet references
  - Single-row ranges
  - Empty cell handling
- **VLOOKUP Tests:**
  - Exact match with value found
  - Exact match with value not found (#N/A)
- **Visual Test Results** with pass/fail indicators
- **Report Generation** for failed tests

Run `test.html` in a local HTTP server to validate the formula engine.

---

## Online Demo

[Editable Table Viewport Demo](https://apprr.rf.gd/edt/edt.html)

---

## License

Free to use and modify, MIT License

---

## Version History

### v1.3.0 (Current)
- Added VLOOKUP function with exact and approximate match support
- Implemented dynamic module loading for all spreadsheet functions
- Refactored codebase into modular architecture with separate function files
- Added comprehensive VLOOKUP test cases
- Enhanced error handling for VLOOKUP operations

### v1.2.0
- Added SUMPRODUCT function with support for 2+ ranges
- Enhanced cross-sheet reference support for SUMPRODUCT
- Added comprehensive SUMPRODUCT test cases
- Improved error handling for dimension mismatches

### v1.1.0
- Added cross-sheet reference support
- Implemented range references for all functions
- Enhanced decimal handling

### v1.0.0
- Initial release with basic arithmetic and spreadsheet functions (SUM, AVG, MAX, MIN, COUNT)
- Viewport navigation and multiple sheet support
- Dual mode display (formulas/results)
