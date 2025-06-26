import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'

import { useApi } from 'api'
import { Invoice } from 'types'
import InvoiceTotals from '../InvoiceTotals'

const InvoiceShow = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const api = useApi()
  const [invoice, setInvoice] = useState<Invoice>()

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) return;
      try {
        const { data } = await api.getInvoice({ id: Number(id) });
        setInvoice(data);
      } catch (err) {
        console.error('Failed to fetch invoice', err);
      }
    };
  
    fetchInvoice();
  }, [api, id]);

  const handleMarkAsPaid = async () => {
    if (!invoice) return;
  
    try {
      await api.putInvoice(
        { id: invoice.id },
        {
          invoice: {
            id: invoice.id,
            paid: true
          }
        }
      );
  
      alert('Invoice marked as paid!');
      window.location.reload();
    } catch (err) {
      console.error('Failed to mark as paid:', err);
      alert('Failed to update invoice status.');
    }
  };  

  const handleFinalize = async () => {
    if (!invoice) return;
  
    try {
      await api.putInvoice(
        { id: invoice.id },
        {
          invoice: {
            id: invoice.id,
            customer_id: invoice.customer_id ?? undefined,
            finalized: true,
            paid: invoice.paid,
            date: invoice.date,
            deadline: invoice.deadline,
            invoice_lines_attributes: invoice.invoice_lines.map((line) => ({
              id: line.id,
              product_id: line.product_id,
              quantity: line.quantity,
              _destroy: false,
            })),
          },
        }
      );
  
      alert('Invoice finalized!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to finalize invoice.');
    }
  };
  

  const handleDelete = async (invoiceId: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this invoice?');
    if (!confirmDelete) return;
  
    try {
      if (!invoice) {
        console.error('No invoice loaded');
        return;
      }
      await api.deleteInvoice({ id: invoice.id });
  
      alert('Invoice deleted successfully!');
      // reload the invoice list or navigate
      window.location.href = '/'; // or use navigate('/')
    } catch (error: any) {
      if (error.response?.status === 422) {
        alert('This invoice is finalized and cannot be deleted.');
      } else {
        console.error('Error deleting invoice:', error);
        alert('An error occurred while deleting the invoice.');
      }
    }
  };

  if (!invoice) return <div>Loading...</div>

  return (
    <div className="container mt-4">
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
      <p><strong>Finalized:</strong> {invoice.finalized ? 'Yes' : 'No'}
      </p>
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
      <InvoiceTotals lines={invoice.invoice_lines} />
      {!invoice.finalized && (
        <div className="mb-3">
        <button
          className="btn btn-primary me-2"
          onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
        >
          Edit Invoice
        </button>
        <button
          className="btn btn-success"
          onClick={handleFinalize}
        >
          Finalize Invoice
        </button>
      </div>
        
      )}

      {invoice.finalized && !invoice.paid && (
        <div className="mb-3">
        <button
          className="btn btn-warning mb-3 ms-2"
          onClick={handleMarkAsPaid}
        >
          Mark as Paid
        </button>
        </div>
      )}

    <button onClick={() => handleDelete(invoice.id)}
    className={`btn btn-danger ${invoice.finalized ? 'opacity-50 cursor-not-allowed' : ''}`}>
      Delete Invoice
      </button>


    </div>
  )
}

export default InvoiceShow
