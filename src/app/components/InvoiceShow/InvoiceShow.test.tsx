import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import InvoiceShow from './index';
import { useApi } from 'api';

jest.mock('api', () => ({
    useApi: jest.fn(),
  }));

// Mock invoice data
const mockInvoice = {
  id: 1,
  customer_id: 101,
  finalized: false,
  paid: false,
  date: '2024-05-01',
  deadline: '2024-06-01',
  total: '100.00',
  tax: '20.00',
  invoice_lines: [
    {
      id: 1,
      invoice_id: 1,
      product_id: 55,
      quantity: 2,
      label: 'Mock Product',
      unit: 'piece',
      vat_rate: '20',
      price: '50.00',
      tax: '10.00',
      product: {
        id: 55,
        label: 'Mock Product',
        vat_rate: '20',
        unit: 'piece',
        unit_price: '50.00',
        unit_price_without_tax: '40.00',
        unit_tax: '10.00',
      },
    },
  ],
  customer: {
    id: 101,
    first_name: 'John',
    last_name: 'Doe',
    address: '123 Main St',
    zip_code: '75001',
    city: 'Paris',
    country: 'France',
    country_code: 'FR',
  },
};

const reloadMock = jest.fn();

/*beforeAll(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      ...window.location,
      reload: reloadMock,
    },
  });
  window.alert = jest.fn();
}); */

beforeAll(() => {
    window.alert = jest.fn();
  });
  

describe('InvoiceShow', () => {
    /* beforeEach(() => {
        jest.clearAllMocks();
      }); */
    beforeEach(() => {
        jest.clearAllMocks();

        window.alert = jest.fn();
        // @ts-ignore
        delete window.location;
        //window.location = { ...window.location, reload: jest.fn() };
      }); 

    it('renders invoice data', async () => {
      
        (useApi as jest.Mock).mockReturnValue({
        getInvoice: jest.fn().mockResolvedValue({ data: mockInvoice }),
      });
  
      render(
        <MemoryRouter initialEntries={['/invoices/1']}>
          <Routes>
            <Route path="/invoices/:id" element={<InvoiceShow />} />
          </Routes>
        </MemoryRouter>
      );
  
      await waitFor(() => {
        expect(screen.getByText(/Invoice #1/)).toBeInTheDocument();
        expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      });
    });

  //test Finalise
  it('calls API to finalize invoice on button click', async () => {
    const mockPutInvoice = jest.fn().mockResolvedValue({ data: {} });
    const mockGetInvoice = jest.fn().mockResolvedValue({ data: mockInvoice });
    
    (useApi as jest.Mock).mockReturnValue({
        getInvoice: mockGetInvoice,
        putInvoice: mockPutInvoice,
      });

    // Mock window.location.reload
    //const reloadSpy = jest.spyOn(window.location, 'reload').mockImplementation(() => {});
/*
    Object.defineProperty(window, 'location', {
        writable: true,
        value: { ...window.location, reload: jest.fn() },
      }); */

    render(
      <MemoryRouter initialEntries={['/invoices/1']}>
        <Routes>
          <Route path="/invoices/:id" element={<InvoiceShow />} />
        </Routes>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Finalize Invoice/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Finalize Invoice/i));

    await waitFor(() => {
        expect(mockPutInvoice).toHaveBeenCalledWith(
          { id: 1 },
          expect.objectContaining({
            invoice: expect.objectContaining({
              finalized: true,
            }),
          })
        );
    
        expect(window.alert).toHaveBeenCalledWith('Invoice finalized!');
      });
    });
});