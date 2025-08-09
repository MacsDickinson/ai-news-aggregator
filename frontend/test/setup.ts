// Test setup file for Vitest
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Extend Vitest's expect with custom matchers
import '@testing-library/jest-dom';

// Clean up after each test
afterEach(() => {
  cleanup();
});