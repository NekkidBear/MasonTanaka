import React from 'react';
import { useQuery, gql } from '@apollo/client';

const GET_ACCOUNTS = gql`
  query GetAccounts {
    accounts {
      account_id
      limit
      products
    }
  }
`;

interface Account {
  account_id: number;
  limit: number;
  products: string[];
}

const Accounts: React.FC = () => {
  const { loading, error, data } = useQuery(GET_ACCOUNTS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>Accounts</h2>
      {data.accounts.map((account: Account) => (
        <div key={account.account_id}>
          <h3>Account ID: {account.account_id}</h3>
          <p>Limit: {account.limit}</p>
          <p>Products: {account.products.join(', ')}</p>
        </div>
      ))}
    </div>
  );
};

export default Accounts;