import React from 'react';
import { useQuery, gql } from '@apollo/client';

// Define GraphQL query to fetch customers data
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

// TypeScript interface for Customer data structure
interface Customer {
  username: string;
  name: string;
  email: string;
  accounts: number[];
}

const Customers: React.FC = () => {
  // Execute the GET_CUSTOMERS query and manage loading, error, and data states
  const { loading, error, data } = useQuery(GET_CUSTOMERS);

  // Display loading state while the query is in progress
  if (loading) return <p>Loading...</p>;
  // Display error message if the query fails
  if (error) return <p>Error: {error.message}</p>;

  // Render customers data once it is available
  return (
    <div>
      <h2>Customers</h2>
      {/* Ensure data.customers exists and is iterable before mapping */}
      {data && data.customers && data.customers.map((customer: Customer) => (
        <div key={customer.username}>
          <h3>Username: {customer.username}</h3>
          <p>Name: {customer.name}</p>
          <p>Email: {customer.email}</p>
          {/* Join accounts array into a string for display */}
          <p>Accounts: {customer.accounts.join(', ')}</p>
        </div>
      ))}
    </div>
  );
};

export default Customers;

// Troubleshooting and Maintenance Notes:
// 1. If "Loading..." persists, verify the GraphQL server is running and accessible.
// 2. For an "Error:" message, check the network response for more details. This could indicate issues with the query or server.
// 3. If no customers are displayed, ensure the customers data structure matches the Customer interface and the server returns data as expected.
// 4. When updating the Customer interface or GET_CUSTOMERS query, ensure all components consuming this data are also updated accordingly.
// 5. For UI updates, consider the impact on the display of customers data, especially if adding or removing fields.