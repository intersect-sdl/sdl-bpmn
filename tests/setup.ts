/**
 * Test setup configuration for @sdl/bpmn tests
 */

// Mock JSDOM globals that might be missing
(globalThis as any).fetch = (globalThis as any).fetch || (() => Promise.reject(new Error('Fetch not available')));
(globalThis as any).AbortController = (globalThis as any).AbortController || class AbortController {
  signal = { aborted: false };
  abort() { this.signal.aborted = true; }
};

// Setup console for better test output
console.warn = console.warn || console.log;
console.error = console.error || console.log;
