import { useState } from 'react'
import DraftInvoicesList from './DraftInvoicesList'
import FinalizedInvoicesList from './FinalizedInvoicesList'

const InvoicesIndex = (): React.ReactElement => {
  const [showFinalized, setShowFinalized] = useState(false)

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Invoices</h1>
        <button
          className="btn btn-outline-primary"
          onClick={() => setShowFinalized(!showFinalized)}
        >
          {showFinalized ? 'Show Draft Invoices' : 'Show Finalized Invoices'}
        </button>
      </div>

      {showFinalized ? <FinalizedInvoicesList /> : <DraftInvoicesList />}
    </div>
  )
}

export default InvoicesIndex