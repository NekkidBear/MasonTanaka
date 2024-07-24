import { Account } from '../../models/Account';
import { Customer } from '../../models/Customer';
import { TransactionBucket } from '../../models/TransactionBucket';
import { GraphQLScalarType, Kind } from 'graphql';



// Define a custom GraphQL scalar type for handling Date objects
const dateScalar = new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    serialize(value: unknown) {
      // Serialize the Date object into an integer timestamp for JSON responses
      if (value instanceof Date) {
        return value.getTime();
      }
      throw new Error('DateScalar can only serialize Date objects');
    },
    parseValue(value: unknown) {
      // Parse an integer timestamp from the client into a Date object
      if (typeof value === 'number') {
        return new Date(value);
      }
      throw new Error('DateScalar can only parse number values');
    },
    parseLiteral(ast) {
      // Parse a hard-coded AST value into a Date object
      if (ast.kind === Kind.INT) {
        return new Date(parseInt(ast.value, 10));
      }
      return null; // Return null if the provided value is not an integer
    },
  });

export const resolvers = {
  Date: dateScalar, // Register the custom Date scalar type
  Query: {
    // Resolver for fetching multiple accounts
    accounts: () => Account.find(),
    // Resolver for fetching a single account by ID
    account: (_, { account_id }: { account_id: string }) => Account.findOne({ account_id }),
    // Resolver for fetching multiple customers
    customers: () => Customer.find(),
    // Resolver for fetching a single customer by username
    customer: (_, { username }: { username: string }) => Customer.findOne({ username }),
    // Resolver for fetching transaction buckets by account ID
    transactionBuckets: (_, { account_id }: { account_id: string }) => TransactionBucket.find({ account_id }),
    // Resolver for calculating account balances for a given customer
    accountBalances: async (_, { username }: { username: string }) => {
      const customer = await Customer.findOne({ username });
      if (!customer) return []; // Return an empty array if the customer is not found

      // Calculate the balance for each account associated with the customer
      const balances = await Promise.all(customer.accounts.map(async (accountId) => {
        const transactionBuckets = await TransactionBucket.find({ account_id: accountId });
        const balance = transactionBuckets.reduce((sum, bucket) => {
          // Calculate the balance by summing the amounts of 'buy' and 'sell' transactions
          return sum + bucket.transactions.reduce((bucketSum, transaction) => {
            const amount = transaction?.amount ?? 0
            return bucketSum + (transaction?.transaction_code === 'buy' ? -amount: amount ?? 0);
          }, 0);
        }, 0);
        return { account_id: accountId, balance };
      }));

      return balances;
    },
  },
  Customer: {
      tier_and_details: (parent: any) => {
          return Object.values(parent.tier_and_details);
      },
  },
};
