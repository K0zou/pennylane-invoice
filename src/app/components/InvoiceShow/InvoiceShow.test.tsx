import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import InvoiceShow from './'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ApiContext } from 'api'
import { Client } from 'api/gen/client'

/*
Getting an error with the useEffect
Error: Uncaught [TypeError: Cannot read properties of undefined (reading 'then')]
*/

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const mockInvoiceData = {
  id: 1,
  customer_id: 100,
  customer: {
    id: 100,
    first_name: 'John',
    last_name: 'Doe',
    address: '123 Street',
    zip_code: '12345',
    city: 'City',
    country: 'Country',
  },
  date: '2025-06-20',
  deadline: '2025-07-20',
  finalized: false,
  paid: false,
  invoice_lines: [
    {
      id: 1,
      product_id: 1,
      label: 'Product A',
      quantity: 2,
      unit: 'piece',
      vat_rate: '20',
      price: '100',
      tax: '20',
    },
  ],
}

const mockClient: Partial<Client> = {
  getInvoice: jest.fn().mockResolvedValue({ data: mockInvoiceData }),
  putInvoice: jest.fn().mockResolvedValue({}),
  deleteInvoice: jest.fn().mockResolvedValue({}),
}

function renderComponent() {
  render(
    <MemoryRouter initialEntries={['/invoices/1']}>
      <ApiContext.Provider value={{ client: mockClient as Client }}>
        <Routes>
          <Route path="/invoices/:id" element={<InvoiceShow />} />
        </Routes>
      </ApiContext.Provider>
    </MemoryRouter>
  )
}

test('renders invoice details', async () => {
  renderComponent()

  await waitFor(() => {
    expect(screen.getByText(/Invoice #1/i)).toBeInTheDocument()
    expect(screen.getByText(/John Doe/)).toBeInTheDocument()
    expect(screen.getByText(/Product A/)).toBeInTheDocument()
  })
})

test('finalizes the invoice', async () => {
  renderComponent()

  await waitFor(() =>
    expect(screen.getByText(/Finalize Invoice/)).toBeInTheDocument()
  )

  fireEvent.click(screen.getByText(/Finalize Invoice/))

  await waitFor(() =>
    expect(mockClient.putInvoice).toHaveBeenCalledWith(
      { id: 1 },
      expect.objectContaining({
        invoice: expect.objectContaining({
          id: 1,
          finalized: true,
        }),
      })
    )
  )
})

test('marks the invoice as paid', async () => {
  // Mock invoice that is already finalized
  ;(mockClient.getInvoice as jest.Mock).mockResolvedValueOnce({
    data: { ...mockInvoiceData, finalized: true },
  })

  renderComponent()

  await waitFor(() =>
    expect(screen.getByText(/Mark as Paid/)).toBeInTheDocument()
  )

  fireEvent.click(screen.getByText(/Mark as Paid/))

  await waitFor(() =>
    expect(mockClient.putInvoice).toHaveBeenCalledWith(
      { id: 1 },
      expect.objectContaining({
        invoice: expect.objectContaining({
          paid: true,
        }),
      })
    )
  )
})

test('deletes invoice when confirmed', async () => {
  window.confirm = jest.fn(() => true)

  renderComponent()

  await waitFor(() =>
    expect(screen.getByText(/Delete Invoice/)).toBeInTheDocument()
  )

  fireEvent.click(screen.getByText(/Delete Invoice/))

  await waitFor(() =>
    expect(mockClient.deleteInvoice).toHaveBeenCalledWith({ id: 1 })
  )
})
