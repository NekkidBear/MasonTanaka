import { resolvers } from '../../src/server/resolvers/resolvers'; // Adjust the import path as necessary
import { Account } from "../../models/Account";
import { Customer } from "../../models/Customer";
import { TransactionBucket } from "../../models/TransactionBucket";

// Mock the database models
jest.mock("../../models/Account");
jest.mock("../../models/Customer");
jest.mock("../../models/TransactionBucket");

// Troubleshooting Tips:
// 1. If you encounter "Cannot find module" errors, ensure all dependencies are properly installed and import paths are correct.
// 2. If mocks are not working as expected, verify that the mock implementations match the actual model methods.
// 3. For TypeScript errors, ensure that your mock implementations include proper typing.
// 4. If tests are failing unexpectedly, use console.log or debugger statements to inspect intermediate values.

describe('Resolver Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Maintenance Tip: Keep these scalar tests updated if you modify the Date scalar implementation
  describe('Date scalar', () => {
    it('serializes Date objects correctly', () => {
      const date = new Date('2023-01-01T00:00:00Z');
      expect(resolvers.Date.serialize(date)).toBe(date.getTime());
    });

    it('parses number values correctly', () => {
      const timestamp = 1672531200000; // 2023-01-01T00:00:00Z
      const result = resolvers.Date.parseValue(timestamp);
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(timestamp);
    });

    // Maintenance Tip: Add tests for edge cases, like invalid inputs
  });

  describe('Query resolvers', () => {
    // Maintenance Tip: Update these tests when you modify the structure of your Account model
    it('fetches all accounts', async () => {
      const mockAccounts = [{ account_id: '1', limit: 1000, products: ['product1'] }];
      (Account.find as jest.Mock).mockResolvedValue(mockAccounts);

      const result = await resolvers.Query.accounts();
      expect(result).toEqual(mockAccounts);
      expect(Account.find).toHaveBeenCalled();
    });

    it('fetches a single account', async () => {
      const mockAccount = { account_id: '1', limit: 1000, products: ['product1'] };
      (Account.findOne as jest.Mock).mockResolvedValue(mockAccount);

      const result = await resolvers.Query.account({}, { account_id: '1' });
      expect(result).toEqual(mockAccount);
      expect(Account.findOne).toHaveBeenCalledWith({ account_id: '1' });
    });

    // Maintenance Tip: Keep these tests in sync with any changes to the Customer model
    it('fetches all customers', async () => {
      const mockCustomers = [{ username: 'user1', name: 'User 1', email: 'user1@example.com' }];
      (Customer.find as jest.Mock).mockResolvedValue(mockCustomers);

      const result = await resolvers.Query.customers();
      expect(result).toEqual(mockCustomers);
      expect(Customer.find).toHaveBeenCalled();
    });

    it('fetches a single customer', async () => {
      const mockCustomer = { username: 'user1', name: 'User 1', email: 'user1@example.com' };
      (Customer.findOne as jest.Mock).mockResolvedValue(mockCustomer);

      const result = await resolvers.Query.customer({}, { username: 'user1' });
      expect(result).toEqual(mockCustomer);
      expect(Customer.findOne).toHaveBeenCalledWith({ username: 'user1' });
    });

    // Maintenance Tip: Update this test if you change the structure of TransactionBucket
    it('fetches transaction buckets', async () => {
      const mockBuckets = [{ account_id: '1', transaction_count: 5, bucket_start_date: new Date(), bucket_end_date: new Date() }];
      (TransactionBucket.find as jest.Mock).mockResolvedValue(mockBuckets);

      const result = await resolvers.Query.transactionBuckets({}, { account_id: '1' });
      expect(result).toEqual(mockBuckets);
      expect(TransactionBucket.find).toHaveBeenCalledWith({ account_id: '1' });
    });

    // Maintenance Tip: This test is complex and may need updates if you change the balance calculation logic
    it('calculates account balances', async () => {
      const mockCustomer = { username: 'user1', accounts: ['1', '2'] };
      const mockBuckets = [
        { 
          account_id: '1',
          transactions: [
            { transaction_code: 'buy', amount: 100 },
            { transaction_code: 'sell', amount: 50 }
          ]
        },
        {
          account_id: '2',
          transactions: [
            { transaction_code: 'buy', amount: 200 },
            { transaction_code: 'sell', amount: 150 }
          ]
        }
      ];

      (Customer.findOne as jest.Mock).mockResolvedValue(mockCustomer);
      (TransactionBucket.find as jest.Mock).mockResolvedValueOnce([mockBuckets[0]]).mockResolvedValueOnce([mockBuckets[1]]);

      const result = await resolvers.Query.accountBalances({}, { username: 'user1' });
      expect(result).toEqual([
        { account_id: '1', balance: -50 },  // 100 buy, 50 sell: -100 + 50 = -50
        { account_id: '2', balance: -50 }   // 200 buy, 150 sell: -200 + 150 = -50
      ]);
      expect(Customer.findOne).toHaveBeenCalledWith({ username: 'user1' });
      expect(TransactionBucket.find).toHaveBeenCalledTimes(2);
    });

    // Troubleshooting Tip: If the above test fails, verify the balance calculation logic in the resolver
  });

  // Maintenance Tip: Update this test if you change the structure of the tier_and_details field
  describe('Customer resolver', () => {
    it('transforms tier_and_details correctly', () => {
      const mockCustomer = {
        tier_and_details: {
          tier1: { tier: 'Gold', benefits: ['benefit1'], active: true, id: '1' },
          tier2: { tier: 'Silver', benefits: ['benefit2'], active: false, id: '2' }
        }
      };

      const result = resolvers.Customer.tier_and_details(mockCustomer);
      expect(result).toEqual([
        { tier: 'Gold', benefits: ['benefit1'], active: true, id: '1' },
        { tier: 'Silver', benefits: ['benefit2'], active: false, id: '2' }
      ]);
    });
  });
});

// General Maintenance Notes:
// 1. Keep these tests in sync with your resolver implementations. When you modify a resolver, update its corresponding test.
// 2. Regularly run these tests, especially after making changes to resolvers or database models.
// 3. If you add new resolvers, create corresponding test cases for them.
// 4. Consider adding more edge case tests, such as testing error handling when data is not found or when invalid input is provided.
// 5. If your resolvers start to include more complex logic, consider breaking down the tests into smaller, more focused test cases.

// Troubleshooting Notes:
// 1. If a test fails, first check if the resolver implementation has changed and update the test accordingly.
// 2. For failing tests, use console.log in the resolver to print intermediate values and compare them with the test expectations.
// 3. Ensure that mock implementations accurately reflect the behavior of your database models.
// 4. If you're seeing inconsistent test results, make sure that mocks are properly cleared between tests.
// 5. For performance issues, consider using Jest's coverage reports to identify and optimize slow-running tests.