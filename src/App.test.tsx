import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the navbar', () => {
    render(<App />)
    expect(screen.getByText('AuraStore')).toBeInTheDocument()
  })

  it('renders the description text', () => {
    render(<App />)
    expect(screen.getByText(/authentic retail app/i)).toBeInTheDocument()
  })

  it('renders the catalog search input', () => {
    render(<App />)
    expect(screen.getByPlaceholderText(/Search products/i)).toBeInTheDocument()
  })

  it('renders the footer', () => {
    render(<App />)
    expect(screen.getByText(/AuraStore Corporation/i)).toBeInTheDocument()
  })
})
