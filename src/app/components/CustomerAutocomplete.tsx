import { useCallback } from 'react'
import { AsyncPaginate, LoadOptions } from 'react-select-async-paginate'

import { Customer } from 'types'
import { useApi } from 'api'
import { GroupBase } from 'react-select'

interface Props {
  value: Customer | null
  onChange: (Customer: Customer | null) => void
  options?: Customer[]
}

const defaultAdditional = { page: 1 }

const getCustomerLabel = (customer: Customer) => {
  return `${customer.first_name} ${customer.last_name}`
}

const CustomerAutocomplete = ({ value, onChange, options }: Props) => {
  const api = useApi()

  const loadOptions: LoadOptions<Customer, GroupBase<Customer>, {page: number}> = useCallback(
    async (search, loadedOptions, additional) => {
      const page = additional?.page ?? 1
      const { data } = await api.getSearchCustomers({
        query: search,
        per_page: 10,
        page,
      })

      return {
        options: data.customers,
        hasMore: data.pagination.page < data.pagination.total_pages,
        additional: {
          page: page + 1,
        },
      }
    },
    [api]
  )

  const staticLoadOptions: LoadOptions<Customer, GroupBase<Customer>, { page: number }> = async () => {
    return {
      options: options ?? [],
      hasMore: false,
      additional: { page: 1 }
    }
  }
  

  return (
    <AsyncPaginate
      placeholder="Search a customer"
      isClearable
      getOptionLabel={getCustomerLabel}
      additional={defaultAdditional}
      value={value}
      onChange={onChange}
      loadOptions={options ? staticLoadOptions : loadOptions}
      options={options}
    />
  )
}

export default CustomerAutocomplete
