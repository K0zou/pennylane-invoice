import FilteredInvoicesList from './FilteredInvoicesList'

const FinalizedInvoicesList = () => (
  <FilteredInvoicesList
    title="Finalized Invoices"
    filter={[{ field: 'finalized', operator: 'eq', value: true }]}
  />
)

export default FinalizedInvoicesList
