import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'

import InvoicesIndex from './components/InvoicesList'
import InvoiceShow from './components/InvoiceShow'
import CreateInvoice from './components/CreateInvoice/CreateInvoice'
import EditInvoice from './components/editInvoice/EditInvoice'



function App() {
  return (
   <Router>
      <div className="container py-4">
        <h1>Invoice Editor</h1>

        <div className="mb-4">
          <Link to="/" className="btn btn-outline-primary me-2">📄 View Invoices</Link>
          <Link to="/create" className="btn btn-primary">➕ Create Invoice</Link>
        </div>

        <Routes>
          <Route path="/" element={<InvoicesIndex />} />
          <Route path="/invoices/:id" element={<InvoiceShow />} />
          <Route path="/create" element={<CreateInvoice />} />
          <Route path="/invoices/:id/edit" element={<EditInvoice />} />
        </Routes>  
      </div>
    </Router>
  )
}

export default App
