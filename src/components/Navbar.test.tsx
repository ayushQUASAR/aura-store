import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Navbar from './Navbar'

const defaultProps = {
  user: null,
  onOpenAuth: vi.fn(),
  onLogout: vi.fn(),
  cartCount: 0,
  onOpenCart: vi.fn(),
  currentTab: 'shop' as const,
  setTab: vi.fn(),
}

describe('Navbar', () => {
  it('renders the brand name', () => {
    render(<Navbar {...defaultProps} />)
    expect(screen.getByText('AuraStore')).toBeInTheDocument()
  })

  it('shows sign in button when user is not logged in', () => {
    render(<Navbar {...defaultProps} />)
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  it('shows cart with badge when cartCount > 0', () => {
    render(<Navbar {...defaultProps} cartCount={3} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('shows user name when logged in', () => {
    const user = { email: 'test@example.com', name: 'Test User', role: 'CUSTOMER' as const }
    render(<Navbar {...defaultProps} user={user} />)
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })
})
