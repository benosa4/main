import React, { useState } from 'react'
import { Meta, StoryObj } from '@storybook/react'
import { GiftContactsDialog, Contact, Page } from '../features/gifting'

type FetchContacts = (p: { query: string; cursor?: string | null; limit: number }) => Promise<Page<Contact>>

const meta: Meta<typeof GiftContactsDialog> = {
  title: 'GiftContactsDialog',
  component: GiftContactsDialog,
  argTypes: {
    open: { control: 'boolean' },
    initialQuery: { control: 'text' },
    pageSize: { control: 'number' },
  },
}

export default meta
type Story = StoryObj<typeof GiftContactsDialog>

const makeMock = (total = 150): FetchContacts => async ({ query, cursor, limit }) => {
  const page = cursor ? parseInt(cursor, 10) : 1
  const all = Array.from({ length: total }, (_, i) => ({
    id: `id-${i+1}`,
    name: `Контакт ${i+1}`,
    lastSeenText: 'был(а) недавно',
    avatarUrl: undefined,
  })).filter(c => c.name.toLowerCase().includes((query||'').toLowerCase()))
  const start = (page - 1) * limit
  const items = all.slice(start, start + limit)
  const nextCursor = start + limit < all.length ? String(page + 1) : null
  return { items, nextCursor }
}

export const Default: Story = {
  args: {
    open: true,
    initialQuery: '',
    pageSize: 30,
    fetchContacts: makeMock(),
    onClose: () => {},
    onContinue: () => {},
  }
}

export const Loading: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true)
    const slowMock: FetchContacts = async (p) => {
      await new Promise(r => setTimeout(r, 1200))
      return makeMock()(p)
    }
    return <GiftContactsDialog {...args} open={open} fetchContacts={slowMock} onClose={() => setOpen(false)} />
  },
}

export const Empty: Story = {
  args: {
    open: true,
    initialQuery: 'zzzz',
    fetchContacts: makeMock(),
    onClose: () => {},
    onContinue: () => {},
  }
}

export const Error: Story = {
  args: {
    open: true,
    fetchContacts: async () => { throw new Error('Network error') },
    onClose: () => {},
    onContinue: () => {},
  }
}

export const WithLongList: Story = {
  args: {
    open: true,
    fetchContacts: makeMock(5000),
    onClose: () => {},
    onContinue: () => {},
  }
}

