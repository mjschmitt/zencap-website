import { useEffect, useRef, useCallback, useState } from 'react';

export const useExcelProcessor = () => {
  const workerRef = useRef(null);
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const pendingCallbacks = useRef(new Map());
  const messageId = useRef(0);

  // Initialize worker
  useEffect(() => {
    try {
      workerRef.current = new Worker('/excelWorker.js');
      
      workerRef.current.onmessage = (event) => {
        const { type, data, error, id } = event.data;
        
        // Handle responses with callbacks
        if (id && pendingCallbacks.current.has(id)) {
          const callback = pendingCallbacks.current.get(id);
          pendingCallbacks.current.delete(id);
          
          if (error) {
            callback.reject(new Error(error.message));
          } else {
            callback.resolve({ type, data });
          }
        }
      };

      workerRef.current.onerror = (error) => {
        // Worker error - reject all pending callbacks
        pendingCallbacks.current.forEach(callback => {
          callback.reject(new Error('Worker error: ' + error.message));
        });
        pendingCallbacks.current.clear();
      };

      setIsWorkerReady(true);
    } catch (error) {
      setIsWorkerReady(false);
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      pendingCallbacks.current.clear();
    };
  }, []);

  // Send message to worker with promise-based response
  const sendMessage = useCallback((type, data) => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current || !isWorkerReady) {
        reject(new Error('Worker not initialized'));
        return;
      }

      const id = ++messageId.current;
      pendingCallbacks.current.set(id, { resolve, reject });

      // Set timeout for worker response
      const timeout = setTimeout(() => {
        if (pendingCallbacks.current.has(id)) {
          pendingCallbacks.current.delete(id);
          reject(new Error('Worker timeout'));
        }
      }, 30000); // 30 second timeout

      // Store timeout in callback to clear it
      pendingCallbacks.current.get(id).timeout = timeout;

      // Modify resolve/reject to clear timeout
      const originalResolve = pendingCallbacks.current.get(id).resolve;
      const originalReject = pendingCallbacks.current.get(id).reject;

      pendingCallbacks.current.get(id).resolve = (data) => {
        clearTimeout(timeout);
        originalResolve(data);
      };

      pendingCallbacks.current.get(id).reject = (error) => {
        clearTimeout(timeout);
        originalReject(error);
      };

      workerRef.current.postMessage({ type, data, id });
    });
  }, [isWorkerReady]);

  // Load workbook from ArrayBuffer
  const loadWorkbook = useCallback(async (arrayBuffer) => {
    const response = await sendMessage('LOAD_WORKBOOK', { arrayBuffer });
    return response.data;
  }, [sendMessage]);

  // Process sheet data for viewport
  const processSheet = useCallback(async (sheetIndex, viewport) => {
    const response = await sendMessage('PROCESS_SHEET', {
      sheetIndex,
      viewportStart: viewport?.start,
      viewportEnd: viewport?.end
    });
    return response.data;
  }, [sendMessage]);

  // Get specific cell range
  const getCellRange = useCallback(async (sheetIndex, range) => {
    const response = await sendMessage('GET_CELL_RANGE', {
      sheetIndex,
      ...range
    });
    return response.data;
  }, [sendMessage]);

  // Search in sheet
  const searchInSheet = useCallback(async (sheetIndex, query, options = {}) => {
    const response = await sendMessage('SEARCH_IN_SHEET', {
      sheetIndex,
      query,
      ...options
    });
    return response.data;
  }, [sendMessage]);

  return {
    isWorkerReady,
    loadWorkbook,
    processSheet,
    getCellRange,
    searchInSheet
  };
};