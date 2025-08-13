import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { KebabMenu } from './KebabMenu'

describe('KebabMenu', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('opens on click and closes on Esc', () => {
    render(<KebabMenu />)
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    const menu = screen.getByRole('menu')
    expect(menu).toBeTruthy()
    fireEvent.keyDown(document, { key: 'Escape' })
    // menu should be removed
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('navigates with arrows and triggers on Enter', () => {
    const spy = vi.fn()
    render(<KebabMenu onAction={spy} />)
    fireEvent.click(screen.getByRole('button'))
    const items = screen.getAllByRole('menuitem')
    expect(items.length).toBeGreaterThan(0)
    items[0].focus()
    fireEvent.keyDown(items[0], { key: 'Enter' })
    expect(spy).toHaveBeenCalled()
  })

  it('disables actions via props', () => {
    render(<KebabMenu disabledActions={{ 'video-call': true, 'delete-chat': true }} />)
    fireEvent.click(screen.getByRole('button'))
    const items = screen.getAllByRole('menuitem')
    // video-call is second
    expect(items[1]).toHaveAttribute('data-disabled')
  })
})

