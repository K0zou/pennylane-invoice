import { useApi } from 'api'
import { Customer, Invoice, Product } from 'types'
import { useEffect, useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import CustomerAutocomplete from '../CustomerAutocomplete'
import ProductAutocomplete from '../ProductAutocomplete'

const InvoicesList = (): React.ReactElement => {
  const api = useApi()

  const [invoicesList, setInvoicesList] = useState<Invoice[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)


  const fetchInvoices = useCallback(async () => {
    const { data } = await api.getInvoices()
    setInvoicesList(data.invoices)
  }, [api])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

   // Filter invoices by selected customer or Product
  const filteredInvoices = selectedCustomer || selectedProduct
  ? invoicesList.filter(invoice => {
      const customerMatch = selectedCustomer
        ? invoice.customer_id === selectedCustomer.id
        : true

      const productMatch = selectedProduct
        ? invoice.invoice_lines.some(line => line.product_id === selectedProduct.id)
        : true

      return customerMatch && productMatch
    })
  : invoicesList

  return (
     <div>
      <div className="mb-4">
        <CustomerAutocomplete
          value={selectedCustomer}
          onChange={setSelectedCustomer}
        />
      </div>
      <div className="mb-4">
        <ProductAutocomplete
          value={selectedProduct}
          onChange={setSelectedProduct}
        />
      </div>
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Id</th>
            <th>Customer</th>
            <th>Address</th>
            <th>Total</th>
            <th>Tax</th>
            <th>Finalized</th>
            <th>Paid</th>
            <th>Date</th>
            <th>Deadline</th>
          </tr>
        </thead>
        <tbody>
          {filteredInvoices.map((invoice) => (
            <tr key={invoice.id}>
              <td>
                <Link to={`/invoices/${invoice.id}`}>{invoice.id}</Link>
              </td>
              <td>
                {invoice.customer?.first_name} {invoice.customer?.last_name}
              </td>
              <td>
                {invoice.customer?.address}, {invoice.customer?.zip_code}{' '}
                {invoice.customer?.city}
              </td>
              <td>{invoice.total}</td>
              <td>{invoice.tax}</td>
              <td>{invoice.finalized ? 'Yes' : 'No'}</td>
              <td>{invoice.paid ? 'Yes' : 'No'}</td>
              <td>{invoice.date}</td>
              <td>{invoice.deadline}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default InvoicesList
