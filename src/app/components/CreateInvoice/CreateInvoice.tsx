import { useState, useMemo } from 'react'
import { useApi } from 'api'
import { Customer, Product } from 'types'
import { useNavigate } from 'react-router-dom';
import ProductAutocomplete from '../ProductAutocomplete'
import CustomerAutocomplete from '../CustomerAutocomplete'
import InvoiceTotals from '../InvoiceTotals'
import { Components } from 'api/gen/client';



export default function CreateInvoice() {
  const api = useApi();

  //const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const navigate = useNavigate();
  type InvoiceLine = {
    product: Product | null;
    quantity: number;
    label: string;
    price: string;
    vat_rate: string;
    _destroy?: boolean;
  };
  
  const [invoiceLines, setInvoiceLines] = useState<InvoiceLine[]>([
    {
      product: null,
      quantity: 1,
      label: '',
      price: '',
      vat_rate: '20',
    },
  ]);

  const totals = useMemo(() => {
    return invoiceLines.reduce(
      (totals, line) => {
        if (line._destroy || !line.price || !line.vat_rate) return totals;
  
        const price = parseFloat(line.price);
        const vatRate = parseFloat(line.vat_rate);
        const quantity = parseFloat(line.quantity.toString() || '1');
  
        const lineSubtotal = price * quantity;
        const lineTax = lineSubtotal * (vatRate / 100);
  
        return {
          subtotal: totals.subtotal + lineSubtotal,
          tax: totals.tax + lineTax,
          total: totals.total + lineSubtotal + lineTax,
        };
      },
      { subtotal: 0, tax: 0, total: 0 }
    );
  }, [invoiceLines]);
  
  
  

  const handleLineChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedLines = [...invoiceLines];
    updatedLines[index] = { ...updatedLines[index], [name]: value };
    setInvoiceLines(updatedLines);
  };
  
  const addInvoiceLine = () => {
    setInvoiceLines([
      ...invoiceLines,
      { product: null, quantity: 1, label: '', price: '', vat_rate: '20' },
    ]);
  };
  
  const removeInvoiceLine = (index: number) => {
    setInvoiceLines(invoiceLines.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, selected: Product | null) => {
    const updatedLines = [...invoiceLines];
    updatedLines[index].product = selected;
    updatedLines[index].label = selected?.label || '';
    updatedLines[index].price = selected?.unit_price || '';
    updatedLines[index].vat_rate = selected?.vat_rate || '20';
    setInvoiceLines(updatedLines);
  };
  

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
      
        const invoice_lines_attributes = invoiceLines.map((line) => ({
          product_id: Number(line.product?.id),
          quantity: Number(line.quantity),
          label: line.label,
          unit: 'piece',
          vat_rate: line.vat_rate,
          price: line.price,
          tax: (Number(line.price) * Number(line.vat_rate) / 100).toFixed(2),
        }));
      
        const payload = {
          customer_id: selectedCustomer?.id ?? 0,
          finalized: false,
          paid: false,
          date: new Date().toISOString().split('T')[0],
          deadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          invoice_lines_attributes,
        };
      
        try {
          console.log('Payload:', payload)
          const res = await api.postInvoices(null, {
            invoice: payload as Components.Schemas.InvoiceCreatePayload,
          });
          
          alert(`Invoice #${res.data.id} created successfully!`);
          navigate('/');
        } catch (err) {
          console.error('Error creating invoice', err);
          alert('Error creating invoice');
        }
    };
      
      

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-semibold">Create Invoice</h2>

      <label htmlFor="customer" className="block text-sm font-medium">
        Select Customer
      </label>
      <CustomerAutocomplete
        value={selectedCustomer}
        onChange={setSelectedCustomer}
      />


      {invoiceLines.map((line, index) => (
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
