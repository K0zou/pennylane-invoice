import FilteredInvoicesList from './FilteredInvoicesList'

const DraftInvoicesList = () => (
  <FilteredInvoicesList
    title="Draft Invoices"
    filter={[{ field: 'finalized', operator: 'eq', value: false }]}
  />
)

export default DraftInvoicesList
