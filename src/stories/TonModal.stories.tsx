import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'
import TonModal from '../features/wallets/ui/TonModal'

const meta: Meta<typeof TonModal> = {
  title: 'Wallets/TonModal',
  component: TonModal,
  argTypes: {
    open: { control: 'boolean' },
    balanceTon: { control: 'number' },
    usdRate: { control: 'number' },
    burstIntensity: { control: 'number' },
    burstSparkles: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof TonModal>

export const Default: Story = {
  args: {
    open: true,
    balanceTon: 0,
    usdRate: undefined,
    burstIntensity: 1,
    burstSparkles: true,
  },
  render: (args) => {
    const [open, setOpen] = useState(true)
    return (
      <TonModal
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        onTopUp={() => {}}
      />
    )
  }
}

export const WithBalance: Story = {
  args: {
    open: true,
    balanceTon: 12.3456,
    usdRate: 5.1,
    burstIntensity: 1,
    burstSparkles: true,
  },
  render: (args) => {
    const [open, setOpen] = useState(true)
    return (
      <TonModal
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        onTopUp={() => {}}
      />
    )
  }
}

export const LoadingTopUp: Story = {
  args: {
    open: true,
    balanceTon: 3.5,
    usdRate: 4.0,
    burstIntensity: 1,
    burstSparkles: true,
  },
  render: (args) => {
    const [open, setOpen] = useState(true)
    return (
      <TonModal
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        onTopUp={async () => { await new Promise(r => setTimeout(r, 1500)) }}
      />
    )
  }
}

