import { Account } from "../../models/Account";
import { Customer } from "../../models/Customer";
import { TransactionBucket } from "../../models/TransactionBucket";
import { GraphQLScalarType, Kind } from "graphql";
import { MongoClient } from "mongodb";
import dotenv from 'dotenv';

dotenv.config();

// MongoDb setup
const uri = process.env.MONGODB_CONNECTION_STRING;
if (!uri) {
  throw new Error("MONGODB_CONNECTION_STRING is not defined in the environment variables.");
}
const client = new MongoClient(uri);

interface CustomerBalance {
  username: string;
  name: string | undefined;
  accountBalances: { product: string; balance: number }[];
}

// Define a custom GraphQL scalar type for handling Date objects
const dateScalar = new GraphQLScalarType({
  name: "Date",
  description: "Date custom scalar type",
  serialize(value: unknown) {
    if (value instanceof Date) {
      return value.getTime();
    }
    throw new Error("DateScalar can only serialize Date objects");
  },
  parseValue(value: unknown) {
    if (typeof value === "number") {
      return new Date(value);
    }
    throw new Error("DateScalar can only parse number values");
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10));
    }
    return null;
  },
});

export const resolvers = {
  Date: dateScalar,
  Query: {
    accounts: async () => {
      try {
        return await Account.find();
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        } else {
          throw new Error(String(error));
        }
      }
    },

    account: async (_: never, { account_id }: { account_id: string }) => {
      try {
        return await Account.findOne({ account_id });
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        } else {
          throw new Error(String(error));
        }
      }
    },

    customers: async () => {
      try {
        return await Customer.find();
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        } else {
          throw new Error(String(error));
        }
      }
    },

    customerWithBalances: async (
      _: never,
      { username }: { username: string }
    ): Promise<CustomerBalance | null> => {
      try {
        await client.connect();
        const database = client.db("sample_analytics");
        const collection = database.collection("customers");

        console.log(`Fetching customer with username: ${username}`);
        const pipeline = [
          { $match: { username } },
          { $unwind: "$accounts" },
          {
            $lookup: {
              from: "accounts",
              localField: "accounts",
              foreignField: "account_id",
              as: "accountDetails",
            },
          },
          { $unwind: "$accountDetails" },
          {
            $group: {
              _id: "$accountDetails.product",
              balance: { $sum: "$accountDetails.balance" },
              customer_name: { $first: "$name" },
            },
          },
          {
            $project: {
              _id: 0,
              product: "$_id",
              balance: 1,
              customer_name: 1,
            },
          },
        ];

        console.log(
          "Running aggregation pipeline:",
          JSON.stringify(pipeline, null, 2)
        );
        const result = await collection.aggregate(pipeline).toArray();
        console.log("Aggregation result:", JSON.stringify(result, null, 2));

        if (result.length === 0) {
          console.warn("No results found for the given username");
          return null;
        }

        return {
          username,
          name: result[0].customer_name,
          accountBalances: result.map((item) => ({
            product: item.product,
            balance: item.balance,
          })),
        };
      } catch (error) {
        console.error("Error in customerWithBalances resolver:", error);
        throw new Error("Failed to fetch customer balances");
      } finally {
        await client.close();
      }
    },

    customer: async (_: never, { username }: { username: string }) => {
      try {
        await client.connect();
        const database = client.db("sample_analytics");
        const collection = database.collection("customers");
        const pipeline = [
          { $match: { username } },
          { $unwind: "$accounts" },
          {
            $lookup: {
              from: "accounts",
              localField: "accounts",
              foreignField: "account_id",
              as: "accountDetails",
            },
          },
          { $unwind: "$accountDetails" },
          {
            $group: {
              _id: "$accountDetails.product",
              balance: { $sum: "$accountDetails.balance" },
              customer_name: { $first: "$name" },
            },
          },
          {
            $project: {
              _id: 0,
              product: "$_id",
              balance: 1,
              customer_name: 1,
            },
          },
        ];
        const result = await collection.aggregate(pipeline).toArray();
        return {
          username,
          name: result[0]?.customer_name,
          accountBalances: result.map((item) => ({
            product: item.product,
            balance: item.balance,
          })),
        };
      } finally {
        await client.close();
      }
    },

    transactionBuckets: async (
      _: never,
      { account_id }: { account_id: string }
    ) => {
      try {
        return await TransactionBucket.find({ account_id });
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        } else {
          throw new Error(String(error));
        }
      }
    },

    accountBalances: async (_: never, { username }: { username: string }) => {
      try {
        const customer = await Customer.findOne({ username });
        if (!customer) return [];

        const balances = await Promise.all(
          customer.accounts.map(async (accountId) => {
            const transactionBuckets = await TransactionBucket.find({
              account_id: accountId,
            });
            const balance = transactionBuckets.reduce((sum, bucket) => {
              return (
                sum +
                bucket.transactions.reduce((bucketSum, transaction) => {
                  const amount = transaction?.amount ?? 0;
                  return (
                    bucketSum +
                    (transaction?.transaction_code === "buy"
                      ? -amount
                      : amount ?? 0)
                  );
                }, 0)
              );
            }, 0);
            return { account_id: accountId, balance };
          })
        );

        return balances;
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        } else {
          throw new Error(String(error));
        }
      }
    },

    firstFiveCustomers: async () => {
      try {
        await client.connect();
        const database = client.db("sample_analytics");
        const collection = database.collection("customers");

        // Fetch the first 5 customers
        const customers = await collection.find().limit(5).toArray();

        // Return the usernames and names of the first 5 customers
        return customers.map((customer) => ({
          username: customer.username,
          name: customer.name,
          // other fields if needed...
        }));
      } catch (error) {
        console.error("Error in firstFiveCustomers resolver:", error);
        throw new Error("Failed to fetch customers");
      } finally {
        await client.close();
      }
    },
  },

  Customer: {
    tier_and_details: async (parent: Record<string, unknown>) => {
      try {
        return Object.values(
          parent.tier_and_details as { [s: string]: unknown }
        );
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        } else {
          throw new Error(String(error));
        }
      }
    },
  },
};
