import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';

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
    variables: { accountId },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>Transaction Buckets</h2>
      <input
        type="number"
        value={accountId}
        onChange={(e) => setAccountId(parseInt(e.target.value))}
        placeholder="Enter Account ID"
      />
      {data.transactionBuckets.map((bucket: TransactionBucket) => (
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
      ))}
    </div>
  );
};

export default TransactionBuckets;