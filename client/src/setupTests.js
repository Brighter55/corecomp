import {afterEach} from 'vitest';
import {cleanup} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = ResizeObserverMock;
}

// Runs a cleanup after each test case
afterEach(() => {
  cleanup();
});