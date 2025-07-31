import { useEffect, useRef, useCallback, useState } from 'react';

export const useExcelProcessor = () => {
  const workerRef = useRef(null);
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const messageIdCounter = useRef(0);
  const pendingMessages = useRef(new Map());

  // Initialize worker
  useEffect(() => {
    console.log('[useExcelProcessor] Initializing worker...');
    
    // Create worker
    workerRef.current = new Worker('/excelWorker.js');
    
    // Set up message handler
    workerRef.current.onmessage = (event) => {
      const { id, type, data, error } = event.data;
      
      if (type === 'READY') {
        console.log('[useExcelProcessor] Worker is ready');
        setIsWorkerReady(true);
        return;
      }
      
      // Handle response to a pending message
      const pending = pendingMessages.current.get(id);
      if (pending) {
        if (error) {
          pending.reject(new Error(error));
        } else {
          pending.resolve({ type, data });
        }
        pendingMessages.current.delete(id);
      }
    };
    
    // Set up error handler
    workerRef.current.onerror = (error) => {
      console.error('[useExcelProcessor] Worker error:', error);
      // Reject all pending messages
      pendingMessages.current.forEach(pending => {
        pending.reject(new Error('Worker error'));
      });
      pendingMessages.current.clear();
    };

    // Cleanup on unmount
    return () => {
      console.log('[useExcelProcessor] Cleaning up worker...');
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      setIsWorkerReady(false);
      pendingMessages.current.clear();
    };
  }, []);

  // Send message to worker with promise-based response
  const sendMessage = useCallback(async (type, data) => {
    // Wait for worker to be ready if not yet initialized
    if (!workerRef.current || !isWorkerReady) {
      throw new Error('Worker not initialized');
    }

    return new Promise((resolve, reject) => {
      const id = messageIdCounter.current++;
      
      // Store the promise handlers
      pendingMessages.current.set(id, { resolve, reject });
      
      // Send message to worker
      workerRef.current.postMessage({ id, type, data });
      
      // Set timeout for response
      setTimeout(() => {
        if (pendingMessages.current.has(id)) {
          pendingMessages.current.delete(id);
          reject(new Error(`Worker timeout for message type: ${type}`));
        }
      }, 30000); // 30 second timeout
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
    // Handle different response types for search
    if (response.type === 'SEARCH_RESULTS') {
      return response.data;
    }
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