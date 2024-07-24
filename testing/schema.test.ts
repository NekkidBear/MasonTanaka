import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "../src/server/schema/schema"; // Import Type Definitions
import { resolvers } from "../src/server/resolvers/resolvers"; // Import resolvers
import { gql } from "graphql-tag";
import { Account } from "../src/models/Account";
import { Customer } from "../src/models/Customer";
import { TransactionBucket } from "../src/models/TransactionBucket";

jest.mock("../src/models/Account");
jest.mock("../src/models/Customer");
jest.mock("../src/models/TransactionBucket");

// Mock data
const mockAccounts = [
  { account_id: 1, limit: 1000, products: ["savings", "checking"] },
];
const mockCustomers = [
  { 
    username: "testUser", 
    name: "Test User", 
    email: "test@example.com",
    accounts: [1, 2],
    tier_and_details: {
      tier1: { tier: "Gold", benefits: ["benefit1"], active: true, id: "1" },
      tier2: { tier: "Silver", benefits: ["benefit2"], active: false, id: "2" }
    }
  },
];
const mockTransactionBuckets = [
  { 
    account_id: 1, 
    transaction_count: 2,
    bucket_start_date: new Date("2023-01-01"),
    bucket_end_date: new Date("2023-01-31"),
    transactions: [
      { date: new Date("2023-01-15"), amount: 100, transaction_code: "buy", symbol: "AAPL", price: 150, total: 15000 },
      { date: new Date("2023-01-20"), amount: 50, transaction_code: "sell", symbol: "AAPL", price: 160, total: 8000 }
    ]
  }
];

// Before each test, clear all mocks and set up default mock implementations
beforeEach(() => {
  jest.clearAllMocks();

  // Mock implementations
  (Account.findOne as jest.Mock).mockImplementation(({ account_id }) => {
    console.log("Account.findOne called with:", account_id);
    const account = mockAccounts.find((acc) => acc.account_id === account_id);
    console.log("Found account:", account);
    return Promise.resolve(account);
  });

  (Account.find as jest.Mock).mockResolvedValue(mockAccounts);
  (Customer.find as jest.Mock).mockResolvedValue(mockCustomers);
  (Customer.findOne as jest.Mock).mockImplementation(({ username }) =>
    Promise.resolve(mockCustomers.find((customer) => customer.username === username))
  );
  (TransactionBucket.find as jest.Mock).mockResolvedValue(mockTransactionBuckets);

  // Add more mocks as needed for other tests
});

// Troubleshooting Tips:
// 1. If you encounter "Cannot find module" errors, ensure all dependencies are properly installed and import paths are correct.
// 2. For "Type ... is not assignable to type ..." errors, check that your Apollo Server and GraphQL versions are compatible.
// 3. If tests fail due to unresolved schema elements, verify that your typeDefs and resolvers are correctly defined and imported.
// 4. Timeout errors may indicate issues with asynchronous operations. Consider increasing Jest's timeout for complex queries.

describe("GraphQL Schema Tests", () => {
  let server: ApolloServer;

  beforeAll(() => {
    server = new ApolloServer({
      typeDefs,
      resolvers,
      // Add any additional context or configurations here
    });

    // Troubleshooting Tip:
    // If you're seeing errors related to context or other server configurations,
    // you may need to add them here. For example:
    // context: () => ({ /* your context object */ }),
  });

  afterAll(async () => {
    await server.stop();
  });

  it("fetches all accounts", async () => {
    const GET_ACCOUNTS = gql`
      query {
        accounts {
          account_id
          limit
          products
        }
      }
    `;

    const result = await server.executeOperation({ query: GET_ACCOUNTS });

    expect(result.errors).toBeUndefined();
    expect(result.data?.accounts).toBeInstanceOf(Array);
    expect(result.data?.accounts[0]).toHaveProperty("account_id", 1);
    expect(result.data?.accounts[0]).toHaveProperty("limit", 1000);
    expect(result.data?.accounts[0]).toHaveProperty("products", ["savings", "checking"]);
  });

  it("fetches a single account", async () => {
    const GET_ACCOUNT = gql`
      query GetAccount($accountId: Int!) {
        account(account_id: $accountId) {
          account_id
          limit
          products
        }
      }
    `;

    const result = await server.executeOperation({
      query: GET_ACCOUNT,
      variables: { accountId: 1 },
    });
    console.log("Query result:", JSON.stringify(result, null, 2));

    expect(result.errors).toBeUndefined();
    expect(result.data?.account).toHaveProperty("account_id", 1);
    expect(result.data?.account).toHaveProperty("limit"), 1000;
    expect(result.data?.account).toHaveProperty("products", ["savings", "checking"]);
  });

  it("fetches all customers", async () => {
    const GET_CUSTOMERS = gql`
      query {
        customers {
          username
          name
          email
        }
      }
    `;

    const result = await server.executeOperation({ query: GET_CUSTOMERS });

    expect(result.errors).toBeUndefined();
    expect(result.data?.customers).toBeInstanceOf(Array);
    expect(result.data?.customers[0]).toHaveProperty("username");
    expect(result.data?.customers[0]).toHaveProperty("name");
    expect(result.data?.customers[0]).toHaveProperty("email");
  });

  it("fetches a single customer", async () => {
    const GET_CUSTOMER = gql`
      query GetCustomer($username: String!) {
        customer(username: $username) {
          username
          name
          email
          accounts
          tier_and_details {
            tier
            benefits
            active
            id
          }
        }
      }
    `;

    const result = await server.executeOperation({
      query: GET_CUSTOMER,
      variables: { username: "testUser" },
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.customer).toHaveProperty("username", "testUser");
    expect(result.data?.customer).toHaveProperty("name", "Test User");
    expect(result.data?.customer).toHaveProperty("email", "test@example.com");
    expect(result.data?.customer.accounts).toEqual([1,2])
    expect(result.data?.customer.accounts).toBeInstanceOf(Array);
    expect(result.data?.customer.tier_and_details).toBeInstanceOf(Array);
    expect(result.data?.customer.tier_and_details).toHaveLength(2);
  });

  it("fetches transaction buckets", async () => {
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

    const result = await server.executeOperation({
      query: GET_TRANSACTION_BUCKETS,
      variables: { accountId: 1 },
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.transactionBuckets).toBeInstanceOf(Array);
    expect(result.data?.transactionBuckets).toHaveLength(1);
    expect(result.data?.transactionBuckets[0]).toHaveProperty("account_id", 1);
    expect(result.data?.transactionBuckets[0]).toHaveProperty("transaction_count", 2);
    expect(result.data?.transactionBuckets[0]).toHaveProperty("bucket_start_date");
    expect(result.data?.transactionBuckets[0]).toHaveProperty("bucket_end_date");
    expect(result.data?.transactionBuckets[0].transactions).toHaveLength(2);
  });

  it("fetches account balances", async () => {
    const GET_ACCOUNT_BALANCES = gql`
      query GetAccountBalances($username: String!) {
        accountBalances(username: $username) {
          account_id
          balance
        }
      }
    `;

    const result = await server.executeOperation({
      query: GET_ACCOUNT_BALANCES,
      variables: { username: "testUser" },
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.accountBalances).toBeInstanceOf(Array);
    if (result.data?.accountBalances.length > 0) {
      expect(result.data?.accountBalances[0]).toHaveProperty("account_id");
      expect(result.data?.accountBalances[0]).toHaveProperty("balance");
    }
  }, 10000);

  // Troubleshooting Notes:
// 1. If "fetches a single account" fails, check that the Account.findOne mock is correctly implemented and returning the expected data.
// 2. For "fetches a single customer" failures, verify that the Customer.findOne mock is working and that the tier_and_details transformation in the resolver is correct.
// 3. If "fetches transaction buckets" fails, ensure that the TransactionBucket.find mock is returning data with all required fields, including transaction_count.
// 4. For any "Cannot return null for non-nullable field" errors, check that all required fields in your schema are present in the mock data.
// 5. If tests are timing out, consider increasing the timeout for individual tests or for the entire test suite.

  // Maintenance Tips:
  // - When adding new fields to your schema, ensure corresponding tests are updated.
  // - Regularly review and run your tests after schema or resolver updates to catch regressions.
  // - Consider abstracting frequently used query patterns or mock data to shared utilities for easier test maintenance.
});

// General Maintenance Notes:
// 1. Keep this test file in sync with your schema. When you add or modify types, queries, or mutations, add corresponding tests.
// 2. Regularly update your dependencies, but be aware that major version updates (especially of Apollo Server) may require test modifications.
// 3. If you add authentication or authorization to your schema, make sure to test both authenticated and unauthenticated scenarios.
// 4. For complex schemas, consider organizing your tests into separate files or test suites for better maintainability.
// 5. Use snapshot testing for complex query results to easily detect unintended changes in your schema's output structure.
