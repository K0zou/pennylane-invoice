import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import EditInvoice from './EditInvoice'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Client } from 'api/gen/client'
import { ApiContext } from 'api'

/*
Getting an error with the useEffect
Error: Uncaught [TypeError: Cannot read properties of undefined (reading 'then')]
*/

const mockGetInvoice = jest.fn().mockResolvedValue({
  data: {
    id: 1,
    customer_id: 101,
    customer: {
      id: 101,
      first_name: 'Alice',
      last_name: 'Smith',
      address: '',
      zip_code: '',
      city: '',
      country: '',
      country_code: '',
    },
    invoice_lines: [
      {
        id: 1,
        product_id: 201,
        quantity: 2,
        label: 'Widget',
        price: '100',
        vat_rate: '20',
      },
    ],
    paid: false,
    date: '2025-06-20',
    deadline: '2025-07-20',
  },
})

const mockGetSearchProducts = jest.fn().mockResolvedValue({
  data: {
    products: [
      {
        id: 201,
        label: 'Widget',
        unit_price: '100',
        vat_rate: '20',
      },
    ],
  },
})

const mockPutInvoice = jest.fn().mockResolvedValue({})

const mockClient: Partial<Client> = {
  getInvoice: mockGetInvoice,
  getSearchProducts: mockGetSearchProducts,
  putInvoice: mockPutInvoice,
}

function renderWithRouterAndContext() {
  render(
    <MemoryRouter initialEntries={['/invoices/1/edit']}>
      <ApiContext.Provider value={{ client: mockClient as Client }}>
        <Routes>
          <Route path="/invoices/:id/edit" element={<EditInvoice />} />
        </Routes>
      </ApiContext.Provider>
    </MemoryRouter>
  )
}

test('loads and displays invoice data for editing', async () => {
  renderWithRouterAndContext()

  // Wait for the inputs to load with mock data
  await waitFor(() =>
    expect(screen.getByPlaceholderText('Label')).toHaveValue('Widget')
  )

  const quantityInput = screen.getByPlaceholderText('Quantity')
  fireEvent.change(quantityInput, { target: { value: '3' } })

  const submitButton = screen.getByRole('button', { name: /submit invoice/i })
  fireEvent.click(submitButton)

  await waitFor(() =>
    expect(mockPutInvoice).toHaveBeenCalledWith(
      { id: 1 },
      expect.objectContaining({
        invoice: expect.objectContaining({
          customer_id: 101,
          invoice_lines_attributes: expect.arrayContaining([
            expect.objectContaining({
              quantity: 3,
              label: 'Widget',
              vat_rate: '20',
              price: '100',
            }),
          ]),
        }),
      })
    )
  )
})
