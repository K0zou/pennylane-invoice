import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import InvoicesList from './components/InvoicesList'
import InvoiceShow from './components/InvoiceShow'

function App() {
  return (
   <Router>
      <div className="px-5">
        <h1>Invoice Editor</h1>
        <Routes>
          <Route path="/" element={<InvoicesList />} />
          <Route path="/invoices/:id" element={<InvoiceShow />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
