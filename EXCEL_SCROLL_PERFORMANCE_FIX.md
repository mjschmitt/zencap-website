# Excel Viewer Scroll Performance Optimization

## Issue
The Excel viewer was experiencing significant lag when scrolling to different parts of the model, as it was reloading data every time the viewport changed.

## Root Cause
The viewer was using a viewport-based progressive loading strategy that would reload sheet data whenever the user scrolled more than 20 rows or 10 columns. This caused:
- Network/worker processing delays on every scroll
- UI freezing while new data loaded
- Poor user experience with large spreadsheets

## Optimizations Implemented

### 1. Increased Initial Data Load
- Changed initial viewport from 100x50 to 1000x200 cells
- Loads more data upfront to reduce the need for reloading

### 2. Smarter Viewport Management
- Only reloads data when scrolling outside the already loaded range
- Adds a 200-row and 50-column buffer around the visible area when loading new data
- Tracks whether initial load is complete to avoid unnecessary reloads

### 3. Debounced Scroll Events
- Added 150ms debouncing to viewport change events
- Prevents rapid-fire data requests during scrolling
- Smooths out the scrolling experience

### 4. Reduced Console Logging
- Made verbose logging conditional on debug mode
- Removed repetitive fill color logging
- Significantly reduces performance overhead from console operations

### 5. Caching Strategy
- Once data is loaded for a viewport, it stays in memory
- No reloading when scrolling within the loaded area
- Expands the loaded area progressively as needed

## Code Changes

### ExcelJSViewer.js
```javascript
// Before: Small viewport, frequent reloads
const [viewport, setViewport] = useState({
  start: { row: 1, col: 1 },
  end: { row: 100, col: 50 }
});

// After: Larger viewport with smart loading
const [viewport, setViewport] = useState({
  start: { row: 1, col: 1 },
  end: { row: 1000, col: 200 }
});
const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
```

### ExcelSheet.js
```javascript
// Added debounced scroll handling
scrollDebounceRef.current = setTimeout(() => {
  onViewportChange(visibleRange);
}, 150); // 150ms debounce
```

## Performance Impact

### Before:
- Lag on every scroll movement beyond 20 rows
- Multiple data reloads during normal usage
- Console flooded with debug messages

### After:
- Smooth scrolling within the loaded area (1000x200 cells)
- Progressive loading only when needed
- Minimal console output
- Better memory usage with targeted loading

## Usage Notes

1. **Initial Load**: The first load may take slightly longer as more data is loaded upfront
2. **Large Files**: For files larger than 1000 rows, scrolling past row 1000 will trigger a progressive load
3. **Memory**: More data in memory but better user experience
4. **Debug Mode**: Set `debugMode={true}` on ExcelSheet to enable verbose logging

## Future Improvements

1. **Virtual Scrolling Optimization**: Further optimize react-window settings
2. **Web Worker Caching**: Implement caching in the worker to avoid re-parsing
3. **Predictive Loading**: Load data in the direction of scroll momentum
4. **Memory Management**: Implement data eviction for very large files