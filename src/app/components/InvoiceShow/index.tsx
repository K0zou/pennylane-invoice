import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'

import { useApi } from 'api'
import { Invoice } from 'types'

const InvoiceShow = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const api = useApi()
  const [invoice, setInvoice] = useState<Invoice>()

  useEffect(() => {
    api.getInvoice(id).then(({ data }) => {
      setInvoice(data)
    })
  }, [api, id])

  if (!invoice) return <div>Loading...</div>

  return (
    <div className="container mt-4">
      <button
        onClick={() => navigate('/')}
        className="btn btn-primary mb-3"
      >
        ← Back to Invoice List
      </button>
      <h2>Invoice #{invoice.id}</h2>

       <p>
        <strong>Customer:</strong> {invoice.customer?.first_name} {invoice.customer?.last_name}
      </p>
      <p>
        <strong>Address:</strong> {invoice.customer?.address}, {invoice.customer?.zip_code},{' '}
        {invoice.customer?.city}, {invoice.customer?.country}
      </p>
      <p><strong>Date:</strong> {invoice.date}</p>
      <p><strong>Deadline:</strong> {invoice.deadline}</p>
      <p><strong>Finalized:</strong> {invoice.finalized ? 'Yes' : 'No'}</p>
      <p><strong>Paid:</strong> {invoice.paid ? 'Yes' : 'No'}</p>

      <h4>Invoice Lines</h4>
      <table className="table table-sm table-bordered">
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Unit</th>
            <th>VAT %</th>
            <th>Price</th>
            <th>Tax</th>
          </tr>
        </thead>
        <tbody>
          {invoice.invoice_lines.map((line) => (
            <tr key={line.id}>
              <td>{line.label}</td>
              <td>{line.quantity}</td>
              <td>{line.unit}</td>
              <td>{line.vat_rate}%</td>
              <td>{line.price}</td>
              <td>{line.tax}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default InvoiceShow
