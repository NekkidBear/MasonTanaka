import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar Date

  type Account {
    account_id: Int!
    limit: Int!
    products: [String!]!
  }

  type Customer {
    username: String!
    name: String!
    address: String!
    birthdate: Date!
    email: String!
    accounts: [Int!]!
    tier_and_details: [TierDetails!]!
  }

  type TierDetails {
    tier: String!
    benefits: [String!]!
    active: Boolean!
    id: String!
  }

  type Transaction {
    date: Date!
    amount: Int!
    transaction_code: String!
    symbol: String!
    price: Float!
    total: Float!
  }

  type TransactionBucket {
    account_id: Int!
    transaction_count: Int!
    bucket_start_date: Date!
    bucket_end_date: Date!
    transactions: [Transaction!]!
  }

  type AccountBalance {
    account_id: Int!
    balance: Float!
  }

  type Query {
    accounts: [Account!]!
    account(account_id: Int!): Account
    customers: [Customer!]!
    customer(username: String!): Customer
    transactionBuckets(account_id: Int!): [TransactionBucket!]!
    accountBalances(username: String!): [AccountBalance!]!
  }
`;