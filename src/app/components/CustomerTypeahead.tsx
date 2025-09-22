import { useState } from "react";
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import type { Option } from 'react-bootstrap-typeahead/types/types';

const SEARCH_URI = `${process.env.NEXT_PUBLIC_API_URL}/api/customers`;

interface Customer {
  ParentCust: string;
  CustNumber: string;
  CustName: string;
}

interface Response {
  data: Customer[];
}

interface ChildProps {
  onCustomerSelect: (customer: Customer[] | null) => void;
}

const CustomerTypeahead: React.FC<ChildProps> = ({ onCustomerSelect }) => {

  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<Customer[]>([]);

  const handleSearch = (query: string) => {
    setIsLoading(true);
    fetch(`${SEARCH_URI}?q=${query}&page=1&per_page=50`)
      .then((resp) => resp.json())
      .then(({ data }: Response) => {
        setOptions(data);
        setIsLoading(false);
      });
  };

  const filterBy = () => true;

  const handleChange = (selected: Option[]) => {
    let arr2 = selected.map(item => item as Customer);
    const customer = selected.length > 0 ? selected.map(item => item as Customer) : null;
    onCustomerSelect(customer);
  };

  return (
    <AsyncTypeahead
      onChange={handleChange}
      multiple
      filterBy={filterBy}
      id="async-example"
      isLoading={isLoading}
      labelKey="CustName"
      minLength={3}
      onSearch={handleSearch}
      options={options}
      placeholder="Search for a customer..."
      renderMenuItemChildren={(option, props, index) => {
        const customer = option as Customer;
        return (
          <>
            <div>{customer.CustNumber} - {customer.CustName}</div>
          </>
        )
      }}
      renderToken={(option, props, index) => {
        const customer = option as Customer;
        return (
          <>
            <div>{customer.CustNumber} - {customer.CustName}</div>
          </>
        )
      }}
    />
  );
};

export { CustomerTypeahead };
export type { Customer };
