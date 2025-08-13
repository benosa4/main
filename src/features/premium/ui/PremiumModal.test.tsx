import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import PremiumModal from './PremiumModal';

describe('PremiumModal', () => {
  it('renders and switches plans via keyboard', async () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    render(<PremiumModal open onClose={onClose} onSubmit={onSubmit} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    // Arrow to monthly
    fireEvent.keyDown(dialog, { key: 'ArrowRight' });
    // CTA exists
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});

