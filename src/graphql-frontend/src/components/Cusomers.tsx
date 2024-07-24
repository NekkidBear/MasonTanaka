import React from 'react';
import { useQuery, gql } from '@apollo/client';

const GET_CUSTOMERS = gql`
  query GetCustomers {
    customers {
      username
      name
      email
      accounts
    }
  }
`;

interface Customer {
  username: string;
  name: string;
  email: string;
  accounts: number[];
}

const Customers: React.FC = () => {
  const { loading, error, data } = useQuery(GET_CUSTOMERS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>Customers</h2>
      {data.customers.map((customer: Customer) => (
        <div key={customer.username}>
          <h3>Username: {customer.username}</h3>
          <p>Name: {customer.name}</p>
          <p>Email: {customer.email}</p>
          <p>Accounts: {customer.accounts.join(', ')}</p>
        </div>
      ))}
    </div>
  );
};

export default Customers;