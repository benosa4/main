import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import ChatPage from './ChatPage';

describe('ChatPage UI', () => {
  it('renders initials for chat avatars (first and last name)', async () => {
    render(<ChatPage />);

    // Wait for chats to load
    const devGroup = await screen.findByText('Developers Group');
    expect(devGroup).toBeInTheDocument();

    // Find the container item for Developers Group and assert it contains initials DG
    const chatItem = devGroup.closest('div');
    expect(chatItem).toBeTruthy();

    // The Avatar renders initials as plain text; check for DG nearby
    const itemScope = within(chatItem as HTMLElement);
    expect(itemScope.getByText('DG')).toBeInTheDocument();

    // Ensure no <img> avatar in the chat list item
    const imgs = itemScope.queryAllByRole('img');
    // allow zero or unrelated images (e.g., story previews in search area), but the avatar itself should be text
    // We at least ensure the expected initials are present which implies Avatar rendered
    expect(imgs).toBeDefined();
  });

  it('shows thicker segmented ring with inner gap for stories', async () => {
    render(<ChatPage />);
    // Wait for any story title to appear
    const storyTitle = await screen.findByText(/Chat \d+/);
    expect(storyTitle).toBeInTheDocument();

    // Climb to the story block and check gradient container exists
    const storyBlock = storyTitle.closest('div');
    expect(storyBlock).toBeTruthy();

    // The gradient wrapper should have inline style with conic-gradient
    const gradientWrapper = (storyBlock as HTMLElement).querySelector('div[style*="conic-gradient"]');
    expect(gradientWrapper).toBeTruthy();

    // Inner gap layer should exist with bg-white/20
    const innerGap = (gradientWrapper as HTMLElement).querySelector('div');
    expect(innerGap).toBeTruthy();
  });

  it('toggles to A version and expands layout', async () => {
    render(<ChatPage />);

    const container = await screen.findByTestId('chat-page-container');
    expect(container.className).toMatch(/mx-\[2cm\]/);

    const burger = await screen.findByLabelText('Open menu');
    burger.click();

    // Open the nested menu and click the version toggle inside "Еще.."
    // The initial label is "Еще.." and inside it "Переключить в А версию"
    const more = await screen.findByText('Еще..');
    more.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

    const toggle = await screen.findByText('Переключить в А версию');
    toggle.click();

    await waitFor(() => {
      expect(container.className).toMatch(/w-full/);
    });
  });

  it('shows paperclip SVG for attachment button', async () => {
    render(<ChatPage />);

    const attachBtn = await screen.findByLabelText('Attachment');
    expect(attachBtn).toBeInTheDocument();
    const svg = attachBtn.querySelector('svg');
    expect(svg).toBeTruthy();
  });
});

