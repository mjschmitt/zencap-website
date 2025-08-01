// Jest setup file
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(() => Promise.resolve()),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  })),
}));

// Mock Next.js dynamic imports
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (...args) => {
    const dynamicModule = jest.requireActual('next/dynamic');
    const dynamicActualComponent = dynamicModule.default;
    const RequiredComponent = dynamicActualComponent(args[0]);
    RequiredComponent.preload ? RequiredComponent.preload() : RequiredComponent.render?.preload?.();
    return RequiredComponent;
  },
}));

// Mock Web Worker
class MockWorker {
  constructor(stringUrl) {
    this.url = stringUrl;
    this.onmessage = null;
    this.onerror = null;
  }

  postMessage(msg) {
    // Simulate async response
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage({ data: { type: 'MOCK_RESPONSE', data: {} } });
      }
    }, 0);
  }

  terminate() {
    // Mock terminate
  }
}

global.Worker = MockWorker;

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
  }

  observe() {
    return null;
  }

  unobserve() {
    return null;
  }

  disconnect() {
    return null;
  }
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock createPortal for full-screen mode tests
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children) => children,
}));

// Mock performance API
global.performance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => []),
  getEntriesByType: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
};

// Mock fetch for file loading tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    blob: () => Promise.resolve(new Blob()),
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
);

// Suppress console errors in tests (optional)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});