import { useMemo } from 'react';
import { Product } from 'types';

type Line = {
  product?: Product | null;
  quantity: number;
  price: string;
  vat_rate: string;
  _destroy?: boolean;
};

type Props = {
  lines: Line[];
};

const InvoiceTotals = ({ lines }: Props) => {
  const totals = useMemo(() => {
    return lines.reduce(
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
  }, [lines]);

  return (
    <div className="border-t pt-4 space-y-1">
      <p><strong>Subtotal:</strong> €{totals.subtotal.toFixed(2)}</p>
      <p><strong>VAT:</strong> €{totals.tax.toFixed(2)}</p>
      <p><strong>Total:</strong> €{totals.total.toFixed(2)}</p>
    </div>
  );
};

export default InvoiceTotals;
