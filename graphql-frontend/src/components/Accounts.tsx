import React from 'react';
import { useQuery, gql } from '@apollo/client';

// GraphQL query to fetch accounts data
const GET_ACCOUNTS = gql`
  query GetAccounts {
    accounts {
      account_id
      limit
      products
    }
  }
`;

// TypeScript interface for Account data structure
interface Account {
  account_id: number;
  limit: number;
  products: string[];
}

const Accounts: React.FC = () => {
  // Execute the GET_ACCOUNTS query and manage loading, error, and data states
  const { loading, error, data } = useQuery(GET_ACCOUNTS);

  // Display loading state while the query is in progress
  if (loading) return <p>Loading...</p>;
  // Display error message if the query fails
  if (error) return <p>Error: {error.message}</p>;

  // Render accounts data once it is available
  return (
    <div>
      <h2>Accounts</h2>
      {/* Ensure data.accounts exists and is iterable before mapping */}
      {data && data.accounts && data.accounts.map((account: Account) => (
        <div key={account.account_id}>
          <h3>Account ID: {account.account_id}</h3>
          <p>Limit: {account.limit}</p>
          {/* Join products array into a string for display */}
          <p>Products: {account.products.join(', ')}</p>
        </div>
      ))}
    </div>
  );
};

export default Accounts;

// Troubleshooting and Maintenance Notes:
// 1. If "Loading..." persists, verify the GraphQL server is running and accessible.
// 2. For an "Error:" message, check the network response for more details. This could indicate issues with the query or server.
// 3. If no accounts are displayed, ensure the accounts data structure matches the Account interface and the server returns data as expected.
// 4. When updating the Account interface or GET_ACCOUNTS query, ensure all components consuming this data are also updated accordingly.
// 5. For UI updates, consider the impact on the display of accounts data, especially if adding or removing fields.