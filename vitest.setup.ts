import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.mock('lottie-web', () => ({
  default: {
    loadAnimation: () => ({
      destroy() {},
      goToAndStop() {},
    }),
  },
}));

