import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProductCard from './ProductCard'

const mockProduct = {
  id: '1',
  name: 'Test Laptop',
  description: 'A test laptop',
  price: 999.99,
  category: 'Electronics',
  imageUrl: '/laptop.jpg',
  stock: 5,
}

describe('ProductCard', () => {
  it('renders product name', () => {
    render(<ProductCard product={mockProduct} onAddToCart={() => {}} />)
    expect(screen.getByText('Test Laptop')).toBeInTheDocument()
  })

  it('renders price with two decimals', () => {
    render(<ProductCard product={mockProduct} onAddToCart={() => {}} />)
    expect(screen.getByText('$999.99')).toBeInTheDocument()
  })

  it('renders category badge', () => {
    render(<ProductCard product={mockProduct} onAddToCart={() => {}} />)
    expect(screen.getByText('Electronics')).toBeInTheDocument()
  })

  it('shows Add to Cart button', () => {
    render(<ProductCard product={mockProduct} onAddToCart={() => {}} />)
    expect(screen.getByText('Add to Cart')).toBeInTheDocument()
  })

  it('shows Sold Out when stock is 0', () => {
    const outOfStock = { ...mockProduct, stock: 0 }
    render(<ProductCard product={outOfStock} onAddToCart={() => {}} />)
    expect(screen.getByText('Sold Out')).toBeInTheDocument()
  })

  it('shows quantity warning when stock is low', () => {
    const lowStock = { ...mockProduct, stock: 3 }
    render(<ProductCard product={lowStock} onAddToCart={() => {}} />)
    expect(screen.getByText('Only 3 left')).toBeInTheDocument()
  })

  it('shows Adding... when isAdding is true', () => {
    render(<ProductCard product={mockProduct} onAddToCart={() => {}} isAdding={true} />)
    expect(screen.getByText('Adding...')).toBeInTheDocument()
  })

  it('calls onAddToCart when clicked', () => {
    const addFn = vi.fn()
    render(<ProductCard product={mockProduct} onAddToCart={addFn} />)
    fireEvent.click(screen.getByText('Add to Cart'))
    expect(addFn).toHaveBeenCalledWith(mockProduct)
  })

  it('disables button when out of stock', () => {
    const outOfStock = { ...mockProduct, stock: 0 }
    render(<ProductCard product={outOfStock} onAddToCart={() => {}} />)
    expect(screen.getByText('Sold Out')).toBeDisabled()
  })

  it('disables button when adding', () => {
    render(<ProductCard product={mockProduct} onAddToCart={() => {}} isAdding={true} />)
    expect(screen.getByText('Adding...')).toBeDisabled()
  })
})
