import { describe, expect, it, vi } from 'vitest';
import { MessageRenderer } from './MessageRenderer';
import { SingleEmoji } from './SingleEmoji';
import { ReactElement } from 'react';

vi.mock('lottie-web', () => ({ default: { loadAnimation: () => ({ destroy() {}, goToAndStop() {} }) } }));

describe('MessageRenderer', () => {
  it('renders single emoji via SingleEmoji', () => {
    const el = MessageRenderer({ message: ':smile:' }) as ReactElement;
    expect(el.type).toBe(SingleEmoji);
  });

  it('renders mixed content in span', () => {
    const el = MessageRenderer({ message: 'hi :smile:' }) as ReactElement;
    expect(el.type).toBe('span');
  });
});
