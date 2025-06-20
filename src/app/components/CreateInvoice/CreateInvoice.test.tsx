import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CreateInvoice from './CreateInvoice'
import { BrowserRouter } from 'react-router-dom'
import type { Client } from 'api/gen/client'
import { Customer, Product } from 'types'

// Mock data
const mockCustomer: Customer = {
  id: 1,
  first_name: 'Alice',
  last_name: 'Smith',
  address: '',
  zip_code: '',
  city: '',
  country: '',
  country_code: '',
}

const mockProduct: Product = {
  id: 10,
  label: 'Test Product',
  vat_rate: '20',
  unit: 'piece',
  unit_price: '100',
  unit_price_without_tax: '80',
  unit_tax: '20',
}

// Mock client
const mockClient: Partial<Client> = {
  postInvoices: jest.fn().mockResolvedValue({
    data: { id: 123 },
  }),
}

// Mock implementations for Autocomplete components
jest.mock('../CustomerAutocomplete', () => (props: any) => (
  <select
    data-testid="customer-select"
    onChange={(e) => {
      props.onChange({ ...mockCustomer, id: Number(e.target.value) })
    }}
  >
    <option value="">Select Customer</option>
    <option value="1">Alice Smith</option>
  </select>
))

jest.mock('../ProductAutocomplete', () => (props: any) => (
  <select
    data-testid="product-select"
    onChange={(e) => {
      props.onChange({ ...mockProduct, id: Number(e.target.value) })
    }}
  >
    <option value="">Select Product</option>
    <option value="10">Test Product</option>
  </select>
))

test('allows creating an invoice with selected customer and product', async () => {
  render(
    <BrowserRouter>
      <CreateInvoice client={mockClient as Client} />
    </BrowserRouter>
  )

  // Select customer
  fireEvent.change(screen.getByTestId('customer-select'), {
    target: { value: '1' },
  })

  // Select product
  fireEvent.change(screen.getByTestId('product-select'), {
    target: { value: '10' },
  })

  // Fill out label, quantity, and price fields
  fireEvent.change(screen.getByPlaceholderText('Label'), {
    target: { value: 'Service A' },
  })
  fireEvent.change(screen.getByPlaceholderText('Quantity'), {
    target: { value: '2' },
  })
  fireEvent.change(screen.getByPlaceholderText('Price'), {
    target: { value: '100' },
  })

  // Submit form
  fireEvent.click(screen.getByRole('button', { name: /submit invoice/i }))

  await waitFor(() => {
    expect(mockClient.postInvoices).toHaveBeenCalledWith(null, expect.objectContaining({
      customer_id: 1,
      invoice_lines_attributes: [
        expect.objectContaining({
          product_id: 10,
          quantity: 2,
          label: 'Service A',
          price: '100',
          tax: '20.00',
        }),
      ],
    }))
  })
})
