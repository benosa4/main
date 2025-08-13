import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import PremiumModal from '../features/premium/ui/PremiumModal';

const meta: Meta<typeof PremiumModal> = {
  title: 'Premium/PremiumModal',
  component: PremiumModal,
};
export default meta;

type Story = StoryObj<typeof PremiumModal>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <PremiumModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={async () => {
          await new Promise((r) => setTimeout(r, 500));
          setOpen(false);
        }}
      />
    );
  },
};

export const MonthlySelected: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <PremiumModal
        open={open}
        defaultPlan="monthly"
        onClose={() => setOpen(false)}
        onSubmit={() => setOpen(false)}
      />
    );
  },
};

export const Loading: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <PremiumModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={async () => {
          await new Promise((r) => setTimeout(r, 2000));
          setOpen(false);
        }}
      />
    );
  },
};

