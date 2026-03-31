# Editable Table Viewport

A JavaScript application that displays an editable spreadsheet-like table with viewport navigation and multiple sheet support.

## Features

- **7x7 Viewport**: Displays a fixed 7x7 grid of cells (7 rows × 7 columns)
- **Multiple Sheets**: Supports multiple worksheets with independent data
- **Cell Editing**: Click any cell to edit its content (supports HTML escaping)
- **Viewport Navigation**: Move the viewport around a virtual grid:
  - Move to top/bottom/left/right edges
  - Step up/down/left/right one row/column at a time
- **Large Virtual Grid**: Supports up to 999 rows and columns up to ZZZ (18,278 columns)
- **Position Indicator**: Shows current viewport range in row numbers and column letters

## Architecture

The application follows a clean MVC-like architecture with separate concerns:

### Components

#### DataHolder
- Stores all sheet data including:
  - Sheet names and their cells
  - Current viewport position for each sheet (start_row, start_col)
  - Cell data with coordinates and values
- Provides methods for:
  - Getting/setting current sheet
  - Updating cell values
  - Updating viewport position

#### ViewModel
- Provides computed properties for the current view state
- Contains constants:
  - `MAX_ROW = 999`
  - `MAX_COL_INDEX = 18278` (ZZZ)
  - `VIEWPORT_WIDTH_COLS = 7`
  - `VIEWPORT_HEIGHT_ROWS = 7`
- Handles boundary checking for navigation

#### SheetView
- Renders the current viewport as an HTML table
- Converts between column indices and letters (A, B, C... Z, AA, AB...)
- Attaches edit event listeners to cells
- Escapes HTML in cell content for security

#### NavButtonsController
- Handles all navigation button clicks
- Validates movements against grid boundaries
- Notifies the app when viewport changes

#### CellsEditablesController
- Handles cell edit events
- Updates cell data in the DataHolder
- Removes empty cell entries to keep storage efficient

#### AppController
- Orchestrates all components
- Manages sheet switching
- Updates position info display
- Initializes the application

## File Structure

```
edt.html          # Main HTML file with UI structure
edt.css           # Styles for the table, navigation, and controls
edt.js            # All JavaScript classes and application logic
README.md         # This documentation
```

## Usage

1. Open `edt.html` in a modern web browser
2. Click on any cell to edit its content
3. Use the navigation buttons to move the viewport:
   - **Move to top/bottom/left/right**: Jump to the edge of the grid
   - **Step up/down/left/right**: Move one row/column at a time
4. Switch between sheets using the sheet links at the top
5. View the current viewport position displayed below the sheet navigation

## Data Persistence

Cell data is stored in memory in the `DataHolder` object. The initial data includes:

- **First sheet**: Cell A1 with value "Some data"
- **Second sheet**: Cell B3 with value "other"

Empty cells are not stored to optimize memory usage.

## Technical Details

- **Column Letter Conversion**: Supports up to 3-letter column codes (A to ZZZ)
- **Grid Size**: 999 rows × 18,278 columns (approximately 18.2 million cells)
- **Viewport**: 7×7 fixed window that can navigate the entire grid
- **Event Handling**: Uses blur events to save cell edits when focus leaves a cell
- **HTML Escaping**: Prevents XSS attacks by escaping special characters in cell content

## Dependencies

None - pure HTML, CSS, and JavaScript. Works in all modern browsers.

## License

Free to use and modify.
```
