// Excel Style Debugger
// Tool to trace style data flow from backend to frontend

export class ExcelStyleDebugger {
  constructor() {
    this.enabled = typeof window !== 'undefined' && 
                   (localStorage.getItem('excel-style-debug') === 'true' ||
                    window.location.search.includes('debug=styles'));
    this.logs = [];
    this.styleStats = {
      extracted: 0,
      transmitted: 0,
      received: 0,
      applied: 0,
      errors: 0
    };
  }

  // Log style extraction in worker
  logExtraction(cell, style) {
    if (!this.enabled) return;
    
    const log = {
      timestamp: Date.now(),
      phase: 'extraction',
      cell: `${cell.row}-${cell.col}`,
      style: JSON.parse(JSON.stringify(style)),
      hasFont: !!style.font,
      hasFill: !!style.fill,
      hasBorder: !!style.border,
      hasAlignment: !!style.alignment,
      hasNumberFormat: !!style.numberFormat
    };
    
    this.logs.push(log);
    this.styleStats.extracted++;
    
    console.log('[Style Debug] Extracted:', log);
  }

  // Log style transmission from worker
  logTransmission(cells) {
    if (!this.enabled) return;
    
    const stylesCount = cells.filter(c => c.style && Object.keys(c.style).length > 0).length;
    
    const log = {
      timestamp: Date.now(),
      phase: 'transmission',
      totalCells: cells.length,
      cellsWithStyles: stylesCount,
      sampleStyles: cells.slice(0, 5).map(c => ({
        cell: `${c.row}-${c.col}`,
        style: c.style
      }))
    };
    
    this.logs.push(log);
    this.styleStats.transmitted += stylesCount;
    
    console.log('[Style Debug] Transmitted:', log);
  }

  // Log style receipt in frontend
  logReceipt(cellData) {
    if (!this.enabled) return;
    
    const log = {
      timestamp: Date.now(),
      phase: 'receipt',
      cell: cellData.row ? `${cellData.row}-${cellData.col}` : 'unknown',
      hasStyle: !!cellData.style,
      styleKeys: cellData.style ? Object.keys(cellData.style) : [],
      style: cellData.style
    };
    
    this.logs.push(log);
    if (cellData.style) this.styleStats.received++;
    
    console.log('[Style Debug] Received:', log);
  }

  // Log style application in ExcelCell
  logApplication(row, col, style, computedStyle) {
    if (!this.enabled) return;
    
    const log = {
      timestamp: Date.now(),
      phase: 'application',
      cell: `${row}-${col}`,
      inputStyle: style,
      computedStyle: computedStyle,
      applied: {
        fontWeight: computedStyle.fontWeight,
        fontSize: computedStyle.fontSize,
        color: computedStyle.color,
        backgroundColor: computedStyle.backgroundColor,
        border: computedStyle.border
      }
    };
    
    this.logs.push(log);
    this.styleStats.applied++;
    
    console.log('[Style Debug] Applied:', log);
  }

  // Log style error
  logError(phase, error, context) {
    if (!this.enabled) return;
    
    const log = {
      timestamp: Date.now(),
      phase: `error-${phase}`,
      error: error.message || error,
      stack: error.stack,
      context
    };
    
    this.logs.push(log);
    this.styleStats.errors++;
    
    console.error('[Style Debug] Error:', log);
  }

  // Generate style report
  generateReport() {
    if (!this.enabled) return null;
    
    const report = {
      stats: this.styleStats,
      timeline: this.logs,
      issues: this.findIssues(),
      summary: {
        extractionRate: this.styleStats.extracted > 0 ? 
          (this.styleStats.transmitted / this.styleStats.extracted * 100).toFixed(2) + '%' : 'N/A',
        transmissionRate: this.styleStats.transmitted > 0 ?
          (this.styleStats.received / this.styleStats.transmitted * 100).toFixed(2) + '%' : 'N/A',
        applicationRate: this.styleStats.received > 0 ?
          (this.styleStats.applied / this.styleStats.received * 100).toFixed(2) + '%' : 'N/A'
      }
    };
    
    console.log('[Style Debug] Report:', report);
    return report;
  }

  // Find potential issues
  findIssues() {
    const issues = [];
    
    // Check for style loss between phases
    if (this.styleStats.extracted > this.styleStats.transmitted) {
      issues.push({
        type: 'STYLE_LOSS_IN_WORKER',
        severity: 'high',
        message: `${this.styleStats.extracted - this.styleStats.transmitted} styles lost during transmission`,
        phase: 'worker'
      });
    }
    
    if (this.styleStats.transmitted > this.styleStats.received) {
      issues.push({
        type: 'STYLE_LOSS_IN_TRANSPORT',
        severity: 'high',
        message: `${this.styleStats.transmitted - this.styleStats.received} styles lost during transport`,
        phase: 'transport'
      });
    }
    
    if (this.styleStats.received > this.styleStats.applied) {
      issues.push({
        type: 'STYLE_APPLICATION_FAILURE',
        severity: 'medium',
        message: `${this.styleStats.received - this.styleStats.applied} styles failed to apply`,
        phase: 'rendering'
      });
    }
    
    // Check for specific style property issues
    const stylePropertyStats = this.analyzeStyleProperties();
    Object.entries(stylePropertyStats).forEach(([property, stats]) => {
      if (stats.failures > 0) {
        issues.push({
          type: 'STYLE_PROPERTY_FAILURE',
          severity: 'low',
          message: `${property} failed to apply ${stats.failures} times`,
          property,
          phase: 'rendering'
        });
      }
    });
    
    return issues;
  }

  // Analyze style properties
  analyzeStyleProperties() {
    const propertyStats = {
      font: { attempts: 0, failures: 0 },
      fill: { attempts: 0, failures: 0 },
      border: { attempts: 0, failures: 0 },
      alignment: { attempts: 0, failures: 0 },
      numberFormat: { attempts: 0, failures: 0 }
    };
    
    this.logs.forEach(log => {
      if (log.phase === 'application' && log.inputStyle) {
        Object.keys(propertyStats).forEach(prop => {
          if (log.inputStyle[prop]) {
            propertyStats[prop].attempts++;
            // Check if property was successfully applied
            if (!this.isPropertyApplied(prop, log.inputStyle[prop], log.computedStyle)) {
              propertyStats[prop].failures++;
            }
          }
        });
      }
    });
    
    return propertyStats;
  }

  // Check if a style property was successfully applied
  isPropertyApplied(property, inputValue, computedStyle) {
    switch (property) {
      case 'font':
        return inputValue.bold ? computedStyle.fontWeight === '700' : true;
      case 'fill':
        return computedStyle.backgroundColor && computedStyle.backgroundColor !== 'transparent';
      case 'border':
        return computedStyle.border && computedStyle.border !== 'none';
      case 'alignment':
        return true; // Alignment is harder to verify from computed styles
      case 'numberFormat':
        return true; // Number format is applied to content, not style
      default:
        return true;
    }
  }

  // Export debug data
  exportDebugData() {
    if (!this.enabled) return;
    
    const debugData = {
      timestamp: new Date().toISOString(),
      report: this.generateReport(),
      logs: this.logs
    };
    
    const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `excel-style-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Clear debug data
  clear() {
    this.logs = [];
    this.styleStats = {
      extracted: 0,
      transmitted: 0,
      received: 0,
      applied: 0,
      errors: 0
    };
  }
}

// Create singleton instance
export const styleDebugger = new ExcelStyleDebugger();

// Helper function to enable debugging
export function enableStyleDebugging() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('excel-style-debug', 'true');
    window.location.reload();
  }
}

// Helper function to disable debugging
export function disableStyleDebugging() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('excel-style-debug');
    window.location.reload();
  }
}