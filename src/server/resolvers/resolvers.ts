import { Account } from './models/Account';
import { Customer } from './models/Customer';
import { TransactionBucket } from './models/TransactionBucket';
import { GraphQLScalarType, Kind } from 'graphql';

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value) {
    return value.getTime(); // Convert outgoing Date to integer for JSON
  },
  parseValue(value) {
    return new Date(value); // Convert incoming integer to Date
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10)); // Convert hard-coded AST string to integer and then to Date
    }
    return null; // Invalid hard-coded value (not an integer)
  },
});

export const resolvers = {
  Date: dateScalar,
  Query: {
    accounts: () => Account.find(),
    account: (_, { account_id }) => Account.findOne({ account_id }),
    customers: () => Customer.find(),
    customer: (_, { username }) => Customer.findOne({ username }),
    transactionBuckets: (_, { account_id }) => TransactionBucket.find({ account_id }),
    accountBalances: async (_, { username }) => {
      const customer = await Customer.findOne({ username });
      if (!customer) return [];

      const balances = await Promise.all(customer.accounts.map(async (accountId) => {
        const transactionBuckets = await TransactionBucket.find({ account_id: accountId });
        const balance = transactionBuckets.reduce((sum, bucket) => {
          return sum + bucket.transactions.reduce((bucketSum, transaction) => {
            return bucketSum + (transaction.transaction_code === 'buy' ? -transaction.amount : transaction.amount);
          }, 0);
        }, 0);
        return { account_id: accountId, balance };
      }));

      return balances;
    },
  },
  Customer: {
    tier_and_details: (parent) => {
      return Object.values(parent.tier_and_details);
    },
  },
};
