import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';

// Troubleshooting and Maintenance Comments for TransactionBuckets.tsx

// 1. Import Statements and GraphQL Query:
//    - Ensure Apollo Client is correctly set up in your project to use `useQuery` and `gql`.
//    - Verify the GraphQL query `GET_TRANSACTION_BUCKETS` matches the schema on your GraphQL server.

const GET_TRANSACTION_BUCKETS = gql`
  query GetTransactionBuckets($accountId: Int!) {
    transactionBuckets(account_id: $accountId) {
      account_id
      transaction_count
      bucket_start_date
      bucket_end_date
      transactions {
        date
        amount
        transaction_code
        symbol
        price
        total
      }
    }
  }
`;

interface Transaction {
  date: string;
  amount: number;
  transaction_code: string;
  symbol: string;
  price: number;
  total: number;
}

interface TransactionBucket {
  account_id: number;
  transaction_count: number;
  bucket_start_date: string;
  bucket_end_date: string;
  transactions: Transaction[];
}

const TransactionBuckets: React.FC = () => {
  const [accountId, setAccountId] = useState<number>(1);
  const { loading, error, data } = useQuery(GET_TRANSACTION_BUCKETS, {
    variables: { accountId }, // Ensure this matches the variable in the query
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // 2. Interfaces:
  //    - Check that the `Transaction` and `TransactionBucket` interfaces accurately reflect the data structure returned by your GraphQL server.

  // 3. useState Hook for Account ID:
  //    - The `accountId` state is initialized to 1. If necessary, adjust this initial value based on your application's requirements.

  // 4. useQuery Hook:
  //    - The `useQuery` hook is used to fetch transaction buckets based on the `accountId`. Ensure the `accountId` variable is correctly passed to the GraphQL query.
  //    - If there are issues with fetching data, check the network request in your browser's developer tools for errors.

  // 5. Loading and Error Handling:
  //    - The component renders a loading message or an error message based on the query's state. Ensure these messages are appropriate for your users.

  // 6. Rendering Transaction Buckets:
  //    - The component checks if `data.transactionBuckets` exists and has length before attempting to render it. This prevents errors when the data is undefined or empty.
  //    - Each transaction bucket is rendered with its details and a list of transactions. Ensure the keys used for mapping (`${bucket.account_id}-${bucket.bucket_start_date}` for buckets and `index` for transactions) are appropriate for your data. Consider using more unique identifiers for transactions if available.

  // 7. Account ID Input:
  //    - The input field allows users to change the `accountId` state, triggering a re-fetch of the transaction buckets. Ensure the input correctly parses integers and updates the state.

  // 8. Potential Areas for Improvement:
  //    - Consider implementing error boundaries or more specific error handling to improve user experience during errors.
  //    - If your application requires handling large numbers of transactions, consider adding pagination or infinite scrolling to improve performance.
  //    - Review accessibility features, such as adding labels or aria attributes to form elements and interactive items.

  return (
    <div>
      <h2>Transaction Buckets</h2>
      <input
        type="number"
        value={accountId}
        onChange={(e) => setAccountId(parseInt(e.target.value))}
        placeholder="Enter Account ID"
      />
      {data && data.transactionBuckets && data.transactionBuckets.length > 0 ? (
        data.transactionBuckets.map((bucket: TransactionBucket) => (
          <div key={`${bucket.account_id}-${bucket.bucket_start_date}`}>
            <h3>Account ID: {bucket.account_id}</h3>
            <p>Transaction Count: {bucket.transaction_count}</p>
            <p>Start Date: {bucket.bucket_start_date}</p>
            <p>End Date: {bucket.bucket_end_date}</p>
            <h4>Transactions:</h4>
            <ul>
              {bucket.transactions.map((transaction: Transaction, index: number) => (
                <li key={index}>
                  Date: {transaction.date}, Amount: {transaction.amount}, 
                  Code: {transaction.transaction_code}, Symbol: {transaction.symbol}, 
                  Price: {transaction.price}, Total: {transaction.total}
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p>No transaction buckets found for the given account ID.</p>
      )}
    </div>
  );
};

export default TransactionBuckets;

