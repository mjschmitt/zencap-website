import { renderHook, act, waitFor } from '@testing-library/react';
import { useExcelProcessor } from '../useExcelProcessor';

describe('useExcelProcessor', () => {
  let mockWorker;
  let originalWorker;

  beforeEach(() => {
    // Save original Worker
    originalWorker = global.Worker;

    // Create mock worker
    mockWorker = {
      postMessage: jest.fn(),
      terminate: jest.fn(),
      onmessage: null,
      onerror: null,
    };

    // Mock Worker constructor
    global.Worker = jest.fn(() => mockWorker);
  });

  afterEach(() => {
    // Restore original Worker
    global.Worker = originalWorker;
    jest.clearAllMocks();
  });

  describe('Worker Initialization', () => {
    it('should initialize worker on mount', () => {
      const { result } = renderHook(() => useExcelProcessor());

      expect(global.Worker).toHaveBeenCalledWith('/excelWorker.js');
      expect(result.current.isWorkerReady).toBe(true);
    });

    it('should handle worker initialization failure', () => {
      global.Worker = jest.fn(() => {
        throw new Error('Worker failed to load');
      });

      const { result } = renderHook(() => useExcelProcessor());

      expect(result.current.isWorkerReady).toBe(false);
    });

    it('should terminate worker on unmount', () => {
      const { unmount } = renderHook(() => useExcelProcessor());

      unmount();

      expect(mockWorker.terminate).toHaveBeenCalled();
    });
  });

  describe('Message Communication', () => {
    it('should send messages to worker with unique IDs', async () => {
      const { result } = renderHook(() => useExcelProcessor());

      await act(async () => {
        result.current.loadWorkbook(new ArrayBuffer(8));
      });

      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'LOAD_WORKBOOK',
        data: { arrayBuffer: expect.any(ArrayBuffer) },
        id: expect.any(Number),
      });
    });

    it('should handle worker responses', async () => {
      const { result } = renderHook(() => useExcelProcessor());

      const loadPromise = act(async () => {
        return result.current.loadWorkbook(new ArrayBuffer(8));
      });

      // Simulate worker response
      act(() => {
        const messageId = mockWorker.postMessage.mock.calls[0][0].id;
        mockWorker.onmessage({
          data: {
            type: 'WORKBOOK_LOADED',
            data: { worksheets: [{ name: 'Sheet1' }] },
            id: messageId,
          },
        });
      });

      const response = await loadPromise;
      expect(response).toEqual({ worksheets: [{ name: 'Sheet1' }] });
    });

    it('should handle worker errors', async () => {
      const { result } = renderHook(() => useExcelProcessor());

      const loadPromise = act(async () => {
        return result.current.loadWorkbook(new ArrayBuffer(8));
      });

      // Simulate worker error response
      act(() => {
        const messageId = mockWorker.postMessage.mock.calls[0][0].id;
        mockWorker.onmessage({
          data: {
            type: 'ERROR',
            error: { message: 'Failed to load workbook' },
            id: messageId,
          },
        });
      });

      await expect(loadPromise).rejects.toThrow('Failed to load workbook');
    });

    it('should handle worker timeout', async () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useExcelProcessor());

      const loadPromise = act(async () => {
        return result.current.loadWorkbook(new ArrayBuffer(8));
      });

      // Fast-forward past timeout (30 seconds)
      act(() => {
        jest.advanceTimersByTime(31000);
      });

      await expect(loadPromise).rejects.toThrow('Worker timeout');
      jest.useRealTimers();
    });

    it('should clear timeout on successful response', async () => {
      jest.useFakeTimers();
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      const { result } = renderHook(() => useExcelProcessor());

      const loadPromise = act(async () => {
        return result.current.loadWorkbook(new ArrayBuffer(8));
      });

      // Simulate worker response before timeout
      act(() => {
        const messageId = mockWorker.postMessage.mock.calls[0][0].id;
        mockWorker.onmessage({
          data: {
            type: 'WORKBOOK_LOADED',
            data: { worksheets: [] },
            id: messageId,
          },
        });
      });

      await loadPromise;
      expect(clearTimeoutSpy).toHaveBeenCalled();
      jest.useRealTimers();
    });
  });

  describe('API Methods', () => {
    beforeEach(() => {
      // Setup automatic successful responses
      mockWorker.postMessage.mockImplementation((message) => {
        setTimeout(() => {
          mockWorker.onmessage({
            data: {
              type: 'SUCCESS',
              data: {},
              id: message.id,
            },
          });
        }, 0);
      });
    });

    it('should load workbook', async () => {
      const { result } = renderHook(() => useExcelProcessor());
      const arrayBuffer = new ArrayBuffer(8);

      await act(async () => {
        await result.current.loadWorkbook(arrayBuffer);
      });

      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'LOAD_WORKBOOK',
        data: { arrayBuffer },
        id: expect.any(Number),
      });
    });

    it('should process sheet with viewport', async () => {
      const { result } = renderHook(() => useExcelProcessor());
      const viewport = {
        start: { row: 1, col: 1 },
        end: { row: 100, col: 50 },
      };

      await act(async () => {
        await result.current.processSheet(0, viewport);
      });

      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'PROCESS_SHEET',
        data: {
          sheetIndex: 0,
          viewportStart: viewport.start,
          viewportEnd: viewport.end,
        },
        id: expect.any(Number),
      });
    });

    it('should get cell range', async () => {
      const { result } = renderHook(() => useExcelProcessor());
      const range = {
        startRow: 1,
        endRow: 10,
        startCol: 1,
        endCol: 5,
      };

      await act(async () => {
        await result.current.getCellRange(0, range);
      });

      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'GET_CELL_RANGE',
        data: {
          sheetIndex: 0,
          ...range,
        },
        id: expect.any(Number),
      });
    });

    it('should search in sheet', async () => {
      const { result } = renderHook(() => useExcelProcessor());
      const options = { caseSensitive: true, wholeWord: true };

      await act(async () => {
        await result.current.searchInSheet(0, 'searchTerm', options);
      });

      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'SEARCH_IN_SHEET',
        data: {
          sheetIndex: 0,
          query: 'searchTerm',
          ...options,
        },
        id: expect.any(Number),
      });
    });
  });

  describe('Error Handling', () => {
    it('should reject when worker is not ready', async () => {
      const { result } = renderHook(() => useExcelProcessor());
      
      // Force worker to not be ready
      result.current.isWorkerReady = false;

      await expect(
        result.current.loadWorkbook(new ArrayBuffer(8))
      ).rejects.toThrow('Worker not initialized');
    });

    it('should handle worker global error', () => {
      const { result } = renderHook(() => useExcelProcessor());

      // Create some pending callbacks
      act(async () => {
        result.current.loadWorkbook(new ArrayBuffer(8));
        result.current.processSheet(0);
      });

      // Simulate worker error
      act(() => {
        mockWorker.onerror(new Error('Worker crashed'));
      });

      // All pending callbacks should be rejected
      expect(mockWorker.postMessage).toHaveBeenCalledTimes(2);
    });

    it('should clear all pending callbacks on error', async () => {
      const { result } = renderHook(() => useExcelProcessor());

      // Create multiple pending operations
      const promises = [
        result.current.loadWorkbook(new ArrayBuffer(8)),
        result.current.processSheet(0),
        result.current.searchInSheet(0, 'test'),
      ];

      // Simulate worker error
      act(() => {
        mockWorker.onerror(new Error('Worker crashed'));
      });

      // All promises should reject
      for (const promise of promises) {
        await expect(promise).rejects.toThrow('Worker error: Worker crashed');
      }
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple concurrent operations', async () => {
      const { result } = renderHook(() => useExcelProcessor());

      // Setup different responses for different message types
      mockWorker.postMessage.mockImplementation((message) => {
        setTimeout(() => {
          const responseData = message.type === 'LOAD_WORKBOOK'
            ? { worksheets: [{ name: 'Sheet1' }] }
            : { cells: [] };

          mockWorker.onmessage({
            data: {
              type: 'SUCCESS',
              data: responseData,
              id: message.id,
            },
          });
        }, 0);
      });

      // Start multiple operations
      const [workbook, sheet1, sheet2] = await Promise.all([
        result.current.loadWorkbook(new ArrayBuffer(8)),
        result.current.processSheet(0),
        result.current.processSheet(1),
      ]);

      expect(workbook).toEqual({ worksheets: [{ name: 'Sheet1' }] });
      expect(sheet1).toEqual({ cells: [] });
      expect(sheet2).toEqual({ cells: [] });
      expect(mockWorker.postMessage).toHaveBeenCalledTimes(3);
    });

    it('should maintain separate callbacks for each operation', async () => {
      const { result } = renderHook(() => useExcelProcessor());
      let messageIds = [];

      // Capture message IDs
      mockWorker.postMessage.mockImplementation((message) => {
        messageIds.push(message.id);
      });

      // Start operations
      act(() => {
        result.current.loadWorkbook(new ArrayBuffer(8));
        result.current.processSheet(0);
      });

      expect(messageIds.length).toBe(2);
      expect(messageIds[0]).not.toBe(messageIds[1]);
    });
  });

  describe('Memory Management', () => {
    it('should clear callbacks after response', async () => {
      const { result } = renderHook(() => useExcelProcessor());

      const loadPromise = result.current.loadWorkbook(new ArrayBuffer(8));

      // Respond to the message
      act(() => {
        const messageId = mockWorker.postMessage.mock.calls[0][0].id;
        mockWorker.onmessage({
          data: {
            type: 'SUCCESS',
            data: {},
            id: messageId,
          },
        });
      });

      await loadPromise;

      // Try to respond again with same ID - should not cause issues
      act(() => {
        const messageId = mockWorker.postMessage.mock.calls[0][0].id;
        mockWorker.onmessage({
          data: {
            type: 'SUCCESS',
            data: {},
            id: messageId,
          },
        });
      });

      // No errors should occur
    });

    it('should clear all resources on unmount', () => {
      const { result, unmount } = renderHook(() => useExcelProcessor());

      // Start some operations
      act(() => {
        result.current.loadWorkbook(new ArrayBuffer(8));
        result.current.processSheet(0);
      });

      unmount();

      expect(mockWorker.terminate).toHaveBeenCalled();
    });
  });
});