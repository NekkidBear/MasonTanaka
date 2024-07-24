import React from 'react';
import { ApolloProvider } from '@apollo/client';
import client from 'apollo-client';
import Accounts from './components/Accounts';
import Customers from './components/Customers';
import TransactionBuckets from './components/TransactionBuckets';

const App: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <h1>GraphQL Data Display</h1>
        <Accounts />
        <Customers />
        <TransactionBuckets />
      </div>
    </ApolloProvider>
  );
};

export default App;