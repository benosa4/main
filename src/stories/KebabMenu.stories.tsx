import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { KebabMenu } from '../shared/ui/kebab/KebabMenu'

const meta: Meta<typeof KebabMenu> = {
  title: 'UI/KebabMenu',
  component: KebabMenu,
}
export default meta

type Story = StoryObj<typeof KebabMenu>

export const Default: Story = {
  render: () => (
    <div className="h-[200px] flex items-start justify-end p-4 bg-slate-50">
      <KebabMenu onAction={(a)=>console.log('action', a)} />
    </div>
  )
}

export const LongLabels: Story = {
  render: () => (
    <div className="h-[200px] flex items-start justify-end p-4 bg-slate-50">
      <KebabMenu onAction={(a)=>console.log('action', a)} />
    </div>
  )
}

export const DisabledItems: Story = {
  render: () => (
    <div className="h-[200px] flex items-start justify-end p-4 bg-slate-50">
      <KebabMenu disabledActions={{ 'video-call': true, 'delete-chat': true }} />
    </div>
  )
}

export const WithinNarrowViewport: Story = {
  render: () => (
    <div style={{ width: 320 }} className="h-[200px] flex items-start justify-end p-2 bg-slate-50 border">
      <KebabMenu />
    </div>
  )
}

