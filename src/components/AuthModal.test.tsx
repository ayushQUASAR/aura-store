import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AuthModal from './AuthModal'

describe('AuthModal', () => {
  it('returns null when isOpen is false', () => {
    const { container } = render(<AuthModal isOpen={false} onClose={() => {}} onLogin={async () => {}} />)
    expect(container.innerHTML).toBe('')
  })

  it('shows login form by default', () => {
    render(<AuthModal isOpen={true} onClose={() => {}} onLogin={async () => {}} />)
    expect(screen.getByText('Sign In to AuraStore')).toBeInTheDocument()
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('customer@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('password123')).toBeInTheDocument()
  })

  it('shows register form after toggle', () => {
    render(<AuthModal isOpen={true} onClose={() => {}} onLogin={async () => {}} />)
    fireEvent.click(screen.getByText('Need an account? Register instead'))
    expect(screen.getByText('Create Developer Account')).toBeInTheDocument()
    expect(screen.getByText('Register Account')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Jane Doe')).toBeInTheDocument()
  })

  it('shows validation error when fields empty', async () => {
    const loginFn = vi.fn()
    render(<AuthModal isOpen={true} onClose={() => {}} onLogin={loginFn} />)
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }))
    await waitFor(() => {
      expect(screen.getByText('Please fill out all required fields.')).toBeInTheDocument()
    })
    expect(loginFn).not.toHaveBeenCalled()
  })

  it('calls onLogin with email and password in login mode', async () => {
    const loginFn = vi.fn().mockResolvedValue(undefined)
    render(<AuthModal isOpen={true} onClose={() => {}} onLogin={loginFn} />)
    fireEvent.change(screen.getByPlaceholderText('customer@example.com'), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('password123'), { target: { value: 'pass123' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }))
    await waitFor(() => {
      expect(loginFn).toHaveBeenCalledWith('test@test.com', 'test', 'CUSTOMER', 'pass123', true)
    })
  })

  it('calls onLogin with name and role in register mode', async () => {
    const loginFn = vi.fn().mockResolvedValue(undefined)
    render(<AuthModal isOpen={true} onClose={() => {}} onLogin={loginFn} />)
    fireEvent.click(screen.getByText('Need an account? Register instead'))
    fireEvent.change(screen.getByPlaceholderText('Jane Doe'), { target: { value: 'Test User' } })
    fireEvent.change(screen.getByPlaceholderTextEditorTool; read those first...
    fireEvent.change(screen.getByPlaceholderText('customer@example.com'), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('password123'), { target: { value: 'pass123' } })
    fireEvent.click(screen.getByRole('button', { name: /Register Account/i }))
    await waitFor(() => {
      expect(loginFn).toHaveBeenCalledWith('test@test.com', 'Test User', 'CUSTOMER', 'pass123', false)
    })
  })

  it('shows error message on failed login', async () => {
    const loginFn = vi.fn().mockRejectedValue(new Error('Invalid credentials'))
    render(<AuthModal isOpen={true} onClose={() => {}} onLogin={loginFn} />)
    fireEvent.change(screen.getByPlaceholderText('customer@example.com'), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('password123'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }))
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('calls onClose on successful login', async () => {
    const closeFn = vi.fn()
    const loginFn = vi.fn().mockResolvedValue(undefined)
    render(<AuthModal isOpen={true} onClose={closeFn} onLogin={loginFn} />)
    fireEvent.change(screen.getByPlaceholderText('customer@example.com'), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('password123'), { target: { value: 'pass123' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }))
    await waitFor(() => {
      expect(closeFn).toHaveBeenCalled()
    })
  })

  it('calls onClose when backdrop clicked', () => {
    const closeFn = vi.fn()
    const { container } = render(<AuthModal isOpen={true} onClose={closeFn} onLogin={async () => {}} />)
    const backdrop = container.querySelector('.fixed')
    if (backdrop) fireEvent.click(backdrop)
    expect(closeFn).toHaveBeenCalled()
  })
})
