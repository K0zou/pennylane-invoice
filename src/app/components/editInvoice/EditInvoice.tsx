import { useState, useEffect } from 'react'
import { useApi } from 'api'
import { Customer, Product, Invoice } from 'types'
import { useParams, useNavigate } from 'react-router-dom';
import ProductAutocomplete from '../ProductAutocomplete'
import CustomerAutocomplete from '../CustomerAutocomplete'
import InvoiceTotals from '../InvoiceTotals'
import { Components } from 'api/gen/client';


type InvoiceWithCustomer = Invoice & { customer?: Customer };


export default function EditInvoice() {
  const api = useApi()
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [products, setProducts] = useState<Product[]>([])
  const [invoice, setInvoice] = useState<InvoiceWithCustomer>()
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>()

  const [invoiceLines, setInvoiceLines] = useState<{
    id?: number;
    product: Product | null;
    quantity: number;
    label: string;
    price: string;
    vat_rate: string;
    _destroy?: boolean;
  }[]>([
    {
      id: undefined,
      product: null,
      quantity: 1,
      label: '',
      price: '',
      vat_rate: '20',
      _destroy: false,
    },
  ]);

  const handleLineChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedLines = [...invoiceLines];
    updatedLines[index] = { ...updatedLines[index], [name]: value };
    setInvoiceLines(updatedLines);
  }; 

  useEffect(() => {
    let fetchedInvoice: InvoiceWithCustomer;
  
    // Step 1: Fetch invoice
    api.getInvoice(id).then(({ data }) => {
      if (!data) return;
      fetchedInvoice = data as InvoiceWithCustomer;
      setInvoice(fetchedInvoice);
      setSelectedCustomer(fetchedInvoice.customer ?? null);
  
      // Step 2: Fetch products and match them to lines
      return api.getSearchProducts({ query: '', page: 1, per_page: 100 });
    })
    .then(res => {
      if (!res) return;
      setProducts(res.data.products);
  
      // Step 3: Once products are available, set invoice lines with full product object
      setInvoiceLines(
        fetchedInvoice.invoice_lines.map((line) => ({
          id: line.id,
          product: res.data.products.find(p => p.id === line.product_id) ?? null,
          quantity: line.quantity,
          label: line.label,
          price: line.price,
          vat_rate: line.vat_rate.toString(),
        }))
      );
    })
    .catch(console.error);
  }, [api, id]);
  

  const handleProductChange = (index: number, selected: Product | null) => {
    const updatedLines = [...invoiceLines];
    updatedLines[index].product = selected;
    updatedLines[index].label = selected?.label || '';
    updatedLines[index].price = selected?.unit_price || '';
    updatedLines[index].vat_rate = selected?.vat_rate || '20';
    setInvoiceLines(updatedLines);
  };
  
  
  const addInvoiceLine = () => {
    setInvoiceLines([
      ...invoiceLines,
      { product: null, quantity: 1, label: '', price: '', vat_rate: '20' },
    ]);
  };
  
  const removeInvoiceLine = (index: number) => {
    setInvoiceLines((prevLines) =>
      prevLines.map((line, i) => {
        if (i !== index) return line;
  
        // If the line has an `id`, mark it for deletion
        if (line.id) {
          return { ...line, _destroy: true };
        }
  
        // If the line is new (no id), remove it entirely
        return null;
      }).filter((line): line is typeof prevLines[number] => line !== null)
    );
  };
  
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!invoice) return;
  
    const invoice_lines_attributes = invoiceLines.map((line) => ({
      id: line.id,
      product_id: Number(line.product?.id),
      quantity: Number(line.quantity),
      label: line.label,
      unit: 'piece',
      vat_rate: line.vat_rate,
      price: line.price,
      tax: (Number(line.price) * Number(line.vat_rate) / 100).toFixed(2),
      _destroy: line._destroy || false,
    }));
  
    const payload = {
      invoice: {
        id: invoice.id,
        customer_id: selectedCustomer?.id ?? 0,
        finalized: false,
        paid: invoice.paid,
        date: invoice.date,
        deadline: invoice.deadline,
        invoice_lines_attributes,
      },
    };
  
    try {
      await api.putInvoice({ id: invoice.id }, {
        invoice: payload.invoice as Components.Schemas.InvoiceUpdatePayload,
      });

      alert(`Invoice #${invoice.id} updated successfully!`);
      navigate('/');
    } catch (err) {
      console.error('Error updating invoice', err);
      alert('Error updating invoice');
    }
  };  
      
      

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-semibold">Create Invoice</h2>

      <CustomerAutocomplete
        value={selectedCustomer}
        onChange={setSelectedCustomer}
      />


      {invoiceLines.map((line, index) => (
        line._destroy ? null : (
          <div key={index} className="border p-3 rounded mb-3">

              <ProductAutocomplete
                value={line.product}
                onChange={(selected) => handleProductChange(index, selected)}
              />

              <input
              type="text"
              name="label"
              value={line.label}
              onChange={(e) => handleLineChange(index, e)}
              placeholder="Label"
              className="w-full border rounded p-2 mb-2"
              required
              />

              <input
              type="number"
              name="quantity"
              value={line.quantity}
              onChange={(e) => handleLineChange(index, e)}
              placeholder="Quantity"
              className="w-full border rounded p-2 mb-2"
              required
              />

              <input
              type="number"
              name="price"
              value={line.price}
              onChange={(e) => handleLineChange(index, e)}
              placeholder="Price"
              className="w-full border rounded p-2 mb-2"
              required
              />



              <button
              type="button"
              onClick={() => removeInvoiceLine(index)}
              className="text-red-600 text-sm"
              >
              Remove Line
              </button>
          </div>
        )
        ))}

        <button
        type="button"
        onClick={addInvoiceLine}
        className="mb-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
        + Add Line
        </button>

        <InvoiceTotals lines={invoiceLines} />

        <button type="submit" className="btn btn-success w-100">
            Submit Invoice
        </button>
    </form>
  )
}
