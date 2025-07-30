// This file now imports and re-exports the refactored ExcelJSViewer
// The original monolithic component has been split into multiple modules
// for better performance, maintainability, and scalability

import ExcelJSViewer from './ExcelViewer/ExcelJSViewer';

// Re-export with the original component name for backward compatibility
export default ExcelJSViewer;
export const ExcelJSViewerComponent = ExcelJSViewer;